import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import { db } from './db';
import {
    OrderRiskAgent,
    CustomerCommunicationAgent,
    ReturnDecisionAgent
} from './agents';
import { authMiddleware } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middlewares ----
app.use(cors());
app.use(express.json());

// ---- Health Check / Root ----
app.get('/', (_req, res) => {
    res.send('ReturnGuard AI Backend is running');
});

// ---- Auth Routes (PUBLIC) ----
app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = db.findUserByEmail(email);

    if (user && bcrypt.compareSync(password, user.passwordHash)) {
        return res.json({
            token: `simple_token_${user.id}`,
            user: { id: user.id, email: user.email }
        });
    }

    res.status(401).json({ error: 'Invalid credentials' });
});

app.post('/api/auth/signup', (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (db.findUserByEmail(email)) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        passwordHash,
        createdAt: new Date().toISOString()
    };

    db.addUser(newUser);

    res.json({
        token: `simple_token_${newUser.id}`,
        user: { id: newUser.id, email: newUser.email }
    });
});

// ---- Protected Routes ----
app.use(authMiddleware);

// Initialize AI Agents
const riskAgent = new OrderRiskAgent();
const commsAgent = new CustomerCommunicationAgent();
const returnAgent = new ReturnDecisionAgent();

// ---- Dashboard ----
app.get('/api/stats', (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const orders = db.getOrders(userId);
    const returnRequests = orders.filter(o => o.status === 'RETURNED').length;
    const preventedReturns = db.getPreventedReturnsCount(userId);

    res.json({
        totalOrders: orders.length,
        returnRequests,
        preventedReturns,
        successRate:
            orders.length > 0
                ? Math.round(((orders.length - returnRequests) / orders.length) * 100)
                : 100
    });
});

app.get('/api/orders', (req: Request, res: Response) => {
    const userId = (req as any).userId;
    res.json(db.getOrders(userId));
});

app.post('/api/orders', (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const orderData = req.body;

    const riskAnalysis = riskAgent.analyzeOrder(orderData);
    const message = commsAgent.generateMessage({
        order_id: orderData.order_id,
        customer_name: orderData.customer_name || 'Customer',
        risk_analysis: riskAnalysis,
        channel: 'WhatsApp'
    });

    const processedOrder = {
        ...orderData,
        riskAnalysis,
        generatedMessage: message,
        status: 'CONFIRMED'
    };

    db.addOrder(processedOrder, userId);
    res.json(processedOrder);
});

// ---- Returns ----
app.post('/api/returns', (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { order_id, reason, item_condition } = req.body;

    const order = db.getOrders(userId).find(o => o.order_id === order_id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const conditionMap: Record<string, any> = {
        New: 'UNOPENED',
        Opened: 'OPENED_UNUSED',
        Used: 'OPENED_UNUSED',
        Damaged: 'USED_DAMAGED'
    };

    const returnReq = {
        order_id,
        product_condition: conditionMap[item_condition] || 'OPENED_UNUSED',
        return_reason: reason,
        risk_analysis: order.riskAnalysis
    };

    const decision = returnAgent.evaluateReturn(returnReq);

    if (decision.recommendation === 'SUGGEST_EXCHANGE') {
        db.incrementPreventedReturns(userId, order_id);
    }

    res.json(decision);
});

// ---- Start Server ----
app.listen(PORT, () => {
    console.log(`ReturnGuard backend running on port ${PORT}`);
});



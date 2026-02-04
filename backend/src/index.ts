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
import { authRouter } from './routes/auth';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize AI Agents
const riskAgent = new OrderRiskAgent();
const commsAgent = new CustomerCommunicationAgent();
const returnAgent = new ReturnDecisionAgent();


// ---- Debug Logging Middleware ----
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ---- Middlewares ----
// ---- Middlewares ----
const allowedOrigins = [
    process.env.FRONTEND_URL, // Production URL from Render Env Var
    'https://returnguard-interface.onrender.com', // Fallback
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://192.168.1.167:5173'
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`Blocked by CORS: ${origin}`);
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ---- Health Check / Root ----
app.get('/', (_req, res) => {
    res.send('ReturnGuard AI Backend is running');
});

// ---- Auth Routes (PUBLIC) ----
app.use('/api/auth', authRouter);

// ---- Demo/Simulator Route (PUBLIC for testing) ----
app.post('/api/demo/orders', (req: Request, res: Response) => {
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

    // Store with demo user ID for testing
    db.addOrder(processedOrder, 'demo-user');
    res.json(processedOrder);
});

// ---- Protected Routes ----
app.use(authMiddleware);

// ---- Dashboard ----
app.get('/api/stats', (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const orders = db.getOrders(userId);
    const returnRequestsList = orders.filter(o => o.status === 'RETURN_REQUESTED' || o.status === 'RETURNED');
    const returnRequests = returnRequestsList.length;
    const preventedReturns = db.getPreventedReturnsCount(userId);

    res.json({
        totalOrders: orders.length,
        returnRequests,
        preventedReturns,
        recentReturns: returnRequestsList.sort((a, b) => new Date(b.returnRequest?.timestamp || 0).getTime() - new Date(a.returnRequest?.timestamp || 0).getTime()).slice(0, 5),
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


// ---- Settings ----
app.get('/api/settings', (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const settings = db.getUserSettings(userId);
    res.json(settings);
});

app.post('/api/settings', (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const settings = req.body;
    db.updateUserSettings(userId, settings);
    res.json({ success: true, settings: db.getUserSettings(userId) });
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

    // Update order with return request details and status
    db.updateOrder(order.order_id, {
        status: 'RETURN_REQUESTED',
        returnRequest: {
            reason,
            condition: item_condition,
            decision,
            timestamp: new Date().toISOString()
        }
    });

    res.json(decision);
});

// ---- Start Server ----
app.listen(PORT, () => {
    console.log(`ReturnGuard backend running on port ${PORT}`);
});



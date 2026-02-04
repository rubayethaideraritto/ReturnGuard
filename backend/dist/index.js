"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
const agents_1 = require("./agents");
const auth_1 = require("./middleware/auth");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Initialize AI Agents
const { orchestrator } = (0, agents_1.setupAgents)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Apply global auth middleware
app.use(auth_1.authMiddleware);
// --- Public Auth Routes ---
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db_1.db.findUserByEmail(email);
    // In real app: bcrypt.compare(password, user.passwordHash)
    if (user && password === 'admin123') { // Simple mock
        res.json({
            token: `simple_token_${user.id}`,
            user: { id: user.id, email: user.email }
        });
    }
    else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});
app.post('/api/auth/signup', (req, res) => {
    const { email, password } = req.body;
    if (db_1.db.findUserByEmail(email)) {
        return res.status(400).json({ error: 'User already exists' });
    }
    const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        passwordHash: password, // Mock
        createdAt: new Date().toISOString()
    };
    db_1.db.addUser(newUser);
    res.json({ token: `simple_token_${newUser.id}`, user: newUser });
});
// --- Protected Dashboard Routes ---
app.get('/api/stats', (req, res) => {
    const userId = req.userId;
    const orders = db_1.db.getOrders(userId);
    const returnRequests = orders.filter(o => o.status === 'RETURNED').length;
    const preventedReturns = db_1.db.getPreventedReturnsCount(userId);
    res.json({
        totalOrders: orders.length,
        returnRequests,
        preventedReturns,
        successRate: orders.length > 0 ? Math.round(((orders.length - (returnRequests)) / orders.length) * 100) : 100
    });
});
app.get('/api/orders', (req, res) => {
    const userId = req.userId;
    res.json(db_1.db.getOrders(userId));
});
// --- AI Orchestration Endpoint ---
app.post('/api/orders', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const orderData = req.body;
    // AI analysis
    const result = yield orchestrator.processOrder(orderData);
    // Save to DB with AI results
    db_1.db.addOrder(Object.assign(Object.assign({}, orderData), { riskAnalysis: result.riskAnalysis, agentDecisions: result.agentDecisions }), userId);
    res.json(result);
}));
// --- Return Decision Endpoint ---
app.post('/api/returns', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const returnData = req.body;
    // Decision logic (Could use AI decision agent here)
    const decision = {
        approve: returnData.reason !== 'CHANGED_MIND',
        reasonings: [
            returnData.reason === 'CHANGED_MIND'
                ? 'Policy update: Manual review required for mind-change returns.'
                : 'Automated approval based on product condition.'
        ]
    };
    if (decision.approve) {
        db_1.db.incrementPreventedReturns(userId, returnData.order_id);
    }
    res.json({ decision });
}));
app.get('/api/settings', (req, res) => {
    const userId = req.userId;
    res.json(db_1.db.getUserSettings(userId));
});
app.post('/api/settings', (req, res) => {
    const userId = req.userId;
    db_1.db.updateUserSettings(userId, req.body);
    res.json({ success: true });
});
// --- Shopify Webhooks (Mock for now) ---
app.post('/api/webhooks/shopify/orders/create', (req, res) => {
    console.log('Received Shopify Webhook:', req.body);
    res.sendStatus(200);
});
// Shopify Auth Redirection
app.get('/api/shopify/auth', (req, res) => {
    const { shop } = req.query;
    if (!shop)
        return res.send('Missing shop parameter');
    const shopifyApiKey = process.env.SHOPIFY_API_KEY;
    const scope = 'read_orders,write_orders,read_products';
    const redirectUri = `${process.env.SHOPIFY_APP_URL}/api/shopify/callback`;
    const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${shopifyApiKey}&scope=${scope}&redirect_uri=${redirectUri}`;
    res.redirect(installUrl);
});
app.get('/api/shopify/callback', (req, res) => {
    const { shop, code } = req.query;
    // In real app: exchange code for access token
    res.send(`App successfully installed on ${shop}! (Mock Callback)`);
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

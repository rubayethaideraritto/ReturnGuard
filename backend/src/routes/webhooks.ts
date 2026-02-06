import express, { Request, Response } from 'express';
import { db } from '../db';
import { OrderRiskAgent } from '../agents/OrderRiskAgent';
import { shopifyService } from '../services/shopifyService';
import { narrativeEngine } from '../services/narrativeEngine';

const router = express.Router();
const riskAgent = new OrderRiskAgent();

// Shopify Order Creation Webhook
router.post('/shopify/orders/create', async (req: Request, res: Response) => {
    try {
        console.log('📦 New Shopify Order Webhook Received');

        const shopifyOrder = req.body;

        // Extract basic order info from webhook
        const orderId = shopifyOrder.id?.toString() || shopifyOrder.name;
        const customerId = shopifyOrder.customer?.id;

        if (!customerId) {
            console.warn('⚠️ No customer data in webhook');
            return res.status(200).json({ received: true, note: 'No customer data' });
        }

        // Fetch full customer history from Shopify
        console.log(`🔍 Fetching full context for order ${orderId}`);
        const orderData = await shopifyService.getOrderAnalysisData(orderId);

        // Analyze Risk
        const riskAnalysis = riskAgent.analyzeOrder(orderData);

        // Generate AI-like Narrative
        const narrative = narrativeEngine.generateRiskNarrative({
            order: orderData,
            riskAnalysis
        });

        const comparisonInsight = narrativeEngine.generateComparisonInsight({
            order: orderData,
            riskAnalysis
        });

        const customerMessage = narrativeEngine.generateCustomerMessage({
            order: orderData,
            riskAnalysis
        }, 'WhatsApp');

        // Update risk analysis with generated content
        riskAnalysis.reasoning_factors = [narrative];
        riskAnalysis.comparison_insight = comparisonInsight;

        // Store processed order
        const processedOrder = {
            ...orderData,
            riskAnalysis,
            generatedMessage: customerMessage ? {
                sent: false,
                content: customerMessage,
                channel: 'WhatsApp',
                metadata: { risk_context: riskAnalysis.risk_label }
            } : null,
            status: 'CONFIRMED',
            source: 'shopify_webhook'
        };

        // Find user by shop (for now, use first user or create a shop-user mapping)
        const users = db.getAllUsers();
        const userId = users[0]?.id || 'webhook-user';

        db.addOrder(processedOrder, userId);

        console.log(`✅ Order ${orderId} analyzed: ${riskAnalysis.risk_label} RISK (${riskAnalysis.risk_score_percent}%)`);

        res.status(200).json({
            received: true,
            order_id: orderId,
            risk: riskAnalysis.risk_label
        });
    } catch (error: any) {
        console.error('❌ Webhook processing error:', error.message);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

export const webhookRouter = router;

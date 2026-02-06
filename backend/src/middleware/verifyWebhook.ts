import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;

export const verifyShopifyWebhook = (req: Request, res: Response, next: NextFunction) => {
    if (!SHOPIFY_WEBHOOK_SECRET) {
        console.error('SHOPIFY_WEBHOOK_SECRET not configured');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const hmacHeader = req.get('X-Shopify-Hmac-Sha256');

    if (!hmacHeader) {
        console.warn('Webhook rejected: Missing HMAC header');
        return res.status(401).json({ error: 'Unauthorized: Missing signature' });
    }

    // Use the raw body buffer captured in index.ts for precise signature verification
    const rawBody = (req as any).rawBody;

    if (!rawBody) {
        console.error('Webhook rejected: rawBody not captured - check express.json config');
        return res.status(500).json({ error: 'Internal server error: body capture failed' });
    }


    const hash = crypto
        .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('base64');

    if (hash !== hmacHeader) {
        console.warn('Webhook rejected: Invalid HMAC signature');
        return res.status(401).json({ error: 'Unauthorized: Invalid signature' });
    }

    console.log('✓ Webhook verified successfully');
    next();
};


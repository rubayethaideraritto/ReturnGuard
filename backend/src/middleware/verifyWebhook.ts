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

    // Get raw body (express.json() already parsed it, we need raw for verification)
    const rawBody = JSON.stringify(req.body);

    const hash = crypto
        .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
        .update(rawBody, 'utf8')
        .digest('base64');

    if (hash !== hmacHeader) {
        console.warn('Webhook rejected: Invalid HMAC signature');
        return res.status(401).json({ error: 'Unauthorized: Invalid signature' });
    }

    console.log('✓ Webhook verified successfully');
    next();
};

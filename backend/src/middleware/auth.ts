import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // 1. Webhook Security (Mock HMAC check)
    if (req.path.startsWith('/api/webhooks')) {
        const hmac = req.header('X-Shopify-Hmac-Sha256');
        // In real app: crypto.createHmac(...).digest('base64') === hmac
        if (!hmac && process.env.NODE_ENV === 'production') {
            // For MVP development, we might skip strict check
            console.warn('[Security] Webhook missing HMAC signature');
        }
        return next();
    }

    // 2. Dashboard API Security (Simple token check)
    if (req.path.startsWith('/api/')) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer simple_token_')) {
            const userId = authHeader.replace('Bearer simple_token_', '');
            (req as any).userId = userId;
            return next();
        }

        // If it's a private API and no token, return 401
        // Allow public access for local MVP demo if not strictly necessary, 
        // but for isolation we NEED userId.
        const publicPaths = ['/api/auth/login', '/api/auth/signup'];
        if (publicPaths.includes(req.path)) {
            return next();
        }

        return res.status(401).json({ error: 'Unauthorized: Valid token required for isolation' });
    }

    next();
};

import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase-admin';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    // Skip OPTIONS requests (CORS preflight)
    if (req.method === 'OPTIONS') {
        next();
        return;
    }

    // 1. Webhook Security (Mock HMAC check) - Keep existing logic
    if (req.path.startsWith('/api/webhooks')) {
        const hmac = req.header('X-Shopify-Hmac-Sha256');
        if (!hmac && process.env.NODE_ENV === 'production') {
            console.warn('[Security] Webhook missing HMAC signature');
        }
        next();
        return;
    }

    // 2. API Security (Firebase Token Check)
    if (req.path.startsWith('/api/')) {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // Public routes exception
            const publicPaths = ['/api/auth/login', '/api/auth/signup', '/'];
            if (publicPaths.includes(req.path)) {
                next();
                return;
            }
            res.status(401).json({ error: 'Unauthorized: No token provided' });
            return;
        }

        const idToken = authHeader.split('Bearer ')[1];

        // Use Promise chain instead of async/await to satisfy Express types exactly
        auth.verifyIdToken(idToken)
            .then(decodedToken => {
                console.log(`[Auth] User Access: ${decodedToken.email} (${decodedToken.uid})`);
                (req as any).userId = decodedToken.uid;
                (req as any).userEmail = decodedToken.email;
                next();
            })
            .catch(error => {
                console.error('Token verification failed:', error);
                res.status(401).json({ error: 'Unauthorized: Invalid token' });
            });
        return;
    }

    next();
};

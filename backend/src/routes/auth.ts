import express, { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import { db, User } from '../db';
import crypto from 'crypto';

export const authRouter = Router();

// Legacy Auth Routes - Deprecated
// Authentication is now handled by Firebase on the frontend.
// Backend verifies tokens via authMiddleware.

authRouter.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Auth service is running (Firebase Mode)' });
});

export default authRouter;

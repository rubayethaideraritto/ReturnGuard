import express, { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import { db, User } from '../db';
import crypto from 'crypto';

export const authRouter = Router();

// Sign Up
authRouter.post('/signup', async (req: Request, res: Response) => {
    let { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    // Normalize email
    email = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser: User = {
        id: crypto.randomBytes(16).toString('hex'),
        email,
        passwordHash,
        createdAt: new Date().toISOString()
    };

    db.addUser(newUser);

    res.status(201).json({
        message: 'User created successfully',
        user: { id: newUser.id, email: newUser.email }
    });
});

// Sign In
authRouter.post('/login', async (req: Request, res: Response) => {
    let { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    // Normalize email
    email = email.toLowerCase().trim();

    // Find user
    const user = db.findUserByEmail(email);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // For MVP, we'll just return user data (in production, use JWT)
    res.json({
        message: 'Login successful',
        user: { id: user.id, email: user.email },
        token: `simple_token_${user.id}` // Mock token for MVP
    });
});

export default authRouter;

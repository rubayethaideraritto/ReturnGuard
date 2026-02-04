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
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../db");
const crypto_1 = __importDefault(require("crypto"));
exports.authRouter = (0, express_1.Router)();
// Sign Up
exports.authRouter.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    // Normalize email
    email = email.toLowerCase().trim();
    // Check if user already exists
    const existingUser = db_1.db.findUserByEmail(email);
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
    }
    // Hash password
    const passwordHash = yield bcryptjs_1.default.hash(password, 10);
    // Create user
    const newUser = {
        id: crypto_1.default.randomBytes(16).toString('hex'),
        email,
        passwordHash,
        createdAt: new Date().toISOString()
    };
    db_1.db.addUser(newUser);
    res.status(201).json({
        message: 'User created successfully',
        user: { id: newUser.id, email: newUser.email }
    });
}));
// Sign In
exports.authRouter.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    // Normalize email
    email = email.toLowerCase().trim();
    // Find user
    const user = db_1.db.findUserByEmail(email);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Verify password
    const isValidPassword = yield bcryptjs_1.default.compare(password, user.passwordHash);
    if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    // For MVP, we'll just return user data (in production, use JWT)
    res.json({
        message: 'Login successful',
        user: { id: user.id, email: user.email },
        token: `simple_token_${user.id}` // Mock token for MVP
    });
}));
exports.default = exports.authRouter;

import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Check if we have credentials in env or if we are using default
if (!admin.apps.length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        // If the JSON key is passed as a string in environment variable (Render/Production friendliness)
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } catch (error) {
            console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY');
        }
    } else {
        // Fallback to Application Default Credentials (good for local dev with Google Cloud CLI)
        // OR simply rely on GOOGLE_APPLICATION_CREDENTIALS path
        admin.initializeApp();
    }
}

export const auth = admin.auth();

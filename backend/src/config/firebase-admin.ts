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
            console.log('✅ Firebase Admin initialized via FIREBASE_SERVICE_ACCOUNT_KEY');
        } catch (error) {
            console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
        }
    } else {
        // Fallback to Application Default Credentials (good for local dev with Google Cloud CLI)
        try {
            admin.initializeApp();
            console.log('ℹ️ Firebase Admin initialized via Default Credentials');
        } catch (error) {
            console.warn('⚠️ Firebase Admin failed to initialize (Expected if local or no creds set)');
        }
    }
}

export const auth = admin.auth();

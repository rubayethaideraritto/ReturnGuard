import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyB5NmLdKTuUi2-ULftEhAqS3S-DjRu-0uc",
    authDomain: "returnguard-ai-rb.firebaseapp.com",
    projectId: "returnguard-ai-rb",
    storageBucket: "returnguard-ai-rb.firebasestorage.app",
    messagingSenderId: "642559934278",
    appId: "1:642559934278:web:169d85f10faf2d10596f47",
    measurementId: "G-S6V3R3461M"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

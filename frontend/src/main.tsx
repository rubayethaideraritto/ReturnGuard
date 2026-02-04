import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json"; // ← এটা যোগ করা হয়েছে (English translations)

import "@shopify/polaris/build/esm/styles.css";

import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode> {/* ← optional: StrictMode যোগ করলাম best practice-এর জন্য */}
        <AppProvider i18n={enTranslations}> {/* ← এখানে i18n prop যোগ করা হয়েছে */}
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </AppProvider>
    </React.StrictMode>
);
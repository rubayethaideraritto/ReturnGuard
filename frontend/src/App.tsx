import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { OrderSimulator } from './pages/OrderSimulator';
import { OrdersHistory } from './pages/OrdersHistory';
import { ReturnPortal } from './pages/ReturnPortal';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/signup" element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />} />
            <Route path="/returns" element={<Layout><ReturnPortal /></Layout>} />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Dashboard />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/simulate"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <OrderSimulator />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/orders"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <OrdersHistory />
                        </Layout>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;

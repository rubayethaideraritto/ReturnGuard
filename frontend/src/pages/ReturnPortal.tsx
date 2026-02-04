import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowRightLeft, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export const ReturnPortal = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        const formData = new FormData(e.currentTarget);
        const returnRequest = {
            return_id: `RET-${Math.floor(Math.random() * 10000)}`,
            order_id: formData.get('order_id'),
            reason: formData.get('reason'),
            item_condition: formData.get('item_condition'),
            customer_history: {
                total_returns: 0
            }
        };

        try {
            if (!user) throw new Error("Must be logged in");
            const token = await user.getIdToken();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/api/returns`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(returnRequest)
            });
            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Minimal Header */}
            <div className="border-b border-slate-200 pb-8 flex items-center justify-center relative">
                <button
                    onClick={() => navigate('/')}
                    className="absolute left-0 p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div className="text-center space-y-1">
                    <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">Return Request</h1>
                    <p className="text-slate-500 font-medium tracking-wide text-sm">Initiate a formal return process</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto">
                <Card className="border-slate-100 shadow-sm rounded-[2.5rem] bg-white overflow-hidden min-h-[400px] flex items-center justify-center relative">
                    <AnimatePresence mode="wait">
                        {result ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-12 flex flex-col items-center text-center max-w-md mx-auto space-y-6"
                            >
                                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-2">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Request Submitted</h3>
                                    <p className="text-slate-500 font-medium text-sm leading-relaxed">
                                        We have received your return request for order <span className="text-slate-900 font-bold">{result.order_id}</span>. Our team will review it and notify you shortly.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => { setResult(null); navigate('/'); }}
                                    className="h-12 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                                >
                                    Return to Dashboard
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onSubmit={handleSubmit}
                                className="w-full"
                            >
                                <CardHeader className="p-10 pb-4">
                                    <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
                                        Submission Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-10 space-y-8">
                                    <div className="space-y-6">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Order Identifier</label>
                                            <Input
                                                name="order_id"
                                                placeholder="e.g. ORD-12345"
                                                className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 text-sm font-bold focus:bg-white transition-all focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500"
                                                required
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Reason for Return</label>
                                                <select
                                                    name="reason"
                                                    className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all appearance-none"
                                                    required
                                                >
                                                    <option value="DEFECTIVE">Product Defective</option>
                                                    <option value="NOT_AS_DESCRIBED">Not as Described</option>
                                                    <option value="SIZE_ISSUE">Size/Fit Issue</option>
                                                    <option value="CHANGED_MIND">Changed Mind</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Product State</label>
                                                <select
                                                    name="item_condition"
                                                    className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all appearance-none"
                                                    required
                                                >
                                                    <option value="UNOPENED">Unopened / Sealed</option>
                                                    <option value="OPENED_UNUSED">Opened (Unused)</option>
                                                    <option value="USED">Used / Lightly Used</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-10 pt-0">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-14 text-xs font-bold uppercase tracking-[0.2em] rounded-[1.25rem] shadow-xl bg-slate-900 hover:bg-slate-800 transition-all active:scale-95"
                                    >
                                        {loading ? (
                                            <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
                                        ) : (
                                            'Process Decision'
                                        )}
                                    </Button>
                                </CardFooter>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </Card>
            </div>
        </div>
    );
};

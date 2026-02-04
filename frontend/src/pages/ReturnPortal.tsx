import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowRightLeft, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export const ReturnPortal = () => {
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
            const token = localStorage.getItem('returnguard_token');
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
                <Card className="border-slate-100 shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
                    <form onSubmit={handleSubmit}>
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

                            <AnimatePresence>
                                {result && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "p-8 rounded-[2rem] border-2 flex flex-col gap-4 shadow-sm",
                                            result.decision.approve ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "p-2.5 rounded-xl",
                                                result.decision.approve ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                                            )}>
                                                {result.decision.approve ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                            </div>
                                            <p className={cn("font-bold text-lg tracking-tight",
                                                result.decision.approve ? "text-emerald-900" : "text-rose-900")}>
                                                {result.decision.approve ? 'Request Approved' : 'Review Triggered'}
                                            </p>
                                        </div>
                                        <p className={cn("text-sm font-medium leading-relaxed opacity-80",
                                            result.decision.approve ? "text-emerald-700" : "text-rose-700")}>
                                            {result.decision.reasonings[0] || 'Decision reached based on automated product eligibility benchmarks.'}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
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
                    </form>
                </Card>
            </div>
        </div>
    );
};

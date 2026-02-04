import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { UploadCloud, RefreshCw, Zap, Shield, CheckCircle, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export const OrderSimulator = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        const formData = new FormData(e.currentTarget);
        const order = {
            order_id: `ORD-${Math.floor(Math.random() * 10000)}`,
            customer_id: formData.get('customer_id'),
            product_category: formData.get('product_category'),
            price: Number(formData.get('price')),
            return_history_count: Number(formData.get('return_history_count')) || 0,
            payment_method: formData.get('payment_method') || 'CARD',
            is_cod: formData.get('payment_method') === 'COD',
            account_age_days: Number(formData.get('account_age_days')) || 0,
            customer_avg_order_value: Number(formData.get('customer_avg_order_value')) || 0,
            past_returns: Number(formData.get('return_history_count')) || 0,
            past_orders: 5,
            is_guest: false
        };


        try {
            if (!user) {
                throw new Error("You must be logged in to run simulation results on your dashboard");
            }
            setError(null);
            const token = await user.getIdToken();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(order)
            });

            if (!res.ok) throw new Error(`Server returned ${res.status}`);

            const data = await res.json();
            setTimeout(() => {
                setResult(data);
                setLoading(false);
            }, 600);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to connect to AI engine');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Minimal Header */}
            <div className="flex items-end justify-between border-b border-slate-200 pb-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/')}
                        className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">AI Simulator</h1>
                        <p className="text-slate-500 font-medium tracking-wide text-sm">Stress-test your risk vectors</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 text-[11px] font-bold uppercase tracking-widest">
                        <Zap className="w-3.5 h-3.5 fill-current animate-pulse text-indigo-500" /> Live Analysis Active
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Configuration Panel */}
                <Card className="lg:col-span-4 border-slate-100 shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        <CardHeader className="p-8 border-b border-slate-50">
                            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <UploadCloud className="w-4 h-4 text-indigo-500" />
                                Model Parameters
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Customer ID</label>
                                    <Input name="customer_id" defaultValue="CUST-FREQ-RET" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 text-xs font-medium focus:bg-white transition-all focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500" required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Past Returns</label>
                                        <Input name="return_history_count" type="number" defaultValue="4" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 text-xs font-bold focus:bg-white transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Account Age (D)</label>
                                        <Input name="account_age_days" type="number" defaultValue="15" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 text-xs font-bold focus:bg-white transition-all" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Item Category</label>
                                    <Input name="product_category" defaultValue="Premium Electronics" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 text-xs font-semibold focus:bg-white transition-all" required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Price ($)</label>
                                        <Input name="price" type="number" defaultValue="1500" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 text-sm font-bold text-slate-900 focus:bg-white transition-all" required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Payment</label>
                                        <select name="payment_method" className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-4 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all appearance-none">
                                            <option value="COD">Cash on Delivery</option>
                                            <option value="CARD">Digital Payment</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="p-8 pt-0">
                            <Button type="submit" disabled={loading} className={cn(
                                "w-full h-14 text-xs font-bold uppercase tracking-[0.2em] rounded-[1.25rem] shadow-xl transition-all active:scale-95",
                                loading ? "bg-slate-100 text-slate-400" : "bg-slate-900 text-white hover:bg-slate-800"
                            )}>
                                {loading ? <RefreshCw className="mr-3 h-4 w-4 animate-spin text-slate-400" /> : <Zap className="mr-3 h-4 w-4 fill-indigo-400 text-indigo-400" />}
                                {loading ? 'Computing Risk...' : 'Execute Analysis'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Analysis Results View */}
                <div className="lg:col-span-8 h-full flex flex-col min-h-[600px]">
                    <AnimatePresence mode="wait">
                        {!result && !loading && (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="flex-grow flex flex-col items-center justify-center p-20 text-center bg-white border border-slate-100 rounded-[2.5rem] shadow-sm group"
                            >
                                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 group-hover:bg-indigo-50 group-hover:scale-105 transition-all duration-500">
                                    <Shield className="w-10 h-10 text-slate-200 group-hover:text-indigo-200 transition-colors" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">System Ready</h3>
                                <p className="text-sm text-slate-400 font-medium max-w-sm mx-auto mt-4 leading-relaxed">
                                    Awaiting input data for risk vectorization. Configure the parameters on the left to begin the simulation.
                                </p>
                            </motion.div>
                        )}

                        {loading && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="flex-grow flex flex-col items-center justify-center p-20 text-center bg-white border border-slate-100 rounded-[2.5rem] relative overflow-hidden"
                            >
                                <div className="absolute inset-x-0 top-0 h-1 bg-slate-50">
                                    <motion.div className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }} />
                                </div>
                                <ActivityLoader />
                                <h3 className="text-2xl font-bold text-slate-900 mt-8">Synthesizing Intent...</h3>
                                <p className="text-sm text-slate-400 mt-2 font-medium">Querying behavioral patterns and historical benchmarks</p>
                            </motion.div>
                        )}

                        {result && !loading && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="flex-grow flex flex-col"
                            >
                                <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm space-y-10 flex flex-col h-full">
                                    <div className="grid md:grid-cols-2 gap-10">
                                        <div className="space-y-8">
                                            <div className="space-y-4">
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Risk Assessment</p>
                                                <div className="flex items-center gap-6">
                                                    <div className={cn("px-6 py-2 rounded-2xl text-sm font-bold uppercase tracking-widest border",
                                                        result.riskAnalysis.risk_label === 'HIGH' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                            result.riskAnalysis.risk_label === 'MEDIUM' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                                "bg-indigo-50 text-indigo-600 border-indigo-100"
                                                    )}>
                                                        {result.riskAnalysis.risk_label} RISK
                                                    </div>
                                                    <div className="text-5xl font-bold text-slate-900 tracking-tighter">
                                                        {result.riskAnalysis.risk_score_percent}%
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <MetricCard label="Confidence" value={`${result.riskAnalysis.confidence_percent || 85}%`} icon={<CheckCircle className="w-4 h-4" />} />
                                                <MetricCard label="ROI Efficiency" value={`$${result.riskAnalysis.estimated_savings?.toFixed(0)}`} icon={<TrendingUp className="w-4 h-4" />} color="bg-emerald-50 text-emerald-600 border-emerald-100" />
                                            </div>
                                        </div>

                                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl flex flex-col justify-center">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />
                                            <div className="relative z-10 space-y-4">
                                                <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">AI Synthesis</p>
                                                <p className="text-lg leading-relaxed font-medium tracking-tight">
                                                    "{result.riskAnalysis.comparison_insight || 'Predictive markers suggest behavioral dissonance in recent transaction nodes.'}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-10 border-t border-slate-50 pt-10 mt-auto">
                                        <div className="space-y-5">
                                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                <ArrowRight className="w-4 h-4 text-indigo-500" />
                                                Behavioral Logic
                                            </h4>
                                            <div className="space-y-2">
                                                {result.riskAnalysis.reasoning_factors?.slice(0, 3).map((factor: string, i: number) => (
                                                    <div key={i} className="p-4 rounded-2xl bg-slate-50 text-xs font-medium text-slate-600 border border-slate-100/50 flex items-center gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                                        {factor}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4 flex flex-col justify-center">
                                            <div className="p-6 rounded-[1.5rem] bg-indigo-50/30 border border-indigo-100">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-[10px] font-bold text-indigo-900/50 uppercase tracking-widest leading-none">Protection Strength</span>
                                                    <span className="text-sm font-bold text-indigo-600 leading-none">{result.riskAnalysis.prevention_chance || 80}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-indigo-500"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${result.riskAnalysis.prevention_chance || 80}%` }}
                                                        transition={{ duration: 1.5, ease: "circOut" }}
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-center font-bold text-slate-300 uppercase tracking-[0.3em] mt-4">Risk Scoping Protocol Active</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, icon, color = "bg-slate-50 text-slate-900 border-slate-100" }: { label: string, value: string, icon: React.ReactNode, color?: string }) => (
    <div className={cn("p-4 rounded-2xl border flex flex-col justify-between min-h-[90px]", color)}>
        <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">{icon} {label}</div>
        <div className="text-xl font-bold">{value}</div>
    </div>
);

const ActivityLoader = () => (
    <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
            <motion.div
                key={i}
                className="w-4 h-4 bg-indigo-500 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
            />
        ))}
    </div>
);

const TrendingUp = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-9 9-4-4-6 6" />
    </svg>
);

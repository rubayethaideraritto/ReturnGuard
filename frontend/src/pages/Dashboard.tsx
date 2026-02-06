import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
    Activity,
    Package,
    ArrowRightLeft,
    TrendingUp,
    ShieldCheck,
    CheckCircle2,
    Bell,
    ArrowRight,
    ShieldAlert,
    RefreshCw,
    Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface Stats {
    totalOrders: number;
    returnRequests: number;
    preventedReturns: number;
    successRate: number;
    recentReturns: any[];
}

export const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        autoSend: true,
        manualApproval: false,
        strictMode: true
    });

    const fetchStats = async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/api/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/api/settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setSettings(data);
        } catch (error) {
            console.error('Failed to fetch settings', error);
        }
    };

    const toggleSetting = async (key: keyof typeof settings) => {
        if (!user) return;
        const newValue = !settings[key];
        const updatedSettings = { ...settings, [key]: newValue };
        setSettings(updatedSettings);

        try {
            const token = await user.getIdToken();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            await fetch(`${apiUrl}/api/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ [key]: newValue })
            });
        } catch (error) {
            console.error('Failed to update settings', error);
            fetchSettings();
        }
    };

    useEffect(() => {
        if (user) {
            fetchStats();
            fetchSettings();
            const interval = setInterval(fetchStats, 10000);
            return () => clearInterval(interval);
        }
    }, [user]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-slate-900" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Minimal Header */}
            <div className="flex items-end justify-between border-b border-slate-200 pb-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">Overview</h1>
                    <div className="flex items-center gap-2 text-slate-500 font-medium tracking-wide text-sm">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        AI AGENT STATUS: ACTIVE
                    </div>
                </div>
            </div>

            {/* Stat Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: Package, trend: '+12%', color: 'border-slate-100' },
                    { label: 'Returns Requested', value: stats?.returnRequests || 0, icon: ArrowRightLeft, trend: '-2%', color: 'border-slate-100' },
                    { label: 'Returns Prevented', value: stats?.preventedReturns || 0, icon: ShieldCheck, trend: '+5%', color: 'border-indigo-100 bg-indigo-50/10' },
                    { label: 'Protection Efficiency', value: `${stats?.successRate || 0}%`, icon: TrendingUp, trend: 'Optimal', color: 'border-slate-100' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                    >
                        <div className={`p-7 rounded-3xl border ${stat.color} shadow-sm group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden bg-white`}>
                            <div className="flex justify-between items-start relative z-10">
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                                    <h3 className="text-4xl font-bold text-slate-900 leading-none">{stat.value}</h3>
                                    <p className="text-xs font-semibold text-emerald-600 mt-3 flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        {stat.trend} <span className="text-slate-400">vs last month</span>
                                    </p>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-slate-50 text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300 shadow-inner">
                                    <stat.icon className="w-6 h-6 stroke-[1.5]" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* AI Configuration - Left Side */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-indigo-500" />
                                    AI Engine Config
                                </h3>
                                <p className="text-slate-500 text-sm font-medium mt-1">Autonomous protection settings</p>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                                Active
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { id: 'autoSend', label: 'Auto-Response', desc: 'Send AI messages for risky orders', icon: Zap },
                                { id: 'manualApproval', label: 'Manual Review', desc: 'Flag high-risk orders for approval', icon: ShieldAlert },
                                { id: 'strictMode', label: 'Strict Logic', desc: 'Enhanced patterns & fraud detection', icon: ShieldCheck }
                            ].map((s) => (
                                <div key={s.id} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-between group/item">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 rounded-xl bg-white text-slate-600 shadow-sm border border-slate-100 group-hover/item:text-indigo-600 transition-colors">
                                            <s.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900">{s.label}</h4>
                                            <p className="text-xs text-slate-500 font-medium">{s.desc}</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={(settings as any)[s.id]}
                                            onChange={() => setSettings(prev => ({ ...prev, [s.id]: !(prev as any)[s.id] }))}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/50">
                                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                    <Zap className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-0.5">Optimization Tip</p>
                                    <p className="text-xs text-indigo-700 font-medium">Enabling "Strict Logic" reduces return rates by ~15%.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity / Visual Stats - Right Side */}
                <div className="lg:col-span-8 space-y-8">
                    <Card className="rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden bg-white hover:shadow-lg transition-all">
                        <CardHeader className="flex flex-row items-center justify-between px-8 pt-8">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold text-slate-900">Health Monitoring</CardTitle>
                                <CardDescription className="text-sm font-medium">Global store protection metrics</CardDescription>
                            </div>
                            <Button variant="ghost" className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center gap-2" onClick={() => navigate('/orders')}>
                                Logs
                                <ArrowRight className="w-3 h-3" />
                            </Button>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 space-y-8">
                            <div className="h-48 w-full bg-slate-50 rounded-3xl flex items-center justify-center border-2 border-dashed border-slate-200 group">
                                <div className="text-center space-y-2">
                                    <Activity className="w-8 h-8 text-slate-300 mx-auto group-hover:text-indigo-400 transition-colors" />
                                    <p className="text-slate-400 font-bold text-xs tracking-widest uppercase">Chart Visualization Pending Live Data</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 rounded-3xl border border-slate-100 bg-white">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">API Uptime</span>
                                    </div>
                                    <h4 className="text-2xl font-bold text-slate-900">99.9%</h4>
                                </div>
                                <div className="p-5 rounded-3xl border border-slate-100 bg-white">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                            <Bell className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Alerts</span>
                                    </div>
                                    <h4 className="text-2xl font-bold text-slate-900">{stats?.returnRequests || 0}</h4>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Active Return Requests Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Active Return Requests</h3>
                        <p className="text-sm text-slate-500 font-medium">Manage pending returns and AI decisions</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => fetchStats()} className="rounded-xl border-slate-200">
                        <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                </div>

                <div className="grid gap-4">
                    {stats?.recentReturns && stats.recentReturns.length > 0 ? (
                        stats.recentReturns.map((order: any) => (
                            <Card key={order.order_id} className="group overflow-hidden border-slate-100 hover:shadow-md transition-all rounded-[2rem]">
                                <div className="p-6 flex flex-col md:flex-row items-center gap-6">
                                    <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
                                        <ArrowRightLeft className="w-6 h-6" />
                                    </div>

                                    <div className="flex-1 space-y-1 text-center md:text-left">
                                        <div className="flex items-center justify-center md:justify-start gap-3">
                                            <h4 className="font-bold text-slate-900">{order.order_id}</h4>
                                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                                                {order.product_category}
                                            </span>
                                        </div>
                                        <div className="text-sm font-medium text-slate-500 flex flex-wrap gap-x-4 justify-center md:justify-start">
                                            <span>Reason: <strong className="text-slate-900">{order.returnRequest?.reason}</strong></span>
                                            <span>Condition: <strong className="text-slate-900">{order.returnRequest?.condition}</strong></span>
                                        </div>
                                    </div>

                                    <div className="hidden md:block w-px h-12 bg-slate-100" />

                                    <div className="flex-1 space-y-2 min-w-[200px]">
                                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                                            <span>AI Recommendation</span>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-lg",
                                                order.returnRequest?.decision?.auto_approved ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                            )}>
                                                {order.returnRequest?.decision?.auto_approved ? "Approve" : "Manual Review"}
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-slate-600 line-clamp-2 leading-relaxed">
                                            {order.returnRequest?.decision?.reasoning || 'Pending review'}
                                        </p>
                                    </div>

                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="p-16 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 custom-shadow">
                                <Package className="w-6 h-6 text-slate-300" />
                            </div>
                            <h4 className="text-slate-900 font-bold mb-1">No Active Returns</h4>
                            <p className="text-slate-400 font-medium text-sm">New return requests will appear here instantly</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

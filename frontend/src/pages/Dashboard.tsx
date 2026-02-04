import { useEffect, useState } from 'react';
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
    ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Stats {
    totalOrders: number;
    returnRequests: number;
    preventedReturns: number;
    successRate: number;
}

export const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        autoSend: true,
        manualApproval: false,
        strictMode: true
    });

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('returnguard_token');
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
        try {
            const token = localStorage.getItem('returnguard_token');
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
        const newValue = !settings[key];
        const updatedSettings = { ...settings, [key]: newValue };
        setSettings(updatedSettings);

        try {
            const token = localStorage.getItem('returnguard_token');
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
        fetchStats();
        fetchSettings();
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);

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
                    <div className="p-8 rounded-[2rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden border border-slate-800">
                        <div className="absolute top-0 right-0 p-8">
                            <Activity className="w-8 h-8 text-indigo-400/30 animate-pulse" />
                        </div>
                        <div className="space-y-6 relative z-10">
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight">ReturnGuard AI</h3>
                                <p className="text-slate-400 text-sm mt-1">Configure your automation engine</p>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { id: 'autoSend', label: 'Autonomous Response', desc: 'Auto-messaging for risky orders' },
                                    { id: 'manualApproval', label: 'Manual Review Mode', desc: 'Hold for approval' },
                                    { id: 'strictMode', label: 'Strict Logic', desc: 'Enhanced behavioral policing' }
                                ].map((s) => (
                                    <div key={s.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-bold tracking-tight">{s.label}</span>
                                            <button
                                                onClick={() => toggleSetting(s.id as keyof typeof settings)}
                                                className={`w-11 h-6 rounded-full transition-all relative ${settings[s.id as keyof typeof settings] ? 'bg-indigo-500' : 'bg-slate-700'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings[s.id as keyof typeof settings] ? 'right-1' : 'left-1'}`} />
                                            </button>
                                        </div>
                                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{s.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-indigo-50 border border-indigo-100/50 flex items-start gap-4">
                        <ShieldAlert className="w-6 h-6 text-indigo-500 mt-1 shrink-0" />
                        <div>
                            <p className="font-bold text-indigo-900 text-sm">Optimization Tip</p>
                            <p className="text-xs text-indigo-700 leading-relaxed mt-1">
                                Enabling "Strict Logic" can reduce returns by an additional 12% on high-risk electronics.
                            </p>
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
        </div>
    );
};

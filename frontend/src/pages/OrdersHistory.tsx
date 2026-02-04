import { Search, CheckCircle, Clock, MoreHorizontal, ArrowLeft, Filter, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';

export const OrdersHistory = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;
    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('returnguard_token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/api/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setOrders(data.reverse());
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const filteredOrders = orders.filter(order =>
        order.order_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.product_category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
                        <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">Orders</h1>
                        <p className="text-slate-500 font-medium tracking-wide text-sm">Protected by ReturnGuard AI</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter orders..."
                            className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="rounded-2xl border-slate-200 font-bold text-xs uppercase px-5 py-6">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden border-t-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30">
                                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Reference</th>
                                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Item Details</th>
                                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">AI Risk</th>
                                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Verdict</th>
                                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedOrders.map((order, i) => {
                                const analysis = order.riskAnalysis || {};
                                return (
                                    <motion.tr
                                        key={order.order_id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">#{order.order_id}</span>
                                                <span className="text-xs font-medium text-slate-400 mt-1">{order.customer_id || 'Guest'}</span>
                                            </div>
                                        </td>

                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-700">{order.product_category}</span>
                                                <span className="text-sm font-bold text-slate-900 mt-1">${order.price}</span>
                                            </div>
                                        </td>

                                        <td className="px-8 py-6">
                                            <div className="flex flex-col items-center gap-2 max-w-[120px] mx-auto">
                                                <div className="flex items-end gap-1 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                                    <span className="text-xl font-bold text-slate-900">{analysis.risk_score_percent || 0}%</span>
                                                </div>
                                                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-1000",
                                                            analysis.risk_label === 'HIGH' ? 'bg-rose-500' :
                                                                analysis.risk_label === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-400'
                                                        )}
                                                        style={{ width: `${analysis.risk_score_percent || 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-8 py-6 text-right md:text-left">
                                            <div className={cn(
                                                "inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest",
                                                analysis.risk_label === 'HIGH' ? "bg-rose-50 text-rose-600 border border-rose-100" :
                                                    analysis.risk_label === 'MEDIUM' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                                        "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                            )}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full",
                                                    analysis.risk_label === 'HIGH' ? "bg-rose-500" :
                                                        analysis.risk_label === 'MEDIUM' ? "bg-amber-500" : "bg-emerald-500"
                                                )} />
                                                {analysis.risk_label || 'SECURE'}
                                            </div>
                                        </td>

                                        <td className="px-8 py-6 text-right">
                                            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-white border border-transparent hover:border-slate-100 shadow-none hover:shadow-sm">
                                                <MoreHorizontal className="w-4 h-4 text-slate-400" />
                                            </Button>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Package className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No Orders Found</h3>
                        <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
                            No orders match your current search criteria. Try a different query.
                        </p>
                    </div>
                )}

                {/* Refined Pagination */}
                {totalPages > 1 && (
                    <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {filteredOrders.length} RESULTS
                        </p>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-2xl border-slate-200 bg-white"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                            >
                                Back
                            </Button>
                            <span className="text-sm font-bold text-slate-900">{currentPage} of {totalPages}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-2xl border-slate-200 bg-white"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

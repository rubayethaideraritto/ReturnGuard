import React, { useEffect, useState } from 'react';

interface Stats {
    totalOrders: number;
    highRiskOrders: number;
    preventedReturns: number;
    estimatedSavings: number;
    recentOrders: any[];
}

export const Dashboard = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/api/stats`);
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 5000); // Refresh every 5s
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="p-8">Loading Dashboard...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Orders" value={stats?.totalOrders || 0} color="bg-blue-50" textColor="text-blue-700" />
                <StatCard title="High Risk Orders" value={stats?.highRiskOrders || 0} color="bg-red-50" textColor="text-red-700" />
                <StatCard title="Prevented Returns" value={stats?.preventedReturns || 0} color="bg-green-50" textColor="text-green-700" />
                <StatCard title="Est. Revenue Saved" value={`$${stats?.estimatedSavings || 0}`} color="bg-yellow-50" textColor="text-yellow-700" />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Live Orders</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {stats?.recentOrders.map((order: any, idx: number) => (
                                <tr key={idx}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.order_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.product_category} (${order.price})</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${order.riskAnalysis.risk_label === 'HIGH' ? 'bg-red-100 text-red-800' :
                                                order.riskAnalysis.risk_label === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                            {order.riskAnalysis.risk_score_percent}% ({order.riskAnalysis.risk_label})
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {order.generatedMessage ? (
                                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">Msg Sent</span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No orders yet. Send a POST request to /api/orders</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, color, textColor }: { title: string, value: string | number, color: string, textColor: string }) => (
    <div className={`${color} rounded-lg p-6 shadow-sm border border-opacity-50`}>
        <h3 className={`text-sm font-medium ${textColor} uppercase tracking-wider`}>{title}</h3>
        <p className={`mt-2 text-3xl font-bold ${textColor}`}>{value}</p>
    </div>
);

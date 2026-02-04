import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, RefreshCcw, LogOut, ShoppingBag } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Orders history', path: '/orders', icon: RefreshCcw }, // Added history link
        { name: 'Simulate Order', path: '/simulate', icon: ShoppingBag },
        { name: 'Return Portal', path: '/returns', icon: ShoppingCart }, // Switched icon to return
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 flex font-sans">
            {/* Sidebar - Sticky and Full Height */}
            <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col h-screen sticky top-0 flex-shrink-0">
                <div className="h-16 flex items-center px-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">R</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">ReturnGuard</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sign Out - Targeted specifically to Dashboard for a neat look */}
                {(location.pathname === '/' || location.pathname === '/dashboard') && (
                    <div className="mt-auto p-6 border-t border-slate-50">
                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 font-bold transition-all rounded-xl"
                        >
                            <LogOut className="w-4 h-4 mr-3" />
                            Sign Out
                        </Button>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Global Header */}
                <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex items-center px-4 sm:px-8 justify-between sticky top-0 z-30">
                    <div className="md:hidden flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">R</span>
                        </div>
                        <span className="font-bold text-slate-900">ReturnGuard</span>
                    </div>

                    <div className="hidden md:block">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            AI Engine Synchronized
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-xs font-black text-slate-900">Admin Account</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Pro Shield active</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;

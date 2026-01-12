import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Layers, Tag, Menu, X, LogOut } from 'lucide-react';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Products', path: '/admin/products', icon: <Package size={20} /> },
        { name: 'Categories', path: '/admin/categories', icon: <Layers size={20} /> },
        { name: 'Tags', path: '/admin/tags', icon: <Tag size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                    <span className={`font-bold text-xl text-gray-800 ${!sidebarOpen && 'hidden'}`}>Admin Panel</span>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded hover:bg-gray-100 text-gray-600">
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                {item.icon}
                                {sidebarOpen && <span className="font-medium">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                            A
                        </div>
                        {sidebarOpen && (
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-gray-700">Admin</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
                    <h1 className="text-lg font-semibold text-gray-800">
                        {navItems.find((item) => item.path === location.pathname)?.name || 'Dashboard'}
                    </h1>
                </header>

                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;

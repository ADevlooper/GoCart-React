import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        tags: 0,
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [productsRes, categoriesRes, tagsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/products`),
                fetch(`${API_BASE_URL}/categories`),
                fetch(`${API_BASE_URL}/tags`),
            ]);

            const productsData = await productsRes.json();
            const categoriesData = await categoriesRes.json();
            const tagsData = await tagsRes.json();

            setStats({
                products: (productsData.products || productsData.data || []).length,
                categories: (categoriesData.categories || categoriesData.data || []).length,
                tags: (tagsData.tags || tagsData.data || []).length,
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const StatCard = ({ title, value, onClick }) => (
        <div
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:border-blue-300 transition-colors"
            onClick={onClick}
        >
            <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider">{title}</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
    );

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Total Products"
                    value={stats.products}
                    onClick={() => navigate('/admin/products')}
                />
                <StatCard
                    title="Categories"
                    value={stats.categories}
                    onClick={() => navigate('/admin/categories')}
                />
                <StatCard
                    title="Tags"
                    value={stats.tags}
                    onClick={() => navigate('/admin/tags')}
                />
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/admin/products')}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Manage Products
                    </button>
                    <button
                        onClick={() => navigate('/admin/categories')}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                    >
                        Manage Categories
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

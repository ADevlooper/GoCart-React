import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import Toaster from '../components/toaster';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [editingId, setEditingId] = useState(null);
    const [toaster, setToaster] = useState(null);

    useEffect(() => {
        loadCategories();
    }, []);

    const showToaster = (message) => {
        setToaster(message);
        setTimeout(() => setToaster(null), 3000);
    };

    const loadCategories = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/categories`);
            const data = await res.json();
            setCategories(data.data || data.categories || []);
        } catch (error) {
            showToaster('Error loading categories');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            showToaster('Please enter category name');
            return;
        }

        try {
            const url = editingId
                ? `${API_BASE_URL}/categories/${editingId}`
                : `${API_BASE_URL}/categories`;

            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    description: formData.description.trim()
                }),
            });

            if (res.ok) {
                showToaster(editingId ? 'Category updated successfully' : 'Category created successfully');
                resetForm();
                loadCategories();
            } else {
                showToaster(editingId ? 'Failed to update category' : 'Failed to create category');
            }
        } catch (error) {
            showToaster('Operation failed');
        }
    };

    const handleEditClick = (category) => {
        setEditingId(category.id);
        setFormData({
            name: category.name,
            description: category.description || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this category?')) return;

        try {
            const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                showToaster('Category deleted successfully');
                loadCategories();
                if (editingId === id) resetForm();
            } else {
                showToaster('Failed to delete category');
            }
        } catch (error) {
            showToaster('Error deleting category');
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ name: '', description: '' });
    };

    return (
        <div className="flex flex-col md:flex-row gap-6">
            {toaster && <Toaster message={toaster} />}

            <div className="md:w-1/3">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200 sticky top-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        {editingId ? 'Edit Category' : 'Add Category'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 p-2 rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 p-2 rounded"
                                rows="3"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                {editingId ? 'Update' : 'Create'}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            <div className="md:w-2/3">
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {categories.map((category) => (
                                <tr key={category.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {category.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {category.description || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEditClick(category)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminCategories;

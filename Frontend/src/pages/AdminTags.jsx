import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import Toaster from '../components/toaster';

const AdminTags = () => {
    const [tags, setTags] = useState([]);
    const [formData, setFormData] = useState({ name: '' });
    const [editingId, setEditingId] = useState(null);
    const [toaster, setToaster] = useState(null);

    useEffect(() => {
        loadTags();
    }, []);

    const showToaster = (message) => {
        setToaster(message);
        setTimeout(() => setToaster(null), 3000);
    };

    const loadTags = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/tags`);
            const data = await res.json();
            setTags(data.data || data.tags || []);
        } catch (error) {
            showToaster('Error loading tags');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            showToaster('Please enter tag name');
            return;
        }

        try {
            const url = editingId
                ? `${API_BASE_URL}/tags/${editingId}`
                : `${API_BASE_URL}/tags`;

            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formData.name.trim() }),
            });

            if (res.ok) {
                showToaster(editingId ? 'Tag updated successfully' : 'Tag created successfully');
                resetForm();
                loadTags();
            } else {
                showToaster(editingId ? 'Failed to update tag' : 'Failed to create tag');
            }
        } catch (error) {
            showToaster('Operation failed');
        }
    };

    const handleEditClick = (tag) => {
        setEditingId(tag.id);
        setFormData({ name: tag.name });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this tag?')) return;

        try {
            const res = await fetch(`${API_BASE_URL}/tags/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                showToaster('Tag deleted successfully');
                loadTags();
                if (editingId === id) resetForm();
            } else {
                showToaster('Failed to delete tag');
            }
        } catch (error) {
            showToaster('Error deleting tag');
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ name: '' });
    };

    return (
        <div className="flex flex-col md:flex-row gap-6">
            {toaster && <Toaster message={toaster} />}

            <div className="md:w-1/3">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200 sticky top-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        {editingId ? 'Edit Tag' : 'Add Tag'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tag Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 p-2 rounded"
                                placeholder="#tagname"
                                required
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tags.map((tag) => (
                                <tr key={tag.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {tag.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {tag.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEditClick(tag)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tag.id)}
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

export default AdminTags;

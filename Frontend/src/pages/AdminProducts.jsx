import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import Toaster from '../components/toaster';

import { X, Upload, Edit, Trash2, Eye } from 'lucide-react';
import ProductImage from '../components/ProductImage';




const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [selectedTagIds, setSelectedTagIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [toaster, setToaster] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    // View Modal State
    const [viewProduct, setViewProduct] = useState(null);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);

    // Image states
    const [existingImages, setExistingImages] = useState([]);
    const [deletedImageIds, setDeletedImageIds] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);

    const [formData, setFormData] = useState({
        id: '',
        title: '',
        description: '',
        price: '',
        discount: '0',
        stock: '',
        availableStock: '',
        brand: '',
        warrantyInfo: '',
        categoryIds: [],
    });

    useEffect(() => {
        loadProducts();
        loadCategories();
        loadTags();
    }, []);

    const showToaster = (message) => {
        setToaster(message);
        setTimeout(() => setToaster(null), 3000);
    };

    const loadProducts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/products`);
            const data = await res.json();
            setProducts(data.products || data.data || []);
        } catch (error) {
            showToaster('Error loading products');
        }
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
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (e) => {
        const options = Array.from(e.target.selectedOptions);
        const categoryIds = options.map((opt) => Number(opt.value));
        setFormData((prev) => ({ ...prev, categoryIds }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setNewImages((prev) => [...prev, ...files]);
            const newPreviews = files.map((file) => URL.createObjectURL(file));
            setNewImagePreviews((prev) => [...prev, ...newPreviews]);
        }
    };

    const removeExistingImage = (imgId) => {
        setDeletedImageIds((prev) => [...prev, imgId]);
    };

    const removeNewImage = (index) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index));
        setNewImagePreviews((prev) => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleTagSelect = (e) => {
        const tagId = Number(e.target.value);
        if (tagId && !selectedTagIds.includes(tagId)) {
            setSelectedTagIds([...selectedTagIds, tagId]);
        }
    };

    const removeTag = (tagId) => {
        setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.price || !formData.stock) {
            showToaster('Please fill in all required fields');
            return;
        }

        if (formData.categoryIds.length === 0) {
            showToaster('Please select at least one category');
            return;
        }

        const fd = new FormData();
        fd.append('title', formData.title);
        fd.append('description', formData.description);
        fd.append('price', formData.price);
        fd.append('discount', formData.discount);
        fd.append('stock', formData.stock);
        fd.append('availableStock', formData.availableStock);
        fd.append('brand', formData.brand);
        fd.append('warrantyInfo', formData.warrantyInfo);
        fd.append('categoryIds', JSON.stringify(formData.categoryIds));
        fd.append('tags', JSON.stringify(selectedTagIds));

        if (deletedImageIds.length > 0) {
            fd.append('deletedImageIds', JSON.stringify(deletedImageIds));
        }

        newImages.forEach((file) => {
            fd.append('images', file);
        });

        try {
            const url = formData.id
                ? `${API_BASE_URL}/products/${formData.id}`
                : `${API_BASE_URL}/products`;
            const method = formData.id ? 'PUT' : 'POST';

            const res = await fetch(url, { method, body: fd });

            if (res.ok) {
                showToaster(formData.id ? 'Product updated successfully' : 'Product created successfully');
                resetForm();
                loadProducts();
                setIsFormVisible(false);
                setIsFormVisible(false);
            } else {
                const data = await res.json();
                showToaster(data.message || 'Failed to save product');
            }
        } catch (error) {
            showToaster('Error saving product');
        }
    };

    const resetForm = () => {
        setFormData({
            id: '',
            title: '',
            description: '',
            price: '',
            discount: '0',
            stock: '',
            availableStock: '',
            brand: '',
            warrantyInfo: '',
            categoryIds: [],
        });
        setSelectedTagIds([]);
        setExistingImages([]);
        setDeletedImageIds([]);
        setNewImages([]);
        setNewImagePreviews([]);
    };

    const handleEdit = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/products/${id}`);
            const data = await res.json();
            const product = data.product || data.data;

            if (!product) {
                showToaster('Product not found');
                return;
            }

            setFormData({
                id: product.id,
                title: product.title || '',
                description: product.description || '',
                price: product.price || '',
                discount: product.discount || '0',
                stock: product.stock || '',
                availableStock: product.availableStock || '',
                brand: product.brand || '',
                warrantyInfo: product.warrantyInfo || '',
                categoryIds: (product.categories || []).map((c) => c.id),
            });

            setSelectedTagIds((product.tags || []).map((t) => t.id));
            setExistingImages(product.images || []);
            setDeletedImageIds([]);
            setNewImages([]);
            setNewImagePreviews([]);

            setIsFormVisible(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            showToaster('Error loading product');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this product?')) return;

        try {
            const res = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                showToaster('Product deleted successfully');
                loadProducts();
            } else {
                const data = await res.json();
                showToaster(data.message || 'Failed to delete product');
            }
        } catch (error) {
            showToaster('Error deleting product');
        }
    };

    const handleView = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/products/${id}`);
            const data = await res.json();
            const product = data.product || data.data;

            if (!product) {
                showToaster('Product not found');
                return;
            }
            setViewProduct(product);
            setIsViewModalVisible(true);
        } catch (error) {
            showToaster('Error loading product');
        }
    };

    const filteredProducts = products.filter((p) =>
        (p.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {toaster && <Toaster message={toaster} />}

            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Products</h2>
                <button
                    onClick={() => {
                        resetForm();
                        setIsFormVisible(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Add Product
                </button>
            </div>

            {/* View Product Modal */}
            {isViewModalVisible && viewProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                            <h3 className="text-xl font-bold text-gray-800">{viewProduct.title}</h3>
                            <button
                                onClick={() => setIsViewModalVisible(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Images Carousel/Grid */}
                            {viewProduct.images && viewProduct.images.length > 0 && (
                                <div className="flex gap-4 overflow-x-auto pb-4">
                                    {viewProduct.images.map((img, idx) => (
                                        <ProductImage
                                            key={idx}
                                            src={img.preview || img}
                                            alt={viewProduct.title}
                                            className="h-48 w-auto object-cover rounded shadow"
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-500 block">Price</span>
                                    <span className="text-lg font-semibold">₹{viewProduct.price}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500 block">Stock</span>
                                    <span className="font-medium text-gray-800">{viewProduct.stock} (Available: {viewProduct.availableStock})</span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500 block">Brand</span>
                                    <span className="font-medium text-gray-800">{viewProduct.brand || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500 block">Warranty</span>
                                    <span className="font-medium text-gray-800">{viewProduct.warrantyInfo || '-'}</span>
                                </div>
                            </div>

                            <div>
                                <span className="text-sm text-gray-500 block mb-1">Description</span>
                                <p className="text-gray-700 whitespace-pre-line">{viewProduct.description}</p>
                            </div>

                            <div>
                                <span className="text-sm text-gray-500 block mb-1">Categories</span>
                                <div className="flex flex-wrap gap-2">
                                    {(viewProduct.categories || []).map((c, i) => (
                                        <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{c}</span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <span className="text-sm text-gray-500 block mb-1">Tags</span>
                                <div className="flex flex-wrap gap-2">
                                    {(viewProduct.tags || []).map((t, i) => (
                                        <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{t}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setIsViewModalVisible(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isFormVisible && (
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            {formData.id ? 'Edit Product' : 'Add New Product'}
                        </h3>
                        <button onClick={() => setIsFormVisible(false)} className="text-gray-500 hover:text-gray-700">
                            Close
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 p-2 rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 p-2 rounded"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                multiple
                                value={formData.categoryIds}
                                onChange={handleCategoryChange}
                                className="w-full border border-gray-300 p-2 rounded h-24"
                            >
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500">Hold Ctrl to select multiple</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {selectedTagIds.map(id => {
                                    const tag = tags.find(t => t.id === id);
                                    return tag ? (
                                        <span key={id} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm flex items-center">
                                            {tag.name}
                                            <button type="button" onClick={() => removeTag(id)} className="ml-1 text-gray-500 hover:text-red-500">
                                                &times;
                                            </button>
                                        </span>
                                    ) : null;
                                })}
                            </div>
                            <select
                                onChange={handleTagSelect}
                                className="w-full border border-gray-300 p-2 rounded"
                                value=""
                            >
                                <option value="">Select a tag...</option>
                                {tags.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
                            <div className="space-y-4">
                                {/* Existing Images */}
                                {existingImages.filter(img => !deletedImageIds.includes(img.id)).length > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-2">Existing Images</p>
                                        <div className="flex flex-wrap gap-4">
                                            {existingImages
                                                .filter((img) => !deletedImageIds.includes(img.id))
                                                .map((img) => (
                                                    <div key={img.id} className="relative group">
                                                        <ProductImage
                                                            src={img.preview || img}
                                                            alt="Product"
                                                            className="w-24 h-24 object-cover rounded border border-gray-200"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeExistingImage(img.id)}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* New Images Preview */}
                                {newImagePreviews.length > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-2">New Images to Upload</p>
                                        <div className="flex flex-wrap gap-4">
                                            {newImagePreviews.map((src, index) => (
                                                <div key={index} className="relative group">
                                                    <ProductImage
                                                        src={src}
                                                        alt="New upload"
                                                        className="w-24 h-24 object-cover rounded border border-gray-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* File Input */}
                                <div className="border border-dashed border-gray-300 rounded p-4 text-center cursor-pointer hover:bg-gray-50 relative">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept="image/*"
                                    />
                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                        <Upload size={24} className="mb-2" />
                                        <span className="text-sm">Click to select images (supports multiple)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsFormVisible(false)}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Save Product
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded max-w-sm"
                    />
                </div>

                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.map((product) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <ProductImage product={product} className="w-10 h-10 object-cover rounded-full border border-gray-200 shadow-sm" fallbackIconSize={18} />
                                    </td>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{product.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    ₹{product.price}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {product.stock}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end items-center gap-3">
                                        <button
                                            onClick={() => handleView(product.id)}
                                            className="text-gray-500 hover:text-blue-600"
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(product.id)}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="Edit"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="text-red-500 hover:text-red-700"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProducts;

import { API_BASE_URL } from '../config/api';

/**
 * Resolves the absolute URL for a product image.
 * @param {string|object} image - The image object or string path/url.
 * @param {string} variant - The preferred variant ('thumbnail', 'preview', 'original').
 * @returns {string|null} The absolute URL or null if invalid.
 */
export const getImageUrl = (image, variant = 'preview') => {
    if (!image) return null;

    // Handle string (legacy or direct path)
    if (typeof image === 'string') {
        if (image.startsWith('http')) return image;
        if (image.startsWith('data:')) return image; // Handle data URIs
        if (image.startsWith('blob:')) return image; // Handle blob URIs

        // Clean relative path
        const cleanPath = image.startsWith('/') ? image : `/${image}`;
        return `${API_BASE_URL.replace('/api', '')}${cleanPath}`;
    }

    // Handle object structure { thumbnail, preview, original }
    // Try preferred variant, then fallbacks
    const path = image[variant] || image.preview || image.original || image.thumbnail;

    if (!path) return null;

    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL.replace('/api', '')}${cleanPath}`;
};

/**
 * Helper to get the main image URL from a product object.
 * @param {object} product - The product object.
 * @returns {string|null} The resolved URL.
 */
export const getProductMainImage = (product) => {
    if (!product) return null;

    // Check images array
    if (product.images && product.images.length > 0) {
        return getImageUrl(product.images[0]);
    }

    // Check direct properties
    if (product.thumbnail) return getImageUrl(product.thumbnail);
    if (product.image) return getImageUrl(product.image);

    return null;
};

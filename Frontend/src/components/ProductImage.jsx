import React, { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

const ProductImage = ({
    src,
    product,
    alt,
    className = "",
    variant = 'preview',
    fallbackIconSize = 24
}) => {
    const [error, setError] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);

    useEffect(() => {
        let url = src;
        if (!url && product) {
            // Logic to verify if direct string or object
            if (product.images && product.images.length > 0) {
                url = getImageUrl(product.images[0], variant);
            } else if (product.thumbnail) {
                url = getImageUrl(product.thumbnail, variant);
            } else if (product.image) {
                url = getImageUrl(product.image, variant);
            }
        } else if (url) {
            // Resolve provided src string too ensuring it has base path
            url = getImageUrl(url);
        }

        setImageSrc(url);
        setError(false); // Reset error when inputs change
    }, [src, product, variant]);

    if (!imageSrc || error) {
        return (
            <div
                className={`bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200 ${className}`}
                title={alt || product?.title || "No Image"}
            >
                <ImageIcon size={fallbackIconSize} />
            </div>
        );
    }

    return (
        <img
            src={imageSrc}
            alt={alt || product?.title || 'Product Image'}
            className={className}
            onError={() => setError(true)}
        />
    );
};

export default ProductImage;

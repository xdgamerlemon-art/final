import { useEffect, useState } from 'react';
import { productPhoto } from '../../data/productImages.js';

export default function ProductPhoto({ product, alt, className = '', loading = 'lazy' }) {
  const fallback = productPhoto({ ...product, imageUrl: '' }, 900);
  const [source, setSource] = useState(productPhoto(product));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSource(productPhoto(product));
    setFailed(false);
  }, [product._id, product.imageUrl, product.category, product.title]);

  return <div className={`product-photo ${className}`}>
    {failed ? <span className="product-art" aria-hidden="true">✳</span> : <img src={source} alt={alt || product.title || 'Handmade artisan product'} loading={loading}
      decoding="async" onError={() => {
        if (source !== fallback) setSource(fallback);
        else setFailed(true);
      }} />}
  </div>;
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Tag, Heart } from 'lucide-react';

const ProductCard = ({ product }) => {
  const getConditionColor = (cond) => {
    switch (cond?.toLowerCase()) {
      case 'new':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'like new':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fair':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isSold = product.status === 'SOLD';

  return (
    <Link 
      to={`/products/${product.id}`}
      className="group relative flex flex-col w-full bg-white rounded-2xl overflow-hidden glass-card transition-smooth cursor-pointer"
    >
      {/* Product Image Panel */}
      <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0]} 
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-smooth duration-500"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full bg-linear-to-br from-blue-50 to-indigo-100 text-blue-400">
            <Tag size={40} className="stroke-1 opacity-70 animate-pulse-slow" />
            <span className="text-xs font-medium mt-2">No Image Uploaded</span>
          </div>
        )}

        {/* Floating Condition Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getConditionColor(product.condition)}`}>
            {product.condition}
          </span>
          {isSold ? (
            <span className="px-2.5 py-0.5 bg-rose-500 text-white rounded-full text-xs font-semibold">
              Sold
            </span>
          ) : (
            <span className="px-2.5 py-0.5 bg-emerald-500 text-white rounded-full text-xs font-semibold">
              Available
            </span>
          )}
        </div>
      </div>

      {/* Product Details Panel */}
      <div className="flex flex-col flex-1 p-4">
        {/* Category & Price */}
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
            {product.category}
          </span>
          <span className="text-lg font-bold text-primary">
            ₹{product.price}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-1 mb-2 group-hover:text-primary transition-colors">
          {product.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>

        {/* Footer Statistics */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-gray-400 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-blue-100 text-primary font-bold flex items-center justify-center text-[10px]">
              {product.seller?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-gray-600 line-clamp-1 max-w-[100px]">
              {product.seller?.name}
            </span>
          </div>

          <div className="flex items-center gap-2 font-medium">
            <span className="flex items-center gap-0.5 text-gray-500">
              <Eye size={14} />
              {product.viewCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

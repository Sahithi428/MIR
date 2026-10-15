import React, { useState } from 'react';
import { ShoppingBag, Eye, Check, Sparkles } from 'lucide-react';

export default function ProductCard({ product, onAddToCart, onQuickView }) {
  const [selectedUnit, setSelectedUnit] = useState('1 kg'); // '½ kg' or '1 kg'
  const [added, setAdded] = useState(false);

  const price = selectedUnit === '½ kg' ? product.price_half : product.price_one;

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToCart(product, selectedUnit, price);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div 
      onClick={() => onQuickView(product)}
      className="group bg-white rounded-3xl overflow-hidden border border-amber-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Product Image Panel */}
        <div className="relative aspect-4/3 overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
          <img
            src={product.image_url || '/images/default_food.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/default_food.jpg';
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <button 
              onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
              className="w-full bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md hover:bg-white transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-amber-700" />
              <span>Quick View & Customization</span>
            </button>
          </div>

          {/* Category & Veg/Non-Veg Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-xs backdrop-blur-md ${
              product.is_veg 
                ? 'bg-emerald-50/95 text-emerald-800 border-emerald-300' 
                : 'bg-red-50/95 text-red-800 border-red-300'
            }`}>
              {product.is_veg ? '🌱 Veg' : '🍗 Non-Veg'}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <span className="bg-amber-950/80 backdrop-blur-md text-amber-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
              {product.category}
            </span>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-5">
          <h3 className="font-extrabold text-slate-900 text-base font-serif group-hover:text-red-700 transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
            {product.description || 'Authentic Andhra homemade recipe with cold-pressed oils & traditional spices.'}
          </p>

          {/* Unit Toggle Buttons (Standard size < 10 kg) */}
          <div className="mt-4 flex items-center gap-1.5 bg-amber-50/80 p-1 rounded-xl border border-amber-200/60" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedUnit('½ kg')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedUnit === '½ kg'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-amber-900 hover:bg-amber-100'
              }`}
            >
              ½ kg (₹{product.price_half.toFixed(0)})
            </button>

            <button
              onClick={() => setSelectedUnit('1 kg')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedUnit === '1 kg'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-amber-900 hover:bg-amber-100'
              }`}
            >
              1 kg (₹{product.price_one.toFixed(0)})
            </button>
          </div>

          {/* Bulk 10kg+ prompt indicator */}
          <div className="mt-2 flex items-center justify-between text-[10px] text-amber-800 font-medium">
            <span>Standard: up to 10 kg</span>
            <button
              onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
              className="text-red-700 hover:underline font-bold flex items-center gap-0.5"
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>&gt;10kg Bulk Custom</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Add to Cart */}
      <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Price ({selectedUnit})</span>
          <span className="text-lg font-extrabold text-slate-900 font-serif">
            ₹{price.toFixed(0)}
          </span>
        </div>

        <button
          onClick={handleAdd}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 ${
            added
              ? 'bg-emerald-600 text-white'
              : 'bg-red-700 hover:bg-red-800 text-white hover:shadow-md'
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}

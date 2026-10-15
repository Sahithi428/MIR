import React, { useState } from 'react';
import { X, ShoppingBag, Check, ShieldCheck, Truck, Sparkles, Sliders, Info, PackageCheck } from 'lucide-react';

export default function ProductModal({ product, allProducts, onClose, onAddToCart, onSelectRelated }) {
  if (!product) return null;

  // Mode: 'standard' (up to 10 kg) or 'bulk' (> 10 kg customized)
  const [mode, setMode] = useState('standard');

  // Standard Order State
  const [unit, setUnit] = useState('1 kg'); // '½ kg', '1 kg', '2 kg', '5 kg'
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // Bulk Customization State (> 10 kg)
  const [bulkKg, setBulkKg] = useState(15);
  const [spiceLevel, setSpiceLevel] = useState('Authentic Andhra Spicy');
  const [oilPreference, setOilPreference] = useState('Cold-Pressed Gingelly (Sesame) Oil');
  const [garlicLevel, setGarlicLevel] = useState('Regular Garlic Infusion');
  const [packagingType, setPackagingType] = useState('Airtight 1kg Food-Grade Jars');
  const [customInstructions, setCustomInstructions] = useState('');

  // Unit weight helper
  const getUnitWeightKg = (u) => {
    if (u === '½ kg') return 0.5;
    if (u === '1 kg') return 1.0;
    if (u === '2 kg') return 2.0;
    if (u === '5 kg') return 5.0;
    return 1.0;
  };

  const getUnitPrice = (u) => {
    if (u === '½ kg') return product.price_half;
    if (u === '1 kg') return product.price_one;
    if (u === '2 kg') return product.price_one * 2 * 0.95; // 5% discount
    if (u === '5 kg') return product.price_one * 5 * 0.92; // 8% discount
    return product.price_one;
  };

  const unitWeight = getUnitWeightKg(unit);
  const totalStandardKg = unitWeight * qty;
  const standardPrice = getUnitPrice(unit);
  const totalStandardPrice = standardPrice * qty;

  // Bulk pricing (10% bulk discount on 10kg+)
  const bulkPricePerKg = product.price_one * 0.90;
  const totalBulkPrice = bulkPricePerKg * bulkKg;

  const handleStandardAdd = () => {
    if (totalStandardKg > 10) {
      alert("Standard orders are limited to 10 kg. Please switch to the 'Customize Bulk Order (>10kg)' tab to order larger quantities.");
      return;
    }
    onAddToCart(product, unit, standardPrice, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleBulkAdd = () => {
    const customLabel = `${bulkKg} kg (Custom Bulk: ${spiceLevel}, ${oilPreference}, ${garlicLevel}, ${packagingType})`;
    const customProduct = {
      ...product,
      name: `${product.name} (Custom Bulk ${bulkKg}kg)`,
      customNotes: `Spice: ${spiceLevel} | Oil: ${oilPreference} | Garlic: ${garlicLevel} | Packaging: ${packagingType} | Note: ${customInstructions}`
    };
    onAddToCart(customProduct, `${bulkKg} kg Bulk Custom`, totalBulkPrice, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const related = allProducts
    ? allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-amber-200/80 max-h-[92vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-900 transition-colors shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Product Image Panel */}
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 aspect-square relative border border-amber-200/60 shadow-sm flex items-center justify-center">
              <img
                src={product.image_url || '/images/default_food.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/default_food.jpg';
                }}
              />
              <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-md shadow-xs ${
                product.is_veg ? 'bg-emerald-50/95 text-emerald-800 border border-emerald-300' : 'bg-red-50/95 text-red-800 border border-red-300'
              }`}>
                {product.is_veg ? '🌱 Veg' : '🍗 Non-Veg'}
              </span>
            </div>

            {/* Right Info */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                  {product.category}
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 font-serif mt-2">{product.name}</h2>
                
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {product.description || 'Prepared fresh in Pasuvullanka with zero artificial colors or synthetic chemical preservatives.'}
                </p>

                {/* Packaging & Hygiene highlights */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-600 bg-amber-50/80 p-3 rounded-xl border border-amber-200/60">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Pure traditional cold-pressed oils & Guntur spices</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Leak-proof packaging delivered across India</span>
                  </div>
                </div>
              </div>

              {/* MODE SWITCHER: Standard (< 10kg) vs Bulk (> 10kg Customized) */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMode('standard')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    mode === 'standard'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Standard (≤ 10 kg)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('bulk')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                    mode === 'bulk'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-amber-800 hover:text-amber-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Customize Bulk (&gt; 10 kg)</span>
                </button>
              </div>

              {/* STANDARD PACK SELECTION (< 10 kg) */}
              {mode === 'standard' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Select Pack Size (Max 10 kg total):</label>
                    <span className="text-[11px] font-semibold text-slate-500">Weight: {totalStandardKg} kg</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { key: '½ kg', label: '½ kg', price: product.price_half },
                      { key: '1 kg', label: '1 kg', price: product.price_one },
                      { key: '2 kg', label: '2 kg', price: product.price_one * 2 * 0.95 },
                      { key: '5 kg', label: '5 kg', price: product.price_one * 5 * 0.92 }
                    ].map((sz) => (
                      <button
                        key={sz.key}
                        type="button"
                        onClick={() => {
                          setUnit(sz.key);
                          if (getUnitWeightKg(sz.key) * qty > 10) {
                            setQty(Math.floor(10 / getUnitWeightKg(sz.key)));
                          }
                        }}
                        className={`py-2 px-1 rounded-xl border text-center transition-all ${
                          unit === sz.key
                            ? 'bg-amber-600 text-white border-amber-700 shadow-xs font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 font-medium'
                        }`}
                      >
                        <span className="block text-xs">{sz.label}</span>
                        <span className="block text-[10px] opacity-90">₹{sz.price.toFixed(0)}</span>
                      </button>
                    ))}
                  </div>

                  {/* Quantity Selector & Add Button */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <button
                        type="button"
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="w-8 h-8 font-bold text-slate-600 hover:bg-slate-200 text-sm"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-extrabold text-xs text-slate-900">{qty}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if ((qty + 1) * unitWeight > 10) {
                            alert("Standard order limit is 10 kg. For orders >10 kg, please click 'Customize Bulk (> 10 kg)'.");
                            return;
                          }
                          setQty(qty + 1);
                        }}
                        className="w-8 h-8 font-bold text-slate-600 hover:bg-slate-200 text-sm"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleStandardAdd}
                      className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                        added ? 'bg-emerald-600 text-white' : 'bg-red-700 hover:bg-red-800 text-white'
                      }`}
                    >
                      {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                      <span>{added ? 'Added to Cart!' : `Add ${totalStandardKg} kg • ₹${totalStandardPrice.toFixed(0)}`}</span>
                    </button>
                  </div>

                  {totalStandardKg >= 10 && (
                    <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      ℹ️ Reached maximum standard size (10 kg). Want more? Use the <strong>Customize Bulk</strong> tab.
                    </p>
                  )}
                </div>
              )}

              {/* BULK CUSTOMIZATION (> 10 kg) */}
              {mode === 'bulk' && (
                <div className="space-y-3 bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 flex items-center gap-1 font-serif">
                      <Sliders className="w-3.5 h-3.5 text-amber-700" />
                      <span>Custom Bulk Options (&gt; 10 kg)</span>
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      10% Wholesale Discount
                    </span>
                  </div>

                  {/* Bulk Weight Input */}
                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>Order Quantity:</span>
                      <span className="text-red-700 font-serif font-extrabold">{bulkKg} kg</span>
                    </div>
                    <input
                      type="range"
                      min={11}
                      max={100}
                      step={1}
                      value={bulkKg}
                      onChange={(e) => setBulkKg(parseInt(e.target.value))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                      <span>11 kg</span>
                      <span>25 kg</span>
                      <span>50 kg</span>
                      <span>100 kg</span>
                    </div>
                  </div>

                  {/* Spice Customization */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Spice Level</label>
                      <select
                        value={spiceLevel}
                        onChange={(e) => setSpiceLevel(e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-slate-300 bg-white text-[11px]"
                      >
                        <option value="Mild Spicy">Mild Spice</option>
                        <option value="Authentic Andhra Spicy">Authentic Andhra Spice</option>
                        <option value="Extra Guntur Hot">Extra Guntur Fiery</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Oil Choice</label>
                      <select
                        value={oilPreference}
                        onChange={(e) => setOilPreference(e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-slate-300 bg-white text-[11px]"
                      >
                        <option value="Cold-Pressed Gingelly (Sesame) Oil">Cold-Pressed Sesame (Gingelly)</option>
                        <option value="Cold-Pressed Peanut Oil">Groundnut (Peanut) Oil</option>
                        <option value="Cold-Pressed Mustard Oil">Mustard Oil</option>
                      </select>
                    </div>
                  </div>

                  {/* Garlic & Packaging Customization */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Garlic Preference</label>
                      <select
                        value={garlicLevel}
                        onChange={(e) => setGarlicLevel(e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-slate-300 bg-white text-[11px]"
                      >
                        <option value="Regular Garlic Infusion">Regular Garlic</option>
                        <option value="Extra Garlic Pods">Extra Garlic</option>
                        <option value="Garlic-Free (Jain style)">Garlic-Free (Jain style)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Packaging</label>
                      <select
                        value={packagingType}
                        onChange={(e) => setPackagingType(e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-slate-300 bg-white text-[11px]"
                      >
                        <option value="Airtight 1kg Food-Grade Jars">1 kg Sealed Jars</option>
                        <option value="Commercial 5kg Buckets">5 kg Catering Buckets</option>
                        <option value="Special Function / Gift Packs">Gift / Event Packs</option>
                      </select>
                    </div>
                  </div>

                  {/* Custom Note */}
                  <div>
                    <input
                      type="text"
                      placeholder="Special occasion instructions (e.g. Wedding on Dec 10, low salt)"
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white text-[11px]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleBulkAdd}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Add Customized Bulk ({bulkKg} kg) • ₹{totalBulkPrice.toFixed(0)}</span>
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Related Products Section */}
          {related.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 mb-2 font-serif">Related Andhra Delicacies in {product.category}</h3>
              <div className="grid grid-cols-3 gap-3">
                {related.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelated(rel)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 cursor-pointer bg-slate-50/50 hover:bg-amber-50 transition-all flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-amber-200">
                      <img
                        src={rel.image_url || '/images/default_food.jpg'}
                        alt={rel.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/images/default_food.jpg';
                        }}
                      />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{rel.name}</h4>
                      <p className="text-[11px] text-amber-700 font-semibold">₹{rel.price_one.toFixed(0)} / 1 kg</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

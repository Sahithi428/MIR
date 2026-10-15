import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldAlert } from 'lucide-react';

export default function CartDrawer({ isOpen, onClose, cart, onUpdateQty, onRemoveItem, onClearCart, onProceedCheckout }) {
  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-amber-200">
          
          {/* Cart Header */}
          <div className="p-6 bg-gradient-to-r from-red-800 to-amber-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-amber-300" />
              <h2 className="font-extrabold text-lg font-serif">Your Shopping Cart</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-amber-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-4xl">
                  🛒
                </div>
                <h3 className="font-bold text-slate-800 text-base">Your cart is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Add authentic Andhra pickles, podis or pindi vantalu to start your order!
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase">{cart.length} Items</span>
                  <button 
                    onClick={onClearCart}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Cart</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {cart.map((item, idx) => (
                    <div 
                      key={`${item.id}-${item.unit}-${idx}`}
                      className="p-3.5 rounded-2xl border border-amber-100 bg-amber-50/40 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-amber-50 border border-amber-200 shrink-0">
                          <img
                            src={item.image_url || '/images/default_food.jpg'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/images/default_food.jpg';
                            }}
                          />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-slate-900 text-sm truncate font-serif">{item.name}</h4>
                          <span className="inline-block text-[11px] font-semibold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md mt-0.5">
                            {item.unit} — ₹{item.price.toFixed(0)}
                          </span>
                        </div>
                      </div>

                      {/* Quantity buttons & Remove */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center border border-amber-200 rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() => onUpdateQty(idx, item.quantity - 1)}
                            className="px-2 py-0.5 font-bold text-slate-600 hover:bg-amber-100 text-xs"
                          >
                            -
                          </button>
                          <span className="px-2 font-extrabold text-xs text-slate-900">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQty(idx, item.quantity + 1)}
                            className="px-2 py-0.5 font-bold text-slate-600 hover:bg-amber-100 text-xs"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs font-extrabold text-slate-900">
                          ₹{(item.price * item.quantity).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="p-6 bg-slate-50 border-t border-amber-200/80 space-y-4">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between font-semibold">
                  <span>Subtotal:</span>
                  <span className="text-slate-900 font-bold">₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-amber-800 text-[11px]">
                  <span>Delivery Charges:</span>
                  <span className="font-semibold">Calculated by Business upon order</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount:</span>
                  <span className="text-red-700 font-serif">₹{subtotal.toFixed(0)}</span>
                </div>
              </div>

              <button
                onClick={onProceedCheckout}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-700 to-amber-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Proceed to All-India Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

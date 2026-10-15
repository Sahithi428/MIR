import React, { useState } from 'react';
import { Search, PackageCheck, ArrowRight, Clock, AlertCircle } from 'lucide-react';

export default function OrderHistoryView({ onTrackSpecificOrder }) {
  const [mobile, setMobile] = useState('');
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetchHistory = async (e) => {
    e.preventDefault();
    if (!mobile.trim() || mobile.trim().length < 5) {
      setError('Please enter your mobile number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/orders/history?mobile=${encodeURIComponent(mobile.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch history.');
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Error loading order history.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <PackageCheck className="w-4 h-4 text-amber-700" />
          <span>Customer Portal</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-serif">Order History</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Enter your registered Mobile Number to view your previous Mana Inti Ruchulu orders.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-3xl p-6 border border-amber-200/80 shadow-sm max-w-md mx-auto">
        <form onSubmit={handleFetchHistory} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number *</label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="e.g. 9885993213"
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Searching Orders...' : 'View Order History'}</span>
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-800 text-xs font-semibold border border-red-200">
            {error}
          </div>
        )}
      </div>

      {/* Orders List */}
      {orders && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">
            Past Orders ({orders.length})
          </h2>

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-500 text-xs border border-amber-100">
              No previous orders found for mobile number <strong>{mobile}</strong>.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {orders.map((ord) => (
                <div 
                  key={ord.id}
                  className="bg-white rounded-3xl p-6 border border-amber-200/80 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-slate-900 text-base">{ord.order_id}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        {ord.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ord.created_at ? new Date(ord.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}</span>
                    </p>

                    <div className="text-xs text-slate-700 space-y-0.5 pt-1">
                      {ord.items && ord.items.map((it, i) => (
                        <div key={i} className="font-medium">
                          • {it.product_name} ({it.quantity_label}) × {it.quantity}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <span className="text-lg font-extrabold text-slate-900 font-serif">₹{ord.total.toFixed(0)}</span>

                    <button
                      onClick={() => onTrackSpecificOrder(ord.order_id, ord.mobile)}
                      className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl transition-colors flex items-center gap-1 mt-2"
                    >
                      <span>Track Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

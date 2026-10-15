import React, { useEffect, useState } from 'react';
import { Search, CheckCircle2, Clock, Truck, Package, MapPin, ExternalLink, AlertCircle, Bell, Copy, Check, Phone, ShieldCheck, ArrowRight } from 'lucide-react';

const ORDER_STEPS = [
  { key: 'Order Placed', label: 'Order Placed', desc: 'Order details recorded in system' },
  { key: 'Confirmed', label: 'Order Confirmed', desc: 'Verified & ingredients selected' },
  { key: 'Preparing', label: 'Fresh Preparation', desc: 'Handcrafted fresh with cold-pressed oils' },
  { key: 'Dispatched', label: 'Dispatched', desc: 'Handed over to courier partner' },
  { key: 'Out for Delivery', label: 'Out for Delivery', desc: 'Delivery agent en route to doorstep' },
  { key: 'Delivered', label: 'Delivered', desc: 'Delivered! Relish authentic Andhra flavors' },
];

export default function TrackOrderView({ initialOrderId = '', initialMobile = '' }) {
  const [orderId, setOrderId] = useState(initialOrderId);
  const [mobile, setMobile] = useState(initialMobile);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialOrderId) setOrderId(initialOrderId);
    if (initialMobile) setMobile(initialMobile);
    if (initialOrderId && initialMobile) {
      fetchOrder(initialOrderId, initialMobile);
    }
  }, [initialOrderId, initialMobile]);

  const fetchOrder = async (oid, mob) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/orders/track?order_id=${encodeURIComponent(oid.trim())}&mobile=${encodeURIComponent(mob.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Order not found. Please verify Order ID and Mobile.');
      }

      setOrderData(data);
    } catch (err) {
      setError(err.message || 'Failed to locate order.');
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = (e) => {
    e.preventDefault();
    if (!orderId.trim() || !mobile.trim()) {
      setError('Please enter both Order ID and Mobile Number.');
      return;
    }
    fetchOrder(orderId, mobile);
  };

  const handleCopyTracking = (trackNum) => {
    navigator.clipboard.writeText(trackNum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStepIdx = orderData
    ? ORDER_STEPS.findIndex(s => s.key.toLowerCase() === (orderData.status || '').toLowerCase())
    : 0;

  return (
    <div className="py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold shadow-2xs">
          <Truck className="w-4 h-4 text-amber-700" />
          <span>Real-Time All-India Courier Tracking</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
          Track Your Delivery
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Trace your authentic Andhra pickles, podis and traditional sweets from our kitchen in Pasuvullanka right to your doorstep.
        </p>
      </div>

      {/* Modern Search Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/90 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

        <form onSubmit={handleTrack} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end relative z-10">
          
          <div className="sm:col-span-5">
            <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
              <span>Order ID *</span>
              <span className="text-[10px] text-slate-400 font-normal">Format: MIR-YYYYMMDD-XXXX</span>
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. MIR-20261014-0001"
              className="w-full text-xs p-3.5 rounded-2xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500 font-mono uppercase focus:outline-none transition-all shadow-inner"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Registered Mobile Number *
            </label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="e.g. 9885993213"
              className="w-full text-xs p-3.5 rounded-2xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all shadow-inner font-mono"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-red-700 via-amber-700 to-amber-800 hover:from-red-800 hover:to-amber-900 text-white font-bold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Searching...' : 'Locate Order'}</span>
            </button>
          </div>

        </form>

        {error && (
          <div className="mt-4 p-3.5 rounded-2xl bg-red-50 text-red-800 text-xs font-semibold border border-red-200 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* TRACKING RESULTS DASHBOARD */}
      {orderData && (
        <div className="space-y-6">
          
          {/* Main Status & Courier Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-xl space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest block">Official Order Tracking</span>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-extrabold text-slate-900 font-mono tracking-wide">{orderData.order_id}</h2>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-2xs">
                    {orderData.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Booked on {orderData.created_at ? new Date(orderData.created_at).toLocaleString('en-IN') : 'Recent'} • Customer: <strong className="text-slate-800">{orderData.customer_name}</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Order Total Amount</span>
                <span className="text-2xl font-extrabold text-slate-900 font-serif">₹{orderData.total.toFixed(0)}</span>
                <span className="block text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mt-1 border border-emerald-200">
                  {orderData.payment_method || 'Verified Payment'}
                </span>
              </div>
            </div>

            {/* Visual Step Progress Bar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <span>Live Journey Timeline</span>
                </h3>
                <span className="text-xs text-amber-800 font-semibold">
                  Step {Math.max(1, currentStepIdx + 1)} of {ORDER_STEPS.length}
                </span>
              </div>

              {/* Step Flow */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2">
                {ORDER_STEPS.map((step, idx) => {
                  const isDone = idx <= (currentStepIdx >= 0 ? currentStepIdx : 0);
                  const isCurrent = idx === (currentStepIdx >= 0 ? currentStepIdx : 0);

                  return (
                    <div 
                      key={step.key} 
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        isCurrent
                          ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                          : isDone
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="w-6 h-6 mx-auto mb-1.5 rounded-full flex items-center justify-center text-xs font-bold border">
                        {isDone && !isCurrent ? '✓' : idx + 1}
                      </div>
                      <h4 className="text-[11px] font-bold leading-tight line-clamp-1">{step.label}</h4>
                      <p className={`text-[9px] mt-0.5 line-clamp-1 ${isCurrent ? 'text-amber-100' : 'opacity-80'}`}>
                        {isCurrent ? 'Current Status' : isDone ? 'Completed' : 'Pending'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Logistics & Tracking Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              
              {/* Courier Tracking Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/50 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase text-amber-950 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-amber-700" />
                    <span>Courier Information</span>
                  </h4>
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                    {orderData.courier || 'Logistics Assigned'}
                  </span>
                </div>

                {orderData.tracking_number ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Tracking ID (AWB Number):</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-extrabold text-sm text-slate-900 bg-white px-2.5 py-1 rounded-xl border border-slate-300">
                          {orderData.tracking_number}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyTracking(orderData.tracking_number)}
                          className="p-1.5 text-slate-600 hover:text-amber-700 bg-white rounded-lg border border-slate-300"
                          title="Copy tracking number"
                        >
                          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-amber-200/60">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Estimated Delivery:</span>
                        <strong className="text-emerald-700">{orderData.estimated_delivery || '3 - 5 Working Days'}</strong>
                      </div>

                      {orderData.tracking_url && (
                        <a
                          href={orderData.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white px-3.5 py-2 rounded-xl shadow-xs transition-all"
                        >
                          <span>Live Courier Track</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-2 text-xs text-slate-600">
                    <p>📦 Your package is being packed fresh. Courier tracking number will appear here as soon as dispatched.</p>
                  </div>
                )}
              </div>

              {/* Delivery Address Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-extrabold uppercase text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <span>Delivery Destination</span>
                </h4>
                <div className="text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-slate-900">{orderData.customer_name} ({orderData.mobile})</p>
                  <p className="text-slate-600">{orderData.full_address}</p>
                  {orderData.notes && (
                    <p className="text-[11px] text-amber-800 italic mt-1 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      Notes: "{orderData.notes}"
                    </p>
                  )}
                </div>
              </div>

            </div>

            {/* Order Items Manifest */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">
                Order Items Manifest ({orderData.items ? orderData.items.length : 0})
              </h4>
              <div className="divide-y divide-slate-100 text-xs">
                {orderData.items && orderData.items.map((it, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-900">{it.product_name}</span>
                      <span className="text-slate-500">({it.quantity_label})</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-500">Qty: {it.quantity}</span>
                      <span className="font-extrabold text-slate-900">₹{(it.unit_price * it.quantity).toFixed(0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications Activity History */}
            {orderData.notifications && orderData.notifications.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-amber-600" />
                  <span>Status Updates & Alerts</span>
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {orderData.notifications.map((n, i) => (
                    <div key={i} className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-xs text-slate-700 flex items-start justify-between">
                      <p className="font-medium text-slate-900">{n.message}</p>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                        {n.created_at ? new Date(n.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Need Assistance? Direct Contact */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-4 rounded-2xl">
              <div>
                <span className="font-bold text-slate-800 block">Questions regarding your shipment?</span>
                <span className="text-slate-500">Contact Mana Inti Ruchulu owner Pavani directly</span>
              </div>
              <a
                href="tel:9885993213"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call +91 98859 93213</span>
              </a>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

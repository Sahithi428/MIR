import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Truck, ShieldCheck, MapPin, AlertCircle, ArrowLeft, Bookmark, Smartphone, Banknote, PlusCircle, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

const INDIAN_STATES = [
  "Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu", "Maharashtra",
  "Delhi", "Gujarat", "Kerala", "West Bengal", "Odisha", "Rajasthan",
  "Uttar Pradesh", "Bihar", "Madhya Pradesh", "Punjab", "Haryana",
  "Assam", "Goa", "Jharkhand", "Chhattisgarh", "Other State"
];

export default function CheckoutModal({ isOpen, onClose, cart, onSuccessOrder }) {
  if (!isOpen) return null;

  const [savedAddress, setSavedAddress] = useState(null);
  const [useSavedAddress, setUseSavedAddress] = useState(true);

  const [formData, setFormData] = useState({
    customer_name: '',
    mobile: '',
    email: '',
    house_flat: '',
    street_area: '',
    city: '',
    district: '',
    state: 'Andhra Pradesh',
    pincode: '',
    notes: '',
    payment_method: 'PhonePe (UPI)' // 'PhonePe (UPI)' or 'Cash on Delivery'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Load saved customer address on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mir_saved_customer_address');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedAddress(parsed);
        setFormData(prev => ({
          ...prev,
          customer_name: parsed.customer_name || '',
          mobile: parsed.mobile || '',
          email: parsed.email || '',
          house_flat: parsed.house_flat || '',
          street_area: parsed.street_area || '',
          city: parsed.city || '',
          district: parsed.district || '',
          state: parsed.state || 'Andhra Pradesh',
          pincode: parsed.pincode || ''
        }));
      }
    } catch (e) {
      console.error("Error reading saved address:", e);
    }
  }, []);

  // When mobile number changes, auto-lookup past address if not already filled
  const handleMobileBlur = async (e) => {
    const val = e.target.value.trim();
    if (val.length === 10 && !savedAddress) {
      setLookupLoading(true);
      try {
        const res = await fetch(`/api/customers/lookup?mobile=${encodeURIComponent(val)}`);
        const data = await res.json();
        if (data.found && data.customer) {
          const c = data.customer;
          setSavedAddress(c);
          setUseSavedAddress(true);
          setFormData(prev => ({
            ...prev,
            customer_name: c.customer_name || prev.customer_name,
            email: c.email || prev.email,
            house_flat: c.house_flat || prev.house_flat,
            street_area: c.street_area || prev.street_area,
            city: c.city || prev.city,
            district: c.district || prev.district,
            state: c.state || prev.state,
            pincode: c.pincode || prev.pincode
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLookupLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSelectSavedAddress = () => {
    if (savedAddress) {
      setUseSavedAddress(true);
      setFormData(prev => ({
        ...prev,
        customer_name: savedAddress.customer_name,
        mobile: savedAddress.mobile,
        email: savedAddress.email || '',
        house_flat: savedAddress.house_flat,
        street_area: savedAddress.street_area,
        city: savedAddress.city,
        district: savedAddress.district,
        state: savedAddress.state,
        pincode: savedAddress.pincode
      }));
    }
  };

  const handleUseNewAddress = () => {
    setUseSavedAddress(false);
    setFormData(prev => ({
      ...prev,
      house_flat: '',
      street_area: '',
      city: '',
      district: '',
      pincode: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.customer_name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.mobile.trim() || !/^\d{10}$/.test(formData.mobile.trim())) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!formData.house_flat || !formData.street_area || !formData.city || !formData.district) {
      setError('Please complete all address details (House/Flat, Street, City, District).');
      return;
    }
    if (!/^[1-9][0-9]{5}$/.test(formData.pincode.trim())) {
      setError('Invalid Indian PIN code format. Please provide a valid 6-digit PIN code (e.g. 533220).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        items: cart.map(i => ({
          product_id: i.id,
          product_name: i.name,
          quantity_label: i.unit,
          unit_price: i.price,
          quantity: i.quantity
        }))
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      // Save customer profile/address to localStorage for repeat visits
      const toSave = {
        customer_name: formData.customer_name,
        mobile: formData.mobile,
        email: formData.email,
        house_flat: formData.house_flat,
        street_area: formData.street_area,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode
      };
      localStorage.setItem('mir_saved_customer_address', JSON.stringify(toSave));

      // Celebrate success!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setCreatedOrder(data);
      onSuccessOrder(data);
    } catch (err) {
      setError(err.message || 'An error occurred during checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-amber-200 my-8 relative">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-red-800 via-amber-800 to-amber-900 text-white flex items-center justify-between">
          <div>
            <span className="bg-emerald-500/25 text-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
              🇮🇳 We Accept Orders Across India
            </span>
            <h2 className="font-extrabold text-xl font-serif mt-1">Mana Inti Ruchulu — Checkout</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-amber-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[82vh] overflow-y-auto">
          {createdOrder ? (
            /* Order Placed Success View */
            <div className="text-center py-6 space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl shadow-inner">
                ✓
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 font-serif">Order Successfully Placed!</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Thank you, <span className="font-bold text-slate-900">{createdOrder.customer_name}</span>! Your homemade order is recorded.
                </p>
              </div>

              <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 max-w-md mx-auto text-left space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Your Unique Order ID:</span>
                  <span className="font-mono font-extrabold text-red-700 text-sm bg-red-100 px-2 py-0.5 rounded">
                    {createdOrder.order_id}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-600">
                  <span>Mobile:</span>
                  <span className="font-semibold text-slate-900">{createdOrder.mobile}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-600">
                  <span>Selected Payment:</span>
                  <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">{createdOrder.payment_method}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-600">
                  <span>Order Total:</span>
                  <span className="font-bold text-slate-900">₹{createdOrder.total.toFixed(0)}</span>
                </div>
              </div>

              {/* Payment instructions based on method */}
              {createdOrder.payment_method === 'PhonePe (UPI)' ? (
                <div className="p-4 rounded-2xl bg-purple-50 text-purple-900 text-xs border border-purple-200 text-left space-y-2">
                  <div className="flex items-center gap-2 font-bold text-purple-950">
                    <Smartphone className="w-4 h-4 text-purple-700" />
                    <span>PhonePe UPI Payment Instructions</span>
                  </div>
                  <p>
                    Please send ₹{createdOrder.total.toFixed(0)} to PhonePe UPI: <strong className="font-mono bg-purple-100 px-1 py-0.5 rounded">9885993213@ybl</strong> or mobile <strong className="font-mono">9885993213</strong> (Pavani).
                  </p>
                  <p className="text-[11px] text-purple-700">
                    Your order will be dispatched promptly upon UPI confirmation. Mention Order ID <strong>{createdOrder.order_id}</strong> in UPI remarks.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 text-xs border border-emerald-200 text-left space-y-1">
                  <div className="flex items-center gap-2 font-bold text-emerald-950">
                    <Banknote className="w-4 h-4 text-emerald-700" />
                    <span>Cash on Delivery (COD)</span>
                  </div>
                  <p>
                    Please pay ₹{createdOrder.total.toFixed(0)} in cash or UPI to the courier delivery agent when your parcel arrives.
                  </p>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-amber-50 text-amber-900 text-xs border border-amber-200 text-left">
                ℹ️ <strong>Courier Charges:</strong> Nominal delivery charges based on your PIN code will be informed by Pavani prior to dispatch.
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            /* Checkout Input Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 text-red-800 text-xs font-semibold border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* SAVED ADDRESS DETECTED BANNER / REUSE */}
              {savedAddress && (
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                      <Bookmark className="w-4 h-4 text-amber-700" />
                      <span>Welcome back! We found your saved delivery address:</span>
                    </span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                      Repeat Customer
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-xs text-slate-700">
                    <p className="font-bold text-slate-900">{savedAddress.customer_name} ({savedAddress.mobile})</p>
                    <p className="text-slate-600 mt-0.5">
                      {savedAddress.house_flat}, {savedAddress.street_area}, {savedAddress.city}, {savedAddress.district}, {savedAddress.state} - {savedAddress.pincode}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSelectSavedAddress}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                        useSavedAddress 
                          ? 'bg-amber-700 text-white shadow-xs' 
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-amber-100'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Use This Saved Address</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleUseNewAddress}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                        !useSavedAddress 
                          ? 'bg-amber-700 text-white shadow-xs' 
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-amber-100'
                      }`}
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Enter New / Different Address</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION 1: Customer Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 font-serif">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-mono">1</span>
                  <span>Contact Information</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="customer_name"
                      required
                      value={formData.customer_name}
                      onChange={handleChange}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Mobile Number (10 Digits) *</label>
                    <input
                      type="tel"
                      name="mobile"
                      required
                      maxLength={10}
                      value={formData.mobile}
                      onChange={handleChange}
                      onBlur={handleMobileBlur}
                      placeholder="e.g. 9885993213"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    {lookupLoading && <span className="text-[10px] text-amber-700 animate-pulse">Checking address...</span>}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. ramesh@example.com"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* SECTION 2: Shipping Address */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 font-serif">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-mono">2</span>
                  <span>Delivery Address Across India</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">House / Flat / Door No. *</label>
                    <input
                      type="text"
                      name="house_flat"
                      required
                      value={formData.house_flat}
                      onChange={handleChange}
                      placeholder="e.g. Flat 402, Sai Residency"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Street / Area / Colony *</label>
                    <input
                      type="text"
                      name="street_area"
                      required
                      value={formData.street_area}
                      onChange={handleChange}
                      placeholder="e.g. MG Road, Near Ramalayam"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">City / Town / Village *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Vijayawada"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">District *</label>
                    <input
                      type="text"
                      name="district"
                      required
                      value={formData.district}
                      onChange={handleChange}
                      placeholder="e.g. NTR District"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">State *</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    6-Digit PIN Code * <span className="text-slate-400 font-normal">(e.g. 533220)</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 533220 or 500081"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Special Order Notes (Optional)</label>
                  <textarea
                    name="notes"
                    rows={2}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="e.g. Please pack extra tightly, or delivery after 4 PM"
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* SECTION 3: Payment Options (PhonePe & Cash on Delivery) */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 font-serif">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-mono">3</span>
                  <span>Select Payment Method</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* PhonePe Option */}
                  <label 
                    onClick={() => setFormData({ ...formData, payment_method: 'PhonePe (UPI)' })}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      formData.payment_method === 'PhonePe (UPI)'
                        ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-600/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method_radio"
                      checked={formData.payment_method === 'PhonePe (UPI)'}
                      onChange={() => setFormData({ ...formData, payment_method: 'PhonePe (UPI)' })}
                      className="mt-1 accent-purple-700"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-purple-950 text-xs">PhonePe (UPI)</span>
                        <span className="bg-purple-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded">Fast & Safe</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Pay via PhonePe UPI ID: <strong className="font-mono text-purple-900">9885993213@ybl</strong> or Mobile: 9885993213
                      </p>
                    </div>
                  </label>

                  {/* Cash on Delivery Option */}
                  <label 
                    onClick={() => setFormData({ ...formData, payment_method: 'Cash on Delivery' })}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      formData.payment_method === 'Cash on Delivery'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-emerald-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method_radio"
                      checked={formData.payment_method === 'Cash on Delivery'}
                      onChange={() => setFormData({ ...formData, payment_method: 'Cash on Delivery' })}
                      className="mt-1 accent-emerald-700"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-emerald-950 text-xs">Cash on Delivery</span>
                        <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded">Doorstep</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Pay with cash or UPI directly when your authentic pickles are delivered.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-800 hover:to-amber-800 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 active:scale-[0.99]"
                >
                  {loading ? 'Confirming Order...' : `Place Order (${formData.payment_method}) — Total ₹${subtotal.toFixed(0)}`}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}

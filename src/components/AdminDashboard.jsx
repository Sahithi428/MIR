import React, { useState, useEffect, useRef } from 'react';
import { 
  KeyRound, Package, ShoppingBag, DollarSign, Clock, CheckCircle, Plus, 
  Trash2, Truck, BarChart3, TrendingUp, AlertCircle, Camera, ImagePlus, 
  Bell, LogOut, Lock, ShieldCheck, RefreshCw, X, Check, ExternalLink, Sparkles
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const STATUS_OPTIONS = ['Order Placed', 'Confirmed', 'Preparing', 'Dispatched', 'Out for Delivery', 'Delivered'];
const COLORS = ['#d97706', '#dc2626', '#16a34a', '#2563eb', '#9333ea', '#ea580c'];

// Play notification sound using Web Audio API
const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    console.error("Audio error:", e);
  }
};

export default function AdminDashboard({ onProductsUpdated }) {
  // Auth state
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authStatusChecked, setAuthStatusChecked] = useState(false);
  const [isPasswordSetup, setIsPasswordSetup] = useState(true); // true if admin password exists

  // First-time setup state
  const [setupPwd, setSetupPwd] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [setupError, setSetupError] = useState('');

  // Change password modal
  const [showChangePwdModal, setShowChangePwdModal] = useState(false);
  const [currPwdInput, setCurrPwdInput] = useState('');
  const [newPwdInput, setNewPwdInput] = useState('');
  const [confirmNewPwdInput, setConfirmNewPwdInput] = useState('');
  const [changePwdMsg, setChangePwdMsg] = useState({ error: '', success: '' });

  // Dashboard content state
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'products', 'analytics', 'alerts'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  // Live order notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const lastKnownCountRef = useRef(0);

  // Product photo update modal state
  const [photoModalProduct, setPhotoModalProduct] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoMessage, setPhotoMessage] = useState({ error: '', success: '' });

  // New product form modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '', category: 'Veg Pickles', is_veg: 1, price_half: 400, price_one: 750, description: '', image_url: '/images/mango_pickle.jpg', available: 1
  });

  // Edit shipment state map
  const [shipmentInputs, setShipmentInputs] = useState({});

  // Check auth status on load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/admin/auth-status');
      const data = await res.json();
      setIsPasswordSetup(Boolean(data.is_setup));
      setAuthStatusChecked(true);
    } catch (e) {
      console.error(e);
      setAuthStatusChecked(true);
    }
  };

  // Poll for new order alerts when logged in
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 8000);

    return () => clearInterval(interval);
  }, [isAuthenticated, password]);

  const fetchNotifications = async (isBackground = false) => {
    try {
      const res = await fetch(`/api/admin/notifications?password=${encodeURIComponent(password)}`);
      if (!res.ok) return;
      const data = await res.json();
      const notifs = data.notifications || [];
      const currentUnread = data.unread_count || 0;

      // If new unread notifications arrived
      if (isBackground && currentUnread > lastKnownCountRef.current) {
        const latest = notifs[0];
        if (latest) {
          setNewOrderAlert(latest);
          playNotificationSound();
          fetchOrders();
          fetchAnalytics();
        }
      }

      lastKnownCountRef.current = currentUnread;
      setNotifications(notifs);
      setUnreadCount(currentUnread);
    } catch (e) {
      console.error("Notifications poll error:", e);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await fetch(`/api/admin/notifications/mark-read?password=${encodeURIComponent(password)}`, {
        method: 'POST'
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (e) {
      console.error(e);
    }
  };

  // First-time password creation by admin
  const handleSetupPassword = async (e) => {
    e.preventDefault();
    if (!setupPwd || setupPwd.length < 4) {
      setSetupError('Password must be at least 4 characters long.');
      return;
    }
    if (setupPwd !== setupConfirm) {
      setSetupError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    setSetupError('');

    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: setupPwd })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create admin password.');

      // Automatically log in with new password
      setPassword(setupPwd);
      setIsPasswordSetup(true);
      performLogin(setupPwd);
    } catch (err) {
      setSetupError(err.message || 'Setup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) {
      setAuthError('Please enter your admin password.');
      return;
    }
    performLogin(password);
  };

  const performLogin = async (pwd) => {
    setLoading(true);
    setAuthError('');

    try {
      const res = await fetch(`/api/admin/orders?password=${encodeURIComponent(pwd)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Incorrect admin password.');
      }

      setIsAuthenticated(true);
      setOrders(data);
      fetchProducts();
      fetchAnalytics();
      fetchNotifications();
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please verify password.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setOrders([]);
    setNotifications([]);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePwdMsg({ error: '', success: '' });

    if (!currPwdInput) {
      setChangePwdMsg({ error: 'Please enter current password.', success: '' });
      return;
    }
    if (newPwdInput.length < 4) {
      setChangePwdMsg({ error: 'New password must be at least 4 characters.', success: '' });
      return;
    }
    if (newPwdInput !== confirmNewPwdInput) {
      setChangePwdMsg({ error: 'New passwords do not match.', success: '' });
      return;
    }

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currPwdInput,
          new_password: newPwdInput
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password.');

      setPassword(newPwdInput);
      setChangePwdMsg({ error: '', success: 'Admin password updated successfully!' });
      setTimeout(() => {
        setShowChangePwdModal(false);
        setCurrPwdInput('');
        setNewPwdInput('');
        setConfirmNewPwdInput('');
        setChangePwdMsg({ error: '', success: '' });
      }, 1500);
    } catch (err) {
      setChangePwdMsg({ error: err.message || 'Password update failed.', success: '' });
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/admin/orders?password=${encodeURIComponent(password)}`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/admin/analytics?password=${encodeURIComponent(password)}`);
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status?password=${encodeURIComponent(password)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchOrders();
        fetchAnalytics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveShipment = async (orderId) => {
    const inputs = shipmentInputs[orderId] || {};
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/shipment?password=${encodeURIComponent(password)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs)
      });
      if (res.ok) {
        alert('Shipment info saved successfully!');
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open photo update modal for a specific pickle / product
  const handleOpenPhotoModal = (prod) => {
    setPhotoModalProduct(prod);
    setSelectedImageFile(null);
    setImagePreviewUrl(prod.image_url || '/images/default_food.jpg');
    setManualImageUrl(prod.image_url || '');
    setPhotoMessage({ error: '', success: '' });
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setPhotoMessage({ error: '', success: '' });
    }
  };

  const handleSaveProductPhoto = async (e) => {
    e.preventDefault();
    if (!photoModalProduct) return;

    setUploadingPhoto(true);
    setPhotoMessage({ error: '', success: '' });

    try {
      if (selectedImageFile) {
        // Upload image file via FormData
        const formData = new FormData();
        formData.append('image', selectedImageFile);
        formData.append('product_id', photoModalProduct.id);
        formData.append('password', password);

        const res = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formData
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed.');

        setPhotoMessage({ error: '', success: 'Product photo updated successfully!' });
      } else if (manualImageUrl && manualImageUrl !== photoModalProduct.image_url) {
        // Update URL directly
        const res = await fetch(`/api/products/${photoModalProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_url: manualImageUrl })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Update failed.');

        setPhotoMessage({ error: '', success: 'Product photo updated successfully!' });
      } else {
        setPhotoMessage({ error: 'Please choose an image file or enter a new photo path.', success: '' });
        setUploadingPhoto(false);
        return;
      }

      // Refresh product data locally and in main app
      await fetchProducts();
      if (onProductsUpdated) {
        onProductsUpdated();
      }

      setTimeout(() => {
        setPhotoModalProduct(null);
        setUploadingPhoto(false);
      }, 1200);

    } catch (err) {
      setPhotoMessage({ error: err.message || 'Failed to update photo.', success: '' });
      setUploadingPhoto(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd)
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchProducts();
        if (onProductsUpdated) onProductsUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${prodId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
        if (onProductsUpdated) onProductsUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // FIRST-TIME PASSWORD CREATION (ONLY ADMIN CREATES IT)
  if (!isAuthenticated && !isPasswordSetup && authStatusChecked) {
    return (
      <div className="py-16 max-w-md mx-auto px-4 animate-fade-in">
        <div className="bg-white rounded-3xl p-8 border border-amber-300 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center text-3xl shadow-inner">
            🛡️
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
              Owner Security Initialization
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 font-serif mt-2">Create Admin Password</h2>
            <p className="text-xs text-slate-500 mt-1">
              Welcome Pavani! Set your private master password for Mana Inti Ruchulu admin access. Only you will create and manage it.
            </p>
          </div>

          <form onSubmit={handleSetupPassword} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Create Master Password *</label>
              <input
                type="password"
                required
                value={setupPwd}
                onChange={(e) => setSetupPwd(e.target.value)}
                placeholder="Choose a strong password (min 4 chars)"
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Confirm Master Password *</label>
              <input
                type="password"
                required
                value={setupConfirm}
                onChange={(e) => setSetupConfirm(e.target.value)}
                placeholder="Re-enter password to confirm"
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {setupError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs font-semibold border border-red-200">
                {setupError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-800 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              {loading ? 'Securing Admin Access...' : 'Set Admin Password & Enter'}
            </button>
          </form>

          <p className="text-[11px] text-slate-400">
            🔒 Password is encrypted with SHA-256 salted hash in your local database.
          </p>
        </div>
      </div>
    );
  }

  // STANDARD LOGIN (USING ADMIN'S CREATED PASSWORD)
  if (!isAuthenticated) {
    return (
      <div className="py-16 max-w-md mx-auto px-4 animate-fade-in">
        <div className="bg-white rounded-3xl p-8 border border-amber-200 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-3xl shadow-inner">
            🔐
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 font-serif">Business Owner Portal</h2>
            <p className="text-xs text-slate-500 mt-1">Mana Inti Ruchulu — Pavani Admin Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Enter Your Admin Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your private admin password"
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs font-semibold border border-red-200">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              {loading ? 'Authenticating...' : 'Access Dashboard'}
            </button>
          </form>

          <p className="text-[11px] text-slate-400">
            Secure admin portal for orders, product catalog, and delivery status updates.
          </p>
        </div>
      </div>
    );
  }

  // AUTHENTICATED DASHBOARD VIEW
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status !== 'Delivered').length;
  const completedOrders = orders.filter(o => o.status === 'Delivered').length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      
      {/* FLOATING REAL-TIME ORDER ALERT BANNER */}
      {newOrderAlert && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-700 via-amber-700 to-amber-800 text-white shadow-xl flex items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg">
              🔔
            </div>
            <div>
              <h4 className="font-extrabold text-sm font-serif">New Order Placed Just Now!</h4>
              <p className="text-xs text-amber-100">{newOrderAlert.message}</p>
            </div>
          </div>
          <button
            onClick={() => setNewOrderAlert(null)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP EXECUTIVE BAR */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍲</span>
            <h1 className="text-2xl font-extrabold font-serif">Mana Inti Ruchulu Admin</h1>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
              Pavani (Owner)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Live orders, real-time customer dispatching, product photos & revenue metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Unread Orders Bell */}
          <button
            onClick={() => {
              setActiveTab('alerts');
              markAllNotificationsRead();
            }}
            className="relative p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
            title="Order Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Change Password Button */}
          <button
            onClick={() => setShowChangePwdModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Change Password</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-red-800/80 hover:bg-red-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Products</span>
          <h3 className="text-2xl font-extrabold text-slate-900 font-serif">{totalProducts}</h3>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Orders</span>
          <h3 className="text-2xl font-extrabold text-slate-900 font-serif">{totalOrders}</h3>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Pending</span>
          <h3 className="text-2xl font-extrabold text-amber-700 font-serif">{pendingOrders}</h3>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Completed</span>
          <h3 className="text-2xl font-extrabold text-emerald-700 font-serif">{completedOrders}</h3>
        </div>

        <div className="bg-gradient-to-br from-red-800 to-amber-800 text-white p-4 rounded-2xl shadow-sm space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-amber-200 uppercase">Total Revenue</span>
          <h3 className="text-2xl font-extrabold font-serif">₹{totalRevenue.toFixed(0)}</h3>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'orders', label: `Orders (${orders.length})` },
            { id: 'products', label: `Product Photos & Catalogue (${products.length})` },
            { id: 'analytics', label: 'Sales Analytics' },
            { id: 'alerts', label: `Live Alerts (${notifications.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => { fetchOrders(); fetchProducts(); fetchNotifications(); }}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-amber-50 text-slate-600 flex items-center gap-1 font-semibold"
            title="Refresh All"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-amber-100">
              No orders recorded yet.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div key={ord.id} className="bg-white rounded-3xl p-6 border border-amber-200/80 shadow-sm space-y-4">
                  
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-slate-900 text-base">{ord.order_id}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                          {ord.payment_method || 'Verified'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 block sm:inline">
                        {ord.created_at ? new Date(ord.created_at).toLocaleString('en-IN') : 'Recent'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-600">Update Status:</label>
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                        className="text-xs font-bold p-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 focus:outline-none"
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-800 mb-1">Customer Address:</h4>
                      <p className="text-slate-600 font-medium">{ord.customer_name} ({ord.mobile})</p>
                      <p className="text-slate-500 mt-0.5">{ord.full_address}</p>
                      {ord.notes && <p className="text-amber-800 italic mt-1 bg-amber-50 p-2 rounded-lg border border-amber-200">Notes: "{ord.notes}"</p>}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 mb-1">Items Ordered:</h4>
                      <div className="space-y-1">
                        {ord.items && ord.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-slate-700">
                            <span>{it.product_name} ({it.quantity_label}) × {it.quantity}</span>
                            <span className="font-bold text-slate-900">₹{(it.unit_price * it.quantity).toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 text-sm font-extrabold text-slate-900 flex justify-between border-t border-slate-100 mt-2">
                        <span>Total:</span>
                        <span className="text-red-700 font-serif">₹{ord.total.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Courier Tracking Details Form */}
                  <div className="pt-3 border-t border-slate-100 bg-amber-50/50 p-4 rounded-2xl space-y-3">
                    <h4 className="text-xs font-extrabold uppercase text-amber-900 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-amber-700" />
                      <span>Courier Shipment Details (Customer Traces This)</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Courier (e.g. DTDC / BlueDart)"
                        defaultValue={ord.courier || ''}
                        onChange={(e) => setShipmentInputs({ ...shipmentInputs, [ord.id]: { ...(shipmentInputs[ord.id] || {}), courier: e.target.value } })}
                        className="text-xs p-2 rounded-xl border border-slate-300 bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Tracking Number"
                        defaultValue={ord.tracking_number || ''}
                        onChange={(e) => setShipmentInputs({ ...shipmentInputs, [ord.id]: { ...(shipmentInputs[ord.id] || {}), tracking_number: e.target.value } })}
                        className="text-xs p-2 rounded-xl border border-slate-300 bg-white font-mono"
                      />
                      <input
                        type="url"
                        placeholder="Tracking URL"
                        defaultValue={ord.tracking_url || ''}
                        onChange={(e) => setShipmentInputs({ ...shipmentInputs, [ord.id]: { ...(shipmentInputs[ord.id] || {}), tracking_url: e.target.value } })}
                        className="text-xs p-2 rounded-xl border border-slate-300 bg-white"
                      />
                      <button
                        onClick={() => handleSaveShipment(ord.id)}
                        className="py-2 px-3 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs"
                      >
                        Save Shipment Info
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRODUCT PHOTOS & CATALOGUE MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-serif">Product Catalogue & Photo Manager</h2>
              <p className="text-xs text-slate-500">
                Click the camera icon on any pickle or delicacy to update its photo live across the store
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-3xl p-4 border border-amber-200/80 shadow-xs flex items-center justify-between gap-3 group hover:border-amber-400 transition-all">
                
                {/* Product Image Thumbnail with Direct Photo Change Button */}
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-amber-50 border border-amber-200 shrink-0 group/img">
                  <img
                    src={p.image_url || '/images/default_food.jpg'}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/default_food.jpg';
                    }}
                  />
                  {/* Photo Edit Icon Overlay */}
                  <button
                    type="button"
                    onClick={() => handleOpenPhotoModal(p)}
                    className="absolute inset-0 bg-slate-950/60 text-white opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-[9px] font-bold"
                    title={`Change photo for ${p.name}`}
                  >
                    <Camera className="w-4 h-4 text-amber-300" />
                    <span>Change</span>
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1 overflow-hidden space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{p.name}</h4>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-semibold">
                      {p.category}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${p.is_veg ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {p.is_veg ? 'Veg' : 'Non-Veg'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-bold">
                    ½kg: ₹{p.price_half} • 1kg: ₹{p.price_one}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenPhotoModal(p)}
                    className="p-2 text-amber-700 hover:bg-amber-100 rounded-xl transition-colors"
                    title="Change Photo for this item"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BUSINESS ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 font-serif">Business Sales Analytics</h2>

          {!analytics || analytics.total_orders === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-amber-100">
              No order data available yet for analytics.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Category Sales Breakdown */}
              <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-900 font-serif">Revenue by Category</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.category_sales}
                        dataKey="category_total"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ category }) => category}
                      >
                        {analytics.category_sales.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => `₹${val}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-900 font-serif">Top Selling Products</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.top_products}>
                      <XAxis dataKey="product_name" />
                      <YAxis />
                      <Tooltip formatter={(val) => `₹${val}`} />
                      <Bar dataKey="total_sales" fill="#dc2626" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* TAB 4: LIVE ORDER ALERTS & NOTIFICATIONS */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-serif">Live Placed Order Alerts</h2>
              <p className="text-xs text-slate-500">Real-time alerts whenever a customer places an order</p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1.5 rounded-xl transition-colors"
              >
                Mark All Read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-amber-100">
              No new order notifications yet. When a customer orders, an alert will sound and appear here!
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    n.is_read === 0
                      ? 'bg-amber-50/90 border-amber-300 shadow-xs ring-1 ring-amber-300'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{n.title}</span>
                      {n.is_read === 0 && (
                        <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">{n.message}</p>
                    <span className="text-[10px] text-slate-400 block">
                      {n.created_at ? new Date(n.created_at).toLocaleString('en-IN') : 'Just now'}
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 underline shrink-0 mt-1"
                  >
                    View Order Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PHOTO UPDATE MODAL FOR SPECIFIC PICKLE / DELICACY */}
      {photoModalProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-amber-300">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                  Product Image Manager
                </span>
                <h3 className="text-lg font-bold font-serif text-slate-900">
                  Update Photo: {photoModalProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setPhotoModalProduct(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductPhoto} className="space-y-4 text-xs">
              
              {/* Photo Preview */}
              <div className="space-y-1 text-center">
                <span className="font-bold text-slate-700 block text-left">Live Photo Preview:</span>
                <div className="w-full aspect-16/9 rounded-2xl overflow-hidden bg-amber-50 border border-amber-200 relative flex items-center justify-center">
                  <img
                    src={imagePreviewUrl || '/images/default_food.jpg'}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/default_food.jpg';
                    }}
                  />
                </div>
              </div>

              {/* Option 1: File Upload */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <label className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-700" />
                  <span>Upload Image File from Device:</span>
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageFileChange}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">Supported: JPG, PNG, WEBP (saved to server images)</p>
              </div>

              {/* Option 2: Image URL / Path */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Or Image URL / Relative Path:</label>
                <input
                  type="text"
                  value={manualImageUrl}
                  onChange={(e) => {
                    setManualImageUrl(e.target.value);
                    setImagePreviewUrl(e.target.value);
                  }}
                  placeholder="e.g. /images/mango_pickle.jpg or https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                />
              </div>

              {photoMessage.error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs font-semibold border border-red-200">
                  {photoMessage.error}
                </div>
              )}

              {photoMessage.success && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{photoMessage.success}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPhotoModalProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingPhoto}
                  className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {uploadingPhoto ? 'Saving Picture...' : 'Save & Update Item Picture'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CHANGE ADMIN PASSWORD MODAL */}
      {showChangePwdModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-amber-300">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-700" />
                <h3 className="text-lg font-bold font-serif text-slate-900">Change Admin Password</h3>
              </div>
              <button
                onClick={() => setShowChangePwdModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  value={currPwdInput}
                  onChange={(e) => setCurrPwdInput(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">New Password (Min 4 chars) *</label>
                <input
                  type="password"
                  required
                  value={newPwdInput}
                  onChange={(e) => setNewPwdInput(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={confirmNewPwdInput}
                  onChange={(e) => setConfirmNewPwdInput(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              {changePwdMsg.error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs font-semibold border border-red-200">
                  {changePwdMsg.error}
                </div>
              )}

              {changePwdMsg.success && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                  {changePwdMsg.success}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePwdModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold font-serif text-slate-900">Add New Product</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Category *</label>
                <select
                  value={newProd.category}
                  onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  {['Veg Pickles', 'Non-Veg Pickles', 'Podi / Powder Varieties', 'Pindi Vantalu', 'Healthy Food', 'Snacks'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">½ kg Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newProd.price_half}
                    onChange={(e) => setNewProd({ ...newProd, price_half: parseFloat(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">1 kg Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newProd.price_one}
                    onChange={(e) => setNewProd({ ...newProd, price_one: parseFloat(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Type *</label>
                <select
                  value={newProd.is_veg}
                  onChange={(e) => setNewProd({ ...newProd, is_veg: parseInt(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value={1}>🌱 Veg</option>
                  <option value={0}>🍗 Non-Veg</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Default Image Path</label>
                <input
                  type="text"
                  value={newProd.image_url}
                  onChange={(e) => setNewProd({ ...newProd, image_url: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-700 text-white font-bold rounded-xl"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

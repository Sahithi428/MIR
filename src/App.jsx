import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategorySection from './components/CategorySection';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import TrackOrderView from './components/TrackOrderView';
import OrderHistoryView from './components/OrderHistoryView';
import HelpContactView from './components/HelpContactView';
import RuchuluAIChat from './components/RuchuluAIChat';
import AdminDashboard from './components/AdminDashboard';
import { Search, Filter, ArrowUpDown, X, Sparkles, Check, Phone } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'products', 'track', 'history', 'help', 'admin'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter & Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [vegFilter, setVegFilter] = useState('All'); // 'All', '1', '0'
  const [priceMax, setPriceMax] = useState(2500);
  const [sortBy, setSortBy] = useState('default'); // 'default', 'price_low_high', 'price_high_low', 'name_a_z', 'name_z_a'

  // Cart state
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Modals & Chat
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [trackInitialOrderId, setTrackInitialOrderId] = useState('');
  const [trackInitialMobile, setTrackInitialMobile] = useState('');

  // Toast notification state
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Add to cart handler
  const handleAddToCart = (product, unit, unitPrice, quantity = 1) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.id === product.id && item.unit === unit);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        category: product.category,
        image_url: product.image_url,
        unit: unit,
        price: unitPrice,
        quantity: quantity
      }];
    });
    showToast(`Added ${product.name} (${unit}) to cart!`);
  };

  const handleUpdateQty = (idx, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(idx);
      return;
    }
    setCart(prev => {
      const updated = [...prev];
      updated[idx].quantity = newQty;
      return updated;
    });
  };

  const handleRemoveItem = (idx) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleOrderSuccess = (orderData) => {
    setCart([]);
    setIsCartOpen(false);
  };

  const handleTrackSpecificOrder = (orderId, mobile) => {
    setTrackInitialOrderId(orderId);
    setTrackInitialMobile(mobile);
    setActiveTab('track');
  };

  // Filtered & Sorted products computation
  const filteredProducts = products.filter(p => {
    // Search matching
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    );

    // Category matching
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;

    // Veg / Non-Veg matching
    const matchesVeg = vegFilter === 'All' || p.is_veg === parseInt(vegFilter);

    // Price matching
    const matchesPrice = p.price_one <= priceMax;

    return matchesSearch && matchesCat && matchesVeg && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'price_low_high') return a.price_one - b.price_one;
    if (sortBy === 'price_high_low') return b.price_one - a.price_one;
    if (sortBy === 'name_a_z') return a.name.localeCompare(b.name);
    if (sortBy === 'name_z_a') return b.name.localeCompare(a.name);
    return a.id - b.id;
  });

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/20 font-sans">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-amber-400 flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
      />

      {/* MAIN BODY CONTENT */}
      <main className="flex-1">
        
        {/* HOMEPAGE VIEW */}
        {activeTab === 'home' && (
          <div>
            <Hero
              onExplore={() => setActiveTab('products')}
              onOpenAI={() => setIsAIOpen(true)}
              onContact={() => setActiveTab('help')}
            />

            <CategorySection
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setActiveTab('products');
              }}
            />

            {/* Featured Products Grid on Homepage */}
            <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
                    Featured Andhra Delicacies
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Handcrafted in Pasuvullanka with pure Guntur spices and cold-pressed oils
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('products')}
                  className="text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors"
                >
                  View All Menu →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.slice(0, 8).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onQuickView={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* PRODUCTS CATALOGUE VIEW */}
        {activeTab === 'products' && (
          <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            
            {/* Header */}
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 font-serif">Product Catalogue</h1>
              <p className="text-sm text-slate-500 mt-1">
                Explore our full range of homemade pickles, fresh podi powders, sweets and snacks.
              </p>
            </div>

            {/* Smart Search & Filter Control Bar */}
            <div className="bg-white rounded-3xl p-6 border border-amber-200/80 shadow-sm space-y-6">
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or keyword (e.g. Mango, Chicken, Prawns, Podi, Laddu, Snacks)..."
                  className="w-full pl-12 pr-10 py-3 text-sm rounded-2xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Quick Search Chips */}
              <div className="flex items-center gap-2 overflow-x-auto text-xs">
                <span className="font-bold text-slate-400 shrink-0">Popular Searches:</span>
                {['Mango', 'Chicken', 'Prawns', 'Podi', 'Laddu', 'Snacks', 'Gongura'].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setSearchQuery(chip)}
                    className={`px-3 py-1 rounded-full border transition-all shrink-0 ${
                      searchQuery.toLowerCase() === chip.toLowerCase()
                        ? 'bg-amber-600 text-white border-amber-600 font-bold'
                        : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100 font-medium'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Filter Controls Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
                
                {/* Category Filter */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="All">All Categories (6)</option>
                    <option value="Veg Pickles">🥭 Veg Pickles</option>
                    <option value="Non-Veg Pickles">🍗 Non-Veg Pickles</option>
                    <option value="Podi / Powder Varieties">🌶️ Podi / Powder Varieties</option>
                    <option value="Pindi Vantalu">🍘 Pindi Vantalu</option>
                    <option value="Healthy Food">❤️ Healthy Food</option>
                    <option value="Snacks">🍿 Snacks</option>
                  </select>
                </div>

                {/* Veg / Non-Veg Filter */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Dietary Preference</label>
                  <select
                    value={vegFilter}
                    onChange={(e) => setVegFilter(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="All">All Items</option>
                    <option value="1">🌱 Vegetarian Only</option>
                    <option value="0">🍗 Non-Vegetarian Only</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="default">Default Order</option>
                    <option value="price_low_high">Price: Low → High</option>
                    <option value="price_high_low">Price: High → Low</option>
                    <option value="name_a_z">Name: A → Z</option>
                    <option value="name_z_a">Name: Z → A</option>
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Max 1kg Price:</span>
                    <span className="text-red-700 font-serif">₹{priceMax}</span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="2500"
                    step="50"
                    value={priceMax}
                    onChange={(e) => setPriceMax(parseInt(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>

              </div>

            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-amber-200">
                <div className="text-4xl">🔍</div>
                <h3 className="font-extrabold text-slate-900 text-lg font-serif">No products found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We couldn't find any products matching "{searchQuery}". Try clearing filters or searching for another delicacy.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setVegFilter('All');
                    setPriceMax(2500);
                    setSortBy('default');
                  }}
                  className="px-6 py-2.5 bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onQuickView={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* TRACK ORDER VIEW */}
        {activeTab === 'track' && (
          <TrackOrderView initialOrderId={trackInitialOrderId} initialMobile={trackInitialMobile} />
        )}

        {/* ORDER HISTORY VIEW */}
        {activeTab === 'history' && (
          <OrderHistoryView onTrackSpecificOrder={handleTrackSpecificOrder} />
        )}

        {/* HELP & CONTACT VIEW */}
        {activeTab === 'help' && (
          <HelpContactView />
        )}

        {/* ADMIN DASHBOARD VIEW */}
        {activeTab === 'admin' && (
          <AdminDashboard onProductsUpdated={fetchProducts} />
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-amber-950/80 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <span className="text-2xl">🍲</span>
              <span className="font-extrabold text-lg font-serif">Mana Inti Ruchulu</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Homemade with Love • Authentic Andhra Taste. Freshly prepared in Pasuvullanka and delivered across India.
            </p>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setActiveTab('home')} className="hover:text-white">Home</button></li>
              <li><button onClick={() => setActiveTab('products')} className="hover:text-white">Product Catalogue</button></li>
              <li><button onClick={() => setActiveTab('track')} className="hover:text-white">Track Your Order</button></li>
              <li><button onClick={() => setActiveTab('history')} className="hover:text-white">Order History</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Verified Contact</h4>
            <ul className="space-y-2 text-xs">
              <li>Owner: <strong className="text-slate-200">Pavani</strong></li>
              <li>Phone: <a href="tel:9885993213" className="text-amber-400 hover:underline">9885993213</a> / <a href="tel:9948295369" className="text-amber-400 hover:underline">9948295369</a></li>
              <li>Pasuvullanka, Ipolavaram Mandal, Konaseema District, AP, PIN 533220</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Ruchulu AI Assistant</h4>
            <p className="text-xs leading-relaxed text-slate-400 mb-3">
              Ask our grounded RAG AI chatbot any product, price, or ordering questions!
            </p>
            <button
              onClick={() => setIsAIOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-xs rounded-xl shadow-xs hover:from-red-700 hover:to-amber-700 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Launch Ruchulu AI</span>
            </button>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © 2026 Mana Inti Ruchulu. All rights reserved. Hackathon MVP Project.
        </div>
      </footer>

      {/* MODALS & DRAWERS */}
      <ProductModal
        product={selectedProduct}
        allProducts={products}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onSelectRelated={(p) => setSelectedProduct(p)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onSuccessOrder={handleOrderSuccess}
      />

      <RuchuluAIChat
        isOpen={isAIOpen}
        onToggle={() => setIsAIOpen(!isAIOpen)}
      />

    </div>
  );
}

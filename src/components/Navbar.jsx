import React from 'react';
import { ShoppingBag, Search, Truck, HelpCircle, UserCheck, ShieldCheck, Sparkles, Phone, PackageCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, cartCount, onOpenCart, onOpenAI }) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-200/60 shadow-xs">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-800 via-amber-700 to-amber-800 text-white text-xs font-medium py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-inner">
        <span className="bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1 font-semibold">
          🇮🇳 We Accept Orders Across India
        </span>
        <span className="hidden md:inline text-amber-100/90">• 100% Authentic Homemade Andhra Delicacies</span>
        <span className="hidden lg:inline text-amber-200">• Call/WhatsApp: 9885993213</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-amber-500 to-amber-400 flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform duration-300">
              🍲
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-red-700 transition-colors font-serif">
                  Mana Inti Ruchulu
                </span>
                <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Andhra
                </span>
              </div>
              <p className="text-xs text-amber-700 font-medium">Homemade with Love • Authentic Andhra Taste</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { id: 'home', label: 'Home' },
              { id: 'products', label: 'Catalogue' },
              { id: 'track', label: 'Track Order', icon: Truck },
              { id: 'history', label: 'Order History', icon: PackageCheck },
              { id: 'help', label: 'Help & Contact', icon: HelpCircle },
              { id: 'admin', label: 'Admin Dashboard', icon: UserCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-100 text-amber-900 shadow-xs'
                      : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50/80'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-amber-600" />}
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Ruchulu AI quick launch button */}
            <button
              onClick={onOpenAI}
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-amber-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm hover:shadow-md hover:from-red-700 hover:to-amber-700 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 animate-spin-slow text-amber-200" />
              <span>Ruchulu AI</span>
            </button>

            {/* Cart Icon Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-2xl bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 transition-all active:scale-95"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-6 h-6 text-amber-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-extrabold text-[11px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-amber-100 text-xs font-semibold overflow-x-auto text-slate-600">
          <button 
            onClick={() => setActiveTab('home')} 
            className={`px-3 py-1.5 rounded-lg ${activeTab === 'home' ? 'text-red-700 bg-red-50 font-bold' : ''}`}
          >
            Home
          </button>
          <button 
            onClick={() => setActiveTab('products')} 
            className={`px-3 py-1.5 rounded-lg ${activeTab === 'products' ? 'text-red-700 bg-red-50 font-bold' : ''}`}
          >
            Menu
          </button>
          <button 
            onClick={() => setActiveTab('track')} 
            className={`px-3 py-1.5 rounded-lg ${activeTab === 'track' ? 'text-red-700 bg-red-50 font-bold' : ''}`}
          >
            Track Order
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`px-3 py-1.5 rounded-lg ${activeTab === 'history' ? 'text-red-700 bg-red-50 font-bold' : ''}`}
          >
            History
          </button>
          <button 
            onClick={() => setActiveTab('help')} 
            className={`px-3 py-1.5 rounded-lg ${activeTab === 'help' ? 'text-red-700 bg-red-50 font-bold' : ''}`}
          >
            Help
          </button>
          <button 
            onClick={() => setActiveTab('admin')} 
            className={`px-3 py-1.5 rounded-lg ${activeTab === 'admin' ? 'text-red-700 bg-red-50 font-bold' : ''}`}
          >
            Admin
          </button>
        </div>
      </div>
    </header>
  );
}

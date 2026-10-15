import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Truck, Award, HeartHandshake, PhoneCall } from 'lucide-react';

export default function Hero({ onExplore, onOpenAI, onContact }) {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 bg-gradient-to-b from-amber-500/10 via-amber-100/30 to-transparent">
      {/* Decorative Background Accents */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-24 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100/90 border border-red-200 text-red-800 text-xs font-bold shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>Authentic Andhra Household Recipes</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 font-serif leading-tight">
              Mana Inti Ruchulu
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-700 via-amber-600 to-amber-700 mt-2">
                Homemade with Love
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl font-normal leading-relaxed">
              Experience the rich, spicy, and authentic taste of traditional Andhra Pradesh pickles, fresh podis, crispy pindi vantalu, and healthy homemade specialties delivered straight from Pasuvullanka to your doorstep across India.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onExplore}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-700 via-amber-600 to-amber-700 text-white font-bold text-base shadow-lg shadow-red-900/20 hover:shadow-xl hover:scale-102 transition-all flex items-center justify-center gap-2 group active:scale-95"
              >
                <span>Explore Full Menu</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenAI}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white text-amber-900 font-bold text-base border-2 border-amber-300 shadow-sm hover:bg-amber-50 hover:border-amber-400 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span>Ask Ruchulu AI</span>
              </button>
            </div>

            {/* Business Trust Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-amber-200/80 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">All-India Delivery</h4>
                  <p className="text-[11px] text-slate-500">Shipped everywhere</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-800 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-red-700" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">100% Homemade</h4>
                  <p className="text-[11px] text-slate-500">Zero preservatives</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Owner Pavani</h4>
                  <p className="text-[11px] text-slate-500">Authentic recipes</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Hero Image Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative ring */}
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-red-600 via-amber-500 to-amber-300 blur-lg opacity-40 animate-pulse" />
              
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                <div className="w-full h-80 sm:h-96 bg-amber-50 flex items-center justify-center p-10 text-center">
                  <h2 className="text-4xl sm:text-5xl font-extrabold text-red-800 font-serif leading-tight">Avakaya Mango Pickle</h2>
                </div>
                
                {/* Floating Overlay Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-amber-200/80 shadow-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-red-700">Featured Special</span>
                    <h3 className="font-extrabold text-slate-900 text-base font-serif">Avakaya Mango Pickle</h3>
                    <p className="text-xs text-amber-800 font-medium">₹400 / ½ kg • ₹750 / 1 kg</p>
                  </div>
                  <span className="bg-amber-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs">
                    Popular
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

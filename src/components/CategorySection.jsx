import React from 'react';

const CATEGORIES = [
  { id: 'Veg Pickles', name: 'Veg Pickles', emoji: '🥭', bg: 'from-amber-500/10 to-emerald-500/10', border: 'border-emerald-200', text: 'Avakaya, Gongura, Tomato, Allam & Lemon' },
  { id: 'Non-Veg Pickles', name: 'Non-Veg Pickles', emoji: '🍗', bg: 'from-red-500/10 to-amber-500/10', border: 'border-red-200', text: 'Prawns, Boneless Chicken, Mutton & Fish' },
  { id: 'Podi / Powder Varieties', name: 'Podi / Powders', emoji: '🌶️', bg: 'from-orange-500/10 to-yellow-500/10', border: 'border-orange-200', text: 'Andhra Karam, Peanut, Kandi & Curry Leaf' },
  { id: 'Pindi Vantalu', name: 'Pindi Vantalu', emoji: '🍘', bg: 'from-yellow-500/10 to-amber-500/10', border: 'border-yellow-200', text: 'Sunnundalu, Ariselu, Murukku & Gavvalu' },
  { id: 'Healthy Food', name: 'Healthy Food', emoji: '❤️', bg: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-200', text: 'Millet Mix, Flax Seed Podi & Dry Fruit Laddu' },
  { id: 'Snacks', name: 'Snacks', emoji: '🍿', bg: 'from-rose-500/10 to-orange-500/10', border: 'border-rose-200', text: 'Ribbon Pakoda, Mixture & Spicy Chegodilu' },
];

export default function CategorySection({ selectedCategory, onSelectCategory }) {
  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
              Explore Product Categories
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select a category to filter authentic Andhra delicacies
            </p>
          </div>
          
          {selectedCategory !== 'All' && (
            <button
              onClick={() => onSelectCategory('All')}
              className="text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3.5 py-1.5 rounded-xl transition-colors"
            >
              Reset Filters (Show All)
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`cursor-pointer rounded-2xl p-4 transition-all duration-300 border flex flex-col justify-between hover:scale-103 shadow-2xs hover:shadow-md ${
                  isSelected
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-400'
                    : `bg-gradient-to-br ${cat.bg} ${cat.border} hover:border-amber-400 text-slate-800`
                }`}
              >
                <div>
                  <span className="text-3xl block mb-2">{cat.emoji}</span>
                  <h3 className={`font-bold text-sm leading-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {cat.name}
                  </h3>
                </div>

                <p className={`text-[11px] mt-2 line-clamp-2 ${isSelected ? 'text-amber-100' : 'text-slate-500'}`}>
                  {cat.text}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

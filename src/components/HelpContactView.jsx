import React, { useState } from 'react';
import { Phone, MapPin, MessageSquare, ChevronDown, ChevronUp, ExternalLink, HelpCircle, Truck, ShoppingBag, ShieldCheck } from 'lucide-react';

const FAQS = [
  {
    category: "Ordering",
    items: [
      { q: "How to place an order?", a: "Browse our catalogue, select ½ kg or 1 kg pack size for your chosen products, click 'Add to Cart', and proceed to Checkout where you enter your delivery details." },
      { q: "How to add products to cart?", a: "On any product card or detail view, pick your desired pack size (½ kg or 1 kg), adjust quantity, and click the 'Add to Cart' button." },
      { q: "How to track an order?", a: "Navigate to the 'Track Order' page and enter your unique Order ID (e.g. MIR-20260918-0001) along with your mobile number to view real-time delivery status." }
    ]
  },
  {
    category: "Delivery",
    items: [
      { q: "Do you accept orders across India?", a: "Yes! 🇮🇳 We accept and ship orders across India (All-India Delivery) via reliable courier partners." },
      { q: "How do I track my order after dispatch?", a: "Once dispatched, courier partner details, tracking number, and a direct 'Track Shipment' link will appear on your Track Order page." },
      { q: "How are delivery charges calculated?", a: "Delivery charges are calculated based on destination PIN code and shipment weight, and confirmed directly by Pavani before dispatch." }
    ]
  },
  {
    category: "Products & Quality",
    items: [
      { q: "What products are available?", a: "We offer authentic Andhra Veg Pickles, Non-Veg Pickles (Prawns, Chicken, Mutton, Fish), Podi / Powder varieties, traditional Pindi Vantalu sweets, Healthy foods, and crisp snacks." },
      { q: "Are preservatives used?", a: "No! All delicacies are 100% homemade by Pavani using traditional family recipes, cold-pressed oils, and zero chemical preservatives." },
      { q: "What is the shelf life?", a: "Veg Pickles stay fresh for 6–9 months, Non-Veg Pickles for 3–6 months (refrigerated), Podis for 4–6 months, and Pindi Vantalu snacks for 30–45 days." }
    ]
  },
  {
    category: "Contact & Business",
    items: [
      { q: "Who is the business owner?", a: "Mana Inti Ruchulu is owned and operated by Pavani." },
      { q: "What are the contact phone numbers?", a: "Call or WhatsApp us at 9885993213 or 9948295369." },
      { q: "Where is the business located?", a: "Pasuvullanka, Ipolavaram Mandal, Konaseema District, Andhra Pradesh, PIN 533220." }
    ]
  }
];

export default function HelpContactView() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (indexStr) => {
    setOpenFaq(openFaq === indexStr ? null : indexStr);
  };

  return (
    <div className="py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <HelpCircle className="w-4 h-4 text-amber-700" />
          <span>Customer Support & Location</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif">Help & Contact</h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          We are here to assist you with order placements, custom requests, and delivery tracking.
        </p>
      </div>

      {/* Verified Business Information Card */}
      <div className="bg-gradient-to-br from-red-900 via-amber-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          
          <div className="md:col-span-7 space-y-4">
            <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/30">
              Verified Business Owner Details
            </span>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-serif">Mana Inti Ruchulu</h2>
              <p className="text-amber-200 text-sm font-medium mt-0.5">Owner: <strong className="text-white">Pavani</strong></p>
            </div>

            <div className="space-y-2 text-xs text-slate-200">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Address:</strong> Pasuvullanka, Ipolavaram Mandal, Konaseema District, Andhra Pradesh, PIN 533220
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <p>
                  <strong>Phone:</strong> <a href="tel:9885993213" className="underline hover:text-amber-300">9885993213</a> / <a href="tel:9948295369" className="underline hover:text-amber-300">9948295369</a>
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="tel:9885993213"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call Owner (Pavani)</span>
              </a>

              <a
                href="https://wa.me/919885993213?text=Hello%20Pavani%20garu,%20I%20have%20an%20inquiry%20regarding%20Mana%20Inti%20Ruchulu."
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Message</span>
              </a>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Pasuvullanka+Ipolavaram+Mandal+Konaseema+District+Andhra+Pradesh"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 text-xs font-bold transition-all border border-amber-300/30 flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Get Directions</span>
              </a>
            </div>

          </div>

          <div className="md:col-span-5 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-xs space-y-4">
            <h3 className="font-bold text-amber-300 text-sm font-serif">Ordering & Shipping Support</h3>
            <p className="text-slate-200 leading-relaxed">
              We pack every order freshly in Pasuvullanka using hygienic airtight containers to ensure freshness throughout delivery across India.
            </p>
            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Working Days:</span>
                <span className="font-bold text-white">Monday – Sunday</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Order Processing:</span>
                <span className="font-bold text-white">24 – 48 Hours</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Help Center / FAQ Section */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900 font-serif">Help Center & Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500">Find answers regarding ordering, delivery, menu options, and business details</p>
        </div>

        <div className="space-y-6">
          {FAQS.map((cat, catIdx) => (
            <div key={cat.category} className="bg-white rounded-3xl p-6 border border-amber-200/80 shadow-xs space-y-3">
              <h3 className="text-sm font-extrabold text-amber-900 uppercase tracking-wider font-serif">
                {cat.category}
              </h3>

              <div className="divide-y divide-slate-100">
                {cat.items.map((item, itemIdx) => {
                  const keyStr = `${catIdx}-${itemIdx}`;
                  const isOpen = openFaq === keyStr;

                  return (
                    <div key={keyStr} className="py-3">
                      <button
                        onClick={() => toggleFaq(keyStr)}
                        className="w-full flex items-center justify-between text-left font-bold text-slate-800 text-xs hover:text-red-700 transition-colors"
                      >
                        <span>{item.q}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-amber-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                      </button>

                      {isOpen && (
                        <p className="mt-2 text-xs text-slate-600 leading-relaxed pl-2 border-l-2 border-amber-400 animate-fade-in">
                          {item.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}

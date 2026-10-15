import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Copy, Check, Trash2, Bot, User, Maximize2, Minimize2, AlertCircle } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  "What is the price of mango pickle?",
  "What podis are available?",
  "What is the price of prawns pickle?",
  "Where is Mana Inti Ruchulu located?",
  "Does mango pickle contain garlic?",
  "Do you deliver across India?"
];

export default function RuchuluAIChat({ isOpen, onToggle }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Namaste! I am Ruchulu AI, your authentic assistant for Mana Inti Ruchulu. How can I help you with our homemade Andhra pickles, podis, sweets or order details today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || input.trim();
    if (!textToSend || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend })
      });
      const data = await res.json();

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: data.answer || "I don't have that information in the current Mana Inti Ruchulu information.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: "I am having trouble connecting right now. Please try again shortly.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleClear = () => {
    setMessages([
      {
        id: 1,
        sender: 'ai',
        text: "Namaste! I am Ruchulu AI. Chat history cleared. Ask me anything about our Andhra delicacies!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <>
      {/* Floating Toggle Bubble */}
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-red-700 via-amber-600 to-amber-700 text-white shadow-2xl hover:scale-108 transition-transform duration-300 flex items-center justify-center badge-pulse group active:scale-95"
        aria-label="Open Ruchulu AI Assistant"
      >
        <Sparkles className="w-7 h-7 text-amber-200 group-hover:rotate-12 transition-transform" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 font-bold text-xs pl-0 group-hover:pl-2">
          Ruchulu AI
        </span>
      </button>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div 
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-white border border-amber-200 shadow-2xl overflow-hidden ${
            isFullScreen
              ? 'inset-0 rounded-none'
              : 'bottom-24 right-4 sm:right-6 w-[92vw] sm:w-[420px] h-[580px] rounded-3xl'
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-red-900 via-amber-800 to-slate-900 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-lg">
                🍲
              </div>
              <div>
                <h3 className="font-extrabold text-sm font-serif flex items-center gap-1.5">
                  <span>Ruchulu AI Assistant</span>
                  <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">RAG Grounded</span>
                </h3>
                <p className="text-[11px] text-amber-200/90">Grounded in business knowledge</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-amber-200 transition-colors"
                title={isFullScreen ? "Minimize" : "Full Screen"}
              >
                {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={handleClear}
                className="p-1.5 rounded-lg hover:bg-white/10 text-amber-200 transition-colors"
                title="Clear Chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg hover:bg-white/10 text-amber-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-amber-50/20">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                  m.sender === 'user' ? 'bg-amber-600 text-white' : 'bg-red-800 text-amber-200'
                }`}>
                  {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`max-w-[80%] rounded-2xl p-3 text-xs space-y-1 relative group ${
                  m.sender === 'user'
                    ? 'bg-amber-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-amber-200/80 shadow-2xs rounded-tl-none'
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  
                  <div className="flex items-center justify-between pt-1 text-[10px] opacity-70">
                    <span>{m.time}</span>
                    {m.sender === 'ai' && (
                      <button
                        onClick={() => handleCopy(m.id, m.text)}
                        className="p-1 hover:text-amber-800 transition-colors"
                        title="Copy Response"
                      >
                        {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 italic pl-9">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Ruchulu AI is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions Chips */}
          <div className="p-2.5 bg-amber-50/80 border-t border-amber-100 overflow-x-auto flex gap-1.5 no-scrollbar">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap bg-white hover:bg-amber-100 text-amber-900 text-[11px] font-medium px-2.5 py-1 rounded-full border border-amber-200 shadow-2xs transition-colors shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about products, prices, ingredients..."
                className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 bg-red-700 hover:bg-red-800 disabled:opacity-40 text-white rounded-xl transition-colors shadow-2xs active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}

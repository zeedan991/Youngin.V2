"use client";

import { useState, useRef, useEffect } from "react";
import { motion, type Transition } from "framer-motion";
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  ImagePlus, 
  Shirt, 
  Palette,
  RotateCcw 
} from "lucide-react";

const SP: Transition = { duration: 0.4, ease: "easeOut" };

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: string;
}

const SUGGESTIONS = [
  { label: "Style a wedding look", icon: Shirt },
  { label: "Streetwear for summer", icon: Palette },
  { label: "Analyze my wardrobe", icon: ImagePlus },
];

const AI_RESPONSES: Record<string, string> = {
  default:
    "Based on your style profile, I'd recommend exploring oversized silhouettes with earth-tone layering. Your body measurements indicate a 98cm chest — a relaxed-fit bomber jacket paired with wide-leg trousers would create excellent proportions. Want me to pull specific items from the marketplace?",
  wedding:
    "For a wedding, let's elevate your look. Given your streetwear-leaning aesthetic, I'd suggest a deconstructed blazer with a mandarin collar in charcoal, slim-fit tailored trousers, and minimal white leather sneakers for that modern edge. I can find pieces from our brand partners that match your exact measurements.",
  streetwear:
    "Summer streetwear is all about breathable fabrics and bold graphics. Think mesh-panel cargo shorts, a heavyweight cotton oversized tee in cream or sage, and chunky trail sandals. Based on your 76cm waist, I'd suggest a size L in most streetwear brands for that perfect oversized drape.",
  wardrobe:
    "I'd love to analyze your wardrobe! Upload some photos of your current pieces and I'll identify gaps, suggest outfit combinations, and recommend secondhand finds from our Thrift Shop that complement what you already own. Your style quiz says you lean Streetwear + Vintage — let's build on that.",
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("wedding") || lower.includes("formal"))
    return AI_RESPONSES.wedding;
  if (lower.includes("street") || lower.includes("summer"))
    return AI_RESPONSES.streetwear;
  if (lower.includes("wardrobe") || lower.includes("analyze") || lower.includes("closet"))
    return AI_RESPONSES.wardrobe;
  return AI_RESPONSES.default;
}

function getTime(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AIStylistPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      text: "Hey! I'm your AI Stylist, powered by Gemini. I know your measurements, style preferences, and what's trending. Ask me anything about fashion, outfit planning, or wardrobe building.",
      timestamp: getTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: text.trim(),
      timestamp: getTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: "ai",
        text: getAIResponse(text),
        timestamp: getTime(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "ai",
        text: "Fresh start! What would you like style help with today?",
        timestamp: getTime(),
      },
    ]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] md:h-[80vh]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SP}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#FF4D94] to-[#B8005C] flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2 text-slate-900">
              AI Stylist
              <span className="px-2 py-0.5 bg-white border border-slate-200 shadow-sm rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Gemini
              </span>
            </h1>
            <p className="text-sm text-slate-500">
              Your personal fashion advisor · Knows your measurements
            </p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
          title="Clear chat"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-sm p-4 md:p-6 space-y-5 mb-4 scrollbar-hide"
      >
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center ${
                msg.role === "ai"
                  ? "bg-gradient-to-br from-[#FF4D94] to-[#B8005C]"
                  : "bg-white/10"
              }`}
            >
              {msg.role === "ai" ? (
                <Bot className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-slate-600" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "ai"
                  ? "bg-slate-50 border border-slate-200"
                  : "bg-pink-50 border border-pink-100"
              }`}
            >
              <p className="text-sm text-slate-800 leading-relaxed">{msg.text}</p>
              <span className="text-[10px] text-slate-400 mt-2 block">
                {msg.timestamp}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center bg-gradient-to-br from-[#FF4D94] to-[#B8005C]">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-1 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce [animation-delay:300ms]" />
            </div>
          </motion.div>
        )}

        {/* Suggestions (only when 1 message) */}
        {messages.length === 1 && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 pt-2"
          >
            {SUGGESTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.label}
                  onClick={() => sendMessage(s.label)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 shadow-sm bg-white text-sm text-slate-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  <Icon className="w-3.5 h-3.5 text-[#FF4D94]" />
                  {s.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about outfits, trends, styling..."
            className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-5 py-3.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF4D94]/50 transition-colors pr-12"
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className={`px-5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${
            input.trim() && !isTyping
              ? "bg-[#FF4D94] text-white hover:scale-105"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

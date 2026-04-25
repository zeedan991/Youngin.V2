"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Smile,
  HandCoins,
  Palette,
  Sparkles,
  X,
  Send,
  ImagePlus,
  Loader2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { generateStylistResponse } from "./actions";

type ToolId = "planner" | "mood" | "budget" | "season" | "celebrity";

interface ToolDef {
  id: ToolId;
  title: string;
  description: string;
  icon: any;
  color: string;
  placeholder: string;
  allowImage?: boolean;
}

const TOOLS: ToolDef[] = [
  {
    id: "planner",
    title: "Weekly Wardrobe Planner",
    description:
      "Input your week's schedule and let AI generate a 7-day outfit plan mixing items you already own.",
    icon: Calendar,
    color: "#3b82f6",
    placeholder:
      "E.g., Monday: office meetings. Tuesday: gym then date night. Wednesday: wfh...",
  },
  {
    id: "mood",
    title: "Mood Translator",
    description:
      "Type how you feel, and we'll map it to colors, fabrics, and silhouettes.",
    icon: Smile,
    color: "#8b5cf6",
    placeholder:
      "E.g., I'm feeling lethargic but want to look secretly powerful and mysterious...",
  },
  {
    id: "budget",
    title: "Budget-Aware Advisor",
    description:
      "Set a budget and describe your wardrobe. We'll maximize outfit variety and calculate Cost-Per-Wear.",
    icon: HandCoins,
    color: "#10b981",
    placeholder:
      "E.g., I have ₹200. I own basic black jeans, a white tee, and old sneakers. What should I buy?",
  },
  {
    id: "season",
    title: "Color Season Analyser",
    description:
      "Upload a photo or describe your skin/hair/eyes to get your personal hex palette.",
    icon: Palette,
    color: "#f59e0b",
    placeholder:
      "E.g., I have pale skin with cool undertones, dark brown hair, and hazel eyes...",
    allowImage: true,
  },
  {
    id: "celebrity",
    title: "Celebrity Alter-Ego",
    description:
      "Pick a celebrity or upload a red-carpet look. We'll deconstruct the aesthetic to wearable street style.",
    icon: Sparkles,
    color: "#ec4899",
    placeholder: "E.g., Zendaya at the Met Gala 2018 or 90s Bollywood...",
    allowImage: true,
  },
];

export default function AIStylistPage() {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [inputVal, setInputVal] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const activeDef = TOOLS.find((t) => t.id === activeTool);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageBase64(event.target?.result as string);
      setImageFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!inputVal.trim() && !imageBase64) return;
    if (!activeTool) return;

    setLoading(true);
    setResult(null);

    const res = await generateStylistResponse(
      activeTool,
      inputVal,
      imageBase64 || undefined,
    );

    if (res.success && res.text) {
      setResult(res.text);
    } else {
      setResult("❌ **Error:** " + (res.error || "Something went wrong."));
    }

    setLoading(false);
  };

  const resetState = () => {
    setActiveTool(null);
    setInputVal("");
    setImageFile(null);
    setImageBase64(null);
    setResult(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          AI Stylist Suite
          <span className="px-2 py-0.5 bg-gradient-to-r from-[#4F46E5] to-[#3730A3] text-white rounded-md text-[10px] font-bold uppercase tracking-widest shadow-sm">
            Powered by Gemini
          </span>
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          Select a specialized style tool below to get started. Complete removal
          of generic chatbots—welcome to precision styling.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!activeTool ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.id}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTool(tool.id)}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] cursor-pointer hover:shadow-xl transition-all flex flex-col justify-between"
                  style={{ minHeight: "220px" }}
                >
                  <div>
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                      style={{
                        background: tool.color + "15",
                        color: tool.color,
                      }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                      {tool.description}
                    </p>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: tool.color }}
                    >
                      Launch Tool →
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="tool-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-[600px]"
          >
            <div
              className="px-6 py-5 border-b border-slate-100 flex items-center justify-between"
              style={{
                borderTop: "4px solid " + (activeDef?.color || "transparent"),
              }}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={resetState}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  {activeDef &&
                    (() => {
                      const ActiveIcon = activeDef.icon;
                      return (
                        <ActiveIcon
                          className="w-6 h-6"
                          style={{ color: activeDef.color }}
                        />
                      );
                    })()}
                  <h2 className="text-xl font-bold text-slate-900">
                    {activeDef?.title}
                  </h2>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 flex flex-col md:flex-row gap-8 bg-slate-50/50">
              <div className="w-full md:w-[400px] flex-shrink-0 flex flex-col gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                    Your Input
                  </label>

                  <textarea
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder={activeDef?.placeholder}
                    className="w-full min-h-[160px] p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 resize-none transition-all placeholder:text-slate-400"
                  />

                  {activeDef?.allowImage && (
                    <div className="w-full relative">
                      <input
                        type="file"
                        accept="image/*"
                        id="image-upload"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        {imageBase64 ? (
                          <div className="w-full h-full p-2 relative">
                            <img
                              src={imageBase64}
                              className="w-full h-full object-cover rounded-lg"
                              alt="Upload preview"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                              <span className="text-white text-xs font-bold">
                                Replace Image
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-slate-500">
                            <ImagePlus className="w-6 h-6" />
                            <span className="text-xs font-bold">
                              Upload Reference Image
                            </span>
                          </div>
                        )}
                      </label>
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={loading || (!inputVal.trim() && !imageBase64)}
                    className="mt-2 w-full py-3.5 rounded-xl text-white font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: activeDef?.color || "#000" }}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    {loading ? "Generating Output..." : "Generate Insights"}
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm overflow-y-auto max-h-[600px] flex flex-col">
                {loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
                    <Loader2
                      className="w-8 h-8 animate-spin"
                      style={{ color: activeDef?.color }}
                    />
                    <p className="text-sm font-medium animate-pulse">
                      Gemini 2.5 Flash is analyzing...
                    </p>
                  </div>
                ) : result ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="markdown-body"
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {result}
                    </ReactMarkdown>
                  </motion.div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-3">
                    {activeDef &&
                      (() => {
                        const ActiveIcon = activeDef.icon;
                        return <ActiveIcon className="w-12 h-12 opacity-20" />;
                      })()}
                    <p className="text-sm font-medium text-center max-w-sm">
                      Submit your inputs on the left to see your personalized
                      <strong className="text-slate-400 ml-1 block mt-1">
                        {activeDef?.title}
                      </strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

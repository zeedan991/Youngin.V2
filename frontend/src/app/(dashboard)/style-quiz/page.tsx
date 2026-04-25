"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Palette,
  Shirt,
  Ruler,
  PartyPopper,
} from "lucide-react";
import Link from "next/link";

const SP: Transition = { duration: 0.5, ease: "easeOut" };

interface QuizQuestion {
  id: number;
  question: string;
  subtitle: string;
  type: "grid" | "slider" | "multi";
  options: { label: string; emoji: string; value: string }[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What's your go-to vibe?",
    subtitle: "Pick the aesthetic that resonates most with your everyday look.",
    type: "grid",
    options: [
      { label: "Streetwear", emoji: "🔥", value: "streetwear" },
      { label: "Minimalist", emoji: "⚪", value: "minimalist" },
      { label: "Y2K", emoji: "💿", value: "y2k" },
      { label: "Grunge", emoji: "⛓️", value: "grunge" },
      { label: "Techwear", emoji: "🥷", value: "techwear" },
      { label: "Vintage", emoji: "📼", value: "vintage" },
    ],
  },
  {
    id: 2,
    question: "How do you like your fit?",
    subtitle:
      "This calibrates how we match garment sizing to your body profile.",
    type: "grid",
    options: [
      { label: "Oversized", emoji: "📦", value: "oversized" },
      { label: "Relaxed", emoji: "🌊", value: "relaxed" },
      { label: "Regular", emoji: "📐", value: "regular" },
      { label: "Slim", emoji: "✂️", value: "slim" },
    ],
  },
  {
    id: 3,
    question: "Pick your color palette",
    subtitle:
      "We'll use this to curate brand recommendations and thrift picks.",
    type: "multi",
    options: [
      { label: "Earth Tones", emoji: "🤎", value: "earth" },
      { label: "Monochrome", emoji: "🖤", value: "monochrome" },
      { label: "Bold Neons", emoji: "💜", value: "neons" },
      { label: "Pastels", emoji: "🩷", value: "pastels" },
      { label: "Dark Academia", emoji: "📚", value: "darkacademia" },
      { label: "All Black", emoji: "🏴", value: "allblack" },
    ],
  },
  {
    id: 4,
    question: "What matters most to you?",
    subtitle:
      "This shapes your credibility score and platform recommendations.",
    type: "grid",
    options: [
      { label: "Sustainability", emoji: "♻️", value: "sustainability" },
      { label: "Affordability", emoji: "💰", value: "affordability" },
      { label: "Brand Names", emoji: "👑", value: "brands" },
      { label: "Uniqueness", emoji: "🦄", value: "uniqueness" },
    ],
  },
];

export default function StyleQuizPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [completed, setCompleted] = useState(false);

  const question = QUESTIONS[currentQ];
  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;

  const toggleAnswer = (questionId: number, value: string) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (question.type === "multi") {
        return {
          ...prev,
          [questionId]: current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value],
        };
      }
      return { ...prev, [questionId]: [value] };
    });
  };

  const isSelected = (value: string) =>
    (answers[question.id] || []).includes(value);

  const canAdvance = (answers[question.id] || []).length > 0;

  const handleNext = () => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ((p) => p + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleBack = () => {
    if (currentQ > 0) setCurrentQ((p) => p - 1);
  };

  return (
    <div className="w-full max-w-3xl mx-auto min-h-[70vh] flex flex-col">
      <AnimatePresence mode="wait">
        {!completed ? (
          <motion.div
            key={`q-${currentQ}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={SP}
            className="flex-1 flex flex-col"
          >
            {/* Progress */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-[#4F46E5] text-xs font-bold uppercase tracking-widest">
                  <Sparkles className="w-4 h-4" /> Style Quiz
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {currentQ + 1} / {QUESTIONS.length}
                </span>
              </div>
              <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-[#4F46E5] to-[#3730A3] rounded-full"
                />
              </div>
            </div>

            {/* Question */}
            <div className="mb-10">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-slate-900">
                {question.question}
              </h1>
              <p className="text-slate-500 text-base">{question.subtitle}</p>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-auto">
              {question.options.map((opt) => {
                const selected = isSelected(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleAnswer(question.id, opt.value)}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all group ${
                      selected
                        ? "border-[#4F46E5] bg-[#4F46E5]/10"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-sm"
                    }`}
                  >
                    {selected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#4F46E5] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className="text-2xl mb-2 block">{opt.emoji}</span>
                    <span
                      className={`text-sm font-semibold ${
                        selected ? "text-slate-900" : "text-slate-700"
                      }`}
                    >
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Footer Nav */}
            <div className="mt-10 pt-6 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={currentQ === 0}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${
                  currentQ === 0
                    ? "text-slate-400 cursor-not-allowed"
                    : "text-slate-900 hover:bg-slate-50"
                }`}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleNext}
                disabled={!canAdvance}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${
                  canAdvance
                    ? "bg-[#4F46E5] text-white hover:scale-105"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                {currentQ === QUESTIONS.length - 1 ? "Finish" : "Next"}{" "}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={SP}
            className="flex-1 flex flex-col items-center justify-center text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-[#4F46E5]/20 flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 rounded-full border-4 border-[#4F46E5] animate-ping opacity-20" />
              <PartyPopper className="w-10 h-10 text-[#4F46E5]" />
            </div>
            <h2 className="text-4xl font-black tracking-tight mb-4 text-slate-900">
              Style Profile Created
            </h2>
            <p className="text-slate-500 max-w-md mx-auto mb-10 text-lg">
              Your aesthetic DNA has been mapped. All curations, brand matches,
              and thrift picks will now align to your unique style fingerprint.
            </p>
            <div className="flex gap-4">
              <Link href="/thrift">
                <button className="px-6 py-2.5 rounded-full border border-slate-200 text-slate-900 bg-white font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
                  <Shirt className="w-4 h-4" /> Browse Thrift
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="px-6 py-2.5 rounded-full bg-[#4F46E5] text-white font-semibold hover:scale-105 transition-transform flex items-center gap-2 shadow-sm">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

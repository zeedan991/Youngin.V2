"use client";
import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Gift, Sparkles, ArrowRight, Check, Star, RefreshCw, Shirt } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Starter",
    price: 29,
    items: 3,
    perks: ["AI-curated selection", "Size guarantee", "Free returns", "Monthly surprise"],
    color: "#00E5FF",
    popular: false,
  },
  {
    name: "Curator",
    price: 59,
    items: 6,
    perks: ["Everything in Starter", "Priority access to drops", "Brand exclusives", "Style profile matching", "Tailor credits ($20)"],
    color: "#F5C842",
    popular: true,
  },
  {
    name: "Elite",
    price: 99,
    items: 10,
    perks: ["Everything in Curator", "Designer pieces", "Personal stylist", "Same-day dispatch", "Free alterations"],
    color: "#9B5DE5",
    popular: false,
  },
];

const RECENT_BOXES = [
  { brand: "Carhartt", item: "Detroit Jacket", size: "L", match: "98%" },
  { brand: "Levi's", item: "501 Jeans", size: "32×32", match: "99%" },
  { brand: "Champion", item: "Reverse Weave Hoodie", size: "XL", match: "97%" },
];

export default function ThriftPage() {
  const [selectedPlan, setSelectedPlan] = useState("Curator");
  const [quizStep, setQuizStep] = useState(0);

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <TopNav />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,200,66,0.06)_0%,transparent_60%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#F5C842]/30 bg-[#F5C842]/5 px-4 py-1.5 mb-6">
              <Gift className="w-4 h-4 text-[#F5C842]" />
              <span className="text-xs font-bold uppercase tracking-[3px] text-[#F5C842]">Monthly Thrift Box</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-[900] text-white tracking-tight mb-6">
              Vintage, curated<br />
              <span className="text-[#F5C842]">just for you.</span>
            </h1>
            <p className="text-[#888] text-lg max-w-2xl mx-auto mb-10">
              Our AI learns your body, your style, your vibe — then curates a monthly box of premium secondhand pieces that actually fit.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-[#555]">
              {["Size guaranteed", "100% secondhand", "Cancel anytime"].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00E5FF]" />
                  {t}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6 border-y border-white/5 bg-[#0D0D0D]">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-[#555] mb-10">How it works</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "01", icon: Sparkles, title: "Take the Style Quiz", desc: "Tell us your aesthetic, vibe, and what you never want to wear again." },
              { num: "02", icon: Shirt, title: "AI Matches Your Build", desc: "We use your body measurements to filter only pieces that will fit perfectly." },
              { num: "03", icon: RefreshCw, title: "Box Arrives Monthly", desc: "Keep what you love, return the rest. Earn credits on returns." },
            ].map(({ num, icon: Icon, title, desc }) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative pl-6 border-l border-white/10"
              >
                <p className="text-[#F5C842] font-[900] text-4xl mb-4 opacity-30">{num}</p>
                <Icon className="w-6 h-6 text-[#F5C842] mb-3" />
                <h3 className="text-white font-bold mb-2">{title}</h3>
                <p className="text-[#555] text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-[#555] mb-3">Choose your box</p>
          <h2 className="text-3xl font-[900] text-white text-center mb-12">One subscription, infinite style.</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedPlan(plan.name)}
                className={cn(
                  "glass-panel rounded-2xl p-6 cursor-pointer transition-all relative overflow-hidden",
                  selectedPlan === plan.name && "ring-1",
                )}
                style={selectedPlan === plan.name ? { borderColor: plan.color, boxShadow: `0 0 20px ${plan.color}22` } : {}}
              >
                {plan.popular && (
                  <div className="absolute top-3 right-3 bg-[#F5C842] text-[#0A0A0A] text-[10px] font-[900] px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Star className="w-2.5 h-2.5" /> Most Popular
                  </div>
                )}

                <p style={{ color: plan.color }} className="text-xs font-bold uppercase tracking-widest mb-3">{plan.name}</p>
                <div className="mb-6">
                  <span className="text-4xl font-[900] text-white">${plan.price}</span>
                  <span className="text-[#555] text-sm">/month</span>
                </div>
                <p className="text-[#888] text-sm mb-6">{plan.items} curated items per box</p>

                <ul className="space-y-2.5 mb-8">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-[#888]">
                      <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: plan.color }} />
                      {perk}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={selectedPlan === plan.name ? "primary" : "outline"}
                  size="md"
                  className="w-full"
                  style={selectedPlan === plan.name ? { backgroundColor: plan.color, color: "#0A0A0A" } : {}}
                >
                  {selectedPlan === plan.name ? "Selected" : "Choose Plan"}
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="primary" size="lg" className="px-12">
              Subscribe Now <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Sample box */}
      <section className="py-16 px-6 bg-[#0D0D0D] border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-[#555] mb-2">Last Month&apos;s Box</p>
          <h3 className="text-2xl font-bold text-white mb-8">A look inside the Curator box</h3>
          <div className="space-y-3">
            {RECENT_BOXES.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel rounded-xl px-5 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
                    <Shirt className="w-5 h-5 text-[#555]" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{item.item}</p>
                    <p className="text-[#555] text-xs">{item.brand} · Size {item.size}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#00E5FF] font-[900] text-sm">{item.match}</p>
                  <p className="text-[#444] text-xs">AI fit match</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

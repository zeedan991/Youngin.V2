"use client";
import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Scissors, MapPin, Star, Clock, ArrowRight, CheckCircle, Send, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const TAILORS = [
  {
    id: 1, name: "Arjun Mehta", city: "Mumbai, IN", specialty: "Streetwear & Custom Fits",
    rating: 4.9, reviews: 312, turnaround: "5–7 days", verified: true,
    tags: ["3D Design Ready", "Embroidery", "Alterations"],
  },
  {
    id: 2, name: "Li Wei Studio", city: "Shanghai, CN", specialty: "Technical Athletic Wear",
    rating: 4.8, reviews: 198, turnaround: "7–10 days", verified: true,
    tags: ["Performance Fabric", "3D Design Ready", "Bulk Orders"],
  },
  {
    id: 3, name: "Carlos Ruiz", city: "NYC, US", specialty: "High-Fashion & Formalwear",
    rating: 5.0, reviews: 87, turnaround: "10–14 days", verified: true,
    tags: ["Luxury Fabric", "Bespoke", "Alterations"],
  },
  {
    id: 4, name: "Amara Diallo", city: "Paris, FR", specialty: "Avant-garde Streetwear",
    rating: 4.7, reviews: 154, turnaround: "8–12 days", verified: false,
    tags: ["3D Design Ready", "Custom Cuts", "Patchwork"],
  },
];

const FEATURES = [
  { icon: Send, title: "Send Your 3D Design", desc: "Share your Studio design directly to any tailor in one click." },
  { icon: CheckCircle, title: "Measurements Auto-Sent", desc: "Your AI measurements are transmitted automatically — no manual input needed." },
  { icon: Clock, title: "Track Progress", desc: "Real-time status updates from cutting through to dispatch." },
];

export default function TailorsPage() {
  const [selectedTailor, setSelectedTailor] = useState<number | null>(null);

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <TopNav />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,200,66,0.05)_0%,transparent_50%)] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#F5C842]/30 bg-[#F5C842]/5 px-4 py-1.5 mb-6">
              <Scissors className="w-4 h-4 text-[#F5C842]" />
              <span className="text-xs font-bold uppercase tracking-[3px] text-[#F5C842]">Tailor Network</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-[900] text-white tracking-tight mb-4">
                  Your design.<br />
                  A real tailor.<br />
                  <span className="text-[#F5C842]">Perfect fit.</span>
                </h1>
                <p className="text-[#888] text-lg mb-8">
                  Design in the Studio, then beam it to verified expert tailors anywhere in the world. Your AI measurements go with it.
                </p>
                <Button variant="gold" size="lg">
                  Find a Tailor <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Feature list */}
              <div className="space-y-4">
                {FEATURES.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="glass-panel rounded-xl p-4 flex items-start gap-4">
                    <div className="w-9 h-9 rounded-lg bg-[#F5C842]/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[#F5C842]" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm mb-1">{title}</p>
                      <p className="text-[#555] text-xs leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tailor listings */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-[900] text-white">Verified Tailors</h2>
              <p className="text-[#555] text-sm mt-1">{TAILORS.length} tailors ready to accept your design</p>
            </div>
            <Button variant="outline" size="sm">Filter by Location</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {TAILORS.map((tailor, i) => (
              <motion.div
                key={tailor.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -3 }}
                onClick={() => setSelectedTailor(tailor.id === selectedTailor ? null : tailor.id)}
                className={cn(
                  "glass-panel rounded-2xl p-6 cursor-pointer transition-all",
                  selectedTailor === tailor.id && "border-[#F5C842] shadow-[0_0_20px_rgba(245,200,66,0.15)]"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F5C842]/30 to-[#F5C842]/5 flex items-center justify-center border border-[#F5C842]/20">
                      <span className="text-[#F5C842] font-[900] text-lg">{tailor.name[0]}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-bold">{tailor.name}</p>
                        {tailor.verified && <BadgeCheck className="w-4 h-4 text-[#00E5FF]" />}
                      </div>
                      <div className="flex items-center gap-1 text-[#555] text-xs mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {tailor.city}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-[#F5C842] fill-[#F5C842]" />
                      <span className="text-white font-bold text-sm">{tailor.rating}</span>
                      <span className="text-[#444] text-xs">({tailor.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#555] text-xs mt-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {tailor.turnaround}
                    </div>
                  </div>
                </div>

                <p className="text-[#888] text-sm mb-4">{tailor.specialty}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {tailor.tags.map((tag) => (
                    <span
                      key={tag}
                      className={cn(
                        "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider",
                        tag === "3D Design Ready"
                          ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20"
                          : "bg-white/5 text-[#666] border border-white/10"
                      )}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <Button
                  variant={selectedTailor === tailor.id ? "gold" : "outline"}
                  size="sm"
                  className="w-full"
                >
                  {selectedTailor === tailor.id ? (
                    <><Send className="w-3.5 h-3.5 mr-2" /> Send My Design</>
                  ) : (
                    "Select Tailor"
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

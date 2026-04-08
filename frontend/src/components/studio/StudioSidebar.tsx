"use client";
import { motion } from "framer-motion";
import { Paintbrush, ImageIcon, Shirt, RotateCcw, Download, Share2, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useStudioStore } from "@/store/useStudioStore";
import { cn } from "@/lib/utils";

const PALETTE = [
  { label: "Neon Cyan", value: "#00E5FF" },
  { label: "Gold", value: "#F5C842" },
  { label: "Pure White", value: "#FFFFFF" },
  { label: "Graphite", value: "#2A2A2A" },
  { label: "Obsidian", value: "#0A0A0A" },
  { label: "Electric Purple", value: "#9B5DE5" },
  { label: "Hot Pink", value: "#F72585" },
  { label: "Lime", value: "#CCFF00" },
  { label: "Coral", value: "#FF6B6B" },
  { label: "Sky Blue", value: "#4ECDC4" },
  { label: "Warm Sand", value: "#E8D5B7" },
  { label: "Forest", value: "#2D6A4F" },
];

const MATERIALS = [
  { id: "matte" as const, label: "Matte" },
  { id: "glossy" as const, label: "Glossy" },
  { id: "metallic" as const, label: "Metallic" },
];

const TABS = [
  { id: "colors" as const, icon: Paintbrush, label: "Colors" },
  { id: "textures" as const, icon: Layers, label: "Textures" },
  { id: "logo" as const, icon: ImageIcon, label: "Logo" },
];

export function StudioSidebar() {
  const { currentColor, currentMaterial, activeTab, setColor, setMaterial, setActiveTab } = useStudioStore();

  return (
    <motion.aside
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-72 bg-white border-l border-slate-200 flex flex-col h-full overflow-y-auto"
    >
      {/* Tab Header */}
      <div className="flex border-b border-slate-200">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-4 flex flex-col items-center gap-1.5 text-xs font-bold transition-all",
                activeTab === tab.id
                  ? "text-[#00E5FF] border-b-2 border-[#00E5FF]"
                  : "text-slate-500 hover:text-slate-900 bg-white"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 p-5 space-y-6">
        {activeTab === "colors" && (
          <>
            {/* Current color preview */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-bold">Active Color</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl border border-slate-200 shadow-lg"
                  style={{ backgroundColor: currentColor, boxShadow: `0 0 20px ${currentColor}44` }}
                />
                <div>
                  <p className="text-slate-900 font-mono text-sm">{currentColor.toUpperCase()}</p>
                  <p className="text-slate-500 text-xs">Tap swatch to switch</p>
                </div>
              </div>
            </div>

            {/* Color swatches */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-bold">Color Palette</p>
              <div className="grid grid-cols-6 gap-2">
                {PALETTE.map((color) => (
                  <button
                    key={color.value}
                    title={color.label}
                    onClick={() => setColor(color.value)}
                    className={cn(
                      "w-9 h-9 rounded-lg transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 shadow-sm border border-slate-200",
                      currentColor === color.value && "ring-2 ring-slate-900 ring-offset-2 ring-offset-white scale-110"
                    )}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
            </div>

            {/* Material */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-bold">Material Finish</p>
              <div className="grid grid-cols-3 gap-2">
                {MATERIALS.map((mat) => (
                  <button
                    key={mat.id}
                    onClick={() => setMaterial(mat.id)}
                    className={cn(
                      "py-2.5 rounded-lg text-xs font-bold transition-all border",
                      currentMaterial === mat.id
                        ? "bg-[#00E5FF] text-[#0A0A0A] border-[#00E5FF]"
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-900 shadow-sm"
                    )}
                  >
                    {mat.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "textures" && (
          <div className="text-center py-12 text-slate-500">
            <Layers className="w-10 h-10 mx-auto mb-3 opacity-40 text-slate-400" />
            <p className="text-sm font-medium text-slate-900">Texture Library</p>
            <p className="text-xs mt-1">Coming soon — Upload custom fabric textures</p>
          </div>
        )}

        {activeTab === "logo" && (
          <div className="text-center py-12 text-slate-500">
            <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-40 text-slate-400" />
            <p className="text-sm font-medium text-slate-900">Logo & Decals</p>
            <p className="text-xs mt-1">Upload a PNG to place on the garment</p>
            <Button variant="outline" size="sm" className="mt-4 border-slate-300 text-slate-700 hover:bg-slate-50">
              Upload Image
            </Button>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="p-4 border-t border-slate-200 bg-white space-y-2">
        <Button variant="primary" size="md" className="w-full">
          <Download className="w-4 h-4 mr-2" /> Export Design
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <RotateCcw className="w-4 h-4 mr-1" /> Reset
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Share2 className="w-4 h-4 mr-1" /> Share
          </Button>
        </div>
      </div>
    </motion.aside>
  );
}

"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { ToolbarTop } from "@/components/studio/ToolbarTop";
import { PanelLeft } from "@/components/studio/PanelLeft";
import { PanelRight } from "@/components/studio/PanelRight";

// Dynamically import Fabric.js canvas to prevent SSR issues
const FabricCanvas = dynamic(
  () => import("@/components/studio/FabricCanvas").then((m) => m.FabricCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-[#0D0D0D]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#555] text-sm font-medium">Loading Design Canvas…</p>
        </div>
      </div>
    ),
  }
);

// Dynamically import Three.js preview
const GarmentPreview3D = dynamic(
  () => import("@/components/studio/GarmentPreview3D").then((m) => m.GarmentPreview3D),
  { ssr: false, loading: () => <div className="w-72 bg-[#0A0A0A]" /> }
);

import { useState } from "react";
import { Paintbrush, Wand2, Layers, Search, Download, Type, Square, PenTool, Eraser, MousePointer2 } from "lucide-react";
import { useStudioStore } from "@/store/useStudioStore";
import { cn } from "@/lib/utils";
export default function StudioPage() {
  const [activeDock, setActiveDock] = useState<"none" | "color" | "images" | "ai" | "layers" | "export">("none");
  const setRightPanel = useStudioStore((s) => s.setRightPanel);
  const activeTool = useStudioStore((s) => s.activeTool);

  const handleDockClick = (tab: "color" | "images" | "ai" | "layers" | "export") => {
    if (activeDock === tab) {
      setActiveDock("none");
    } else {
      setActiveDock(tab);
      if (tab === "ai" || tab === "layers" || tab === "export") {
        setRightPanel(tab);
      }
    }
  };

  const handleAddText = async () => {
    const canvas = useStudioStore.getState().fabricCanvas;
    if (!canvas) return;
    const { FabricText } = await import("fabric");
    const text = new FabricText("Double-click to edit", {
      left: 100, top: 100, fontFamily: "Inter, sans-serif", fontSize: 40, fill: "#000000", fontWeight: "bold", editable: true
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    useStudioStore.getState().setActiveTool("select");
  };

  const handleAddShape = async () => {
    const canvas = useStudioStore.getState().fabricCanvas;
    if (!canvas) return;
    const { Rect } = await import("fabric");
    const shape = new Rect({
      left: 100, top: 100, width: 120, height: 80, fill: "#00E5FF", rx: 8, ry: 8
    });
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
    useStudioStore.getState().setActiveTool("select");
  };

  return (
    <div
      className="flex flex-col bg-[#0A0A0A] rounded-3xl overflow-hidden border border-[#1A1A1A] shadow-2xl"
      style={{ height: "calc(100vh - 80px)" }}
    >
      <ToolbarTop />

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* The New Thin Navigation Navbar (CAD Style) */}
        <div className="w-16 bg-[#0F0F0F] border-r border-[#1E1E1E] flex flex-col items-center py-6 gap-6 z-30 shrink-0 overflow-y-auto">
           {/* Direct Canvas Actions */}
           <button onClick={() => useStudioStore.getState().setActiveTool("select")} className={cn("transition-colors", activeTool === "select" ? "text-[#00E5FF]" : "text-[#666] hover:text-white")} title="Select Tool"><MousePointer2 className="w-5 h-5"/></button>
           <button onClick={handleAddText} className="text-[#666] hover:text-white transition-colors" title="Add Text"><Type className="w-5 h-5"/></button>
           <button onClick={handleAddShape} className="text-[#666] hover:text-white transition-colors" title="Add Shape (Rect)"><Square className="w-5 h-5"/></button>
           <button onClick={() => useStudioStore.getState().setActiveTool(activeTool === "draw" ? "select" : "draw")} className={cn("transition-colors", activeTool === "draw" ? "text-[#00E5FF]" : "text-[#666] hover:text-white")} title="Draw Mode"><PenTool className="w-5 h-5"/></button>
           
           <div className="w-8 h-px bg-[#2A2A2A]" />
           
           {/* Flyout Dock Triggers */}
           <button onClick={() => handleDockClick("color")} className={cn("transition-colors", activeDock === "color" ? "text-[#00E5FF]" : "text-[#666] hover:text-[#00E5FF]")} title="Garment Color & Brush"><Paintbrush className="w-5 h-5"/></button>
           <button onClick={() => handleDockClick("images")} className={cn("transition-colors", activeDock === "images" ? "text-[#00E5FF]" : "text-[#666] hover:text-[#00E5FF]")} title="Image Library"><Search className="w-5 h-5"/></button>
           <button onClick={() => handleDockClick("ai")} className={cn("transition-colors bg-clip-text", activeDock === "ai" ? "text-purple-400" : "text-purple-600 hover:text-purple-400")} title="AI Generator"><Wand2 className="w-5 h-5"/></button>
           
           <div className="w-8 h-px bg-[#2A2A2A]" />
           
           {/* Manage Triggers */}
           <button onClick={() => handleDockClick("layers")} className={cn("transition-colors", activeDock === "layers" ? "text-[#00E5FF]" : "text-[#666] hover:text-[#00E5FF]")} title="Layers & Adjust"><Layers className="w-5 h-5"/></button>
           <button onClick={() => handleDockClick("export")} className={cn("transition-colors mt-auto", activeDock === "export" ? "text-[#00E5FF]" : "text-[#666] hover:text-[#00E5FF]")} title="Export & Print"><Download className="w-5 h-5"/></button>
        </div>

        {/* Slide-out Panels */}
        {activeDock !== "none" && (
           <div className="absolute top-0 bottom-0 left-16 z-20 shadow-2xl border-r border-[#1E1E1E] bg-[#111] overflow-hidden">
             {(activeDock === "color" || activeDock === "images") && <PanelLeft />}
             {(activeDock === "ai" || activeDock === "layers" || activeDock === "export") && <PanelRight />}
           </div>
        )}

        {/* Center: Fabric.js Design Canvas */}
        <div className="flex-[2] flex overflow-hidden border-r border-[#1E1E1E] bg-[#1a1a1a]">
          <Suspense fallback={null}>
            <FabricCanvas />
          </Suspense>
        </div>

        {/* Center-Right: Massive 3D Preview */}
        <div className="flex-1 flex flex-col bg-[#0D0D0D] relative overflow-hidden shrink-0">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="text-[10px] text-white/50 uppercase tracking-[3px] font-bold bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">Live 3D Preview</span>
          </div>
          <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing">
            <GarmentPreview3D />
          </div>
        </div>

      </div>
    </div>
  );
}

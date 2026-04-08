"use client";
import dynamic from "next/dynamic";
import { StudioSidebar } from "@/components/studio/StudioSidebar";
import { Shirt, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from "lucide-react";

// Dynamically import the 3D canvas to avoid SSR issues with WebGL
const ModelViewer = dynamic(
  () => import("@/components/studio/ModelViewer").then((m) => m.ModelViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-[#0D0D0D]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#888] text-sm">Loading 3D Engine...</p>
        </div>
      </div>
    ),
  }
);

export default function StudioPage() {
  return (
    <div className="flex flex-col h-[85vh] bg-[#0A0A0A] rounded-3xl overflow-hidden border border-white/10 relative">
      {/* Studio toolbar */}
      <div className="absolute top-0 inset-x-0 z-40 bg-[#111111]/95 backdrop-blur-md border-b border-white/5 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-white">
            <Shirt className="w-4 h-4 text-[#00E5FF]" />
            <span className="text-sm font-bold tracking-wide">Untitled Design</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-xs text-[#555] font-medium">Classic Tee · v1</span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {[ZoomIn, ZoomOut, RotateCcw, Maximize2].map((Icon, i) => (
            <button
              key={i}
              className="p-2 rounded-lg text-[#666] hover:text-white hover:bg-white/5 transition-all"
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-[#555]">
          <div className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
          <span>Auto-saved</span>
        </div>
      </div>

      {/* Studio split layout */}
      <div className="flex flex-1 pt-12 overflow-hidden">
        {/* 3D Canvas */}
        <div className="flex-1 relative bg-[#0D0D0D] overflow-hidden">
          {/* Subtle grid floor */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          <ModelViewer />

          {/* Canvas corner hint */}
          <div className="absolute bottom-6 left-6 text-[#333] text-xs font-medium pointer-events-none select-none">
            Drag to rotate · Scroll to zoom
          </div>
        </div>

        {/* Sidebar */}
        <StudioSidebar />
      </div>
    </div>
  );
}

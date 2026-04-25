"use client";
import {
  useStudioStore,
  GARMENTS,
  type ActiveTool,
} from "@/store/useStudioStore";
import { cn } from "@/lib/utils";
import { Undo2, Redo2, ChevronDown, Download, Trash2 } from "lucide-react";
import { useState } from "react";

export function ToolbarTop() {
  const {
    currentGarment,
    setGarment,
    designTitle,
    setDesignTitle,
    undo,
    redo,
    isSaving,
    lastSaved,
    fabricCanvas,
    setRightPanel,
  } = useStudioStore();

  const [garmentOpen, setGarmentOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);

  const clearCanvas = () => {
    if (fabricCanvas) {
      fabricCanvas.clear();
      fabricCanvas.set(
        "backgroundColor",
        useStudioStore.getState().garmentColor,
      );
      fabricCanvas.renderAll();
    }
  };

  return (
    <div className="h-12 flex items-center gap-3 px-4 bg-[#0F0F0F] border-b border-[#1E1E1E] z-50 shrink-0">
      {/* Logo pill */}
      <div className="flex items-center gap-2 mr-2 pr-4 border-r border-[#1E1E1E]">
        <span className="text-white font-black text-sm tracking-[4px]">
          YOUNGIN
        </span>
        <span className="text-[#00E5FF] text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#00E5FF]/10">
          CAD
        </span>
      </div>

      {/* Professional File Menus */}
      <div className="hidden lg:flex items-center gap-4 text-[#888] text-xs font-semibold mr-4">
        <button className="hover:text-white transition-colors">File</button>
        <button className="hover:text-white transition-colors">Edit</button>
        <button className="hover:text-white transition-colors">View</button>
        <button className="hover:text-white transition-colors">Settings</button>
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px h-5 bg-[#222] mx-1" />

      {/* Garment Selector Dropdown */}
      <div className="relative mr-2">
        <button
          onClick={() => setGarmentOpen(!garmentOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-white text-xs font-bold hover:border-[#00E5FF]/40 transition-all"
        >
          <span>{currentGarment.emoji}</span>
          <span>{currentGarment.label}</span>
          <ChevronDown
            className={cn(
              "w-3 h-3 text-[#555] transition-transform",
              garmentOpen && "rotate-180",
            )}
          />
        </button>

        {garmentOpen && (
          <div className="absolute top-full left-0 mt-1 w-56 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
            {GARMENTS.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  setGarment(g);
                  setGarmentOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2 text-xs transition-colors text-left",
                  currentGarment.id === g.id
                    ? "bg-[#00E5FF]/10 text-[#00E5FF] font-bold"
                    : "text-[#888] hover:bg-[#2A2A2A] hover:text-white",
                )}
              >
                <span className="text-base">{g.emoji}</span>
                <div>
                  <p className="font-semibold leading-tight">{g.label}</p>
                  <p className="text-[9px] text-[#555] uppercase tracking-wider">
                    {g.printWidth} × {g.printHeight}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-[#222] mx-1" />

      {/* Undo / Redo & Clear */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          title="Undo"
          className="p-1.5 rounded-md text-[#666] hover:text-white hover:bg-[#1A1A1A] transition-all"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          title="Redo"
          className="p-1.5 rounded-md text-[#666] hover:text-white hover:bg-[#1A1A1A] transition-all"
        >
          <Redo2 className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-[#222] mx-1" />
        <button
          onClick={clearCanvas}
          title="Clear Canvas"
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-red-500/80 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs font-bold"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Design Title */}
      {editingTitle ? (
        <input
          autoFocus
          value={designTitle}
          onChange={(e) => setDesignTitle(e.target.value)}
          onBlur={() => setEditingTitle(false)}
          onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
          className="bg-transparent text-white text-sm font-bold text-center border-b border-[#00E5FF] outline-none px-2 py-1 w-40"
        />
      ) : (
        <button
          onClick={() => setEditingTitle(true)}
          className="text-[#888] hover:text-white text-sm font-bold transition-colors px-2"
        >
          {designTitle}
        </button>
      )}

      {/* Auto-save status */}
      <div className="flex items-center gap-1.5 text-[10px] mr-2">
        {isSaving ? (
          <span className="text-[#555] animate-pulse">Saving…</span>
        ) : lastSaved ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[#555]">Saved</span>
          </>
        ) : null}
      </div>

      {/* Export Button */}
      <button
        onClick={() => useStudioStore.getState().setRightPanel("export")}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E5FF] text-[#0A0A0A] text-sm font-black hover:bg-[#33eeff] transition-all"
      >
        <Download className="w-4 h-4" />
        Export
      </button>
    </div>
  );
}

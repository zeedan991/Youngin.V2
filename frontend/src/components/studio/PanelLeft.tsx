"use client";
import { useState, useRef } from "react";
import { useStudioStore } from "@/store/useStudioStore";
import { Search, X, Upload, Loader2, ImageIcon } from "lucide-react";

const COLORS = [
  "#FFFFFF","#000000","#4F46E5","#00E5FF","#F5C842","#9B5DE5",
  "#FF6B6B","#CCFF00","#4ECDC4","#E8D5B7","#2D6A4F","#1A1A1A",
  "#FF8C00","#87CEEB","#DDA0DD","#F0E68C","#7FFFD4","#DC143C",
  "#4169E1","#32CD32","#8B4513","#708090","#FF1493","#00CED1",
];

export function PanelLeft() {
  const { garmentColor, setGarmentColor, fabricCanvas, activeTool, setActiveTool } = useStudioStore();
  const [unsplashQuery, setUnsplashQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [drawColor, setDrawColor] = useState("#000000");
  const [drawSize, setDrawSize] = useState(4);
  const fileRef = useRef<HTMLInputElement>(null);

  const searchUnsplash = async () => {
    if (!unsplashQuery.trim()) return;
    setSearching(true);
    setResults([]);
    try {
      const res = await fetch(`/api/unsplash?q=${encodeURIComponent(unsplashQuery)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const addUnsplashToCanvas = async (url: string) => {
    if (!fabricCanvas) return;
    const { FabricImage } = await import("fabric");
    const img = await FabricImage.fromURL(url, { crossOrigin: "anonymous" });
    img.scaleToWidth(Math.min(fabricCanvas.getWidth() * 0.5, 300));
    img.set({ left: 50, top: 50 });
    fabricCanvas.add(img);
    fabricCanvas.setActiveObject(img);
    fabricCanvas.renderAll();
    setActiveTool("select");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvas) return;
    const { FabricImage } = await import("fabric");
    const url = URL.createObjectURL(file);
    const img = await FabricImage.fromURL(url);
    img.scaleToWidth(Math.min(fabricCanvas.getWidth() * 0.6, 350));
    img.set({ left: 60, top: 60 });
    fabricCanvas.add(img);
    fabricCanvas.setActiveObject(img);
    fabricCanvas.renderAll();
    setActiveTool("select");
  };

  const updateDrawBrush = (color: string, size: number) => {
    if (!fabricCanvas) return;
    // @ts-ignore
    if (fabricCanvas.freeDrawingBrush) {
      // @ts-ignore
      fabricCanvas.freeDrawingBrush.color = color;
      // @ts-ignore
      fabricCanvas.freeDrawingBrush.width = size;
    }
  };

  return (
    <div className="w-72 bg-[#111] border-r border-[#1E1E1E] flex flex-col h-full overflow-hidden">
      
      {/* Garment Color Section */}
      <div className="p-4 border-b border-[#1E1E1E]">
        <p className="text-[10px] text-[#555] uppercase tracking-[3px] mb-3 font-bold">Garment Color</p>
        <div className="grid grid-cols-6 gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setGarmentColor(c)}
              className="w-9 h-9 rounded-lg border-2 transition-all hover:scale-110"
              style={{
                backgroundColor: c,
                borderColor: garmentColor === c ? "#00E5FF" : "#2A2A2A",
                boxShadow: garmentColor === c ? `0 0 10px ${c}88` : "none",
              }}
            />
          ))}
        </div>
        {/* Custom color input */}
        <div className="flex items-center gap-2 mt-3">
          <div className="w-8 h-8 rounded-lg border border-[#2A2A2A] overflow-hidden shrink-0">
            <input
              type="color"
              value={garmentColor}
              onChange={(e) => setGarmentColor(e.target.value)}
              className="w-full h-full cursor-pointer border-none outline-none bg-transparent"
            />
          </div>
          <input
            type="text"
            value={garmentColor}
            onChange={(e) => setGarmentColor(e.target.value)}
            maxLength={7}
            className="flex-1 bg-[#1A1A1A] text-white font-mono text-xs px-2 py-1.5 rounded-lg border border-[#2A2A2A] outline-none focus:border-[#00E5FF]/40"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Drawing Tools (shown when draw mode active) */}
      {activeTool === "draw" && (
        <div className="p-4 border-b border-[#1E1E1E]">
          <p className="text-[10px] text-[#555] uppercase tracking-[3px] mb-3 font-bold">Brush Settings</p>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[#555] text-xs w-10">Color</span>
              <div className="w-8 h-8 rounded-lg border border-[#2A2A2A] overflow-hidden">
                <input
                  type="color"
                  value={drawColor}
                  onChange={(e) => { setDrawColor(e.target.value); updateDrawBrush(e.target.value, drawSize); }}
                  className="w-full h-full cursor-pointer"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#555] text-xs w-10">Size</span>
              <input
                type="range" min={1} max={50} value={drawSize}
                onChange={(e) => { setDrawSize(+e.target.value); updateDrawBrush(drawColor, +e.target.value); }}
                className="flex-1 accent-[#00E5FF]"
              />
              <span className="text-white text-xs w-6">{drawSize}</span>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload & Search */}
      <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto">
        <p className="text-[10px] text-[#555] uppercase tracking-[3px] font-bold">Add Image</p>

        {/* Upload button */}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-[#2A2A2A] text-[#555] hover:border-[#00E5FF]/40 hover:text-[#00E5FF] transition-all text-sm font-bold"
        >
          <Upload className="w-4 h-4" />
          Upload from Device
        </button>

        {/* Unsplash search */}
        <div className="flex gap-1.5">
          <input
            value={unsplashQuery}
            onChange={(e) => setUnsplashQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchUnsplash()}
            placeholder="Search Unsplash…"
            className="flex-1 bg-[#1A1A1A] text-white text-xs px-3 py-2 rounded-xl border border-[#2A2A2A] outline-none focus:border-[#00E5FF]/40 placeholder-[#444]"
          />
          <button
            onClick={searchUnsplash}
            disabled={searching}
            className="p-2 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] text-[#555] hover:text-[#00E5FF] hover:border-[#00E5FF]/40 transition-all"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </div>

        {/* Results grid */}
        {results.length > 0 && (
          <div className="grid grid-cols-2 gap-1.5">
            {results.map((photo) => (
              <button
                key={photo.id}
                onClick={() => addUnsplashToCanvas(photo.urls.regular)}
                className="aspect-square rounded-lg overflow-hidden border border-[#2A2A2A] hover:border-[#00E5FF]/50 transition-all group relative"
              >
                <img src={photo.urls.thumb} alt={photo.alt_description} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
              </button>
            ))}
          </div>
        )}

        {results.length === 0 && unsplashQuery && !searching && (
          <p className="text-center text-[#444] text-xs py-4">No results found</p>
        )}
      </div>
    </div>
  );
}


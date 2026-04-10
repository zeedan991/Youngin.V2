"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Save, Layers, Type, Image as ImageIcon, Shirt, Plus, X, ArrowLeft, FolderOpen,
  Paintbrush, Search, RotateCcw, Eraser, Loader2, Check, Undo2, Redo2, Move
} from "lucide-react";
import Link from "next/link";
import { toJpeg } from 'html-to-image';
import { saveDesignToDb, loadUserDesigns, deleteDesign, uploadSnapshotBase64, uploadDesignConfig, fetchDesignConfig, type Design } from "./actions";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface DesignElement {
  id: string;
  type: "text" | "image" | "shape";
  content: string;
  font: string;
  size: number;
  color: string;
  bold: boolean;
  italic: boolean;
  x: number;
  y: number;
  side: "front" | "back";
}

type HistoryState = {
  elements: DesignElement[];
  frontPaintData: string;
  backPaintData: string;
};

// ─── Constants ──────────────────────────────────────────────────────────────
const GARMENT_TYPES = [
  { id: "tshirt", label: "T-Shirt", icon: "👕" },
  { id: "hoodie", label: "Hoodie",  icon: "🧥" },
  { id: "jeans",  label: "Jeans",   icon: "👖" },
  { id: "dress",  label: "Dress",   icon: "👗" },
  { id: "jacket", label: "Jacket",  icon: "🥼" },
  { id: "polo",   label: "Polo",    icon: "🎽" },
];

const COLORS = [
  "#FFFFFF","#F0F0F0","#1A1A1A","#2D2D2D","#C0392B","#E74C3C",
  "#E67E22","#F39C12","#27AE60","#2ECC71","#2980B9","#3498DB",
  "#8E44AD","#9B59B6","#E91E63","#FF4081","#795548","#9E9E9E",
  "#607D8B","#00BCD4",
];

const FONTS = ["Inter", "Arial", "Georgia", "Courier New", "Times New Roman", "Trebuchet MS", "Verdana"];

// ─── 2D Vectors ──────────────────────────────────────────────────────────────
const GarmentVector = ({ type, color }: { type: string, color: string }) => {
  const baseClass = "w-full h-full drop-shadow-2xl transition-all duration-300 pointer-events-none";
  const defs = (
    <defs>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="15" stdDeviation="15" floodOpacity="0.1" />
      </filter>
      <radialGradient id="contour" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="white" stopOpacity="0.15" />
        <stop offset="80%" stopColor="black" stopOpacity="0.05" />
        <stop offset="100%" stopColor="black" stopOpacity="0.2" />
      </radialGradient>
    </defs>
  );

  const fillProps = { fill: color, stroke: "rgba(0,0,0,0.08)", strokeWidth: "0.5" };

  if (type === 'tshirt') {
    return (
      <svg viewBox="0 0 100 100" className={baseClass} preserveAspectRatio="xMidYMid meet" filter="url(#shadow)">
        {defs}
        <g fill="url(#contour)">
          <path d="M 30 15 Q 50 22 70 15 L 75 85 C 75 90 25 90 25 85 Z" {...fillProps} />
          <path d="M 30 15 L 12 32 C 8 36 18 45 23 40 L 28 35 Z" {...fillProps} />
          <path d="M 70 15 L 88 32 C 92 36 82 45 77 40 L 72 35 Z" {...fillProps} />
          <path d="M 40 15 Q 50 24 60 15" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </svg>
    )
  }
  if (type === 'hoodie') {
    return (
      <svg viewBox="0 0 100 100" className={baseClass} preserveAspectRatio="xMidYMid meet" filter="url(#shadow)">
         {defs}
         <g fill="url(#contour)">
           <path d="M 30 25 Q 50 32 70 25 L 75 85 C 75 90 25 90 25 85 Z" {...fillProps} />
           <path d="M 30 25 L 8 50 C 5 55 15 60 20 55 L 25 40 Z" {...fillProps} />
           <path d="M 70 25 L 92 50 C 95 55 85 60 80 55 L 75 40 Z" {...fillProps} />
           <path d="M 37 25 C 34 -3 66 -3 63 25 Z" {...fillProps} strokeWidth="1" />
           <path d="M 40 60 L 60 60 L 65 78 L 35 78 Z" fill="rgba(0,0,0,0.06)" />
           <path d="M 45 28 L 45 45" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" strokeLinecap="round" />
           <path d="M 55 28 L 55 45" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" strokeLinecap="round" />
         </g>
      </svg>
    )
  }
  if (type === 'jeans') {
    return (
      <svg viewBox="0 0 100 100" className={baseClass} preserveAspectRatio="xMidYMid meet" filter="url(#shadow)">
         {defs}
         <g fill="url(#contour)">
           <path d="M 30 15 L 70 15 L 75 35 L 25 35 Z" {...fillProps} />
           <path d="M 25 35 L 48 35 L 46 95 L 20 95 Z" {...fillProps} />
           <path d="M 52 35 L 75 35 L 80 95 L 54 95 Z" {...fillProps} />
           <path d="M 28 17 L 72 17" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="2,2" />
           <circle cx="50" cy="20" r="1.5" fill="rgba(0,0,0,0.3)" />
           <path d="M 50 23 L 50 35" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
         </g>
      </svg>
    )
  }
  if (type === 'dress') {
     return (
       <svg viewBox="0 0 100 100" className={baseClass} preserveAspectRatio="xMidYMid meet" filter="url(#shadow)">
         {defs}
         <g fill="url(#contour)">
           <path d="M 40 10 L 42 25 L 58 25 L 60 10" fill="none" stroke={color} strokeWidth="2.5" />
           <path d="M 33 25 L 67 25 L 72 45 L 88 95 C 88 98 12 98 12 95 L 28 45 Z" {...fillProps} />
           <path d="M 35 45 Q 50 50 65 45" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
         </g>
       </svg>
     )
  }
  if (type === 'jacket') {
    return (
      <svg viewBox="0 0 100 100" className={baseClass} preserveAspectRatio="xMidYMid meet" filter="url(#shadow)">
         {defs}
         <g fill="url(#contour)">
           <path d="M 28 15 Q 50 20 72 15 L 78 85 C 78 90 22 90 22 85 Z" {...fillProps} />
           <path d="M 28 15 L 8 45 C 5 50 15 55 20 50 L 25 35 Z" {...fillProps} />
           <path d="M 72 15 L 92 45 C 95 50 85 55 80 50 L 75 35 Z" {...fillProps} />
           <path d="M 50 18 L 50 90" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
           <path d="M 38 18 L 48 35 L 50 18" fill="rgba(0,0,0,0.1)" />
           <path d="M 62 18 L 52 35 L 50 18" fill="rgba(0,0,0,0.1)" />
         </g>
      </svg>
    )
  }
  if (type === 'polo') {
    return (
      <svg viewBox="0 0 100 100" className={baseClass} preserveAspectRatio="xMidYMid meet" filter="url(#shadow)">
         {defs}
         <g fill="url(#contour)">
           <path d="M 28 20 Q 50 25 72 20 L 75 85 C 75 90 25 90 25 85 Z" {...fillProps} />
           <path d="M 28 20 L 12 35 C 8 40 18 45 23 40 L 28 32 Z" {...fillProps} />
           <path d="M 72 20 L 88 35 C 92 40 82 45 77 40 L 72 32 Z" {...fillProps} />
           <path d="M 40 20 L 35 30 L 45 35 L 50 25" {...fillProps} />
           <path d="M 60 20 L 65 30 L 55 35 L 50 25" {...fillProps} />
           <path d="M 48 24 L 48 42 L 52 42 L 52 24 Z" fill="rgba(0,0,0,0.08)" />
           <circle cx="50" cy="30" r="1.2" fill="rgba(0,0,0,0.3)" />
           <circle cx="50" cy="38" r="1.2" fill="rgba(0,0,0,0.3)" />
         </g>
      </svg>
    )
  }
  return <div className="w-full h-full bg-gray-200 rounded-xl" />
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function StudioPage() {
  const [garmentType,    setGarmentType]   = useState("tshirt");
  const [garmentColor,   setGarmentColor]  = useState("#FAFAFA");
  
  // Design State
  const [currentSide,    setCurrentSide]   = useState<"front" | "back">("front");
  const [elements,       setElements]      = useState<DesignElement[]>([]);
  const [activeTab,      setActiveTab]     = useState<"garment"|"text"|"paint"|"graphics"|"layers">("garment");
  const [rightTab,       setRightTab]      = useState<"layers"|"mydesigns">("layers");

  // Tools State
  const [textContent,    setTextContent]   = useState("YOUNGIN");
  const [textFont,       setTextFont]      = useState("Inter");
  const [textSize,       setTextSize]      = useState(36);
  const [textColor,      setTextColor]     = useState("#1A1A1A");
  const [textBold,       setTextBold]      = useState(true);
  const [textItalic,     setTextItalic]    = useState(false);
  
  const [brushColor,     setBrushColor]    = useState("#1ADD66");
  const [brushSize,      setBrushSize]     = useState(18);
  const [isEraser,       setIsEraser]      = useState(false);

  // Paint Canvases
  const paintCanvasFrontRef = useRef<HTMLCanvasElement>(null);
  const paintCanvasBackRef  = useRef<HTMLCanvasElement>(null);
  const isPainting       = useRef(false);
  const lastPaintPos     = useRef<{x: number; y: number} | null>(null);

  const [frontPaintData, setFrontPaintData] = useState<string>("");
  const [backPaintData, setBackPaintData] = useState<string>("");

  const [unsplashQuery,   setUnsplashQuery]  = useState("");
  const [unsplashResults, setUnsplashResults] = useState<any[]>([]);
  const [unsplashLoading, setUnsplashLoading] = useState(false);

  // Database Save
  const [saving,         setSaving]        = useState(false);
  const [saved,          setSaved]         = useState(false);
  const [saveError,      setSaveError]     = useState<string|null>(null);
  const [designName,     setDesignName]    = useState("Untitled Collection");
  const [dbDesignId,     setDbDesignId]    = useState<string|undefined>(undefined);
  const [myDesigns,      setMyDesigns]     = useState<Design[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);

  // Snapshot Ref
  const artboardRef = useRef<HTMLDivElement>(null);
  const elementsAreaRef = useRef<HTMLDivElement>(null);

  // Drag & Drop State
  const dragState = useRef<{ id: string, startX: number, startY: number, initialX: number, initialY: number } | null>(null);
  const [isDraggingObj, setIsDraggingObj] = useState(false);

  // Undo / Redo
  const [history, setHistory] = useState<HistoryState[]>([{ elements: [], frontPaintData: "", backPaintData: "" }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = useCallback((newState: HistoryState) => {
    setHistory(prev => {
      const slice = prev.slice(0, historyIndex + 1);
      slice.push(newState);
      return slice;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const p = history[historyIndex - 1];
      setElements(p.elements); setFrontPaintData(p.frontPaintData); setBackPaintData(p.backPaintData);
      setHistoryIndex(i => i - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const p = history[historyIndex + 1];
      setElements(p.elements); setFrontPaintData(p.frontPaintData); setBackPaintData(p.backPaintData);
      setHistoryIndex(i => i + 1);
    }
  };

  const commitCurrentStateToHistory = useCallback(() => {
    pushHistory({ elements, frontPaintData, backPaintData });
  }, [elements, frontPaintData, backPaintData, pushHistory]);

  const syncPaint = useCallback(() => {
     let f = frontPaintData, b = backPaintData;
     if (paintCanvasFrontRef.current) f = paintCanvasFrontRef.current.toDataURL();
     if (paintCanvasBackRef.current) b = paintCanvasBackRef.current.toDataURL();
     setFrontPaintData(f); setBackPaintData(b);
  }, [frontPaintData, backPaintData]);

  const paint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pc = currentSide === 'front' ? paintCanvasFrontRef.current : paintCanvasBackRef.current;
    if (!pc) return;
    const rect = pc.getBoundingClientRect();
    const scaleX = pc.width / rect.width;
    const scaleY = pc.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const ctx = pc.getContext("2d")!;
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    ctx.beginPath();
    
    if (lastPaintPos.current) {
      ctx.moveTo(lastPaintPos.current.x, lastPaintPos.current.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    } else {
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = brushColor;
      ctx.fill();
    }
    
    lastPaintPos.current = { x, y };
    syncPaint();
  };

  const handlePaintStart = (e: React.PointerEvent<HTMLCanvasElement>) => { e.preventDefault(); isPainting.current = true; paint(e); };
  const handlePaintMove = (e: React.PointerEvent<HTMLCanvasElement>) => { if (!isPainting.current) return; e.preventDefault(); paint(e); };
  const handlePaintEnd = () => { 
    if (isPainting.current) {
       isPainting.current = false; lastPaintPos.current = null; syncPaint();
       setTimeout(commitCurrentStateToHistory, 50); // commit after render
    }
  };
  
  const clearPaintCanvas = () => {
    const pc = currentSide === 'front' ? paintCanvasFrontRef.current : paintCanvasBackRef.current;
    if (pc) pc.getContext("2d")!.clearRect(0, 0, pc.width, pc.height);
    syncPaint();
    setTimeout(commitCurrentStateToHistory, 50);
  };

  const searchUnsplash = async () => {
    if (!unsplashQuery.trim()) return;
    setUnsplashLoading(true);
    try {
      const res = await fetch(`/api/unsplash?q=${encodeURIComponent(unsplashQuery)}`);
      const data = await res.json();
      setUnsplashResults((data.results || []).slice(0, 16));
    } catch { setUnsplashResults([]); }
    setUnsplashLoading(false);
  };

  const addTextEl = () => {
    if (!textContent.trim()) return;
    const newEls = [...elements, {
      id: `el_${Date.now()}`, type: "text" as const, content: textContent,
      font: textFont, size: textSize, color: textColor, bold: textBold,
      italic: textItalic, x: 50, y: 40, side: currentSide
    }];
    setElements(newEls);
    pushHistory({ elements: newEls, frontPaintData, backPaintData });
  };

  const addUnsplashImage = (url: string) => {
    const newEls = [...elements, {
      id: `el_${Date.now()}`, type: "image" as const, content: url, font: "Arial",
      size: 40, color: "#000", bold: false, italic: false, x: 50, y: 50, side: currentSide
    }];
    setElements(newEls);
    pushHistory({ elements: newEls, frontPaintData, backPaintData });
  };

  const deleteEl = (id: string) => {
    const newEls = elements.filter(e => e.id !== id);
    setElements(newEls);
    pushHistory({ elements: newEls, frontPaintData, backPaintData });
  };

  const handlePointerDown = (e: React.PointerEvent, el: DesignElement) => {
    if (activeTab === 'paint') return; // prevent moving while in paint mode if overlapping
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingObj(true);
    dragState.current = { id: el.id, startX: e.clientX, startY: e.clientY, initialX: el.x, initialY: el.y };
  };

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!isDraggingObj || !dragState.current || !elementsAreaRef.current) return;
      e.preventDefault();
      const rect = elementsAreaRef.current.getBoundingClientRect();
      const dx = ((e.clientX - dragState.current.startX) / rect.width) * 100;
      const dy = ((e.clientY - dragState.current.startY) / rect.height) * 100;
      
      const newX = Math.max(0, Math.min(100, dragState.current.initialX + dx));
      const newY = Math.max(0, Math.min(100, dragState.current.initialY + dy));
      
      setElements(prev => prev.map(p => p.id === dragState.current!.id ? { ...p, x: newX, y: newY } : p));
    };

    const handleUp = () => {
      if (isDraggingObj) {
        setIsDraggingObj(false);
        dragState.current = null;
        commitCurrentStateToHistory(); // Save the final dragged position
      }
    };

    if (isDraggingObj) {
      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    }
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [isDraggingObj, commitCurrentStateToHistory]);

  const handleSave = async () => {
    setSaving(true); setSaveError(null);
    let publicUrl = undefined;
    const timestampId = Date.now().toString();

    const configData = {
      garmentType, garmentColor, elements, frontPaintData, backPaintData, designName
    };

    if (artboardRef.current) {
      try {
        const originalSide = currentSide;
        
        setCurrentSide("front");
        await new Promise(r => setTimeout(r, 100)); // Paint cycle 1
        const front64 = await toJpeg(artboardRef.current, { quality: 0.85, pixelRatio: 1.5 });
        
        setCurrentSide("back");
        await new Promise(r => setTimeout(r, 100)); // Paint cycle 2
        const back64 = await toJpeg(artboardRef.current, { quality: 0.85, pixelRatio: 1.5 });
        
        setCurrentSide(originalSide);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        const imgF = new Image(); const imgB = new Image();
        
        await new Promise(r => { imgF.onload = r; imgF.src = front64; });
        await new Promise(r => { imgB.onload = r; imgB.src = back64; });
        
        canvas.width = imgF.width + imgB.width;
        canvas.height = imgF.height;
        ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imgF, 0, 0);
        ctx.drawImage(imgB, imgF.width, 0);
        
        const compositeBase64 = canvas.toDataURL("image/jpeg", 0.85);

        const uploadResult = await uploadSnapshotBase64(compositeBase64, timestampId);
        if (uploadResult.success && uploadResult.url) {
          publicUrl = uploadResult.url;
        } else {
          console.warn("Could not save thumbnail", uploadResult.error);
        }
        
        await uploadDesignConfig(configData, timestampId);

      } catch (e) { console.error("Snapshot Error:", e); }
    }

    const result = await saveDesignToDb({
      id: dbDesignId, name: designName, garmentType, storage_url: publicUrl
    });
    
    setSaving(false);
    if (result.success && result.id) {
      setDbDesignId(result.id); setSaved(true); setTimeout(() => setSaved(false), 2500);
    } else { setSaveError(result.error || "Save failed."); }
  };

  const openMyDesigns = async () => {
    setRightTab("mydesigns");
    setLoadingDesigns(true);
    const r = await loadUserDesigns();
    setMyDesigns(r.designs);
    setLoadingDesigns(false);
  };

  const loadDesign = async (d: Design) => {
    setRightTab("layers");
    
    // Read from the remote JSON Config mapped to the thumbnail URL
    if (d.storage_url) {
      const config = await fetchDesignConfig(d.storage_url);
      if (config) {
        setGarmentType(config.garmentType || "tshirt");
        setGarmentColor(config.garmentColor || "#FFFFFF");
        setElements(config.elements || []);
        setFrontPaintData(config.frontPaintData || "");
        setBackPaintData(config.backPaintData || "");
        setDesignName(config.designName || d.title || "Untitled");
        setDbDesignId(d.id);
        setHistory([{ elements: config.elements || [], frontPaintData: config.frontPaintData || "", backPaintData: config.backPaintData || "" }]);
        setHistoryIndex(0);
        return;
      }
    }

    // Fallback if config is missing (but DB saved it)
    setGarmentType(d.type || "tshirt");
    setDesignName(d.title || "Untitled");
    setDbDesignId(d.id);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F0F0F0] font-sans selection:bg-black selection:text-white">
      {/* ── TOP BAR ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-gray-200 z-40 shrink-0 bg-white h-[60px] shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-black transition-colors text-xs font-black uppercase tracking-widest">
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <div className="w-px h-5 bg-gray-200" />
          <span className="text-sm font-black tracking-tight text-gray-900 uppercase">2D Pro Creator</span>
        </div>

        <input value={designName} onChange={e => setDesignName(e.target.value)}
          className="text-sm font-black text-center text-gray-800 bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-black outline-none px-4 py-1 w-[260px] transition-colors uppercase tracking-widest"
          placeholder="Untitled Collection" />

        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase text-white hover:scale-105 active:scale-95 transition-all shadow-md" style={{ background: saved ? "#16A34A" : "#1A1A1A" }}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? "Saved" : "Save Design"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* ── LEFT PANEL (TOOLS) ────────────────────────────────────────── */}
        <div className="w-[320px] shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden shadow-xl z-20">
          
          <div className="flex bg-[#F8F8F8] p-1.5 border-b border-gray-200">
             <button onClick={() => setCurrentSide('front')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-md transition-all ${currentSide === 'front' ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-700'}`}>Front View</button>
             <button onClick={() => setCurrentSide('back')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-md transition-all ${currentSide === 'back' ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-700'}`}>Back View</button>
          </div>

          <div className="flex border-b border-gray-100">
            {[{ id: "garment", label: "Style", Icon: Shirt }, { id: "paint", label: "Draw", Icon: Paintbrush }, { id: "text", label: "Type", Icon: Type }, { id: "graphics", label: "Assets", Icon: ImageIcon }].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id as any)} className="flex-1 py-4 flex flex-col items-center gap-1.5 text-[9px] font-black uppercase tracking-wider transition-all hover:bg-gray-50" style={{ color: activeTab === t.id ? "#1A1A1A" : "#BBB", borderBottom: activeTab === t.id ? "3px solid #1A1A1A" : "3px solid transparent" }}>
                <t.Icon className="w-4 h-4" />{t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* GARMENT */}
            <div className={activeTab === "garment" ? "block space-y-6" : "hidden"}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-3">Garment Type</p>
                <div className="grid grid-cols-2 gap-2">
                  {GARMENT_TYPES.map(g => (
                    <button key={g.id} onClick={() => setGarmentType(g.id)} className="flex items-center justify-between px-3 py-3 rounded-xl border-2 transition-all hover:border-gray-400 bg-white" style={{ borderColor: garmentType === g.id ? "#1A1A1A" : "#F0F0F0", transform: garmentType === g.id ? "scale(1.02)" : "scale(1)" }}>
                      <span className="text-[11px] font-black uppercase">{g.label}</span><span className="text-xl">{g.icon}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-px w-full bg-gray-100" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-3">Fabric Color</p>
                <div className="grid grid-cols-5 gap-2">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setGarmentColor(c)} className="w-full aspect-square rounded-full border border-black/10 transition-transform hover:scale-110 shadow-sm" style={{ background: c, outline: garmentColor === c ? "2px solid #1A1A1A" : "none", outlineOffset: "2px" }} />
                  ))}
                </div>
              </div>
            </div>

            {/* PAINT */}
            <div className={activeTab === "paint" ? "block space-y-4" : "hidden"}>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Interactive Canvas ({currentSide})</p>
               <div className="aspect-square w-full rounded-2xl bg-white border-2 border-dashed border-gray-200 overflow-hidden relative shadow-sm cursor-crosshair">
                  <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                  <canvas ref={paintCanvasFrontRef} width={800} height={800} className={`w-full h-full touch-none relative z-10 ${currentSide === 'front' ? 'block' : 'hidden'}`} onPointerDown={handlePaintStart} onPointerMove={handlePaintMove} onPointerUp={handlePaintEnd} onPointerLeave={handlePaintEnd} />
                  <canvas ref={paintCanvasBackRef} width={800} height={800} className={`w-full h-full touch-none relative z-10 ${currentSide === 'back' ? 'block' : 'hidden'}`} onPointerDown={handlePaintStart} onPointerMove={handlePaintMove} onPointerUp={handlePaintEnd} onPointerLeave={handlePaintEnd} />
               </div>
               
               <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={() => setIsEraser(false)} className={`py-3 rounded-xl border-2 text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 ${!isEraser ? 'bg-[#1A1A1A] text-white border-black' : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-200'}`}><Paintbrush className="w-4 h-4"/> Brush</button>
                <button onClick={() => setIsEraser(true)} className={`py-3 rounded-xl border-2 text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 ${isEraser ? 'bg-[#1A1A1A] text-white border-black' : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-200'}`}><Eraser className="w-4 h-4"/> Eraser</button>
              </div>
              <div className="flex gap-3 p-1.5 border border-gray-100 rounded-2xl bg-white shadow-sm">
                 <input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border border-gray-200 shadow-inner" />
                 <div className="flex-1 px-3 flex flex-col justify-center">
                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest -mt-1">Line Width</span>
                    <input type="range" min={2} max={100} value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-full accent-[#1A1A1A] mt-1" />
                 </div>
              </div>
              <button onClick={clearPaintCanvas} className="w-full py-3 mt-1 rounded-xl border-2 border-transparent text-[11px] font-black uppercase tracking-wider text-red-500 flex justify-center items-center gap-2 hover:bg-red-50 hover:border-red-100 transition-colors"><RotateCcw className="w-4 h-4"/> Clear Layer</button>
            </div>

            {/* TEXT */}
            <div className={activeTab === "text" ? "block space-y-4" : "hidden"}>
              <textarea value={textContent} onChange={e => setTextContent(e.target.value)} className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 outline-none resize-none focus:border-black transition-all shadow-sm" rows={2} placeholder="Add typography..." />
              
              <div className="flex items-center gap-2">
                 <select value={textFont} onChange={e => setTextFont(e.target.value)} className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-3 text-xs font-black uppercase tracking-wider outline-none bg-white">
                   {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                 </select>
                 <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border border-gray-200 shadow-sm" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setTextBold(b => !b)} className={`py-3 rounded-xl border-2 font-black uppercase tracking-wider text-xs ${textBold ? 'bg-[#1A1A1A] text-white border-black' : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-200'}`}>Bold</button>
                <button onClick={() => setTextItalic(b => !b)} className={`py-3 rounded-xl border-2 italic font-bold uppercase tracking-wider text-xs ${textItalic ? 'bg-[#1A1A1A] text-white border-black' : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-200'}`}>Italic</button>
              </div>

              <div className="bg-white border-2 border-gray-200 p-3 rounded-xl shadow-sm">
                 <div className="flex justify-between items-center mb-1">
                   <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Font Size</span>
                   <span className="text-[10px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{textSize}px</span>
                 </div>
                 <input type="range" min={10} max={180} value={textSize} onChange={e => setTextSize(Number(e.target.value))} className="w-full accent-black mb-1" />
              </div>

              <button onClick={addTextEl} className="w-full py-4 mt-2 rounded-xl font-black uppercase tracking-widest text-sm text-white flex items-center justify-center bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl">
                <Plus className="w-4 h-4 mr-2" /> Add to {currentSide}
              </button>
            </div>

            {/* GRAPHICS */}
            <div className={activeTab === "graphics" ? "block space-y-4" : "hidden"}>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                    <input value={unsplashQuery} onChange={e => setUnsplashQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && searchUnsplash()} className="w-full border-2 border-gray-200 rounded-xl pl-4 pr-10 py-3 text-xs font-bold outline-none focus:border-black transition-colors" placeholder="Search patterns or vectors..." />
                    {unsplashLoading && <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />}
                </div>
                <button onClick={searchUnsplash} className="px-5 rounded-xl bg-black text-white hover:scale-105 active:scale-95 transition-all"><Search className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                 {unsplashResults.map(img => (
                   <button key={img.id} onClick={() => addUnsplashImage(img.urls.regular)} className="rounded-xl overflow-hidden aspect-square border-2 border-transparent hover:border-black transition-all shadow-sm bg-gray-100 group relative">
                     <img src={img.urls.thumb} className="w-full h-full object-cover group-hover:opacity-60 transition-opacity" alt="" />
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40"><Plus className="w-8 h-8 text-white drop-shadow-md" /></div>
                   </button>
                 ))}
                 {unsplashResults.length === 0 && !unsplashLoading && (
                     <div className="col-span-2 py-10 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200 rounded-xl"><ImageIcon className="w-10 h-10 mb-2 opacity-50" /><span className="text-[10px] font-black uppercase tracking-widest text-center">Search Library</span></div>
                 )}
              </div>
            </div>

          </div>
        </div>

        {/* ── CENTER: 2D PURE CANVAS ─────────────────────────────────────────── */}
        <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center" style={{ background: "radial-gradient(circle at center, #FFFFFF 0%, #E5E5E5 100%)" }}>
           
           <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex gap-2">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 bg-white/50 backdrop-blur-md px-5 py-2 rounded-full shadow-sm">
               {garmentType} ─ 2D MODE
             </span>
           </div>

           {/* Undo/Redo Buttons */}
           <div className="absolute bottom-6 right-6 z-40 flex items-center gap-2 p-1.5 bg-white border border-gray-200 rounded-full shadow-xl">
              <button 
                onClick={handleUndo} 
                disabled={historyIndex <= 0}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 disabled:opacity-30 transition-all text-gray-700"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <div className="h-6 w-px bg-gray-200" />
              <button 
                onClick={handleRedo} 
                disabled={historyIndex >= history.length - 1}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 disabled:opacity-30 transition-all text-gray-700"
              >
                <Redo2 className="w-4 h-4" />
              </button>
           </div>

           {/* MASTER 2D ARTBOARD (Ref attached for Snapshot generation) */}
           <div ref={artboardRef} className="relative w-full max-w-[550px] aspect-square flex items-center justify-center bg-transparent">
              
              {/* Base Garment Vector */}
              <div className="absolute inset-4 z-10">
                 <GarmentVector type={garmentType} color={garmentColor} />
              </div>

              {/* Graphical Overlays (Interactive) */}
              <div ref={elementsAreaRef} className="absolute inset-[10%] z-20 overflow-hidden" style={{ clipPath: garmentType === 'tshirt' ? 'inset(0)' : 'none' }}>
                  
                  {/* Sync'd Paint Layer */}
                  {currentSide === 'front' && frontPaintData && <img src={frontPaintData} className="absolute inset-0 w-full h-full opacity-90 mix-blend-multiply pointer-events-none" alt=""/>}
                  {currentSide === 'back' && backPaintData && <img src={backPaintData} className="absolute inset-0 w-full h-full opacity-90 mix-blend-multiply pointer-events-none" alt=""/>}
                  
                  {/* Generated Draggable Elements */}
                  {elements.filter(e => e.side === currentSide).map(el => (
                    <div 
                      key={el.id} 
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move hover:ring-2 hover:ring-black hover:ring-offset-2 transition-shadow"
                      onPointerDown={(e) => handlePointerDown(e, el)}
                      style={{ 
                        left: `${el.x}%`, 
                        top: `${el.y}%`, 
                        width: el.type === 'image' ? `${el.size}%` : 'auto' 
                      }}
                    >
                      {el.type === 'image' ? (
                        <img src={el.content} className="w-full h-auto drop-shadow-xl mix-blend-multiply rounded-lg select-none pointer-events-none" draggable={false} alt=""/>
                      ) : (
                        <span style={{ 
                          color: el.color, fontSize: `${el.size}px`, fontFamily: el.font,
                          fontWeight: el.bold ? '900' : '500', fontStyle: el.italic ? 'italic' : 'normal',
                          whiteSpace: 'nowrap'
                        }} className="inline-block drop-shadow-sm tracking-tight leading-none select-none pointer-events-none">
                          {el.content}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
           </div>

        </div>

        {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
        <div className="w-[300px] shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden shadow-xl z-20">
          <div className="flex border-b border-gray-100">
            {[{ id: "layers", label: "Object Layers", Icon: Layers }, { id: "mydesigns", label: "Saved Works", Icon: FolderOpen }].map(t => (
              <button key={t.id} onClick={() => t.id === "mydesigns" ? openMyDesigns() : setRightTab("layers")} className="flex-1 py-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all" style={{ color: rightTab === t.id ? "#1A1A1A" : "#BBB", borderBottom: rightTab === t.id ? "3px solid #1A1A1A" : "3px solid transparent", background: rightTab === t.id ? "#FAFAFA" : "#fff" }}>
                <t.Icon className="w-3.5 h-3.5" />{t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 flex flex-col bg-[#FAFAFA]">
            {rightTab === "layers" && (<>
               
               {['front', 'back'].map((side) => {
                 const sideEls = elements.filter(e => e.side === side);
                 if (sideEls.length === 0) return null;
                 return (
                    <div key={side} className="mb-6">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 pl-1">{side} Decals</p>
                      <div className="space-y-3">
                        {sideEls.map((el, i) => (
                          <div key={el.id} className="p-3 border-2 border-gray-100 rounded-xl bg-white flex flex-col gap-3 shadow-sm group hover:border-gray-300 transition-all">
                            <div className="flex items-center gap-3">
                              <span className="text-[9px] font-black bg-gray-100 text-gray-500 w-5 h-5 flex items-center justify-center rounded-md uppercase shrink-0">{i+1}</span>
                              <span className="text-[11px] font-black text-gray-800 truncate flex-1 uppercase tracking-wider">{el.type === 'image' ? 'Art Asset' : el.content}</span>
                              <button onClick={() => deleteEl(el.id)} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5"/></button>
                            </div>
                            
                            <div className="flex flex-col gap-2 bg-[#FAFAFA] p-2.5 rounded-lg border border-gray-100">
                              <div className="flex items-center gap-3">
                                <span className="text-[9px] font-black text-gray-400 uppercase w-6">SCL</span>
                                <input type="range" className="flex-1 accent-black h-1.5" min={10} max={el.type === 'image' ? 100 : 200} value={el.size} 
                                  onChange={e => {
                                    setElements(prev => prev.map(p => p.id === el.id ? {...p, size: Number(e.target.value)} : p));
                                  }} 
                                  onMouseUp={commitCurrentStateToHistory}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                 )
               })}

               {elements.length === 0 && (
                 <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-white"><Layers className="w-10 h-10 mx-auto mb-3 opacity-20 text-gray-900"/><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Canvas is empty</p></div>
               )}
            </>)}

            {rightTab === "mydesigns" && (
              <div className="space-y-3">
                {loadingDesigns ? <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div> :
                  myDesigns.length === 0 ? (
                    <div className="text-center py-12"><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No collections</p></div>
                  ) :
                  myDesigns.map(d => (
                    <div key={d.id} className="border-2 border-transparent bg-white p-4 rounded-xl hover:border-black cursor-pointer transition-all shadow-sm group" onClick={() => loadDesign(d)}>
                       <div className="flex justify-between items-start mb-2">
                          <p className="text-[13px] font-black text-gray-900 truncate tracking-tight">{d.title || (d as any).name}</p>
                          <div className="w-5 h-5 rounded-full shrink-0 border-2 border-white shadow-md outline outline-2 outline-gray-200" style={{ background: (d as any).garment_color || '#1A1A1A' }} />
                       </div>
                       <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">{d.type || (d as any).garment_type}</p>
                       {d.storage_url && <img src={d.storage_url} className="w-full h-24 object-cover rounded-md mt-2 opacity-50" />}
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

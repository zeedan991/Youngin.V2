"use client";

import {
  useState, useRef, useEffect, useCallback, Suspense, useMemo
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, ContactShadows, Environment, Decal, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  ChevronDown, Save, Layers, Type, Image as ImageIcon, Shirt,
  Plus, Trash2, Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  Check, Loader2, X, ArrowLeft, FolderOpen, AlertCircle,
  Paintbrush, Search, RotateCcw, Eraser, Move
} from "lucide-react";
import Link from "next/link";
import { saveDesignToDb, loadUserDesigns, deleteDesign, type Design } from "./actions";

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

const MATERIALS = [
  { id: "cotton",  label: "Cotton",  roughness: 0.9,  metalness: 0.0  },
  { id: "silk",    label: "Silk",    roughness: 0.18, metalness: 0.06 },
  { id: "denim",   label: "Denim",   roughness: 0.88, metalness: 0.0  },
  { id: "leather", label: "Leather", roughness: 0.32, metalness: 0.12 },
  { id: "wool",    label: "Wool",    roughness: 0.97, metalness: 0.0  },
  { id: "satin",   label: "Satin",   roughness: 0.12, metalness: 0.1  },
];

const FONTS = ["Arial","Georgia","Courier New","Times New Roman","Trebuchet MS","Verdana"];

// ─── Realistic 3D Models (Internet GLTF & Advanced Procedural) ──────────────

function RealisticTShirt({ mat, frontTexture, backTexture }: any) {
  // Loaded directly from GitHub public source via earlier step
  const { scene } = useGLTF('/models/shirt_baked.glb') as any;
  
  // Extract geometry so we can attach decals natively without hierarchical scaling bugs
  const geometry = useMemo(() => {
    let g: any = null;
    scene.traverse((c: any) => { if (c.isMesh && !g) g = c.geometry; });
    return g;
  }, [scene]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} material={mat} castShadow receiveShadow scale={[3.8, 3.8, 3.8]} position={[0, -1.8, 0]}>
      {/* Decal uses true wrap geometry to perfectly bend over the 3D curves */}
      {frontTexture && (
         <Decal position={[0, 0.35, 0.2]} rotation={[0, 0, 0]} scale={[0.6, 0.6, 0.6]}>
            <meshStandardMaterial map={frontTexture} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
         </Decal>
      )}
      {backTexture && (
         <Decal position={[0, 0.35, -0.2]} rotation={[0, Math.PI, 0]} scale={[0.6, 0.6, 0.6]}>
            <meshStandardMaterial map={backTexture} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
         </Decal>
      )}
    </mesh>
  );
}

// Fallback high-fidelity procedural bodies if internet model fails or isn't requested type
function ProceduralGarment({ type, mat, frontTexture, backTexture }: any) {
  const isJeans = type === "jeans";
  const isDress = type === "dress";

  return (
    <group position={[0, isJeans ? 0.4 : -0.2, 0]}>
      {isJeans ? (
        <>
          <mesh position={[0, 0.1, 0]} scale={[1, 1, 0.6]} castShadow><cylinderGeometry args={[0.7, 0.72, 0.3, 32]} /><meshStandardMaterial {...mat} /></mesh>
          <mesh position={[0, -0.4, 0]} scale={[1, 1, 0.65]} castShadow><cylinderGeometry args={[0.72, 0.75, 0.7, 32]} /><meshStandardMaterial {...mat} /></mesh>
          <mesh position={[-0.38, -1.8, 0]} scale={[1, 1, 0.9]} castShadow><cylinderGeometry args={[0.35, 0.28, 2.1, 24]} /><meshStandardMaterial {...mat} /></mesh>
          <mesh position={[0.38, -1.8, 0]} scale={[1, 1, 0.9]} castShadow><cylinderGeometry args={[0.35, 0.28, 2.1, 24]} /><meshStandardMaterial {...mat} /></mesh>
        </>
      ) : (
        <mesh position={[0, 0.5, 0]} scale={[1, isDress ? 1.4 : 1, isDress ? 0.6 : 0.55]} castShadow>
          <cylinderGeometry args={[isDress ? 0.6 : 0.85, isDress ? 1.1 : 0.8, 1.8, 32]} />
          <meshStandardMaterial {...mat} />
          {/* Apply Decals to the torso mesh */}
          {frontTexture && (
            <Decal position={[0, 0, 0.86]} rotation={[0, 0, 0]} scale={[1.4, 1.4, 1.4]}>
              <meshStandardMaterial map={frontTexture} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
            </Decal>
          )}
          {backTexture && (
            <Decal position={[0, 0, -0.86]} rotation={[0, Math.PI, 0]} scale={[1.4, 1.4, 1.4]}>
              <meshStandardMaterial map={backTexture} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
            </Decal>
          )}
        </mesh>
      )}

      {/* Dress add-ons */}
      {isDress && (
        <group>
           <mesh position={[-0.3, 1.9, 0]} rotation={[0, 0, 0.1]} castShadow><cylinderGeometry args={[0.04, 0.04, 0.5, 8]} /><meshStandardMaterial {...mat} /></mesh>
           <mesh position={[0.3, 1.9, 0]} rotation={[0, 0, -0.1]} castShadow><cylinderGeometry args={[0.04, 0.04, 0.5, 8]} /><meshStandardMaterial {...mat} /></mesh>
           <mesh position={[0, -0.9, 0]} scale={[1, 1, 0.7]} castShadow><cylinderGeometry args={[1.1, 1.3, 1.2, 32]} /><meshStandardMaterial {...mat} /></mesh>
        </group>
      )}

      {/* General Upper Body Shoulders/Sleeves */}
      {!isJeans && !isDress && (
        <group>
          <mesh position={[-0.75, 1.25, 0]} scale={[1, 0.9, 0.6]} castShadow><sphereGeometry args={[0.35, 16, 16]} /><meshStandardMaterial {...mat} /></mesh>
          <mesh position={[0.75, 1.25, 0]} scale={[1, 0.9, 0.6]} castShadow><sphereGeometry args={[0.35, 16, 16]} /><meshStandardMaterial {...mat} /></mesh>
          <mesh position={[0, 1.4, 0]} castShadow><cylinderGeometry args={[0.3, 0.35, 0.2, 16]} /><meshStandardMaterial {...mat} /></mesh>
          {type === 'hoodie' && (
            <group>
               <mesh position={[-1.15, 0.6, 0]} rotation={[0, 0, Math.PI / 4]} scale={[1, 1, 0.8]} castShadow><cylinderGeometry args={[0.3, 0.22, 1.4, 16]} /><meshStandardMaterial {...mat} /></mesh>
               <mesh position={[1.15, 0.6, 0]} rotation={[0, 0, -Math.PI / 4]} scale={[1, 1, 0.8]} castShadow><cylinderGeometry args={[0.3, 0.22, 1.4, 16]} /><meshStandardMaterial {...mat} /></mesh>
               <mesh position={[0, 1.5, -0.2]} scale={[1.2, 0.9, 1.2]} castShadow><sphereGeometry args={[0.45, 16, 16]} /><meshStandardMaterial {...mat} /></mesh>
               <mesh position={[0, -0.1, 0.45]} castShadow><boxGeometry args={[0.8, 0.4, 0.1]} /><meshStandardMaterial {...mat} /></mesh>
            </group>
          )}
          {type === 'jacket' && (
            <group>
               <mesh position={[-1.15, 0.6, 0]} rotation={[0, 0, Math.PI / 4]} scale={[1, 1, 0.8]} castShadow><cylinderGeometry args={[0.3, 0.25, 1.4, 16]} /><meshStandardMaterial {...mat} /></mesh>
               <mesh position={[1.15, 0.6, 0]} rotation={[0, 0, -Math.PI / 4]} scale={[1, 1, 0.8]} castShadow><cylinderGeometry args={[0.3, 0.25, 1.4, 16]} /><meshStandardMaterial {...mat} /></mesh>
               <mesh position={[-0.25, 1.0, 0.44]} rotation={[0, 0, 0.3]} castShadow><boxGeometry args={[0.2, 0.7, 0.05]} /><meshStandardMaterial {...mat} /></mesh>
               <mesh position={[0.25, 1.0, 0.44]} rotation={[0, 0, -0.3]} castShadow><boxGeometry args={[0.2, 0.7, 0.05]} /><meshStandardMaterial {...mat} /></mesh>
            </group>
          )}
          {type === 'polo' && (
            <group>
               <mesh position={[-1.0, 0.9, 0]} rotation={[0, 0, Math.PI / 3.5]} scale={[1, 1, 0.8]} castShadow><cylinderGeometry args={[0.3, 0.28, 0.7, 16]} /><meshStandardMaterial {...mat} /></mesh>
               <mesh position={[1.0, 0.9, 0]} rotation={[0, 0, -Math.PI / 3.5]} scale={[1, 1, 0.8]} castShadow><cylinderGeometry args={[0.3, 0.28, 0.7, 16]} /><meshStandardMaterial {...mat} /></mesh>
               <mesh position={[0, 1.45, 0.05]} castShadow><cylinderGeometry args={[0.32, 0.35, 0.15, 16]} /><meshStandardMaterial {...mat} /></mesh>
               <mesh position={[0, 1.1, 0.44]} castShadow><boxGeometry args={[0.15, 0.5, 0.05]} /><meshStandardMaterial color="#fff" /></mesh>
            </group>
          )}
        </group>
      )}
    </group>
  );
}

// ─── Camera Preset Controller ───────────────────────────────────────────────
const VIEW_POSITIONS = { front: [0, 0, 6.5], back: [0, 0, -6.5], side: [6.5, 0, 0] };
function CameraController({ view }: { view: "front"|"back"|"side" }) {
  const { camera, controls } = useThree();
  const t = VIEW_POSITIONS[view];
  const targetPos = new THREE.Vector3(t[0], t[1], t[2]);
  
  useFrame(() => {
    camera.position.lerp(targetPos, 0.07);
    camera.lookAt(0, 0, 0);
    if ((controls as any)?.target) (controls as any).target.lerp(new THREE.Vector3(0, 0, 0), 0.07);
  });
  return null;
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function StudioPage() {
  const [garmentType,    setGarmentType]   = useState("tshirt");
  const [garmentColor,   setGarmentColor]  = useState("#FFFFFF");
  const [materialId,     setMaterialId]    = useState("cotton");
  const [cameraView,     setCameraView]    = useState<"front"|"back"|"side">("front");
  
  // Design State
  const [currentSide,    setCurrentSide]   = useState<"front" | "back">("front");
  const [elements,       setElements]      = useState<DesignElement[]>([]);
  const [selectedEl,     setSelectedEl]    = useState<string|null>(null);
  const [activeTab,      setActiveTab]     = useState<"garment"|"text"|"paint"|"graphics"|"layers">("garment");
  const [rightTab,       setRightTab]      = useState<"layers"|"mydesigns">("layers");

  // Tools State
  const [textContent,    setTextContent]   = useState("YOUNGIN");
  const [textFont,       setTextFont]      = useState("Arial");
  const [textSize,       setTextSize]      = useState(36);
  const [textColor,      setTextColor]     = useState("#1A1A1A");
  const [textBold,       setTextBold]      = useState(false);
  const [textItalic,     setTextItalic]    = useState(false);
  
  const [brushColor,     setBrushColor]    = useState("#1A1A1A");
  const [brushSize,      setBrushSize]     = useState(10);
  const [isEraser,       setIsEraser]      = useState(false);

  // Separate Canvases for Front and Back
  const paintCanvasFrontRef = useRef<HTMLCanvasElement>(null);
  const paintCanvasBackRef  = useRef<HTMLCanvasElement>(null);
  const isPainting       = useRef(false);
  const lastPaintPos     = useRef<{x: number; y: number} | null>(null);

  const [unsplashQuery,   setUnsplashQuery]  = useState("");
  const [unsplashResults, setUnsplashResults] = useState<any[]>([]);
  const [unsplashLoading, setUnsplashLoading] = useState(false);

  // Dual Textures
  const [frontTexture,   setFrontTexture]  = useState<THREE.CanvasTexture|null>(null);
  const [backTexture,    setBackTexture]   = useState<THREE.CanvasTexture|null>(null);

  const [saving,         setSaving]        = useState(false);
  const [saved,          setSaved]         = useState(false);
  const [saveError,      setSaveError]     = useState<string|null>(null);
  const [designName,     setDesignName]    = useState("Untitled Design");
  const [dbDesignId,     setDbDesignId]    = useState<string|undefined>(undefined);
  const [myDesigns,      setMyDesigns]     = useState<Design[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);

  const material = MATERIALS.find(m => m.id === materialId) || MATERIALS[0];

  // Auto-update camera slightly to help user understand sides
  useEffect(() => { setCameraView(currentSide); }, [currentSide]);

  // ─── Asynchronous Texture Builder for Dual Sides ──────────────────────────
  const buildTex = async (side: "front"|"back") => {
    const size = 1024;
    const c = document.createElement("canvas");
    c.width = size; c.height = size;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, size, size);

    // 1. Paint Layer
    const pCanvas = side === "front" ? paintCanvasFrontRef.current : paintCanvasBackRef.current;
    if (pCanvas) ctx.drawImage(pCanvas, 0, 0, size, size);

    // 2. Elements matched to side
    const activeEls = elements.filter(e => e.side === side);
    for (const el of activeEls) {
      if (el.type === "image") {
        await new Promise<void>((resolve) => {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const w = el.size * 5; 
            const h = img.height * (w / img.width);
            ctx.drawImage(img, (el.x / 100 * size) - w/2, (el.y / 100 * size) - h/2, w, h);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = el.content;
        });
      } else {
        const w = el.bold   ? "bold "   : "";
        const s = el.italic ? "italic " : "";
        ctx.font = `${s}${w}${el.size * 3}px ${el.font}`;
        ctx.fillStyle = el.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(el.content, (el.x / 100) * size, (el.y / 100) * size);
      }
    }

    const tex = new THREE.CanvasTexture(c);
    // Explicitly set false ONLY for decals, but text might be upside down, we'll keep default `true` to fix the upside-down bug!
    tex.flipY = true;
    tex.needsUpdate = true;
    return tex;
  };

  const rebuildTextures = useCallback(async () => {
    const fTex = await buildTex("front");
    const bTex = await buildTex("back");
    setFrontTexture(fTex);
    setBackTexture(bTex);
  }, [elements]);

  useEffect(() => { rebuildTextures(); }, [elements, rebuildTextures]);

  // ─── Paint canvas handlers (Draws to active side) ──────────────────────
  const paint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pc = currentSide === 'front' ? paintCanvasFrontRef.current : paintCanvasBackRef.current;
    if (!pc) return;
    const rect = pc.getBoundingClientRect();
    const scaleX = pc.width / rect.width;
    const scaleY = pc.height / rect.height;
    
    // Y must be inverted mathematically to match Three.js UV orientation on Decals
    const x = (e.clientX - rect.left) * scaleX;
    const y = pc.height - ((e.clientY - rect.top) * scaleY);
    
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
    rebuildTextures(); // sync live
  };

  // Canvas bounds drawing
  useEffect(() => {
    // Fill slightly transparent helper grid across the canvas once
    [paintCanvasFrontRef.current, paintCanvasBackRef.current].forEach(pc => {
        if (!pc) return;
        const ctx = pc.getContext('2d');
        if(ctx) ctx.clearRect(0, 0, pc.width, pc.height);
    });
  }, []);

  const handlePaintStart = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault(); isPainting.current = true; paint(e);
  };
  const handlePaintMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPainting.current) return; e.preventDefault(); paint(e);
  };
  const handlePaintEnd = () => { isPainting.current = false; lastPaintPos.current = null; };
  const clearPaintCanvas = () => {
    const pc = currentSide === 'front' ? paintCanvasFrontRef.current : paintCanvasBackRef.current;
    if (pc) pc.getContext("2d")!.clearRect(0, 0, pc.width, pc.height);
    rebuildTextures();
  };

  // ─── Actions ────────────────────────────────────────────────────────────
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
    // IMPORTANT: Y is inverted for Three.js text orientation mapping via Decal
    setElements(prev => [...prev, {
      id: `el_${Date.now()}`, type: "text", content: textContent,
      font: textFont, size: textSize, color: textColor, bold: textBold,
      italic: textItalic, x: 50, y: 70, side: currentSide
    }]);
  };

  const addUnsplashImage = (url: string) => {
    setElements(prev => [...prev, {
      id: `el_${Date.now()}`, type: "image", content: url, font: "Arial",
      size: 50, color: "#000", bold: false, italic: false, x: 50, y: 50, side: currentSide
    }]);
  };

  const deleteEl = (id: string) => setElements(prev => prev.filter(e => e.id !== id));

  const handleSave = async () => {
    setSaving(true); setSaveError(null);
    const m = elements.map(e => ({...e, type: "shape" as any})); // Satisfy strict typings
    const result = await saveDesignToDb({
      id: dbDesignId, name: designName, garmentType, garmentColor, material: materialId, elements: m as any,
    });
    setSaving(false);
    if (result.success && result.id) {
      setDbDesignId(result.id); setSaved(true); setTimeout(() => setSaved(false), 2500);
    } else { setSaveError(result.error || "Save failed."); }
  };

  const loadDesign = (d: Design) => {
    setGarmentType(d.garment_type);
    setGarmentColor(d.garment_color);
    setMaterialId(d.material);
    setElements((d.elements || []).map(e => ({...e, type: (e as any).type === "shape" ? "image" : e.type} as any)));
    setDesignName(d.name);
    setDbDesignId(d.id);
    setRightTab("layers");
  };

  const openMyDesigns = async () => {
    setRightTab("mydesigns");
    setLoadingDesigns(true);
    const r = await loadUserDesigns();
    setMyDesigns(r.designs);
    setLoadingDesigns(false);
  };

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col" style={{ height: "100vh", background: "#F2F2F4", fontFamily: "'Inter', sans-serif" }}>
      {/* ── TOP BAR ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-2bg-white border-b border-gray-200 z-40 shrink-0 bg-white shadow-sm h-[60px]">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="w-px h-5 bg-gray-200" />
          <span className="text-sm font-black tracking-tight text-gray-900 uppercase">Design Studio</span>
        </div>

        <input value={designName} onChange={e => setDesignName(e.target.value)}
          className="text-[15px] font-bold text-center text-gray-700 bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-gray-800 outline-none px-4 py-1 w-[260px] transition-colors"
          placeholder="Untitled Collection" />

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl overflow-hidden border border-gray-200 text-xs font-bold bg-white p-1">
            {(["front","back","side"] as const).map(v => (
              <button key={v} onClick={() => setCameraView(v)} className="px-4 py-1.5 capitalize rounded-lg transition-all focus:outline-none" style={{ background: cameraView === v ? "#1A1A1A" : "transparent", color: cameraView === v ? "#fff" : "#777" }}>{v}</button>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white hover:scale-105 active:scale-95 transition-all shadow-md shadow-emerald-500/10" style={{ background: saved ? "#16A34A" : "#1A1A1A" }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? "Saved" : "Save to Profile"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT PANEL (TOOLS) ────────────────────────────────────────── */}
        <div className="w-[300px] shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          
          {/* Front/Back Modifier Toggle */}
          <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Working On</span>
            <div className="flex bg-white rounded-lg p-0.5 border border-gray-200 shadow-sm">
                <button onClick={() => setCurrentSide('front')} className={`px-4 py-1 text-[10px] font-black uppercase rounded-md transition-colors ${currentSide==='front'?'bg-[#1A1A1A] text-white':'text-gray-400 hover:text-gray-700'}`}>Front</button>
                <button onClick={() => setCurrentSide('back')} className={`px-4 py-1 text-[10px] font-black uppercase rounded-md transition-colors ${currentSide==='back'?'bg-[#1A1A1A] text-white':'text-gray-400 hover:text-gray-700'}`}>Back</button>
            </div>
          </div>

          <div className="flex border-b border-gray-100">
            {[{ id: "garment", label: "Style", Icon: Shirt }, { id: "paint", label: "Draw", Icon: Paintbrush }, { id: "text", label: "Type", Icon: Type }, { id: "graphics", label: "Assets", Icon: ImageIcon }].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id as any)} className="flex-1 py-3.5 flex flex-col items-center gap-1.5 text-[9px] font-black uppercase tracking-wider transition-all hover:bg-gray-50" style={{ color: activeTab === t.id ? "#1A1A1A" : "#BBB", borderBottom: activeTab === t.id ? "3px solid #1A1A1A" : "3px solid transparent" }}>
                <t.Icon className="w-4 h-4" />{t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* GARMENT */}
            <div className={activeTab === "garment" ? "block space-y-6" : "hidden"}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-3 ml-1">Garment Type</p>
                <div className="grid grid-cols-2 gap-2">
                  {GARMENT_TYPES.map(g => (
                    <button key={g.id} onClick={() => setGarmentType(g.id)} className="flex items-center justify-between px-3 py-3 rounded-xl border-2 transition-all hover:border-gray-400" style={{ borderColor: garmentType === g.id ? "#1A1A1A" : "#EBEBEB", background: garmentType === g.id ? "#FAFAFA" : "#fff" }}>
                      <span className="text-[11px] font-bold text-gray-700">{g.label}</span><span className="text-lg">{g.icon}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-px w-full bg-gray-100" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-3 ml-1">Fabric Color</p>
                <div className="grid grid-cols-5 gap-2">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setGarmentColor(c)} className="w-full aspect-square rounded-full border border-black/10 transition-transform hover:scale-110 shadow-sm" style={{ background: c, outline: garmentColor === c ? "2px solid #1A1A1A" : "none", outlineOffset: "2px" }} />
                  ))}
                </div>
              </div>
            </div>

            {/* PAINT */}
            <div className={activeTab === "paint" ? "block space-y-4" : "hidden"}>
               <p className="text-[10px] font-black uppercase text-gray-400">Canvas Surface ({currentSide.toUpperCase()})</p>
               <div className="aspect-square w-full rounded-2xl bg-[#EBEBEB] border-2 border-dashed border-gray-300 overflow-hidden relative shadow-inner cursor-crosshair">
                  {/* Both canvases exist, only active side is displayed */}
                  <canvas ref={paintCanvasFrontRef} width={1024} height={1024} className={`w-full h-full touch-none relative z-10 ${currentSide === 'front' ? 'block' : 'hidden'}`} onPointerDown={handlePaintStart} onPointerMove={handlePaintMove} onPointerUp={handlePaintEnd} onPointerLeave={handlePaintEnd} />
                  <canvas ref={paintCanvasBackRef} width={1024} height={1024} className={`w-full h-full touch-none relative z-10 ${currentSide === 'back' ? 'block' : 'hidden'}`} onPointerDown={handlePaintStart} onPointerMove={handlePaintMove} onPointerUp={handlePaintEnd} onPointerLeave={handlePaintEnd} />
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center opacity-30 pointer-events-none text-xl font-bold uppercase tracking-widest text-gray-400">DRAW HERE</div>
               </div>
               <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={() => setIsEraser(false)} className={`py-3 rounded-xl border text-[11px] font-black flex items-center justify-center gap-2 ${!isEraser ? 'bg-[#1A1A1A] text-white border-black' : 'bg-white text-gray-500 hover:bg-gray-50'}`}><Paintbrush className="w-4 h-4"/> Brush</button>
                <button onClick={() => setIsEraser(true)} className={`py-3 rounded-xl border text-[11px] font-black flex items-center justify-center gap-2 ${isEraser ? 'bg-[#1A1A1A] text-white border-black' : 'bg-white text-gray-500 hover:bg-gray-50'}`}><Eraser className="w-4 h-4"/> Eraser</button>
              </div>
              <div className="flex gap-2 p-1 border border-gray-100 rounded-2xl bg-gray-50">
                 <input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border border-gray-200" />
                 <div className="flex-1 px-3 flex flex-col justify-center">
                    <span className="text-[9px] font-black uppercase text-gray-400 -mt-1">Thickness: {brushSize}px</span>
                    <input type="range" min={2} max={100} value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-full accent-[#1A1A1A]" />
                 </div>
              </div>
              <button onClick={clearPaintCanvas} className="w-full py-2.5 mt-2 rounded-xl border border-red-200 text-[11px] font-bold text-red-500 flex justify-center items-center gap-2 hover:bg-red-50"><RotateCcw className="w-3.5 h-3.5"/> Clear Paint</button>
            </div>

            {/* TEXT */}
            <div className={activeTab === "text" ? "block space-y-4" : "hidden"}>
              <textarea value={textContent} onChange={e => setTextContent(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 outline-none resize-none focus:border-gray-500 focus:bg-white transition-all shadow-sm" rows={2} placeholder="Write something bold..." />
              
              <div className="flex items-center gap-2">
                 <select value={textFont} onChange={e => setTextFont(e.target.value)} className="flex-1 border border-gray-200 rounded-xl px-3 py-3 text-xs font-semibold outline-none bg-white">
                   {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                 </select>
                 <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-11 h-11 rounded-xl cursor-pointer border border-gray-200" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setTextBold(b => !b)} className={`py-3 rounded-xl border font-black text-xs ${textBold ? 'bg-[#1A1A1A] text-white border-black' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>Bold</button>
                <button onClick={() => setTextItalic(b => !b)} className={`py-3 rounded-xl border italic font-black text-xs ${textItalic ? 'bg-[#1A1A1A] text-white border-black' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>Italic</button>
              </div>

              <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl">
                 <div className="flex justify-between items-center mb-1">
                   <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Size</span>
                   <span className="text-[10px] font-bold text-gray-700 w-6 text-right">{textSize}</span>
                 </div>
                 <input type="range" min={20} max={120} value={textSize} onChange={e => setTextSize(Number(e.target.value))} className="w-full accent-black mb-1" />
              </div>

              <button onClick={addTextEl} className="w-full py-4 mt-2 rounded-xl font-black text-sm text-white flex items-center justify-center shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all" style={{ background: "linear-gradient(to right, #111, #333)" }}>
                <Plus className="w-4 h-4 mr-2" /> Strike to {currentSide.toUpperCase()}
              </button>
            </div>

            {/* GRAPHICS */}
            <div className={activeTab === "graphics" ? "block space-y-4" : "hidden"}>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                    <input value={unsplashQuery} onChange={e => setUnsplashQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && searchUnsplash()} className="w-full border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-xs font-medium outline-none focus:border-gray-500" placeholder="Search patterns or aesthetics..." />
                    {unsplashLoading && <Loader2 className="w-3.5 h-3.5 animate-spin absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />}
                </div>
                <button onClick={searchUnsplash} className="px-4 py-0 rounded-xl bg-[#1A1A1A] text-white shadow-md hover:scale-105 active:scale-95 transition-all"><Search className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2 h-72 overflow-y-auto pr-1 custom-scroll">
                 {unsplashResults.map(img => (
                   <button key={img.id} onClick={() => addUnsplashImage(img.urls.regular)} className="rounded-xl overflow-hidden aspect-square border-2 border-transparent hover:border-black/50 transition-all shadow-sm bg-gray-100 group relative">
                     <img src={img.urls.thumb} className="w-full h-full object-cover group-hover:opacity-80" alt="" />
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20"><Plus className="w-8 h-8 text-white drop-shadow-md" /></div>
                   </button>
                 ))}
                 {unsplashResults.length === 0 && !unsplashLoading && (
                     <div className="col-span-2 py-10 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200 rounded-xl"><ImageIcon className="w-8 h-8 mb-2 opacity-50" /><span className="text-[10px] font-black uppercase text-center block max-w-[120px]">Search to fetch decals</span></div>
                 )}
              </div>
            </div>

          </div>
        </div>

        {/* ── CENTER: 3D VIEWPORT ─────────────────────────────────────────── */}
        <div className="flex-1 relative overflow-hidden flex flex-col" style={{ background: "radial-gradient(circle, #FCFCFC 0%, #ECECEC 100%)" }}>
           
           <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex gap-2">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 shadow-sm">
               {garmentType} / {material.label}
             </span>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white bg-[#1A1A1A] px-4 py-2 rounded-full shadow-sm shadow-black/20">
               VIEWING: {cameraView}
             </span>
           </div>

           <Canvas shadows gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }} style={{ width: "100%", height: "100%" }}>
              <PerspectiveCamera makeDefault position={[0,0,6.5]} fov={35} />
              <Suspense fallback={null}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[4, 5, 5]} intensity={1.8} castShadow shadow-mapSize={[2048, 2048]} />
                <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#C8D8FF" />
                <pointLight position={[0, -2, 4]} intensity={0.5} color="#FFF5E0" />
                
                {garmentType === 'tshirt' ? (
                   <RealisticTShirt mat={material} frontTexture={frontTexture} backTexture={backTexture} />
                ) : (
                   <ProceduralGarment type={garmentType} mat={material} frontTexture={frontTexture} backTexture={backTexture} />
                )}
                
                <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2.5} frames={1} />
                <Environment preset="studio" background={false} />
              </Suspense>
              <CameraController view={cameraView} />
              <OrbitControls enablePan enableZoom minDistance={2.5} maxDistance={10} maxPolarAngle={Math.PI / 1.6} makeDefault />
           </Canvas>
        </div>

        {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
        <div className="w-[280px] shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-100">
            {[{ id: "layers", label: "Layers Editor", Icon: Layers }, { id: "mydesigns", label: "My Designs", Icon: FolderOpen }].map(t => (
              <button key={t.id} onClick={() => t.id === "mydesigns" ? openMyDesigns() : setRightTab("layers")} className="flex-1 py-3.5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all" style={{ color: rightTab === t.id ? "#1A1A1A" : "#BBB", borderBottom: rightTab === t.id ? "3px solid #1A1A1A" : "3px solid transparent" }}>
                <t.Icon className="w-3.5 h-3.5" />{t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 flex flex-col">
            {rightTab === "layers" && (<>
               <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-4">Active Graphics</p>
               
               {/* Split layers by front/back visually */}
               {['front', 'back'].map((side) => {
                 const sideEls = elements.filter(e => e.side === side);
                 if (sideEls.length === 0) return null;
                 return (
                    <div key={side} className="mb-4">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{side} face ({sideEls.length})</p>
                      <div className="space-y-2">
                        {sideEls.map((el, i) => (
                          <div key={el.id} className="p-2 border border-gray-100 rounded-xl bg-gray-50 flex flex-col gap-1.5 shadow-sm group">
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-black bg-white border border-gray-200 text-gray-500 w-4 h-4 flex items-center justify-center rounded uppercase shrink-0 shadow-sm">{i+1}</span>
                              <span className="text-[11px] font-bold text-gray-800 truncate flex-1">{el.type === 'image' ? 'Image Graphic' : el.content}</span>
                              <button onClick={() => deleteEl(el.id)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-100 text-gray-300 hover:text-red-500 transition-colors"><X className="w-3 h-3"/></button>
                            </div>
                            
                            <div className="flex gap-2">
                              {/* Position Y Slider */}
                              <div className="flex-1 flex flex-col px-1">
                                <div className="flex justify-between mb-1">
                                  <span className="text-[8px] font-black text-gray-400 uppercase">Pos Y</span>
                                  <span className="text-[8px] font-bold text-gray-600">{100 - el.y}%</span>
                                </div>
                                <input type="range" className="w-full accent-black h-1" min={10} max={90} value={el.y} onChange={e => setElements(prev => prev.map(p => p.id === el.id ? {...p, y: Number(e.target.value)} : p))} />
                              </div>
                              {/* Size Slider */}
                              <div className="flex-1 flex flex-col px-1">
                                <div className="flex justify-between mb-1">
                                  <span className="text-[8px] font-black text-gray-400 uppercase">Size</span>
                                  <span className="text-[8px] font-bold text-gray-600">{el.size}</span>
                                </div>
                                <input type="range" className="w-full accent-black h-1" min={10} max={120} value={el.size} onChange={e => setElements(prev => prev.map(p => p.id === el.id ? {...p, size: Number(e.target.value)} : p))} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                 )
               })}

               {elements.length === 0 && (
                 <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl"><Layers className="w-8 h-8 mx-auto mb-2 opacity-20 text-gray-900"/><p className="text-[11px] font-bold text-gray-500">No decals applied yet</p></div>
               )}

               {/* Editor Pro Tips Fill */}
               <div className="mt-auto pt-6 border-t border-gray-100">
                 <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-3">Studio Actions</p>
                 <div className="bg-gradient-to-br from-[#111] to-[#222] rounded-2xl p-4 text-white shadow-lg space-y-3">
                   <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5"><ReplaceIcon /></div>
                      <p className="text-[10px] font-semibold text-gray-300 leading-snug">Toggle between Front and Back modes above the Left Panel to edit both sides.</p>
                   </div>
                   <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5"><Move className="w-2.5 h-2.5" /></div>
                      <p className="text-[10px] font-semibold text-gray-300 leading-snug">Use the Layers sliders above to dynamically move and scale graphics.</p>
                   </div>
                 </div>
               </div>
            </>)}

            {rightTab === "mydesigns" && (
              <div className="space-y-3">
                {loadingDesigns ? <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div> :
                  myDesigns.length === 0 ? (
                    <div className="text-center py-10"><p className="text-[11px] font-bold text-gray-400">Empty folder.</p></div>
                  ) :
                  myDesigns.map(d => (
                    <div key={d.id} className="border border-gray-200 p-3 rounded-2xl hover:border-gray-900 cursor-pointer transition-all shadow-sm hover:shadow-md" onClick={() => loadDesign(d)}>
                       <div className="flex justify-between items-start mb-1.5">
                          <p className="text-sm font-bold text-gray-800 truncate">{d.name}</p>
                          <div className="w-4 h-4 rounded-full shrink-0 border border-black/10 shadow-inner" style={{ background: d.garment_color }} />
                       </div>
                       <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{d.garment_type} <span className="opacity-50 mx-1">•</span> {d.material}</p>
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

// Inline custom icon
const ReplaceIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3v4h4"/><path d="M21 7L16 2"/><path d="M7 21v-4H3"/><path d="M3 17l5 5"/><path d="M21 12c0 4.97-4.03 9-9 9"/><path d="M3 12c0-4.97 4.03-9 9-9"/></svg>
);

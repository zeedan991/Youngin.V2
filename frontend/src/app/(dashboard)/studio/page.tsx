"use client";

import {
  useState, useRef, useEffect, useCallback, Suspense
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";
import {
  ChevronDown, Save, Layers, Type, Image as ImageIcon, Shirt,
  Plus, Trash2, Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  Check, Loader2, X, ArrowLeft, FolderOpen, AlertCircle,
  Paintbrush, Search, RotateCcw, Eraser
} from "lucide-react";
import Link from "next/link";
import { saveDesignToDb, loadUserDesigns, deleteDesign, type Design } from "./actions";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface DesignElement {
  id: string;
  type: "text" | "image" | "shape";
  content: string; // text content or image URL
  font: string;
  size: number;
  color: string;
  bold: boolean;
  italic: boolean;
  x: number;
  y: number;
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

// ─── Improved Human-Scale 3D Garment Models ─────────────────────────────────

const DecalPlane = ({ texture, isJeans = false }: { texture: THREE.Texture | null, isJeans?: boolean }) => {
  if (!texture) return null;
  // Jeans place decal on left leg, otherwise center chest
  const pos: [number, number, number] = isJeans ? [-0.38, -1.2, 0.36] : [0, 0.45, 0.455];
  const scl: [number, number, number] = isJeans ? [0.6, 0.6, 1] : [1.1, 1.1, 1];
  
  return (
    <mesh position={pos} scale={scl}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial map={texture} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
    </mesh>
  );
};

function GarmentMesh({ type, color, roughness, metalness, texture }: any) {
  const threeColor = new THREE.Color(color);
  const mat = { color: threeColor, roughness, metalness };
  const isDress = type === "dress";
  const isJeans = type === "jeans";

  if (isJeans) {
    return (
      <group position={[0, 0.4, 0]}>
        {/* Waist & Hips */}
        <mesh position={[0, 0.1, 0]} scale={[1, 1, 0.6]} castShadow><cylinderGeometry args={[0.7, 0.72, 0.3, 32]} /><meshStandardMaterial {...mat} /></mesh>
        <mesh position={[0, -0.4, 0]} scale={[1, 1, 0.65]} castShadow><cylinderGeometry args={[0.72, 0.75, 0.7, 32]} /><meshStandardMaterial {...mat} /></mesh>
        {/* Legs */}
        <mesh position={[-0.38, -1.8, 0]} scale={[1, 1, 0.9]} castShadow><cylinderGeometry args={[0.35, 0.28, 2.1, 24]} /><meshStandardMaterial {...mat} /></mesh>
        <mesh position={[0.38, -1.8, 0]} scale={[1, 1, 0.9]} castShadow><cylinderGeometry args={[0.35, 0.28, 2.1, 24]} /><meshStandardMaterial {...mat} /></mesh>
        <DecalPlane texture={texture} isJeans={true} />
      </group>
    );
  }

  return (
    <group position={[0, -0.2, 0]}>
      {/* Torso */}
      <mesh position={[0, 0.5, 0]} scale={[1, isDress ? 1.4 : 1, isDress ? 0.6 : 0.55]} castShadow>
        <cylinderGeometry args={[isDress ? 0.6 : 0.85, isDress ? 1.1 : 0.8, 1.8, 32]} />
        <meshStandardMaterial {...mat} />
      </mesh>

      {/* Front Decal Graphic */}
      <DecalPlane texture={texture} />

      {!isDress && (
        <group>
          {/* Shoulders */}
          <mesh position={[-0.75, 1.25, 0]} scale={[1, 0.9, 0.6]} castShadow><sphereGeometry args={[0.35, 16, 16]} /><meshStandardMaterial {...mat} /></mesh>
          <mesh position={[0.75, 1.25, 0]} scale={[1, 0.9, 0.6]} castShadow><sphereGeometry args={[0.35, 16, 16]} /><meshStandardMaterial {...mat} /></mesh>
          {/* Neck */}
          <mesh position={[0, 1.4, 0]} castShadow><cylinderGeometry args={[0.3, 0.35, 0.2, 16]} /><meshStandardMaterial {...mat} /></mesh>
        </group>
      )}

      {/* Dress Differences */}
      {isDress && (
        <group>
           <mesh position={[-0.3, 1.9, 0]} rotation={[0, 0, 0.1]} castShadow><cylinderGeometry args={[0.04, 0.04, 0.5, 8]} /><meshStandardMaterial {...mat} /></mesh>
           <mesh position={[0.3, 1.9, 0]} rotation={[0, 0, -0.1]} castShadow><cylinderGeometry args={[0.04, 0.04, 0.5, 8]} /><meshStandardMaterial {...mat} /></mesh>
           <mesh position={[0, -0.9, 0]} scale={[1, 1, 0.7]} castShadow><cylinderGeometry args={[1.1, 1.3, 1.2, 32]} /><meshStandardMaterial {...mat} /></mesh>
        </group>
      )}

      {type === 'tshirt' && (
         <group>
           <mesh position={[-1.0, 0.9, 0]} rotation={[0, 0, Math.PI / 3.5]} scale={[1, 1, 0.8]} castShadow><cylinderGeometry args={[0.3, 0.28, 0.7, 16]} /><meshStandardMaterial {...mat} /></mesh>
           <mesh position={[1.0, 0.9, 0]} rotation={[0, 0, -Math.PI / 3.5]} scale={[1, 1, 0.8]} castShadow><cylinderGeometry args={[0.3, 0.28, 0.7, 16]} /><meshStandardMaterial {...mat} /></mesh>
         </group>
      )}

      {type === 'hoodie' && (
         <group>
           <mesh position={[-1.15, 0.6, 0]} rotation={[0, 0, Math.PI / 4]} scale={[1, 1, 0.8]} castShadow><cylinderGeometry args={[0.3, 0.22, 1.4, 16]} /><meshStandardMaterial {...mat} /></mesh>
           <mesh position={[1.15, 0.6, 0]} rotation={[0, 0, -Math.PI / 4]} scale={[1, 1, 0.8]} castShadow><cylinderGeometry args={[0.3, 0.22, 1.4, 16]} /><meshStandardMaterial {...mat} /></mesh>
           <mesh position={[0, 1.5, -0.2]} scale={[1.2, 0.9, 1.2]} castShadow><sphereGeometry args={[0.45, 16, 16]} /><meshStandardMaterial {...mat} /></mesh> {/* Hood */}
           <mesh position={[0, -0.1, 0.45]} castShadow><boxGeometry args={[0.8, 0.4, 0.1]} /><meshStandardMaterial {...mat} /></mesh> {/* Pocket */}
         </group>
      )}

      {type === 'jacket' && (
         <group>
           <mesh position={[-1.15, 0.6, 0]} rotation={[0, 0, Math.PI / 4]} scale={[1, 1, 0.8]} castShadow><cylinderGeometry args={[0.3, 0.25, 1.4, 16]} /><meshStandardMaterial {...mat} /></mesh>
           <mesh position={[1.15, 0.6, 0]} rotation={[0, 0, -Math.PI / 4]} scale={[1, 1, 0.8]} castShadow><cylinderGeometry args={[0.3, 0.25, 1.4, 16]} /><meshStandardMaterial {...mat} /></mesh>
           <mesh position={[-0.25, 1.0, 0.44]} rotation={[0, 0, 0.3]} castShadow><boxGeometry args={[0.2, 0.7, 0.05]} /><meshStandardMaterial {...mat} /></mesh> {/* Lapels */}
           <mesh position={[0.25, 1.0, 0.44]} rotation={[0, 0, -0.3]} castShadow><boxGeometry args={[0.2, 0.7, 0.05]} /><meshStandardMaterial {...mat} /></mesh>
         </group>
      )}

      {type === 'polo' && (
         <group>
           <mesh position={[-1.0, 0.9, 0]} rotation={[0, 0, Math.PI / 3.5]} scale={[1, 1, 0.8]} castShadow><cylinderGeometry args={[0.3, 0.28, 0.7, 16]} /><meshStandardMaterial {...mat} /></mesh>
           <mesh position={[1.0, 0.9, 0]} rotation={[0, 0, -Math.PI / 3.5]} scale={[1, 1, 0.8]} castShadow><cylinderGeometry args={[0.3, 0.28, 0.7, 16]} /><meshStandardMaterial {...mat} /></mesh>
           <mesh position={[0, 1.45, 0.05]} castShadow><cylinderGeometry args={[0.32, 0.35, 0.15, 16]} /><meshStandardMaterial {...mat} /></mesh> {/* Collar */}
           <mesh position={[0, 1.1, 0.44]} castShadow><boxGeometry args={[0.15, 0.5, 0.05]} /><meshStandardMaterial color="#fff" /></mesh> {/* Placket */}
         </group>
      )}
    </group>
  );
}

// ─── Camera Preset Controller ───────────────────────────────────────────────
const VIEW_POSITIONS = {
  front: new THREE.Vector3(0, 0, 6.0),
  back:  new THREE.Vector3(0, 0, -6.0),
  side:  new THREE.Vector3(6.0, 0, 0),
};
function CameraController({ view }: { view: "front"|"back"|"side" }) {
  const { camera, controls } = useThree();
  const target = VIEW_POSITIONS[view];
  useFrame(() => {
    camera.position.lerp(target, 0.07);
    camera.lookAt(0, 0, 0);
    // Reset controls target so orbiting orbits naturally from preset
    if ((controls as any)?.target) {
      (controls as any).target.lerp(new THREE.Vector3(0, 0, 0), 0.07);
    }
  });
  return null;
}

// ─── 3D Scene Wrapper ───────────────────────────────────────────────────────
function GarmentScene({ type, color, roughness, metalness, texture }: any) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-4, 3, -3]} intensity={0.6} color="#C8D8FF" />
      <pointLight position={[0, -3, 4]} intensity={0.4} color="#FFF5E0" />
      <GarmentMesh type={type} color={color} roughness={roughness} metalness={metalness} texture={texture} />
      <ContactShadows position={[0, -2.5, 0]} opacity={0.3} scale={8} blur={3} />
      <mesh position={[0, -2.52, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#F5F5F5" roughness={1} />
      </mesh>
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function StudioPage() {
  const [garmentType,    setGarmentType]   = useState("tshirt");
  const [garmentColor,   setGarmentColor]  = useState("#FFFFFF");
  const [materialId,     setMaterialId]    = useState("cotton");
  const [cameraView,     setCameraView]    = useState<"front"|"back"|"side">("front");
  const [elements,       setElements]      = useState<DesignElement[]>([]);
  const [selectedEl,     setSelectedEl]    = useState<string|null>(null);
  const [activeTab,      setActiveTab]     = useState<"garment"|"text"|"paint"|"graphics"|"layers">("garment");
  const [rightTab,       setRightTab]      = useState<"summary"|"mydesigns">("summary");

  // Text tool state
  const [textContent,    setTextContent]   = useState("YOUNGIN");
  const [textFont,       setTextFont]      = useState("Arial");
  const [textSize,       setTextSize]      = useState(36);
  const [textColor,      setTextColor]     = useState("#1A1A1A");
  const [textBold,       setTextBold]      = useState(false);
  const [textItalic,     setTextItalic]    = useState(false);
  const [textAlign,      setTextAlign]     = useState<"left"|"center"|"right">("center");

  // Paint tool state
  const [brushColor,     setBrushColor]    = useState("#1A1A1A");
  const [brushSize,      setBrushSize]     = useState(10);
  const [isEraser,       setIsEraser]      = useState(false);
  const paintCanvasRef   = useRef<HTMLCanvasElement>(null);
  const isPainting       = useRef(false);
  const lastPaintPos     = useRef<{x: number; y: number} | null>(null);

  // Unsplash state
  const [unsplashQuery,  setUnsplashQuery]  = useState("");
  const [unsplashResults, setUnsplashResults] = useState<any[]>([]);
  const [unsplashLoading, setUnsplashLoading] = useState(false);

  // Textures
  const [texture,        setTexture]       = useState<THREE.CanvasTexture|null>(null);

  // DB Save state
  const [saving,         setSaving]        = useState(false);
  const [saved,          setSaved]         = useState(false);
  const [saveError,      setSaveError]     = useState<string|null>(null);
  const [designName,     setDesignName]    = useState("Untitled");
  const [dbDesignId,     setDbDesignId]    = useState<string|undefined>(undefined);
  const [myDesigns,      setMyDesigns]     = useState<Design[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);

  const material = MATERIALS.find(m => m.id === materialId) || MATERIALS[0];

  // ─── Asynchronous Texture Builder ──────────────────────────────────────────
  const rebuildTexture = useCallback(async (els: DesignElement[]) => {
    const size = 1024;
    const c = document.createElement("canvas");
    c.width = size; c.height = size;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, size, size);

    // 1. Draw paint layer
    if (paintCanvasRef.current) {
      ctx.drawImage(paintCanvasRef.current, 0, 0, size, size);
    }

    // 2. Draw active elements
    for (const el of els) {
      if (el.type === "image") {
        await new Promise<void>((resolve) => {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const w = el.size * 5; // e.g. 50 * 5 = 250px wide
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
    // Important: by default flipY is false on textures manually mapped to planes
    tex.flipY = false; 
    setTexture(tex);
  }, []);

  // Update texture when elements list changes
  useEffect(() => { rebuildTexture(elements); }, [elements, rebuildTexture]);

  // ─── Paint canvas handlers ─────────────────────────────────────────────
  const paint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pc = paintCanvasRef.current;
    if (!pc) return;
    const rect = pc.getBoundingClientRect();
    // Scale coordinates correctly from pixel space to canvas space (1024)
    const scaleX = pc.width / rect.width;
    const scaleY = pc.height / rect.height;
    
    // Reverse Y mathematically because the canvas gets flipped when wrapping on the plane
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
    rebuildTexture(elements); // sync 3D texture live
  };

  const handlePaintStart = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    isPainting.current = true;
    paint(e);
  };
  const handlePaintMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPainting.current) return;
    e.preventDefault();
    paint(e);
  };
  const handlePaintEnd = () => {
    isPainting.current = false;
    lastPaintPos.current = null;
  };
  const clearPaintCanvas = () => {
    const pc = paintCanvasRef.current;
    if (!pc) return;
    pc.getContext("2d")!.clearRect(0, 0, pc.width, pc.height);
    rebuildTexture(elements);
  };

  // ─── Actions ────────────────────────────────────────────────────────────
  const searchUnsplash = async () => {
    if (!unsplashQuery.trim()) return;
    setUnsplashLoading(true);
    try {
      const res = await fetch(`/api/unsplash?q=${encodeURIComponent(unsplashQuery)}`);
      const data = await res.json();
      setUnsplashResults(data.results || []);
    } catch {
      setUnsplashResults([]);
    }
    setUnsplashLoading(false);
  };

  const addTextEl = () => {
    if (!textContent.trim()) return;
    setElements(prev => [...prev, {
      id: `el_${Date.now()}`, type: "text",
      content: textContent, font: textFont, size: textSize,
      color: textColor, bold: textBold, italic: textItalic, x: 50, y: 35,
    }]);
  };

  const addUnsplashImage = (url: string) => {
    setElements(prev => [...prev, {
      id: `el_${Date.now()}`, type: "image",
      content: url, font: "Arial", size: 60, // Used as width scale
      color: "#000", bold: false, italic: false, x: 50, y: 50,
    }]);
  };

  const deleteEl = (id: string) => setElements(prev => prev.filter(e => e.id !== id));

  const handleSave = async () => {
    setSaving(true); setSaveError(null);
    const mappedElements = elements.map(e => ({...e, type: "shape" as any})); // Cast to satisfy API
    const result = await saveDesignToDb({
      id: dbDesignId, name: designName,
      garmentType, garmentColor, material: materialId, 
      elements: mappedElements as any,
    });
    setSaving(false);
    if (result.success && result.id) {
      setDbDesignId(result.id);
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } else {
      setSaveError(result.error || "Save failed.");
    }
  };

  const loadDesign = (d: Design) => {
    setGarmentType(d.garment_type);
    setGarmentColor(d.garment_color);
    setMaterialId(d.material);
    setElements((d.elements || []).map(e => ({...e, type: (e as any).type === "shape" ? "image" : e.type} as any)));
    setDesignName(d.name);
    setDbDesignId(d.id);
    setRightTab("summary");
  };

  const openMyDesigns = async () => {
    setRightTab("mydesigns");
    setLoadingDesigns(true);
    const r = await loadUserDesigns();
    setMyDesigns(r.designs);
    setLoadingDesigns(false);
  };

  return (
    <div className="flex flex-col" style={{ height: "100vh", background: "#F2F2F4", fontFamily: "'Inter', sans-serif" }}>
      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-gray-200 z-40 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="w-px h-5 bg-gray-200" />
          <span className="text-sm font-black tracking-tight text-gray-900 uppercase">Design Studio</span>
        </div>

        <input value={designName} onChange={e => setDesignName(e.target.value)}
          className="text-sm font-semibold text-center text-gray-700 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-gray-600 outline-none px-2 py-0.5 w-[200px]"
          placeholder="Untitled Design" />

        <div className="flex items-center gap-2.5">
          <div className="flex items-center rounded-xl overflow-hidden border border-gray-200 text-xs font-bold bg-white">
            {(["front","back","side"] as const).map(v => (
              <button key={v} onClick={() => setCameraView(v)}
                className="px-3 py-1.5 capitalize transition-all focus:outline-none"
                style={{ background: cameraView === v ? "#1A1A1A" : "#fff", color: cameraView === v ? "#fff" : "#555" }}>{v}</button>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white hover:scale-105 active:scale-95 transition-all" style={{ background: saved ? "#16A34A" : "#1A1A1A" }}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
        <div className="w-[272px] shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-100">
            {[
              { id: "garment",  label: "Garment",  Icon: Shirt },
              { id: "paint",    label: "Paint",    Icon: Paintbrush },
              { id: "text",     label: "Text",     Icon: Type },
              { id: "graphics", label: "Graphics", Icon: ImageIcon }
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id as any)}
                className="flex-1 py-3 flex flex-col items-center gap-1 text-[8px] font-black uppercase tracking-wider transition-all"
                style={{ color: activeTab === t.id ? "#1A1A1A" : "#BBB", borderBottom: activeTab === t.id ? "2px solid #1A1A1A" : "2px solid transparent" }}>
                <t.Icon className="w-4 h-4" />{t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scroll">
            {/* GARMENT TAB */}
            <div className={activeTab === "garment" ? "block space-y-5" : "hidden"}>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 mb-3">Garment Type</p>
                <div className="grid grid-cols-3 gap-2">
                  {GARMENT_TYPES.map(g => (
                    <button key={g.id} onClick={() => setGarmentType(g.id)}
                      className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 transition-all"
                      style={{ borderColor: garmentType === g.id ? "#1A1A1A" : "#EEE", background: garmentType === g.id ? "#F9F9F9" : "#fff" }}>
                      <span className="text-xl">{g.icon}</span><span className="text-[9px] font-black uppercase">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 mb-3">Color</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setGarmentColor(c)} className="w-full aspect-square rounded-lg border-2 transition-all hover:scale-110" style={{ background: c, borderColor: garmentColor === c ? "#1A1A1A" : c === "#FFFFFF" ? "#DDD" : c, boxShadow: garmentColor === c ? "0 0 0 3px rgba(0,0,0,0.18)" : "none" }} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 mb-3">Fabric</p>
                <div className="grid grid-cols-2 gap-2">
                  {MATERIALS.map(m => (
                    <button key={m.id} onClick={() => setMaterialId(m.id)} className="py-2.5 px-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all" style={{ borderColor: materialId === m.id ? "#1A1A1A" : "#EEE", background: materialId === m.id ? "#1A1A1A" : "#fff", color: materialId === m.id ? "#fff" : "#777" }}>{m.label}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* PAINT TAB */}
            <div className={activeTab === "paint" ? "block space-y-4" : "hidden"}>
               <p className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">Canvas Surface</p>
               <div className="aspect-square w-full rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden relative shadow-inner">
                  {/* Visual grid guide */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                  <canvas ref={paintCanvasRef} width={1024} height={1024} className="w-full h-full cursor-crosshair touch-none relative z-10" onPointerDown={handlePaintStart} onPointerMove={handlePaintMove} onPointerUp={handlePaintEnd} onPointerLeave={handlePaintEnd} />
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[9px] text-gray-400 font-bold">Draw strictly inside the box.</span>
                  <button onClick={clearPaintCanvas} className="text-[9px] font-black text-red-500 flex items-center gap-1 hover:underline"><RotateCcw className="w-3 h-3"/> Clear Box</button>
               </div>
               <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                <button onClick={() => setIsEraser(false)} className="py-2.5 rounded-xl border-2 text-xs font-black flex items-center justify-center gap-1.5" style={{ borderColor: !isEraser ? "#1A1A1A" : "#EBEBEB", background: !isEraser ? "#1A1A1A" : "#fff", color: !isEraser ? "#fff" : "#777" }}><Paintbrush className="w-3.5 h-3.5" /> Brush</button>
                <button onClick={() => setIsEraser(true)} className="py-2.5 rounded-xl border-2 text-xs font-black flex items-center justify-center gap-1.5" style={{ borderColor: isEraser ? "#1A1A1A" : "#EBEBEB", background: isEraser ? "#1A1A1A" : "#fff", color: isEraser ? "#fff" : "#777" }}><Eraser className="w-3.5 h-3.5" /> Eraser</button>
              </div>
              <div className="flex gap-2">
                 <input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer border border-gray-200" />
                 <div className="flex-1 px-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3">
                    <span className="text-[10px] font-black text-gray-500 w-6">{brushSize}px</span>
                    <input type="range" min={2} max={100} value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="flex-1 accent-black" />
                 </div>
              </div>
            </div>

            {/* TEXT TAB */}
            <div className={activeTab === "text" ? "block space-y-4" : "hidden"}>
              <textarea value={textContent} onChange={e => setTextContent(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 outline-none resize-none focus:border-gray-500" rows={2} placeholder="Type here..." />
              <div className="grid grid-cols-2 gap-2">
                 <select value={textFont} onChange={e => setTextFont(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none bg-white">{FONTS.map(f => <option key={f} value={f}>{f}</option>)}</select>
                 <div className="flex items-center border border-gray-200 rounded-xl px-2 gap-2">
                   <input type="range" min={20} max={120} value={textSize} onChange={e => setTextSize(Number(e.target.value))} className="w-full accent-black" />
                 </div>
              </div>
              <div className="flex gap-2">
                <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer border border-gray-200" />
                <button onClick={() => setTextBold(b => !b)} className="flex-1 rounded-xl border-2 font-black text-xs" style={{ borderColor: textBold ? "#1A1A1A" : "#EEE", color: textBold ? "black" : "#AAA" }}>B</button>
                <button onClick={() => setTextItalic(b => !b)} className="flex-1 rounded-xl border-2 italic font-black text-xs" style={{ borderColor: textItalic ? "#1A1A1A" : "#EEE", color: textItalic ? "black" : "#AAA" }}>I</button>
              </div>
              <button onClick={addTextEl} className="w-full py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2" style={{ background: "#1A1A1A" }}><Plus className="w-4 h-4" /> Add Text</button>
            </div>

            {/* GRAPHICS TAB */}
            <div className={activeTab === "graphics" ? "block space-y-4" : "hidden"}>
              <div className="flex gap-2">
                <input value={unsplashQuery} onChange={e => setUnsplashQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && searchUnsplash()} className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-gray-500" placeholder="Search patterns..." />
                <button onClick={searchUnsplash} className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50"><Search className="w-3.5 h-3.5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2 h-64 overflow-y-auto">
                 {unsplashResults.map(img => (
                   <button key={img.id} onClick={() => addUnsplashImage(img.urls.regular)} className="rounded-xl overflow-hidden aspect-[4/5] border hover:border-gray-500">
                     <img src={img.urls.thumb} className="w-full h-full object-cover" alt="" />
                   </button>
                 ))}
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">Logos</p>
              <div className="flex flex-wrap gap-2">
                {["ORIGINAL","PREMIUM","LIMITED"].map(badge => (
                  <button key={badge} onClick={() => { setElements(prev => [...prev, { id: `el_${Date.now()}`, type:"text", content: badge, font: "Arial", size: 30, color: "#1A1A1A", bold: true, italic: false, x: 50, y: 35}]); }} className="px-3 py-1.5 rounded-lg border text-xs font-black uppercase">{badge}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── CENTER: 3D VIEWPORT ─────────────────────────────────────────── */}
        <div className="flex-1 relative overflow-hidden" style={{ background: "radial-gradient(circle, #FAFAFA 0%, #E8E8E8 100%)" }}>
           <Canvas shadows gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }} style={{ width: "100%", height: "100%" }}>
              <PerspectiveCamera makeDefault position={[0,0,6.0]} fov={40} />
              <Suspense fallback={null}>
                <GarmentScene type={garmentType} color={garmentColor} roughness={material.roughness} metalness={material.metalness} texture={texture} />
                <Environment preset="studio" background={false} />
              </Suspense>
              <CameraController view={cameraView} />
              <OrbitControls enablePan enableZoom minDistance={2.5} maxDistance={10} maxPolarAngle={Math.PI / 1.8} makeDefault />
           </Canvas>
        </div>

        {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
        <div className="w-[260px] shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-100">
            {[{ id: "layers", label: "Layers", Icon: Layers }, { id: "mydesigns", label: "Designs", Icon: FolderOpen }].map(t => (
              <button key={t.id} onClick={() => t.id === "mydesigns" ? openMyDesigns() : setRightTab("layers")} className="flex-1 py-3 flex flex-col items-center gap-1 text-[8px] font-black uppercase tracking-wider transition-all" style={{ color: rightTab === t.id ? "#1A1A1A" : "#BBB", borderBottom: rightTab === t.id ? "2px solid #1A1A1A" : "2px solid transparent" }}>
                <t.Icon className="w-4 h-4" />{t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col">
            {rightTab === "layers" && (<>
               <p className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 mb-3">Garment Add-Ons</p>
               {elements.length === 0 ? (
                 <div className="text-center py-6 text-gray-400 border border-dashed rounded-xl"><Layers className="w-6 h-6 mx-auto mb-2 opacity-30"/><p className="text-[10px] font-bold">No added elements</p></div>
               ) : (
                 <div className="space-y-2 mb-6">
                   {elements.map((el, i) => (
                     <div key={el.id} className="flex flex-col gap-1 p-2 border rounded-xl bg-gray-50 border-gray-100">
                       <div className="flex items-center gap-2">
                         <span className="text-[8px] font-black bg-black text-white w-4 h-4 flex items-center justify-center rounded uppercase shrink-0">{el.type.charAt(0)}</span>
                         <span className="text-[10px] font-bold truncate flex-1">{el.type === 'image' ? 'Image Graphic' : el.content}</span>
                         <button onClick={() => deleteEl(el.id)} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3"/></button>
                       </div>
                       {el.type !== 'image' && (
                         <div className="flex gap-2 mt-1 px-1 opacity-60">
                           <input type="range" className="flex-1 accent-black h-1" min={10} max={90} value={el.y} onChange={e => setElements(prev => prev.map(p => p.id === el.id ? {...p, y: Number(e.target.value)} : p))} />
                           <span className="text-[8px] font-bold">POS Y</span>
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               )}

               {/* Useful Area Fill */}
               <div className="mt-auto pt-6 border-t border-gray-100">
                 <p className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 mb-3">Pro Tips</p>
                 <div className="bg-[#1A1A1A] rounded-xl p-3 text-white space-y-2 text-[10px]">
                   <p className="flex items-start gap-2"><span className="opacity-50 mt-px">💡</span> <span className="font-semibold leading-tight text-gray-300">Paint strokes live stream directly onto the garment texture.</span></p>
                   <p className="flex items-start gap-2"><span className="opacity-50 mt-px">🖱️</span> <span className="font-semibold leading-tight text-gray-300">Left-click drag the 3D model to inspect from all angles.</span></p>
                   <p className="flex items-start gap-2"><span className="opacity-50 mt-px">🎨</span> <span className="font-semibold leading-tight text-gray-300">Colors update instantly—try the fabric swatches!</span></p>
                 </div>
               </div>
            </>)}

            {rightTab === "mydesigns" && (
              <div className="space-y-3">
                {loadingDesigns ? <div className="py-6 flex justify-center"><Loader2 className="w-5 h-5 animate-spin" /></div> :
                  myDesigns.map(d => (
                    <div key={d.id} className="border p-3 rounded-xl hover:border-gray-400 cursor-pointer" onClick={() => loadDesign(d)}>
                       <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-bold text-gray-800 truncate">{d.name}</p>
                          <div className="w-3 h-3 rounded-sm shrink-0 border" style={{ background: d.garment_color }} />
                       </div>
                       <p className="text-[9px] text-gray-400 font-black uppercase">{d.garment_type}</p>
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

"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";
import {
  ChevronDown, Save, Layers, Type, Image as ImageIcon, Shirt,
  Plus, Trash2, Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  Check, Loader2, X, ArrowLeft, FolderOpen, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { saveDesignToDb, loadUserDesigns, deleteDesign, type Design, type DesignElement } from "./actions";

// ─── Constants ──────────────────────────────────────────────────────────────
const GARMENT_TYPES = [
  { id: "tshirt",  label: "T-Shirt",  icon: "👕" },
  { id: "hoodie",  label: "Hoodie",   icon: "🧥" },
  { id: "jeans",   label: "Jeans",    icon: "👖" },
  { id: "dress",   label: "Dress",    icon: "👗" },
  { id: "jacket",  label: "Jacket",   icon: "🥼" },
  { id: "polo",    label: "Polo",     icon: "🎽" },
];

const COLORS = [
  "#FFFFFF","#F5F5F5","#1A1A1A","#2D2D2D","#C0392B","#E74C3C",
  "#E67E22","#F39C12","#27AE60","#2ECC71","#2980B9","#3498DB",
  "#8E44AD","#9B59B6","#E91E63","#FF4081","#795548","#9E9E9E",
  "#607D8B","#00BCD4",
];

const MATERIALS = [
  { id: "cotton",  label: "Cotton",  roughness: 0.9,  metalness: 0.0  },
  { id: "silk",    label: "Silk",    roughness: 0.2,  metalness: 0.05 },
  { id: "denim",   label: "Denim",   roughness: 0.85, metalness: 0.0  },
  { id: "leather", label: "Leather", roughness: 0.35, metalness: 0.1  },
  { id: "wool",    label: "Wool",    roughness: 0.95, metalness: 0.0  },
  { id: "satin",   label: "Satin",   roughness: 0.15, metalness: 0.08 },
];

const FONTS = ["Arial","Georgia","Courier New","Times New Roman","Trebuchet MS","Verdana"];

// ─── 3D Garment Meshes ──────────────────────────────────────────────────────
function GarmentMesh({ type, color, roughness, metalness, texture }: {
  type: string; color: string; roughness: number; metalness: number; texture: THREE.CanvasTexture | null;
}) {
  const threeColor = new THREE.Color(color);
  const mat = { color: threeColor, roughness, metalness, map: texture };

  switch (type) {
    case "tshirt": return (
      <group>
        <mesh castShadow><boxGeometry args={[1.6,2.0,0.4]}/><meshStandardMaterial {...mat}/></mesh>
        <mesh position={[-1.1,0.6,0]} rotation={[0,0,0.3]} castShadow><boxGeometry args={[0.65,0.65,0.35]}/><meshStandardMaterial {...mat}/></mesh>
        <mesh position={[1.1,0.6,0]} rotation={[0,0,-0.3]} castShadow><boxGeometry args={[0.65,0.65,0.35]}/><meshStandardMaterial {...mat}/></mesh>
        <mesh position={[0,1.05,0.02]}><torusGeometry args={[0.28,0.09,8,20,Math.PI]}/><meshStandardMaterial {...mat}/></mesh>
      </group>
    );
    case "hoodie": return (
      <group>
        <mesh castShadow><boxGeometry args={[1.7,2.1,0.45]}/><meshStandardMaterial {...mat}/></mesh>
        <mesh position={[-1.2,0.4,0]} rotation={[0,0,0.25]} castShadow><boxGeometry args={[0.7,0.9,0.38]}/><meshStandardMaterial {...mat}/></mesh>
        <mesh position={[1.2,0.4,0]} rotation={[0,0,-0.25]} castShadow><boxGeometry args={[0.7,0.9,0.38]}/><meshStandardMaterial {...mat}/></mesh>
        <mesh position={[0,1.35,-0.05]} castShadow><sphereGeometry args={[0.52,16,12,0,Math.PI*2,0,Math.PI*0.65]}/><meshStandardMaterial {...mat}/></mesh>
        <mesh position={[0,-0.5,0.23]}><boxGeometry args={[0.9,0.35,0.04]}/><meshStandardMaterial {...mat}/></mesh>
      </group>
    );
    case "jeans": return (
      <group>
        <mesh position={[0,1.1,0]} castShadow><boxGeometry args={[1.5,0.25,0.4]}/><meshStandardMaterial {...mat}/></mesh>
        <mesh position={[-0.38,-0.35,0]} castShadow><cylinderGeometry args={[0.33,0.25,2.0,12]}/><meshStandardMaterial {...mat}/></mesh>
        <mesh position={[0.38,-0.35,0]} castShadow><cylinderGeometry args={[0.33,0.25,2.0,12]}/><meshStandardMaterial {...mat}/></mesh>
        <mesh position={[0,0.55,0]} castShadow><boxGeometry args={[0.78,0.6,0.38]}/><meshStandardMaterial {...mat}/></mesh>
      </group>
    );
    case "dress": return (
      <group>
        <mesh position={[0,0.75,0]} castShadow><boxGeometry args={[1.3,1.4,0.35]}/><meshStandardMaterial {...mat}/></mesh>
        <mesh position={[0,-0.5,0]} castShadow><cylinderGeometry args={[1.1,1.5,1.8,20]}/><meshStandardMaterial {...mat}/></mesh>
        <mesh position={[-0.35,1.55,0]} castShadow><boxGeometry args={[0.12,0.4,0.08]}/><meshStandardMaterial {...mat}/></mesh>
        <mesh position={[0.35,1.55,0]} castShadow><boxGeometry args={[0.12,0.4,0.08]}/><meshStandardMaterial {...mat}/></mesh>
      </group>
    );
    case "jacket": return (
      <group>
        <mesh castShadow><boxGeometry args={[1.75,2.1,0.48]}/><meshStandardMaterial {...mat}/></mesh>
        <mesh position={[-1.22,0.35,0]} rotation={[0,0,0.2]} castShadow><boxGeometry args={[0.72,1.0,0.4]}/><meshStandardMaterial {...mat}/></mesh>
        <mesh position={[1.22,0.35,0]} rotation={[0,0,-0.2]} castShadow><boxGeometry args={[0.72,1.0,0.4]}/><meshStandardMaterial {...mat}/></mesh>
        <mesh position={[-0.3,0.85,0.25]} rotation={[0,0,0.3]} castShadow><boxGeometry args={[0.32,0.65,0.06]}/><meshStandardMaterial {...mat}/></mesh>
        <mesh position={[0.3,0.85,0.25]} rotation={[0,0,-0.3]} castShadow><boxGeometry args={[0.32,0.65,0.06]}/><meshStandardMaterial {...mat}/></mesh>
      </group>
    );
    default: return ( // polo
      <group>
        <mesh castShadow><boxGeometry args={[1.55,2.0,0.4]}/><meshStandardMaterial {...mat}/></mesh>
        <mesh position={[-1.06,0.65,0]} rotation={[0,0,0.27]} castShadow><boxGeometry args={[0.6,0.65,0.33]}/><meshStandardMaterial {...mat}/></mesh>
        <mesh position={[1.06,0.65,0]} rotation={[0,0,-0.27]} castShadow><boxGeometry args={[0.6,0.65,0.33]}/><meshStandardMaterial {...mat}/></mesh>
        <mesh position={[0,1.1,0.05]}><boxGeometry args={[0.7,0.22,0.12]}/><meshStandardMaterial {...mat}/></mesh>
      </group>
    );
  }
}

// ─── Camera Preset Controller ───────────────────────────────────────────────
const VIEW_POSITIONS = {
  front: new THREE.Vector3(0, 0, 4.5),
  back:  new THREE.Vector3(0, 0, -4.5),
  side:  new THREE.Vector3(4.5, 0, 0),
};

function CameraController({ view }: { view: "front"|"back"|"side" }) {
  const { camera } = useThree();
  const target = VIEW_POSITIONS[view];
  useFrame(() => { camera.position.lerp(target, 0.07); camera.lookAt(0, 0, 0); });
  return null;
}

// ─── 3D Scene ───────────────────────────────────────────────────────────────
function GarmentScene({ type, color, roughness, metalness, texture }: {
  type: string; color: string; roughness: number; metalness: number; texture: THREE.CanvasTexture | null;
}) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[3,5,4]} intensity={1.4} castShadow shadow-mapSize={[1024,1024]} />
      <directionalLight position={[-3,2,-2]} intensity={0.55} color="#E8F0FF" />
      <pointLight position={[0,-2,3]} intensity={0.35} color="#FFF8F0" />
      <GarmentMesh type={type} color={color} roughness={roughness} metalness={metalness} texture={texture} />
      <ContactShadows position={[0,-1.6,0]} opacity={0.28} scale={5} blur={2.5} />
      <mesh position={[0,-1.62,0]} rotation={[-Math.PI/2,0,0]} receiveShadow>
        <planeGeometry args={[20,20]}/><meshStandardMaterial color="#F8F8F8" roughness={1}/>
      </mesh>
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function StudioPage() {
  const [garmentType,   setGarmentType]   = useState("tshirt");
  const [garmentColor,  setGarmentColor]  = useState("#FFFFFF");
  const [materialId,    setMaterialId]    = useState("cotton");
  const [cameraView,    setCameraView]    = useState<"front"|"back"|"side">("front");
  const [elements,      setElements]      = useState<DesignElement[]>([]);
  const [selectedEl,    setSelectedEl]    = useState<string|null>(null);
  const [activeTab,     setActiveTab]     = useState<"garment"|"text"|"graphics"|"layers">("garment");
  const [rightTab,      setRightTab]      = useState<"summary"|"mydesigns">("summary");

  // Text tool
  const [textContent,   setTextContent]   = useState("YOUNGIN");
  const [textFont,      setTextFont]      = useState("Arial");
  const [textSize,      setTextSize]      = useState(36);
  const [textColor,     setTextColor]     = useState("#1A1A1A");
  const [textBold,      setTextBold]      = useState(false);
  const [textItalic,    setTextItalic]    = useState(false);
  const [textAlign,     setTextAlign]     = useState<"left"|"center"|"right">("center");

  // Texture
  const [texture, setTexture] = useState<THREE.CanvasTexture|null>(null);

  // Save state
  const [saving,        setSaving]        = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [saveError,     setSaveError]     = useState<string|null>(null);
  const [designName,    setDesignName]    = useState("My Design");
  const [dbDesignId,    setDbDesignId]    = useState<string|undefined>(undefined);

  // My Designs
  const [myDesigns,     setMyDesigns]     = useState<Design[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);

  const material = MATERIALS.find(m => m.id === materialId) || MATERIALS[0];

  // ─── Rebuild texture when elements change ──────────────────────────────
  const rebuildTexture = useCallback((els: DesignElement[]) => {
    const c = document.createElement("canvas");
    c.width = 1024; c.height = 1024;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, 1024, 1024);
    els.forEach(el => {
      if (el.type === "text") {
        const w = el.bold   ? "bold "   : "";
        const s = el.italic ? "italic " : "";
        ctx.font      = `${s}${w}${el.size * 4}px ${el.font}`;
        ctx.fillStyle = el.color;
        ctx.textAlign = "center";
        ctx.fillText(el.content, el.x * 10.24, el.y * 10.24);
      }
    });
    const tex = new THREE.CanvasTexture(c);
    tex.flipY = false;
    setTexture(tex);
  }, []);

  useEffect(() => { rebuildTexture(elements); }, [elements, rebuildTexture]);

  // ─── Add text ────────────────────────────────────────────────────────────
  const addTextEl = () => {
    if (!textContent.trim()) return;
    const el: DesignElement = {
      id: `el_${Date.now()}`, type: "text",
      content: textContent, font: textFont, size: textSize,
      color: textColor, bold: textBold, italic: textItalic, x: 51, y: 48,
    };
    setElements(prev => [...prev, el]);
    setSelectedEl(el.id);
  };

  const deleteEl = (id: string) => {
    setElements(prev => prev.filter(e => e.id !== id));
    if (selectedEl === id) setSelectedEl(null);
  };

  // ─── Save to Supabase ────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true); setSaveError(null);
    const result = await saveDesignToDb({
      id: dbDesignId,
      name: designName,
      garmentType, garmentColor,
      material: materialId, elements,
    });
    setSaving(false);
    if (result.success && result.id) {
      setDbDesignId(result.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setSaveError(result.error || "Save failed. Check your connection.");
    }
  };

  // ─── Load saved design ───────────────────────────────────────────────────
  const loadDesign = (d: Design) => {
    setGarmentType(d.garment_type);
    setGarmentColor(d.garment_color);
    setMaterialId(d.material);
    setElements(d.elements as DesignElement[]);
    setDesignName(d.name);
    setDbDesignId(d.id);
    setRightTab("summary");
  };

  // ─── Open My Designs ────────────────────────────────────────────────────
  const openMyDesigns = async () => {
    setRightTab("mydesigns");
    setLoadingDesigns(true);
    const result = await loadUserDesigns();
    setMyDesigns(result.designs);
    setLoadingDesigns(false);
  };

  // ─── Delete a saved design ───────────────────────────────────────────────
  const handleDeleteDesign = async (id: string) => {
    await deleteDesign(id);
    setMyDesigns(prev => prev.filter(d => d.id !== id));
    if (dbDesignId === id) { setDbDesignId(undefined); }
  };

  const LEFT_TABS = [
    { id: "garment",  label: "Garment",  Icon: Shirt     },
    { id: "text",     label: "Text",     Icon: Type      },
    { id: "graphics", label: "Graphics", Icon: ImageIcon  },
    { id: "layers",   label: "Layers",   Icon: Layers    },
  ] as const;

  return (
    <div className="flex flex-col" style={{ height: "100vh", background: "#F4F4F5", fontFamily: "'Inter', sans-serif" }}>

      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 z-40 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="w-px h-5 bg-gray-200" />
          <span className="text-sm font-black tracking-tight text-gray-900 uppercase">Design Studio</span>
          {dbDesignId && (
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
              Saved to Database
            </span>
          )}
        </div>

        <input
          value={designName} onChange={e => setDesignName(e.target.value)}
          className="text-sm font-semibold text-center text-gray-700 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-gray-600 outline-none px-2 py-0.5 w-[220px]"
          placeholder="Untitled Design"
        />

        <div className="flex items-center gap-3">
          {/* View presets */}
          <div className="flex items-center rounded-xl overflow-hidden border border-gray-200 text-xs font-bold">
            {(["front","back","side"] as const).map(v => (
              <button key={v} onClick={() => setCameraView(v)}
                className="px-3 py-1.5 capitalize transition-all"
                style={{ background: cameraView === v ? "#1A1A1A" : "#fff", color: cameraView === v ? "#fff" : "#555" }}>
                {v}
              </button>
            ))}
          </div>

          <button onClick={openMyDesigns}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-600 border border-gray-200 hover:border-gray-400 transition-all">
            <FolderOpen className="w-4 h-4" /> My Designs
          </button>

          {saveError && (
            <div className="flex items-center gap-1.5 text-xs text-red-500 max-w-[200px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="truncate">{saveError}</span>
            </div>
          )}

          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: saved ? "#16A34A" : "#1A1A1A", minWidth: 90 }}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? "Saving…" : saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      {/* ── 3-COLUMN BODY ────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT PANEL ──────────────────────────────────────────────────── */}
        <div className="w-[280px] shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-100">
            {LEFT_TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id as any)}
                className="flex-1 py-2.5 flex flex-col items-center gap-0.5 text-[9px] font-black uppercase tracking-wider transition-all"
                style={{ color: activeTab === t.id ? "#1A1A1A" : "#AAA", borderBottom: activeTab === t.id ? "2px solid #1A1A1A" : "2px solid transparent" }}>
                <t.Icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">

            {/* GARMENT TAB */}
            {activeTab === "garment" && (
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Select Garment</p>
                  <div className="grid grid-cols-3 gap-2">
                    {GARMENT_TYPES.map(g => (
                      <button key={g.id} onClick={() => setGarmentType(g.id)}
                        className="flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all"
                        style={{ borderColor: garmentType === g.id ? "#1A1A1A" : "#E5E5E5", background: garmentType === g.id ? "#F5F5F5" : "#fff" }}>
                        <span className="text-2xl">{g.icon}</span>
                        <span className="text-[9px] font-black uppercase tracking-wide text-gray-600">{g.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Color</p>
                  <div className="grid grid-cols-5 gap-2">
                    {COLORS.map(c => (
                      <button key={c} onClick={() => setGarmentColor(c)}
                        className="w-full aspect-square rounded-lg border-2 transition-all hover:scale-110"
                        style={{ background: c, borderColor: garmentColor === c ? "#1A1A1A" : c === "#FFFFFF" ? "#DDD" : c, boxShadow: garmentColor === c ? "0 0 0 3px rgba(0,0,0,0.2)" : "none" }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Custom</label>
                    <input type="color" value={garmentColor} onChange={e => setGarmentColor(e.target.value)}
                      className="flex-1 h-9 rounded-lg cursor-pointer border border-gray-200" />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Material</p>
                  <div className="grid grid-cols-2 gap-2">
                    {MATERIALS.map(m => (
                      <button key={m.id} onClick={() => setMaterialId(m.id)}
                        className="py-2.5 px-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-wider transition-all"
                        style={{ borderColor: materialId === m.id ? "#1A1A1A" : "#E5E5E5", background: materialId === m.id ? "#1A1A1A" : "#fff", color: materialId === m.id ? "#fff" : "#666" }}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TEXT TAB */}
            {activeTab === "text" && (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Text Content</p>
                  <textarea value={textContent} onChange={e => setTextContent(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 outline-none resize-none focus:border-gray-600 transition-colors"
                    rows={2} placeholder="Enter your text…" />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Font</p>
                  <div className="relative">
                    <select value={textFont} onChange={e => setTextFont(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 outline-none appearance-none bg-white">
                      {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Font Size</p>
                    <span className="text-xs font-black text-gray-700">{textSize}px</span>
                  </div>
                  <input type="range" min={12} max={72} value={textSize} onChange={e => setTextSize(Number(e.target.value))}
                    className="w-full accent-gray-900" />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Text Color</p>
                  <div className="flex items-center gap-2">
                    <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)}
                      className="w-12 h-9 rounded-lg cursor-pointer border border-gray-200 shrink-0" />
                    <input value={textColor} onChange={e => setTextColor(e.target.value)}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono text-gray-700 outline-none focus:border-gray-600 uppercase"
                      maxLength={7} />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setTextBold(b => !b)}
                    className="w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all font-black"
                    style={{ borderColor: textBold ? "#1A1A1A" : "#E5E5E5", background: textBold ? "#1A1A1A" : "#fff", color: textBold ? "#fff" : "#666" }}>
                    <Bold className="w-4 h-4" />
                  </button>
                  <button onClick={() => setTextItalic(b => !b)}
                    className="w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all"
                    style={{ borderColor: textItalic ? "#1A1A1A" : "#E5E5E5", background: textItalic ? "#1A1A1A" : "#fff", color: textItalic ? "#fff" : "#666" }}>
                    <Italic className="w-4 h-4" />
                  </button>
                  <div className="flex ml-auto border border-gray-200 rounded-xl overflow-hidden">
                    {(["left","center","right"] as const).map(a => (
                      <button key={a} onClick={() => setTextAlign(a)}
                        className="w-9 h-9 flex items-center justify-center transition-all"
                        style={{ background: textAlign === a ? "#1A1A1A" : "#fff", color: textAlign === a ? "#fff" : "#999" }}>
                        {a === "left" ? <AlignLeft className="w-3.5 h-3.5" /> : a === "center" ? <AlignCenter className="w-3.5 h-3.5" /> : <AlignRight className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={addTextEl}
                  className="w-full py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                  style={{ background: "#1A1A1A" }}>
                  <Plus className="w-4 h-4" /> Add to Garment
                </button>

                {/* Live Preview */}
                <div className="rounded-xl border border-gray-100 p-3 bg-gray-50" style={{ fontFamily: textFont, fontWeight: textBold ? "bold" : "normal", fontStyle: textItalic ? "italic" : "normal", fontSize: Math.max(12, textSize * 0.5), color: textColor, textAlign }}>
                  {textContent || "Preview text here"}
                </div>
              </div>
            )}

            {/* GRAPHICS TAB */}
            {activeTab === "graphics" && (
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Quick Shapes</p>
                <div className="grid grid-cols-3 gap-2">
                  {["⭐","❤️","🔶","🔵","➕","🌟","◼","▲","⬡"].map((s,i) => (
                    <button key={i} onClick={() => setElements(prev => [...prev, {
                      id: `el_${Date.now()}`, type: "text", content: s,
                      font: "Arial", size: 40, color: "#000000", bold: false, italic: false, x: 51, y: 48,
                    }])}
                    className="aspect-square rounded-xl border border-gray-200 flex items-center justify-center text-2xl hover:border-gray-500 hover:bg-gray-50 transition-all">
                      {s}
                    </button>
                  ))}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Brand Badges</p>
                  {["ORIGINAL","LIMITED","EXCLUSIVE","CLASSIC","PREMIUM"].map(badge => (
                    <button key={badge} onClick={() => setElements(prev => [...prev, {
                      id: `el_${Date.now()}`, type: "text", content: badge,
                      font: "Arial", size: 18, color: "#1A1A1A", bold: true, italic: false, x: 51, y: 35,
                    }])}
                    className="w-full mb-2 py-2 px-3 rounded-lg border border-gray-200 text-xs font-black uppercase tracking-widest text-gray-600 text-left hover:border-gray-500 hover:bg-gray-50 transition-all">
                      {badge}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* LAYERS TAB */}
            {activeTab === "layers" && (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Design Layers ({elements.length})</p>
                {elements.length === 0 && (
                  <div className="text-center py-10 text-gray-300">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-semibold">No elements yet.<br/>Add text or graphics.</p>
                  </div>
                )}
                {elements.map((el, i) => (
                  <div key={el.id} onClick={() => setSelectedEl(el.id)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer border transition-all"
                    style={{ borderColor: selectedEl === el.id ? "#1A1A1A" : "#E5E5E5", background: selectedEl === el.id ? "#F5F5F5" : "#fff" }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0" style={{ background: "#1A1A1A", color: "#fff", fontWeight: "bold" }}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{el.content}</p>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wide">{el.font} · {el.size}px</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); deleteEl(el.id); }}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── CENTER: 3D VIEWPORT ──────────────────────────────────────────── */}
        <div className="flex-1 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #EFEFEF 0%, #FAFAFA 50%, #EFEFEF 100%)" }}>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-gray-200">
              {GARMENT_TYPES.find(g => g.id === garmentType)?.label} — {material.label}
            </span>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <span className="text-[9px] font-semibold text-gray-300 bg-white/70 backdrop-blur px-3 py-1.5 rounded-full border border-gray-100">
              Drag to rotate · Scroll to zoom · Right-click to pan
            </span>
          </div>

          <Canvas shadows gl={{ antialias: true, alpha: false }} style={{ width: "100%", height: "100%", cursor: "grab" }}>
            <color attach="background" args={["#F7F7F7"]} />
            <PerspectiveCamera makeDefault position={[0,0,4.5]} fov={42} />
            <Suspense fallback={null}>
              <GarmentScene type={garmentType} color={garmentColor} roughness={material.roughness} metalness={material.metalness} texture={texture} />
              <Environment preset="studio" background={false} />
            </Suspense>
            <CameraController view={cameraView} />
            <OrbitControls enablePan enableZoom minDistance={2} maxDistance={9} makeDefault />
          </Canvas>
        </div>

        {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
        <div className="w-[280px] shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-100">
            {[
              { id: "summary",   label: "Summary",    Icon: Layers     },
              { id: "mydesigns", label: "My Designs", Icon: FolderOpen },
            ].map(t => (
              <button key={t.id} onClick={() => t.id === "mydesigns" ? openMyDesigns() : setRightTab("summary")}
                className="flex-1 py-2.5 flex flex-col items-center gap-0.5 text-[9px] font-black uppercase tracking-wider transition-all"
                style={{ color: rightTab === t.id ? "#1A1A1A" : "#AAA", borderBottom: rightTab === t.id ? "2px solid #1A1A1A" : "2px solid transparent" }}>
                <t.Icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">

            {/* SUMMARY */}
            {rightTab === "summary" && (
              <div className="space-y-5">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Design Overview</p>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-semibold">Garment</span>
                      <span className="font-black text-gray-800">{GARMENT_TYPES.find(g => g.id === garmentType)?.label}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-semibold">Color</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded border border-gray-200" style={{ background: garmentColor }} />
                        <span className="font-black text-gray-800 font-mono uppercase text-[10px]">{garmentColor}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-semibold">Material</span>
                      <span className="font-black text-gray-800">{material.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-semibold">Elements</span>
                      <span className="font-black text-gray-800">{elements.length}</span>
                    </div>
                    {dbDesignId && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">DB Status</span>
                        <span className="font-black text-green-600 flex items-center gap-1"><Check className="w-3 h-3"/>Saved</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Element list */}
                {elements.length > 0 && (
                  <div className="rounded-xl border border-gray-100 p-3 bg-gray-50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Elements</p>
                    <div className="space-y-1.5">
                      {elements.map((el, i) => (
                        <div key={el.id} className="flex items-center gap-2 p-2 rounded-lg bg-white border border-gray-100">
                          <span className="text-[9px] font-black text-gray-400 w-4">{i+1}</span>
                          <div className="w-3 h-3 rounded-full border border-gray-200" style={{ background: el.color }} />
                          <span className="text-[10px] font-bold text-gray-700 truncate flex-1">{el.content}</span>
                          <button onClick={() => deleteEl(el.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {saveError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {saveError}
                  </div>
                )}

                <button onClick={handleSave} disabled={saving}
                  className="w-full py-3.5 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                  style={{ background: saved ? "#16A34A" : "#1A1A1A" }}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving to DB…" : saved ? "Saved to Supabase!" : "Save Design"}
                </button>
              </div>
            )}

            {/* MY DESIGNS */}
            {rightTab === "mydesigns" && (
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Saved Designs ({myDesigns.length})</p>
                {loadingDesigns ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
                ) : myDesigns.length === 0 ? (
                  <div className="text-center py-12 text-gray-300">
                    <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-semibold">No saved designs yet.<br/>Save your first design!</p>
                  </div>
                ) : (
                  myDesigns.map(d => (
                    <div key={d.id} className="border border-gray-200 rounded-2xl p-3 hover:border-gray-400 transition-all cursor-pointer group"
                      onClick={() => loadDesign(d)}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-bold text-gray-800">{d.name}</p>
                          <p className="text-[10px] text-gray-400 capitalize">{d.garment_type} · {d.material}</p>
                        </div>
                        <div className="w-5 h-5 rounded border border-gray-200" style={{ background: d.garment_color }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-gray-400">{new Date(d.updated_at).toLocaleDateString()}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={e => { e.stopPropagation(); loadDesign(d); }}
                            className="text-[9px] font-bold text-gray-700 hover:text-gray-900 px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                            Load
                          </button>
                          <button onClick={e => { e.stopPropagation(); handleDeleteDesign(d.id); }}
                            className="text-[9px] font-bold text-red-400 hover:text-red-600 px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

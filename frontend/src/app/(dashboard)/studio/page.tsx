"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";
import {
  ChevronDown, Save, Download, RotateCcw, Eye, Layers, Type,
  Image as ImageIcon, Palette, Shirt, Plus, Trash2, Bold, Italic,
  AlignLeft, AlignCenter, AlignRight, Check, Loader2, X, ArrowLeft,
  ZoomIn, ZoomOut, Maximize2, Settings
} from "lucide-react";
import Link from "next/link";

// ─── Design save to localStorage ──────────────────────────────────────────
interface DesignElement {
  id: string;
  type: "text" | "shape";
  content: string;
  font: string;
  size: number;
  color: string;
  bold: boolean;
  italic: boolean;
  x: number;
  y: number;
}

interface SavedDesign {
  id: string;
  name: string;
  garmentType: string;
  garmentColor: string;
  material: string;
  elements: DesignElement[];
  timestamp: number;
}

function saveDesign(design: SavedDesign) {
  const stored = JSON.parse(localStorage.getItem("youngin_designs") || "[]");
  const idx = stored.findIndex((d: SavedDesign) => d.id === design.id);
  if (idx >= 0) stored[idx] = design;
  else stored.push(design);
  localStorage.setItem("youngin_designs", JSON.stringify(stored));
}

// ─── Garment Types ─────────────────────────────────────────────────────────
const GARMENT_TYPES = [
  { id: "tshirt",  label: "T-Shirt",   icon: "👕" },
  { id: "hoodie",  label: "Hoodie",    icon: "🧥" },
  { id: "jeans",   label: "Jeans",     icon: "👖" },
  { id: "dress",   label: "Dress",     icon: "👗" },
  { id: "jacket",  label: "Jacket",    icon: "🥼" },
  { id: "polo",    label: "Polo",      icon: "🎽" },
];

const COLORS = [
  "#FFFFFF", "#F5F5F5", "#1A1A1A", "#2D2D2D",
  "#C0392B", "#E74C3C", "#E67E22", "#F39C12",
  "#27AE60", "#2ECC71", "#2980B9", "#3498DB",
  "#8E44AD", "#9B59B6", "#E91E63", "#FF4081",
  "#795548", "#9E9E9E", "#607D8B", "#00BCD4",
];

const MATERIALS = [
  { id: "cotton",  label: "Cotton",  roughness: 0.9, metalness: 0.0 },
  { id: "silk",    label: "Silk",    roughness: 0.2, metalness: 0.05 },
  { id: "denim",   label: "Denim",   roughness: 0.85, metalness: 0.0 },
  { id: "leather", label: "Leather", roughness: 0.35, metalness: 0.1 },
  { id: "wool",    label: "Wool",    roughness: 0.95, metalness: 0.0 },
  { id: "satin",   label: "Satin",   roughness: 0.15, metalness: 0.08 },
];

const FONTS = ["Arial", "Georgia", "Courier New", "Times New Roman", "Trebuchet MS", "Verdana"];

// ─── Procedural Garment Geometries ─────────────────────────────────────────
function TShirtMesh({ color, roughness, metalness, texture }: any) {
  const bodyGeom = new THREE.BoxGeometry(1.6, 2.0, 0.4, 1, 1, 1);
  const sleeveGeoL = new THREE.BoxGeometry(0.6, 0.7, 0.35);
  const sleeveGeoR = new THREE.BoxGeometry(0.6, 0.7, 0.35);
  const mat = new THREE.MeshStandardMaterial({ color, roughness, metalness, map: texture || null });

  return (
    <group position={[0, 0, 0]}>
      <mesh geometry={bodyGeom} material={mat} castShadow />
      {/* Left sleeve */}
      <mesh position={[-1.1, 0.6, 0]} rotation={[0, 0, 0.3]} castShadow>
        <boxGeometry args={[0.65, 0.65, 0.35]} />
        <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} map={texture || null} />
      </mesh>
      {/* Right sleeve */}
      <mesh position={[1.1, 0.6, 0]} rotation={[0, 0, -0.3]} castShadow>
        <boxGeometry args={[0.65, 0.65, 0.35]} />
        <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} map={texture || null} />
      </mesh>
      {/* Collar */}
      <mesh position={[0, 1.05, 0.02]}>
        <torusGeometry args={[0.28, 0.09, 8, 20, Math.PI]} />
        <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
      </mesh>
    </group>
  );
}

function HoodieMesh({ color, roughness, metalness, texture }: any) {
  const mat = { color, roughness, metalness, map: texture || null };
  return (
    <group>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[1.7, 2.1, 0.45]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Left sleeve */}
      <mesh position={[-1.2, 0.4, 0]} rotation={[0, 0, 0.25]} castShadow>
        <boxGeometry args={[0.7, 0.9, 0.38]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Right sleeve */}
      <mesh position={[1.2, 0.4, 0]} rotation={[0, 0, -0.25]} castShadow>
        <boxGeometry args={[0.7, 0.9, 0.38]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Hood */}
      <mesh position={[0, 1.35, -0.05]} castShadow>
        <sphereGeometry args={[0.52, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Pocket */}
      <mesh position={[0, -0.5, 0.23]}>
        <boxGeometry args={[0.9, 0.35, 0.04]} />
        <meshStandardMaterial color={color} roughness={roughness + 0.05} metalness={metalness} />
      </mesh>
    </group>
  );
}

function JeansMesh({ color, roughness, metalness }: any) {
  const mat = { color, roughness, metalness };
  return (
    <group position={[0, 0, 0]}>
      {/* Waistband */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[1.5, 0.25, 0.4]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.38, -0.35, 0]} castShadow>
        <cylinderGeometry args={[0.33, 0.25, 2.0, 12]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.38, -0.35, 0]} castShadow>
        <cylinderGeometry args={[0.33, 0.25, 2.0, 12]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Crotch join */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.78, 0.6, 0.38]} />
        <meshStandardMaterial {...mat} />
      </mesh>
    </group>
  );
}

function DressMesh({ color, roughness, metalness, texture }: any) {
  const mat = { color, roughness, metalness, map: texture || null };
  return (
    <group>
      {/* Bodice */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[1.3, 1.4, 0.35]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Skirt (flared cone) */}
      <mesh position={[0, -0.5, 0]} castShadow>
        <cylinderGeometry args={[1.1, 1.5, 1.8, 20]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Straps */}
      <mesh position={[-0.35, 1.55, 0]} castShadow>
        <boxGeometry args={[0.12, 0.4, 0.08]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh position={[0.35, 1.55, 0]} castShadow>
        <boxGeometry args={[0.12, 0.4, 0.08]} />
        <meshStandardMaterial {...mat} />
      </mesh>
    </group>
  );
}

function JacketMesh({ color, roughness, metalness }: any) {
  const mat = { color, roughness, metalness };
  return (
    <group>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[1.75, 2.1, 0.48]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Left sleeve */}
      <mesh position={[-1.22, 0.35, 0]} rotation={[0, 0, 0.2]} castShadow>
        <boxGeometry args={[0.72, 1.0, 0.4]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Right sleeve */}
      <mesh position={[1.22, 0.35, 0]} rotation={[0, 0, -0.2]} castShadow>
        <boxGeometry args={[0.72, 1.0, 0.4]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Left lapel */}
      <mesh position={[-0.3, 0.85, 0.25]} rotation={[0, 0, 0.3]} castShadow>
        <boxGeometry args={[0.32, 0.65, 0.06]} />
        <meshStandardMaterial color={color} roughness={roughness - 0.1} metalness={metalness} />
      </mesh>
      {/* Right lapel */}
      <mesh position={[0.3, 0.85, 0.25]} rotation={[0, 0, -0.3]} castShadow>
        <boxGeometry args={[0.32, 0.65, 0.06]} />
        <meshStandardMaterial color={color} roughness={roughness - 0.1} metalness={metalness} />
      </mesh>
      {/* Collar */}
      <mesh position={[0, 1.1, 0.2]}>
        <boxGeometry args={[0.9, 0.25, 0.08]} />
        <meshStandardMaterial {...mat} />
      </mesh>
    </group>
  );
}

function PoloMesh({ color, roughness, metalness }: any) {
  const mat = { color, roughness, metalness };
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[1.55, 2.0, 0.4]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh position={[-1.06, 0.65, 0]} rotation={[0, 0, 0.27]} castShadow>
        <boxGeometry args={[0.6, 0.65, 0.33]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh position={[1.06, 0.65, 0]} rotation={[0, 0, -0.27]} castShadow>
        <boxGeometry args={[0.6, 0.65, 0.33]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Polo collar */}
      <mesh position={[0, 1.1, 0.05]}>
        <boxGeometry args={[0.7, 0.22, 0.12]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Button placket */}
      <mesh position={[0, 0.5, 0.21]}>
        <boxGeometry args={[0.14, 0.7, 0.03]} />
        <meshStandardMaterial color="#F0F0F0" roughness={0.9} metalness={0} />
      </mesh>
    </group>
  );
}

// ─── Camera view presets ───────────────────────────────────────────────────
const VIEW_PRESETS = {
  front: new THREE.Vector3(0, 0, 4.5),
  back:  new THREE.Vector3(0, 0, -4.5),
  side:  new THREE.Vector3(4.5, 0, 0),
};

function CameraController({ view }: { view: "front" | "back" | "side" }) {
  const { camera } = useThree();
  const target = VIEW_PRESETS[view];
  const lerpSpeed = useRef(0.08);

  useFrame(() => {
    camera.position.lerp(target, lerpSpeed.current);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ─── Main 3D Scene ─────────────────────────────────────────────────────────
function GarmentScene({ garmentType, color, material, texture }: {
  garmentType: string;
  color: string;
  material: typeof MATERIALS[0];
  texture: THREE.CanvasTexture | null;
}) {
  const threeColor = new THREE.Color(color);
  const props = { color: threeColor, roughness: material.roughness, metalness: material.metalness, texture };

  return (
    <>
      {/* 3-point studio lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-3, 2, -2]} intensity={0.6} color="#E8F0FF" />
      <pointLight position={[0, -2, 3]} intensity={0.4} color="#FFF8F0" />

      {garmentType === "tshirt"  && <TShirtMesh {...props} />}
      {garmentType === "hoodie"  && <HoodieMesh {...props} />}
      {garmentType === "jeans"   && <JeansMesh  {...props} />}
      {garmentType === "dress"   && <DressMesh  {...props} />}
      {garmentType === "jacket"  && <JacketMesh {...props} />}
      {garmentType === "polo"    && <PoloMesh   {...props} />}

      {/* Shadow beneath garment */}
      <ContactShadows position={[0, -1.6, 0]} opacity={0.3} scale={5} blur={2.5} />

      {/* Ground plane */}
      <mesh position={[0, -1.62, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#F8F8F8" roughness={1} />
      </mesh>
    </>
  );
}

// ─── Main Studio Page ───────────────────────────────────────────────────────
export default function StudioPage() {
  // Garment state
  const [garmentType, setGarmentType] = useState("tshirt");
  const [garmentColor, setGarmentColor]   = useState("#FFFFFF");
  const [materialId,   setMaterialId]     = useState("cotton");
  const [cameraView,   setCameraView]     = useState<"front" | "back" | "side">("front");

  // Design elements
  const [elements,      setElements]      = useState<DesignElement[]>([]);
  const [selectedEl,    setSelectedEl]    = useState<string | null>(null);
  const [activeTab,     setActiveTab]     = useState<"garment" | "text" | "graphics" | "layers">("garment");
  const [rightTab,      setRightTab]      = useState<"layers" | "settings">("layers");

  // Text tool state
  const [textContent,   setTextContent]   = useState("YOUNGIN");
  const [textFont,      setTextFont]      = useState("Arial");
  const [textSize,      setTextSize]      = useState(36);
  const [textColor,     setTextColor]     = useState("#1A1A1A");
  const [textBold,      setTextBold]      = useState(false);
  const [textItalic,    setTextItalic]    = useState(false);
  const [textAlign,     setTextAlign]     = useState<"left"|"center"|"right">("center");

  // Texture on garment
  const [texture,       setTexture]       = useState<THREE.CanvasTexture | null>(null);
  const [saving,        setSaving]        = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [designName,    setDesignName]    = useState("My Design");

  const designId = useRef(`design_${Date.now()}`);
  const material = MATERIALS.find(m => m.id === materialId) || MATERIALS[0];

  // ─── Rebuild canvas texture whenever elements change ─────────────────────
  const rebuildTexture = useCallback((els: DesignElement[]) => {
    const c = document.createElement("canvas");
    c.width = 1024; c.height = 1024;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, 1024, 1024);

    els.forEach(el => {
      if (el.type === "text") {
        const weight  = el.bold   ? "bold "   : "";
        const style   = el.italic ? "italic " : "";
        ctx.font      = `${style}${weight}${el.size * 4}px ${el.font}`;
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

  // ─── Add text element ────────────────────────────────────────────────────
  const addTextEl = () => {
    if (!textContent.trim()) return;
    const el: DesignElement = {
      id: `el_${Date.now()}`,
      type: "text",
      content: textContent,
      font: textFont,
      size: textSize,
      color: textColor,
      bold: textBold,
      italic: textItalic,
      x: 51, y: 48,
    };
    const updated = [...elements, el];
    setElements(updated);
    setSelectedEl(el.id);
  };

  // ─── Delete element ──────────────────────────────────────────────────────
  const deleteEl = (id: string) => {
    const updated = elements.filter(e => e.id !== id);
    setElements(updated);
    if (selectedEl === id) setSelectedEl(null);
  };

  // ─── Save design ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    const design: SavedDesign = {
      id: designId.current,
      name: designName,
      garmentType,
      garmentColor,
      material: materialId,
      elements,
      timestamp: Date.now(),
    };
    saveDesign(design);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ─── Panel Tabs ──────────────────────────────────────────────────────────
  const LEFT_TABS = [
    { id: "garment",  label: "Garment",  icon: Shirt    },
    { id: "text",     label: "Text",     icon: Type     },
    { id: "graphics", label: "Graphics", icon: ImageIcon },
    { id: "layers",   label: "Layers",   icon: Layers   },
  ] as const;

  return (
    <div className="flex flex-col" style={{ height: "100vh", background: "#F5F5F5", fontFamily: "'Inter', sans-serif" }}>
      
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 z-40 shrink-0" style={{ boxShadow: "0 1px 0 #E5E5E5" }}>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="w-px h-5 bg-gray-200" />
          <span className="text-sm font-black tracking-tight text-gray-900 uppercase">Design Studio</span>
        </div>

        {/* Design name */}
        <input
          value={designName}
          onChange={e => setDesignName(e.target.value)}
          className="text-sm font-semibold text-center text-gray-700 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-gray-500 outline-none px-2 py-0.5 w-[220px]"
          placeholder="Untitled Design"
        />

        <div className="flex items-center gap-3">
          {/* View presets */}
          <div className="flex items-center rounded-xl overflow-hidden border border-gray-200 text-xs font-bold">
            {(["front", "back", "side"] as const).map(v => (
              <button key={v} onClick={() => setCameraView(v)}
                className="px-3 py-1.5 capitalize transition-all"
                style={{ background: cameraView === v ? "#1A1A1A" : "#fff", color: cameraView === v ? "#fff" : "#555" }}>
                {v}
              </button>
            ))}
          </div>

          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: saved ? "#16A34A" : "#1A1A1A", minWidth: 90 }}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? "Saving…" : saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      {/* ── Body: 3 columns ─────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT PANEL (280px) ─────────────────────────────────────────── */}
        <div className="w-[280px] shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-gray-100">
            {LEFT_TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id as any)}
                className="flex-1 py-2.5 flex flex-col items-center gap-0.5 text-[9px] font-black uppercase tracking-wider transition-all"
                style={{ color: activeTab === t.id ? "#1A1A1A" : "#AAA", borderBottom: activeTab === t.id ? "2px solid #1A1A1A" : "2px solid transparent" }}>
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">

            {/* ── GARMENT TAB ──────────────────────────────────────────── */}
            {activeTab === "garment" && (
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Select Garment</p>
                  <div className="grid grid-cols-3 gap-2">
                    {GARMENT_TYPES.map(g => (
                      <button key={g.id} onClick={() => setGarmentType(g.id)}
                        className="flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-center transition-all"
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

            {/* ── TEXT TAB ───────────────────────────────────────────────── */}
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
                      {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
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
                    className="flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-all font-black"
                    style={{ borderColor: textBold ? "#1A1A1A" : "#E5E5E5", background: textBold ? "#1A1A1A" : "#fff", color: textBold ? "#fff" : "#666" }}>
                    <Bold className="w-4 h-4" />
                  </button>
                  <button onClick={() => setTextItalic(b => !b)}
                    className="flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-all"
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
                  className="w-full py-3 rounded-xl font-black text-sm text-white uppercase tracking-wider transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  style={{ background: "#1A1A1A" }}>
                  <Plus className="w-4 h-4" /> Add to Garment
                </button>

                <div className="rounded-xl border border-gray-100 p-3" style={{ fontFamily: textFont, fontWeight: textBold ? "bold" : "normal", fontStyle: textItalic ? "italic" : "normal", fontSize: Math.max(12, textSize * 0.55), color: textColor, textAlign }}>
                  {textContent || "Preview"}
                </div>
              </div>
            )}

            {/* ── GRAPHICS TAB ───────────────────────────────────────────── */}
            {activeTab === "graphics" && (
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Quick Shapes</p>
                <div className="grid grid-cols-3 gap-2">
                  {["⭐", "❤️", "🔶", "🔵", "➕", "🌟", "◼", "▲", "⬡"].map((s, i) => (
                    <button key={i} onClick={() => {
                      const el: DesignElement = {
                        id: `el_${Date.now()}`, type: "text", content: s,
                        font: "Arial", size: 40, color: "#000000",
                        bold: false, italic: false, x: 51, y: 48,
                      };
                      const updated = [...elements, el];
                      setElements(updated);
                    }}
                    className="aspect-square rounded-xl border border-gray-200 flex items-center justify-center text-2xl hover:border-gray-500 hover:bg-gray-50 transition-all">
                      {s}
                    </button>
                  ))}
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Brand Badges</p>
                  {["ORIGINAL", "LIMITED", "EXCLUSIVE", "CLASSIC", "PREMIUM"].map(badge => (
                    <button key={badge} onClick={() => {
                      const el: DesignElement = {
                        id: `el_${Date.now()}`, type: "text", content: badge,
                        font: "Arial", size: 18, color: "#1A1A1A",
                        bold: true, italic: false, x: 51, y: 35,
                      };
                      setElements(prev => [...prev, el]);
                    }}
                    className="w-full mb-2 py-2 px-3 rounded-lg border border-gray-200 text-xs font-black uppercase tracking-widest text-gray-600 text-left hover:border-gray-500 hover:bg-gray-50 transition-all">
                      {badge}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── LAYERS TAB ─────────────────────────────────────────────── */}
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
                  <div key={el.id}
                    onClick={() => setSelectedEl(el.id)}
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

        {/* ── CENTER: 3D VIEWPORT ───────────────────────────────────────────── */}
        <div className="flex-1 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #F0F0F0 0%, #FAFAFA 50%, #F0F0F0 100%)" }}>
          
          {/* Canvas label */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-gray-200">
              {GARMENT_TYPES.find(g => g.id === garmentType)?.label} — {MATERIALS.find(m => m.id === materialId)?.label}
            </span>
          </div>

          {/* Zoom hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <span className="text-[9px] font-semibold text-gray-300 bg-white/70 backdrop-blur px-3 py-1.5 rounded-full border border-gray-100">
              Drag to rotate · Scroll to zoom · Right-click to pan
            </span>
          </div>

          <Canvas shadows gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
            style={{ width: "100%", height: "100%", cursor: "grab" }}>
            <color attach="background" args={["#F7F7F7"]} />
            <PerspectiveCamera makeDefault position={[0, 0, 4.5]} fov={42} />

            <Suspense fallback={null}>
              <GarmentScene garmentType={garmentType} color={garmentColor} material={material} texture={texture} />
              <Environment preset="studio" background={false} />
            </Suspense>

            <CameraController view={cameraView} />
            <OrbitControls enablePan enableZoom minDistance={2} maxDistance={9} makeDefault />
          </Canvas>
        </div>

        {/* ── RIGHT PANEL (280px) ───────────────────────────────────────────── */}
        <div className="w-[280px] shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
          {/* Tab Bar */}
          <div className="flex border-b border-gray-100">
            {[
              { id: "layers",   label: "Layers",   icon: Layers   },
              { id: "settings", label: "Export",   icon: Download },
            ].map(t => (
              <button key={t.id} onClick={() => setRightTab(t.id as any)}
                className="flex-1 py-2.5 flex flex-col items-center gap-0.5 text-[9px] font-black uppercase tracking-wider transition-all"
                style={{ color: rightTab === t.id ? "#1A1A1A" : "#AAA", borderBottom: rightTab === t.id ? "2px solid #1A1A1A" : "2px solid transparent" }}>
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {rightTab === "layers" && (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Design Summary</p>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-semibold">Garment</span>
                      <span className="font-black text-gray-800">{GARMENT_TYPES.find(g => g.id === garmentType)?.label}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-semibold">Color</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded border border-gray-200" style={{ background: garmentColor }} />
                        <span className="font-black text-gray-800 font-mono uppercase text-[10px]">{garmentColor}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-semibold">Material</span>
                      <span className="font-black text-gray-800">{MATERIALS.find(m => m.id === materialId)?.label}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-semibold">Elements</span>
                      <span className="font-black text-gray-800">{elements.length}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 p-3 bg-gray-50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5">All Elements</p>
                  {elements.length === 0 ? (
                    <p className="text-[10px] text-gray-300 text-center py-4 font-semibold">No design elements added</p>
                  ) : (
                    <div className="space-y-1.5">
                      {elements.map((el, i) => (
                        <div key={el.id} className="flex items-center gap-2 p-2 rounded-lg bg-white border border-gray-100">
                          <span className="text-[9px] font-black text-gray-400 w-4">{i + 1}</span>
                          <div className="w-3 h-3 rounded-full border border-gray-200 shrink-0" style={{ background: el.color }} />
                          <span className="text-[10px] font-bold text-gray-700 truncate flex-1">{el.content}</span>
                          <button onClick={() => deleteEl(el.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={handleSave} disabled={saving}
                  className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                  style={{ background: saved ? "#16A34A" : "#1A1A1A", color: "#fff" }}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving…" : saved ? "Saved!" : "Save Design"}
                </button>
              </div>
            )}

            {rightTab === "settings" && (
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Export Options</p>
                  <div className="space-y-2">
                    {["PNG (High Res)", "PDF (Print Ready)", "JSON (Design File)"].map(opt => (
                      <button key={opt}
                        className="w-full py-3 px-4 rounded-xl border border-gray-200 text-left text-sm font-black text-gray-700 hover:border-gray-500 hover:bg-gray-50 transition-all flex items-center gap-2">
                        <Download className="w-4 h-4 text-gray-400" /> {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Canvas Size</p>
                  <div className="grid grid-cols-2 gap-2">
                    {["1:1 Square", "4:3 Print", "16:9 Banner", "A4 Paper"].map(size => (
                      <button key={size}
                        className="py-2 px-3 rounded-xl border border-gray-200 text-[10px] font-black text-gray-500 hover:border-gray-500 hover:bg-gray-50 transition-all">
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Design ID</p>
                  <p className="font-mono text-[9px] text-gray-400 break-all">{designId.current}</p>
                </div>

                <button onClick={handleSave}
                  className="w-full py-3.5 rounded-xl font-black text-sm text-white uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-105"
                  style={{ background: "#1A1A1A" }}>
                  <Save className="w-4 h-4" /> Save & Export
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

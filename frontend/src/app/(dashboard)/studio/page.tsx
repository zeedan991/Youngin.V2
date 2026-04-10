"use client";

import {
  useState, useRef, useEffect, useCallback, Suspense
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, ContactShadows, Environment, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import {
  ChevronDown, Save, Layers, Type, Image as ImageIcon, Shirt,
  Plus, Trash2, Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  Check, Loader2, X, ArrowLeft, FolderOpen, AlertCircle,
  Paintbrush, Search, RotateCcw, Eraser
} from "lucide-react";
import Link from "next/link";
import { saveDesignToDb, loadUserDesigns, deleteDesign, type Design, type DesignElement } from "./actions";

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

// ─── Improved 3D Garment Models ────────────────────────────────────────────
function TShirtModel({ mat }: { mat: any }) {
  return (
    <group>
      {/* Body - wider at shoulders, slight taper */}
      <mesh castShadow>
        <cylinderGeometry args={[0.82, 0.72, 2.0, 20]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Left sleeve - angled out */}
      <mesh position={[-1.08, 0.55, 0]} rotation={[0, 0, Math.PI / 2.5]} castShadow>
        <cylinderGeometry args={[0.22, 0.26, 0.88, 16]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Right sleeve */}
      <mesh position={[1.08, 0.55, 0]} rotation={[0, 0, -Math.PI / 2.5]} castShadow>
        <cylinderGeometry args={[0.22, 0.26, 0.88, 16]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Shoulder connector left */}
      <mesh position={[-0.72, 0.82, 0]} castShadow>
        <sphereGeometry args={[0.26, 12, 8]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Shoulder connector right */}
      <mesh position={[0.72, 0.82, 0]} castShadow>
        <sphereGeometry args={[0.26, 12, 8]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Collar - neckline ring */}
      <mesh position={[0, 1.08, 0]}>
        <torusGeometry args={[0.26, 0.08, 12, 32, Math.PI * 2]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Hem at bottom */}
      <mesh position={[0, -1.02, 0]}>
        <torusGeometry args={[0.74, 0.04, 8, 28]} />
        <meshStandardMaterial {...mat} roughness={(mat.roughness || 0.9) + 0.05} />
      </mesh>
    </group>
  );
}

function HoodieModel({ mat }: { mat: any }) {
  return (
    <group>
      <mesh castShadow>
        <cylinderGeometry args={[0.88, 0.76, 2.15, 20]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Left sleeve - longer than tshirt */}
      <mesh position={[-1.12, 0.5, 0]} rotation={[0, 0, Math.PI / 2.4]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 1.05, 16]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh position={[1.12, 0.5, 0]} rotation={[0, 0, -Math.PI / 2.4]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 1.05, 16]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh position={[-0.76, 0.82, 0]} castShadow>
        <sphereGeometry args={[0.27, 12, 8]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh position={[0.76, 0.82, 0]} castShadow>
        <sphereGeometry args={[0.27, 12, 8]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Hood */}
      <mesh position={[0, 1.42, -0.08]} castShadow>
        <sphereGeometry args={[0.52, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Hood rim */}
      <mesh position={[0, 1.18, 0.02]}>
        <torusGeometry args={[0.38, 0.045, 8, 18, Math.PI * 1.2]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Kangaroo pocket */}
      <mesh position={[0, -0.52, 0.45]} castShadow>
        <RoundedBox args={[0.92, 0.32, 0.06]} radius={0.04} smoothness={4}>
          <meshStandardMaterial {...mat} roughness={(mat.roughness||0.9)+0.06} />
        </RoundedBox>
      </mesh>
      {/* Drawstrings */}
      <mesh position={[-0.1, 1.15, 0.28]}>
        <cylinderGeometry args={[0.012, 0.012, 0.38, 6]} />
        <meshStandardMaterial color="#888" roughness={0.8} />
      </mesh>
      <mesh position={[0.1, 1.15, 0.28]}>
        <cylinderGeometry args={[0.012, 0.012, 0.38, 6]} />
        <meshStandardMaterial color="#888" roughness={0.8} />
      </mesh>
    </group>
  );
}

function JeansModel({ mat }: { mat: any }) {
  return (
    <group>
      {/* Waistband */}
      <mesh position={[0, 1.12, 0]} castShadow>
        <cylinderGeometry args={[0.75, 0.72, 0.22, 20]} />
        <meshStandardMaterial {...mat} roughness={(mat.roughness||0.9)+0.05} />
      </mesh>
      {/* Upper body / seat */}
      <mesh position={[0, 0.62, 0]} castShadow>
        <cylinderGeometry args={[0.72, 0.68, 0.72, 20]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.36, -0.55, 0]} castShadow>
        <cylinderGeometry args={[0.31, 0.22, 2.1, 14]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.36, -0.55, 0]} castShadow>
        <cylinderGeometry args={[0.31, 0.22, 2.1, 14]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Fly/seam detail */}
      <mesh position={[0, 0.65, 0.37]}>
        <cylinderGeometry args={[0.025, 0.025, 0.55, 6]} />
        <meshStandardMaterial color="#5a3e2b" roughness={0.9} />
      </mesh>
      {/* Belt loops x4 */}
      {[-0.55, -0.18, 0.18, 0.55].map((x, i) => (
        <mesh key={i} position={[x, 1.1, 0.36]}>
          <boxGeometry args={[0.08, 0.18, 0.04]} />
          <meshStandardMaterial {...mat} roughness={(mat.roughness||0.9)+0.05} />
        </mesh>
      ))}
    </group>
  );
}

function DressModel({ mat }: { mat: any }) {
  return (
    <group>
      {/* Fitted bodice */}
      <mesh position={[0, 0.82, 0]} castShadow>
        <cylinderGeometry args={[0.62, 0.52, 1.35, 20]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Flared skirt */}
      <mesh position={[0, -0.52, 0]} castShadow>
        <cylinderGeometry args={[0.52, 1.4, 1.95, 24]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Spaghetti straps */}
      <mesh position={[-0.3, 1.6, 0.04]} rotation={[0.12, 0, 0.08]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.45, 8]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh position={[0.3, 1.6, 0.04]} rotation={[0.12, 0, -0.08]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.45, 8]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Waist band accent */}
      <mesh position={[0, 0.16, 0]}>
        <torusGeometry args={[0.52, 0.038, 8, 28]} />
        <meshStandardMaterial {...mat} roughness={(mat.roughness||0.9)*0.7} />
      </mesh>
    </group>
  );
}

function JacketModel({ mat }: { mat: any }) {
  return (
    <group>
      {/* Main body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.9, 0.78, 2.1, 20]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Left sleeve */}
      <mesh position={[-1.15, 0.48, 0]} rotation={[0, 0, Math.PI / 2.6]} castShadow>
        <cylinderGeometry args={[0.21, 0.26, 1.1, 16]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh position={[1.15, 0.48, 0]} rotation={[0, 0, -Math.PI / 2.6]} castShadow>
        <cylinderGeometry args={[0.21, 0.26, 1.1, 16]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh position={[-0.77, 0.84, 0]} castShadow>
        <sphereGeometry args={[0.27, 12, 8]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh position={[0.77, 0.84, 0]} castShadow>
        <sphereGeometry args={[0.27, 12, 8]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Left lapel */}
      <mesh position={[-0.28, 0.82, 0.46]} rotation={[0, -0.3, 0.35]} castShadow>
        <RoundedBox args={[0.3, 0.68, 0.07]} radius={0.03} smoothness={4}>
          <meshStandardMaterial {...mat} roughness={(mat.roughness||0.9)*0.8} />
        </RoundedBox>
      </mesh>
      <mesh position={[0.28, 0.82, 0.46]} rotation={[0, 0.3, -0.35]} castShadow>
        <RoundedBox args={[0.3, 0.68, 0.07]} radius={0.03} smoothness={4}>
          <meshStandardMaterial {...mat} roughness={(mat.roughness||0.9)*0.8} />
        </RoundedBox>
      </mesh>
      {/* Collar */}
      <mesh position={[0, 1.12, 0.24]}>
        <RoundedBox args={[0.82, 0.2, 0.1]} radius={0.04} smoothness={4}>
          <meshStandardMaterial {...mat} />
        </RoundedBox>
      </mesh>
      {/* Buttons */}
      {[-0.45, -0.1, 0.25, 0.6].map((y, i) => (
        <mesh key={i} position={[0, y, 0.46]}>
          <cylinderGeometry args={[0.04, 0.04, 0.04, 12]} />
          <meshStandardMaterial color="#333" roughness={0.3} metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function PoloModel({ mat }: { mat: any }) {
  return (
    <group>
      <mesh castShadow>
        <cylinderGeometry args={[0.82, 0.72, 2.0, 20]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh position={[-1.06, 0.58, 0]} rotation={[0, 0, Math.PI / 2.5]} castShadow>
        <cylinderGeometry args={[0.21, 0.25, 0.82, 14]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh position={[1.06, 0.58, 0]} rotation={[0, 0, -Math.PI / 2.5]} castShadow>
        <cylinderGeometry args={[0.21, 0.25, 0.82, 14]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh position={[-0.7, 0.82, 0]} castShadow>
        <sphereGeometry args={[0.25, 12, 8]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh position={[0.7, 0.82, 0]} castShadow>
        <sphereGeometry args={[0.25, 12, 8]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Polo collar - wider, stiffer */}
      <mesh position={[0, 1.1, 0.06]} castShadow>
        <RoundedBox args={[0.68, 0.22, 0.14]} radius={0.04} smoothness={4}>
          <meshStandardMaterial {...mat} roughness={(mat.roughness||0.9)*0.75} />
        </RoundedBox>
      </mesh>
      {/* Button placket */}
      <mesh position={[0, 0.45, 0.42]}>
        <RoundedBox args={[0.13, 0.75, 0.04]} radius={0.015} smoothness={4}>
          <meshStandardMaterial color="#F0F0F0" roughness={0.9} />
        </RoundedBox>
      </mesh>
      {[-0.1, 0.1, 0.3].map((y, i) => (
        <mesh key={i} position={[0, y + 0.4, 0.46]}>
          <cylinderGeometry args={[0.03, 0.03, 0.03, 10]} />
          <meshStandardMaterial color="#ccc" roughness={0.3} metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function GarmentMesh({ type, color, roughness, metalness, texture }: {
  type: string; color: string; roughness: number; metalness: number; texture: THREE.CanvasTexture | null;
}) {
  const threeColor = new THREE.Color(color);
  const mat = { color: threeColor, roughness, metalness, map: texture };
  switch (type) {
    case "tshirt":  return <TShirtModel mat={mat} />;
    case "hoodie":  return <HoodieModel mat={mat} />;
    case "jeans":   return <JeansModel  mat={mat} />;
    case "dress":   return <DressModel  mat={mat} />;
    case "jacket":  return <JacketModel mat={mat} />;
    default:        return <PoloModel   mat={mat} />;
  }
}

// ─── Camera Preset Controller ───────────────────────────────────────────────
const VIEW_POSITIONS = {
  front: new THREE.Vector3(0, 0, 5.0),
  back:  new THREE.Vector3(0, 0, -5.0),
  side:  new THREE.Vector3(5.0, 0, 0),
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
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-4, 3, -3]} intensity={0.6} color="#C8D8FF" />
      <pointLight position={[0, -3, 4]} intensity={0.4} color="#FFF5E0" />
      <GarmentMesh type={type} color={color} roughness={roughness} metalness={metalness} texture={texture} />
      <ContactShadows position={[0, -1.7, 0]} opacity={0.3} scale={6} blur={3} />
      <mesh position={[0, -1.72, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
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
  const [brushColor,     setBrushColor]    = useState("#FF0000");
  const [brushSize,      setBrushSize]     = useState(20);
  const [isPaintMode,    setIsPaintMode]   = useState(false);
  const [isEraser,       setIsEraser]      = useState(false);
  const paintCanvasRef   = useRef<HTMLCanvasElement>(null);
  const isPainting       = useRef(false);
  const lastPaintPos     = useRef<{x: number; y: number} | null>(null);

  // Unsplash state
  const [unsplashQuery,  setUnsplashQuery]  = useState("");
  const [unsplashResults, setUnsplashResults] = useState<any[]>([]);
  const [unsplashLoading, setUnsplashLoading] = useState(false);

  // Textures
  const textCanvasRef    = useRef<HTMLCanvasElement | null>(null);
  const [texture,        setTexture]       = useState<THREE.CanvasTexture|null>(null);

  // Save state
  const [saving,         setSaving]        = useState(false);
  const [saved,          setSaved]         = useState(false);
  const [saveError,      setSaveError]     = useState<string|null>(null);
  const [designName,     setDesignName]    = useState("My Design");
  const [dbDesignId,     setDbDesignId]    = useState<string|undefined>(undefined);
  const [myDesigns,      setMyDesigns]     = useState<Design[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);

  const material = MATERIALS.find(m => m.id === materialId) || MATERIALS[0];

  // ─── Rebuild merged texture from text elements + paint canvas ──────────
  const rebuildTexture = useCallback((els: DesignElement[]) => {
    const size = 1024;
    const c = document.createElement("canvas");
    c.width = size; c.height = size;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, size, size);

    // Layer 1: paint strokes (if any)
    if (paintCanvasRef.current) {
      ctx.drawImage(paintCanvasRef.current, 0, 0, size, size);
    }

    // Layer 2: elements (text, images)
    els.forEach(el => {
      if (el.type === "text") {
        const w = el.bold   ? "bold "   : "";
        const s = el.italic ? "italic " : "";
        ctx.font = `${s}${w}${el.size * 4}px ${el.font}`;
        ctx.fillStyle = el.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // flipY is TRUE (default), so canvas Y=0 is the TOP of the garment
        // We draw at el.y% of canvas height - no extra flipping needed
        ctx.fillText(el.content, el.x / 100 * size, el.y / 100 * size);
      }
    });

    const tex = new THREE.CanvasTexture(c);
    // THREE default flipY=true: canvas top → mesh top. This is correct!
    textCanvasRef.current = c;
    setTexture(tex);
  }, []);

  useEffect(() => { rebuildTexture(elements); }, [elements, rebuildTexture]);

  // ─── Paint canvas handlers ─────────────────────────────────────────────
  const initPaintCanvas = useCallback(() => {
    const pc = paintCanvasRef.current;
    if (!pc) return;
    if (pc.width === 0) { pc.width = 512; pc.height = 512; }
  }, []);

  const handlePaintStart = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPaintMode) return;
    e.preventDefault();
    const pc = paintCanvasRef.current;
    if (!pc) return;
    isPainting.current = true;
    const rect = pc.getBoundingClientRect();
    lastPaintPos.current = {
      x: (e.clientX - rect.left) / rect.width * pc.width,
      y: (e.clientY - rect.top)  / rect.height * pc.height,
    };
    paint(e);
  };

  const handlePaintMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPainting.current || !isPaintMode) return;
    e.preventDefault();
    paint(e);
  };

  const handlePaintEnd = () => {
    isPainting.current = false;
    lastPaintPos.current = null;
    rebuildTexture(elements);
  };

  const paint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pc = paintCanvasRef.current;
    if (!pc) return;
    const ctx = pc.getContext("2d")!;
    const rect = pc.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * pc.width;
    const y = (e.clientY - rect.top)  / rect.height * pc.height;

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
    rebuildTexture(elements);
  };

  const clearPaintCanvas = () => {
    const pc = paintCanvasRef.current;
    if (!pc) return;
    const ctx = pc.getContext("2d")!;
    ctx.clearRect(0, 0, pc.width, pc.height);
    rebuildTexture(elements);
  };

  // ─── Unsplash search ──────────────────────────────────────────────────
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

  // Add unsplash image as an element drawn on the paint canvas
  const addUnsplashImage = async (url: string) => {
    const pc = paintCanvasRef.current;
    if (!pc) return;
    const ctx = pc.getContext("2d")!;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Draw the graphic in the center-chest area
      const x = pc.width * 0.25;
      const y = pc.height * 0.22;
      const w = pc.width * 0.5;
      const h = pc.height * 0.35;
      ctx.drawImage(img, x, y, w, h);
      rebuildTexture(elements);
    };
    img.src = url;
  };

  // ─── Add text element ─────────────────────────────────────────────────
  const addTextEl = () => {
    if (!textContent.trim()) return;
    const el: DesignElement = {
      id: `el_${Date.now()}`, type: "text",
      content: textContent, font: textFont, size: textSize,
      color: textColor, bold: textBold, italic: textItalic,
      x: 50, y: 35,  // center chest, 35% from top
    };
    setElements(prev => [...prev, el]);
    setSelectedEl(el.id);
  };

  const deleteEl = (id: string) => {
    setElements(prev => prev.filter(e => e.id !== id));
    if (selectedEl === id) setSelectedEl(null);
  };

  // ─── Save ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true); setSaveError(null);
    const result = await saveDesignToDb({
      id: dbDesignId, name: designName,
      garmentType, garmentColor,
      material: materialId, elements,
    });
    setSaving(false);
    if (result.success && result.id) {
      setDbDesignId(result.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setSaveError(result.error || "Save failed.");
    }
  };

  const loadDesign = (d: Design) => {
    setGarmentType(d.garment_type);
    setGarmentColor(d.garment_color);
    setMaterialId(d.material);
    setElements(d.elements as DesignElement[]);
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

  const handleDeleteDesign = async (id: string) => {
    await deleteDesign(id);
    setMyDesigns(prev => prev.filter(d => d.id !== id));
  };

  const LEFT_TABS = [
    { id: "garment",  label: "Garment",  Icon: Shirt     },
    { id: "text",     label: "Text",     Icon: Type      },
    { id: "paint",    label: "Paint",    Icon: Paintbrush },
    { id: "graphics", label: "Graphics", Icon: ImageIcon  },
    { id: "layers",   label: "Layers",   Icon: Layers    },
  ] as const;

  // ─── RENDER ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col" style={{ height: "100vh", background: "#F2F2F4", fontFamily: "'Inter', sans-serif" }}>

      {/* TOP BAR */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-gray-200 z-40 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="w-px h-5 bg-gray-200" />
          <span className="text-sm font-black tracking-tight text-gray-900 uppercase">Design Studio</span>
          {dbDesignId && (
            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg flex items-center gap-1">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
        </div>

        <input value={designName} onChange={e => setDesignName(e.target.value)}
          className="text-sm font-semibold text-center text-gray-700 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-gray-600 outline-none px-2 py-0.5 w-[200px]"
          placeholder="Untitled Design" />

        <div className="flex items-center gap-2.5">
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
            <FolderOpen className="w-3.5 h-3.5" /> My Designs
          </button>
          {saveError && (
            <div className="flex items-center gap-1.5 text-xs text-red-500">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[160px]">{saveError}</span>
            </div>
          )}
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: saved ? "#16A34A" : "#1A1A1A", minWidth: 86 }}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? "Saving…" : saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      {/* 3-COLUMN BODY */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
        <div className="w-[272px] shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-100">
            {LEFT_TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id as any)}
                className="flex-1 py-2 flex flex-col items-center gap-0.5 text-[8px] font-black uppercase tracking-wider transition-all"
                style={{ color: activeTab === t.id ? "#1A1A1A" : "#BBB", borderBottom: activeTab === t.id ? "2px solid #1A1A1A" : "2px solid transparent" }}>
                <t.Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">

            {/* ── GARMENT TAB ────────────────────────────────────────────── */}
            {activeTab === "garment" && (<>
              <div>
                <p className="panel-label mb-3" style={{ color: "#999", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }}>Garment Type</p>
                <div className="grid grid-cols-3 gap-2">
                  {GARMENT_TYPES.map(g => (
                    <button key={g.id} onClick={() => setGarmentType(g.id)}
                      className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 transition-all"
                      style={{ borderColor: garmentType === g.id ? "#1A1A1A" : "#EBEBEB", background: garmentType === g.id ? "#F5F5F5" : "#fff" }}>
                      <span className="text-xl">{g.icon}</span>
                      <span className="text-[9px] font-black uppercase tracking-wide text-gray-600">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ color: "#999", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }} className="mb-3">Color</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setGarmentColor(c)}
                      className="w-full aspect-square rounded-lg border-2 transition-all hover:scale-110"
                      style={{ background: c, borderColor: garmentColor === c ? "#1A1A1A" : c === "#FFFFFF" ? "#DDD" : c, boxShadow: garmentColor === c ? "0 0 0 3px rgba(0,0,0,0.18)" : "none" }} />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span style={{ color: "#999", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em" }}>Custom</span>
                  <input type="color" value={garmentColor} onChange={e => setGarmentColor(e.target.value)}
                    className="flex-1 h-8 rounded-lg cursor-pointer border border-gray-200" />
                </div>
              </div>
              <div>
                <p style={{ color: "#999", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }} className="mb-3">Material / Fabric</p>
                <div className="grid grid-cols-2 gap-2">
                  {MATERIALS.map(m => (
                    <button key={m.id} onClick={() => setMaterialId(m.id)}
                      className="py-2.5 px-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-wider transition-all"
                      style={{ borderColor: materialId === m.id ? "#1A1A1A" : "#EBEBEB", background: materialId === m.id ? "#1A1A1A" : "#fff", color: materialId === m.id ? "#fff" : "#777" }}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </>)}

            {/* ── TEXT TAB ───────────────────────────────────────────────── */}
            {activeTab === "text" && (<>
              <div>
                <p style={{ color: "#999", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }} className="mb-2">Text Content</p>
                <textarea value={textContent} onChange={e => setTextContent(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 outline-none resize-none focus:border-gray-500 transition-colors"
                  rows={2} placeholder="Enter your text…" />
              </div>
              <div>
                <p style={{ color: "#999", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }} className="mb-2">Font</p>
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
                  <p style={{ color: "#999", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }}>Font Size</p>
                  <span className="text-xs font-black text-gray-700">{textSize}px</span>
                </div>
                <input type="range" min={12} max={72} value={textSize} onChange={e => setTextSize(Number(e.target.value))} className="w-full accent-gray-900" />
              </div>
              <div>
                <p style={{ color: "#999", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }} className="mb-2">Text Color</p>
                <div className="flex items-center gap-2">
                  <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)}
                    className="w-10 h-9 rounded-lg cursor-pointer border border-gray-200 shrink-0" />
                  <input value={textColor} onChange={e => setTextColor(e.target.value)} maxLength={7}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono text-gray-700 outline-none focus:border-gray-600 uppercase" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setTextBold(b => !b)}
                  className="w-9 h-9 rounded-xl border-2 flex items-center justify-center font-black transition-all"
                  style={{ borderColor: textBold ? "#1A1A1A" : "#EBEBEB", background: textBold ? "#1A1A1A" : "#fff", color: textBold ? "#fff" : "#777" }}>
                  <Bold className="w-4 h-4" />
                </button>
                <button onClick={() => setTextItalic(b => !b)}
                  className="w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all"
                  style={{ borderColor: textItalic ? "#1A1A1A" : "#EBEBEB", background: textItalic ? "#1A1A1A" : "#fff", color: textItalic ? "#fff" : "#777" }}>
                  <Italic className="w-4 h-4" />
                </button>
                <div className="flex ml-auto border border-gray-200 rounded-xl overflow-hidden">
                  {(["left","center","right"] as const).map(a => (
                    <button key={a} onClick={() => setTextAlign(a)}
                      className="w-9 h-9 flex items-center justify-center transition-all"
                      style={{ background: textAlign === a ? "#1A1A1A" : "#fff", color: textAlign === a ? "#fff" : "#AAA" }}>
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
              <div className="rounded-xl border border-gray-100 p-3 bg-gray-50 text-center overflow-hidden min-h-[40px]"
                style={{ fontFamily: textFont, fontWeight: textBold ? "bold" : "normal", fontStyle: textItalic ? "italic" : "normal", fontSize: Math.max(12, textSize * 0.45), color: textColor, textAlign }}>
                {textContent || "Preview text here"}
              </div>
            </>)}

            {/* ── PAINT TAB ──────────────────────────────────────────────── */}
            {activeTab === "paint" && (<>
              <div className="flex items-center justify-between">
                <p style={{ color: "#999", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }}>Paint Mode</p>
                <button onClick={() => { setIsPaintMode(p => !p); setIsEraser(false); }}
                  className="px-3 py-1.5 rounded-xl text-xs font-black transition-all"
                  style={{ background: isPaintMode ? "#1A1A1A" : "#EBEBEB", color: isPaintMode ? "#fff" : "#666" }}>
                  {isPaintMode ? "Active" : "Activate"}
                </button>
              </div>
              {isPaintMode && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 font-semibold">
                  🎨 Paint mode is active! Draw directly on the paint canvas below the 3D view.
                </div>
              )}
              <div>
                <p style={{ color: "#999", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }} className="mb-2">Brush Color</p>
                <div className="flex items-center gap-2">
                  <input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)}
                    className="w-10 h-9 rounded-lg cursor-pointer border border-gray-200 shrink-0" />
                  <input value={brushColor} onChange={e => setBrushColor(e.target.value)} maxLength={7}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono text-gray-700 outline-none uppercase" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p style={{ color: "#999", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }}>Brush Size</p>
                  <span className="text-xs font-black text-gray-700">{brushSize}px</span>
                </div>
                <input type="range" min={2} max={80} value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-full accent-gray-900" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setIsEraser(false)}
                  className="py-2.5 rounded-xl border-2 text-xs font-black flex items-center justify-center gap-1.5 transition-all"
                  style={{ borderColor: !isEraser ? "#1A1A1A" : "#EBEBEB", background: !isEraser ? "#1A1A1A" : "#fff", color: !isEraser ? "#fff" : "#777" }}>
                  <Paintbrush className="w-3.5 h-3.5" /> Brush
                </button>
                <button onClick={() => setIsEraser(true)}
                  className="py-2.5 rounded-xl border-2 text-xs font-black flex items-center justify-center gap-1.5 transition-all"
                  style={{ borderColor: isEraser ? "#1A1A1A" : "#EBEBEB", background: isEraser ? "#1A1A1A" : "#fff", color: isEraser ? "#fff" : "#777" }}>
                  <Eraser className="w-3.5 h-3.5" /> Eraser
                </button>
              </div>
              <button onClick={clearPaintCanvas}
                className="w-full py-2.5 rounded-xl border border-red-200 text-xs font-black text-red-500 flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
                <RotateCcw className="w-3.5 h-3.5" /> Clear All Paint
              </button>
              {/* Quick paint colors */}
              <div>
                <p style={{ color: "#999", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }} className="mb-2">Quick Colors</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {["#FF0000","#FF6600","#FFD700","#00CC00","#0066FF","#9900FF","#FF00AA","#FFFFFF","#888888","#000000"].map(c => (
                    <button key={c} onClick={() => setBrushColor(c)}
                      className="w-full aspect-square rounded-lg border-2 transition-all hover:scale-110"
                      style={{ background: c, borderColor: brushColor === c ? "#1A1A1A" : c === "#FFFFFF" ? "#DDD" : c }} />
                  ))}
                </div>
              </div>
            </>)}

            {/* ── GRAPHICS TAB ───────────────────────────────────────────── */}
            {activeTab === "graphics" && (<>
              {/* Unsplash Image Search */}
              <div>
                <p style={{ color: "#999", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }} className="mb-2">Search Images</p>
                <div className="flex gap-2">
                  <input value={unsplashQuery} onChange={e => setUnsplashQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && searchUnsplash()}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none focus:border-gray-500 transition-colors"
                    placeholder="Search patterns, logos…" />
                  <button onClick={searchUnsplash} disabled={unsplashLoading}
                    className="px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-500 transition-all">
                    {unsplashLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" /> : <Search className="w-3.5 h-3.5 text-gray-500" />}
                  </button>
                </div>
              </div>

              {unsplashResults.length > 0 && (
                <div className="grid grid-cols-2 gap-1.5">
                  {unsplashResults.slice(0, 12).map(img => (
                    <button key={img.id} onClick={() => addUnsplashImage(img.urls.regular)}
                      className="rounded-xl overflow-hidden aspect-square hover:opacity-80 transition-opacity border-2 hover:border-gray-500 border-transparent">
                      <img src={img.urls.thumb} alt={img.alt_description || ""} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Quick emojis */}
              <div>
                <p style={{ color: "#999", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }} className="mb-2">Quick Shapes</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {["⭐","❤️","🔶","➕","🌟","◼","▲","⬡","🔥","💎"].map((s,i) => (
                    <button key={i} onClick={() => setElements(prev => [...prev, {
                      id: `el_${Date.now()+i}`, type: "text", content: s,
                      font: "Arial", size: 42, color: "#000000", bold: false, italic: false, x: 50, y: 38,
                    }])}
                    className="aspect-square rounded-xl border border-gray-200 flex items-center justify-center text-xl hover:border-gray-500 hover:bg-gray-50 transition-all">
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p style={{ color: "#999", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }} className="mb-2">Brand Text</p>
                {["ORIGINAL","LIMITED","EXCLUSIVE","CLASSIC","PREMIUM"].map(badge => (
                  <button key={badge} onClick={() => setElements(prev => [...prev, {
                    id: `el_${Date.now()}`, type: "text", content: badge,
                    font: "Arial", size: 18, color: "#1A1A1A", bold: true, italic: false, x: 50, y: 35,
                  }])}
                  className="w-full mb-1.5 py-2 px-3 rounded-lg border border-gray-200 text-xs font-black uppercase tracking-widest text-gray-600 text-left hover:border-gray-500 hover:bg-gray-50 transition-all">
                    {badge}
                  </button>
                ))}
              </div>
            </>)}

            {/* ── LAYERS TAB ─────────────────────────────────────────────── */}
            {activeTab === "layers" && (
              <div className="space-y-2">
                <p style={{ color: "#999", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }} className="mb-3">Design Layers ({elements.length})</p>
                {elements.length === 0 && (
                  <div className="text-center py-10 text-gray-300">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-semibold">No elements. Add text or graphics.</p>
                  </div>
                )}
                {elements.map((el, i) => (
                  <div key={el.id} onClick={() => setSelectedEl(el.id)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer border transition-all"
                    style={{ borderColor: selectedEl === el.id ? "#1A1A1A" : "#EBEBEB", background: selectedEl === el.id ? "#F5F5F5" : "#fff" }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] shrink-0 font-black" style={{ background: "#1A1A1A", color: "#fff" }}>{i+1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{el.content}</p>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wide">{el.font} · {el.size}px</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); deleteEl(el.id); }}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── CENTER: 3D VIEWPORT ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* 3D Canvas */}
          <div className="flex-1 relative" style={{ background: "linear-gradient(135deg, #ECECEC 0%, #F8F8F8 50%, #ECECEC 100%)" }}>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-gray-200">
                {GARMENT_TYPES.find(g => g.id === garmentType)?.label} — {material.label}
              </span>
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <span className="text-[9px] font-semibold text-gray-300 bg-white/60 backdrop-blur px-2.5 py-1.5 rounded-full border border-gray-100">
                Drag to rotate · Scroll to zoom
              </span>
            </div>

            <Canvas shadows gl={{ antialias: true, alpha: false }} style={{ width: "100%", height: "100%", cursor: isPaintMode ? "crosshair" : "grab" }}>
              <color attach="background" args={["#F5F5F5"]} />
              <PerspectiveCamera makeDefault position={[0,0,5.0]} fov={40} />
              <Suspense fallback={null}>
                <GarmentScene type={garmentType} color={garmentColor} roughness={material.roughness} metalness={material.metalness} texture={texture} />
                <Environment preset="studio" background={false} />
              </Suspense>
              <CameraController view={cameraView} />
              <OrbitControls enablePan enableZoom minDistance={2.5} maxDistance={10} makeDefault enabled={!isPaintMode} />
            </Canvas>
          </div>

          {/* Paint Canvas Overlay (hidden under 3D unless paint mode) */}
          {isPaintMode && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <div className="relative" style={{ width: "min(400px, 70%)", aspectRatio: "1/1", pointerEvents: "all" }}>
                <div className="absolute -top-8 left-0 right-0 text-center">
                  <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full">PAINT MODE — Draw here</span>
                </div>
                <canvas
                  ref={el => {
                    (paintCanvasRef as any).current = el;
                    if (el && el.width === 0) { el.width = 512; el.height = 512; }
                  }}
                  width={512} height={512}
                  className="rounded-2xl border-2 border-blue-400 cursor-crosshair"
                  style={{ width: "100%", height: "100%", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(4px)" }}
                  onPointerDown={handlePaintStart}
                  onPointerMove={handlePaintMove}
                  onPointerUp={handlePaintEnd}
                  onPointerLeave={handlePaintEnd}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
        <div className="w-[260px] shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-100">
            {[
              { id: "summary",   label: "Summary",    Icon: Layers     },
              { id: "mydesigns", label: "My Designs", Icon: FolderOpen },
            ].map(t => (
              <button key={t.id}
                onClick={() => t.id === "mydesigns" ? openMyDesigns() : setRightTab("summary")}
                className="flex-1 py-2.5 flex flex-col items-center gap-0.5 text-[9px] font-black uppercase tracking-wider transition-all"
                style={{ color: rightTab === t.id ? "#1A1A1A" : "#BBB", borderBottom: rightTab === t.id ? "2px solid #1A1A1A" : "2px solid transparent" }}>
                <t.Icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {rightTab === "summary" && (
              <div className="space-y-4">
                <div className="space-y-2 text-xs">
                  <p style={{ color: "#999", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }}>Design Overview</p>
                  {[
                    ["Garment", GARMENT_TYPES.find(g => g.id === garmentType)?.label],
                    ["Material", material.label],
                    ["Elements", elements.length],
                    ["Status", dbDesignId ? "✓ Saved" : "Unsaved"],
                  ].map(([k, v]) => (
                    <div key={String(k)} className="flex justify-between">
                      <span className="text-gray-500 font-semibold">{k}</span>
                      <span className={`font-black ${String(v).startsWith("✓") ? "text-emerald-600" : "text-gray-800"}`}>{String(v)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-semibold">Color</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded border border-gray-200" style={{ background: garmentColor }} />
                      <span className="font-black text-gray-800 font-mono uppercase text-[10px]">{garmentColor}</span>
                    </div>
                  </div>
                </div>

                {elements.length > 0 && (
                  <div className="rounded-xl border border-gray-100 p-3 bg-gray-50">
                    <p style={{ color: "#999", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }} className="mb-2">Elements</p>
                    <div className="space-y-1">
                      {elements.map((el, i) => (
                        <div key={el.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-gray-100">
                          <span className="text-[9px] font-black text-gray-400 w-3">{i+1}</span>
                          <div className="w-3 h-3 rounded-full border border-gray-200" style={{ background: el.color }} />
                          <span className="text-[10px] font-bold text-gray-700 truncate flex-1">{el.content}</span>
                          <button onClick={() => deleteEl(el.id)} className="text-gray-300 hover:text-red-400 transition-colors shrink-0">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {saveError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{saveError}
                  </div>
                )}

                <button onClick={handleSave} disabled={saving}
                  className="w-full py-3.5 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                  style={{ background: saved ? "#16A34A" : "#1A1A1A" }}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving to DB…" : saved ? "Saved!" : "Save Design"}
                </button>
              </div>
            )}

            {rightTab === "mydesigns" && (
              <div className="space-y-3">
                <p style={{ color: "#999", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }}>Saved Designs ({myDesigns.length})</p>
                {loadingDesigns ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
                ) : myDesigns.length === 0 ? (
                  <div className="text-center py-10 text-gray-300">
                    <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-semibold">No saved designs yet.</p>
                  </div>
                ) : (
                  myDesigns.map(d => (
                    <div key={d.id} className="border border-gray-200 rounded-2xl p-3 hover:border-gray-400 transition-all cursor-pointer group" onClick={() => loadDesign(d)}>
                      <div className="flex items-start gap-2 mb-2">
                        <div className="w-9 h-9 rounded-xl border border-gray-200 shrink-0 flex items-center justify-center text-lg" style={{ background: d.garment_color || "#F5F5F5" }}>
                          {{ tshirt:"👕", hoodie:"🧥", jeans:"👖", dress:"👗", jacket:"🥼", polo:"🎽" }[d.garment_type] || "👕"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{d.name}</p>
                          <p className="text-[10px] text-gray-400 capitalize">{d.garment_type} · {d.material}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-gray-400">{new Date(d.updated_at).toLocaleDateString()}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={e => { e.stopPropagation(); loadDesign(d); }}
                            className="text-[9px] font-bold text-gray-700 px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">Load</button>
                          <button onClick={e => { e.stopPropagation(); handleDeleteDesign(d.id); }}
                            className="text-[9px] font-bold text-red-400 px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">Del</button>
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

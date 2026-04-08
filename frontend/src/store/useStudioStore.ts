import { create } from "zustand";
import type { Canvas as FabricCanvas } from "fabric";

export type GarmentType =
  | "tshirt"
  | "hoodie"
  | "crewneck"
  | "jacket"
  | "pants"
  | "sneakers"
  | "totebag"
  | "cap";

export type ActiveTool =
  | "select"
  | "text"
  | "shape"
  | "draw"
  | "image"
  | "ai";

export interface GarmentConfig {
  id: GarmentType;
  label: string;
  emoji: string;
  canvasWidth: number;   // px at 72dpi — multiplied x4 for print
  canvasHeight: number;
  printWidth: string;    // Real-world cm
  printHeight: string;
  printZone: string;
  bgColor: string;
  has3D: boolean;
}

export const GARMENTS: GarmentConfig[] = [
  { id: "tshirt",   label: "Classic T-Shirt",   emoji: "👕", canvasWidth: 520, canvasHeight: 640, printWidth: "28cm", printHeight: "36cm", printZone: "front-chest",   bgColor: "#FFFFFF", has3D: true  },
  { id: "hoodie",   label: "Hoodie",             emoji: "🧥", canvasWidth: 560, canvasHeight: 680, printWidth: "30cm", printHeight: "38cm", printZone: "front-pocket",  bgColor: "#CCCCCC", has3D: true  },
  { id: "crewneck", label: "Crewneck",            emoji: "🧣", canvasWidth: 540, canvasHeight: 650, printWidth: "29cm", printHeight: "37cm", printZone: "front-chest",   bgColor: "#F5F5F5", has3D: true  },
  { id: "jacket",   label: "Bomber Jacket",       emoji: "🧣", canvasWidth: 580, canvasHeight: 700, printWidth: "32cm", printHeight: "40cm", printZone: "back-panel",    bgColor: "#111111", has3D: true  },
  { id: "pants",    label: "Cargo Pants",         emoji: "👖", canvasWidth: 480, canvasHeight: 720, printWidth: "26cm", printHeight: "56cm", printZone: "front-left",    bgColor: "#4A4A4A", has3D: false },
  { id: "sneakers", label: "Sneakers",            emoji: "👟", canvasWidth: 600, canvasHeight: 400, printWidth: "34cm", printHeight: "22cm", printZone: "side-panel",    bgColor: "#FFFFFF", has3D: false },
  { id: "totebag",  label: "Tote Bag",            emoji: "👜", canvasWidth: 500, canvasHeight: 500, printWidth: "28cm", printHeight: "28cm", printZone: "front-panel",   bgColor: "#F5C842", has3D: false },
  { id: "cap",      label: "Cap / Hat",           emoji: "🧢", canvasWidth: 480, canvasHeight: 320, printWidth: "20cm", printHeight: "14cm", printZone: "front-panel",   bgColor: "#1A1A1A", has3D: false },
];

export interface StudioState {
  // Garment
  currentGarment: GarmentConfig;
  garmentColor: string;

  // Active tool on the canvas
  activeTool: ActiveTool;

  // Fabric canvas instance (set via ref)
  fabricCanvas: FabricCanvas | null;

  // History
  historyIndex: number;
  history: string[];

  // AI state
  isGeneratingAI: boolean;
  aiPrompt: string;

  // Unsplash
  unsplashQuery: string;
  unsplashResults: any[];
  isSearchingImages: boolean;

  // Active right panel tab
  rightPanel: "layers" | "filters" | "ai" | "export";

  // Save state
  designTitle: string;
  isSaving: boolean;
  lastSaved: Date | null;

  // Actions
  setGarment: (g: GarmentConfig) => void;
  setGarmentColor: (c: string) => void;
  setActiveTool: (t: ActiveTool) => void;
  setFabricCanvas: (c: FabricCanvas | null) => void;
  pushHistory: (json: string) => void;
  undo: () => void;
  redo: () => void;
  setAIPrompt: (p: string) => void;
  setIsGeneratingAI: (v: boolean) => void;
  setUnsplashQuery: (q: string) => void;
  setUnsplashResults: (r: any[]) => void;
  setIsSearchingImages: (v: boolean) => void;
  setRightPanel: (p: "layers" | "filters" | "ai" | "export") => void;
  setDesignTitle: (t: string) => void;
  setIsSaving: (v: boolean) => void;
  setLastSaved: (d: Date) => void;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  currentGarment: GARMENTS[0],
  garmentColor: "#FFFFFF",
  activeTool: "select",
  fabricCanvas: null,
  historyIndex: -1,
  history: [],
  isGeneratingAI: false,
  aiPrompt: "",
  unsplashQuery: "",
  unsplashResults: [],
  isSearchingImages: false,
  rightPanel: "ai",
  designTitle: "Untitled Design",
  isSaving: false,
  lastSaved: null,

  setGarment: (g) => set({ currentGarment: g }),
  setGarmentColor: (c) => set({ garmentColor: c }),
  setActiveTool: (t) => set({ activeTool: t }),
  setFabricCanvas: (c) => set({ fabricCanvas: c }),

  pushHistory: (json) => {
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(json);
    // cap at 50 steps
    if (newHistory.length > 50) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex, fabricCanvas } = get();
    if (historyIndex <= 0 || !fabricCanvas) return;
    const newIndex = historyIndex - 1;
    const snapshot = history[newIndex];
    fabricCanvas.loadFromJSON(snapshot).then(() => fabricCanvas.renderAll());
    set({ historyIndex: newIndex });
  },

  redo: () => {
    const { history, historyIndex, fabricCanvas } = get();
    if (historyIndex >= history.length - 1 || !fabricCanvas) return;
    const newIndex = historyIndex + 1;
    const snapshot = history[newIndex];
    fabricCanvas.loadFromJSON(snapshot).then(() => fabricCanvas.renderAll());
    set({ historyIndex: newIndex });
  },

  setAIPrompt: (p) => set({ aiPrompt: p }),
  setIsGeneratingAI: (v) => set({ isGeneratingAI: v }),
  setUnsplashQuery: (q) => set({ unsplashQuery: q }),
  setUnsplashResults: (r) => set({ unsplashResults: r }),
  setIsSearchingImages: (v) => set({ isSearchingImages: v }),
  setRightPanel: (p) => set({ rightPanel: p }),
  setDesignTitle: (t) => set({ designTitle: t }),
  setIsSaving: (v) => set({ isSaving: v }),
  setLastSaved: (d) => set({ lastSaved: d }),
}));

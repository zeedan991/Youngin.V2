import { create } from "zustand";

interface StudioState {
  currentColor: string;
  currentMaterial: "matte" | "glossy" | "metallic";
  activeTab: "colors" | "textures" | "logo";
  setColor: (color: string) => void;
  setMaterial: (material: "matte" | "glossy" | "metallic") => void;
  setActiveTab: (tab: "colors" | "textures" | "logo") => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  currentColor: "#00E5FF",
  currentMaterial: "matte",
  activeTab: "colors",
  setColor: (color) => set({ currentColor: color }),
  setMaterial: (material) => set({ currentMaterial: material }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

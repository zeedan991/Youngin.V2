"use client";
import { useState, useCallback } from "react";
import { useStudioStore } from "@/store/useStudioStore";
import { cn } from "@/lib/utils";
import {
  Wand2,
  Layers,
  SlidersHorizontal,
  Download,
  Loader2,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Lock,
} from "lucide-react";
import jsPDF from "jspdf";
import { createClient } from "@/utils/supabase/client";

const TABS = [
  { id: "ai" as const, icon: Wand2, label: "AI" },
  { id: "layers" as const, icon: Layers, label: "Layers" },
  { id: "filters" as const, icon: SlidersHorizontal, label: "Adjust" },
  { id: "export" as const, icon: Download, label: "Export" },
];

export function PanelRight() {
  const {
    rightPanel,
    setRightPanel,
    fabricCanvas,
    currentGarment,
    garmentColor,
    designTitle,
    setIsSaving,
    setLastSaved,
  } = useStudioStore();
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState("");

  // ── AI Graphic Generation ──
  const generateAIGraphic = async () => {
    if (!aiPrompt.trim() || !fabricCanvas) return;
    setIsGenerating(true);
    setAiError("");
    try {
      const res = await fetch("/api/ai/generate-graphic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (data.error) {
        setAiError(data.error);
        return;
      }

      const { FabricImage } = await import("fabric");
      const img = await FabricImage.fromURL(
        `data:image/png;base64,${data.imageBase64}`,
        { crossOrigin: "anonymous" },
      );
      img.scaleToWidth(Math.min(fabricCanvas.getWidth() * 0.55, 320));
      img.set({ left: 80, top: 80 });
      fabricCanvas.add(img);
      fabricCanvas.setActiveObject(img);
      fabricCanvas.renderAll();
      setAiPrompt("");
    } catch {
      setAiError("Generation failed. Check your API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Export: High-Res PNG ──
  const exportPNG = useCallback(() => {
    if (!fabricCanvas) return;
    const dataURL = fabricCanvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 4, // 4x = ~300 DPI at standard screen size
    });
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = `${designTitle.replace(/\s+/g, "_")}_300dpi.png`;
    a.click();
  }, [fabricCanvas, designTitle]);

  // ── Export: Tech Spec PDF ──
  const exportPDF = useCallback(async () => {
    if (!fabricCanvas) return;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const canvasDataURL = fabricCanvas.toDataURL({
      format: "png",
      multiplier: 3,
    });

    // Page 1: Design Preview
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("YOUNGIN — Technical Design Sheet", 15, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Design: ${designTitle}`, 15, 30);
    doc.text(`Garment: ${currentGarment.label}`, 15, 36);
    doc.text(`Print Zone: ${currentGarment.printZone}`, 15, 42);
    doc.text(
      `Print Size: ${currentGarment.printWidth} × ${currentGarment.printHeight}`,
      15,
      48,
    );
    doc.text(`Export DPI: 300`, 15, 54);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 60);

    doc.addImage(canvasDataURL, "PNG", 15, 68, 180, 180);

    // Page 2: Specs
    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("Color & Placement Specifications", 15, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text(`Garment Base Color: ${garmentColor} (HEX)`, 15, 35);
    doc.text(`Print Area Starts: 3cm below collar, centered`, 15, 42);
    doc.text(`File Format: PNG with transparent background`, 15, 49);
    doc.text(`Color Mode: sRGB — convert to CMYK when printing`, 15, 56);
    doc.text(`Recommended Print Method: DTG or Screen Print`, 15, 63);
    doc.text(`\nIMPORTANT: Verify print dimensions with your factory`, 15, 70);

    doc.save(`${designTitle.replace(/\s+/g, "_")}_spec_sheet.pdf`);
  }, [fabricCanvas, designTitle, currentGarment, garmentColor]);

  // ── Save to Supabase / R2 ──
  const saveDesign = useCallback(async () => {
    if (!fabricCanvas) return;
    setIsSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const dataURL = fabricCanvas.toDataURL({ format: "png", multiplier: 2 });
      const configJSON = JSON.stringify(fabricCanvas.toJSON());

      const blob = await (await fetch(dataURL)).blob();
      const file = new File([blob], `${designTitle}.png`, {
        type: "image/png",
      });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "3d_design");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();

      await supabase.from("designs").insert({
        user_id: user.id,
        title: designTitle,
        type: currentGarment.id,
        storage_url: uploadData.url || uploadData.path,
        configuration: configJSON,
      });

      setLastSaved(new Date());
    } catch (e) {
      console.error("Save error", e);
    } finally {
      setIsSaving(false);
    }
  }, [fabricCanvas, designTitle, currentGarment, setIsSaving, setLastSaved]);

  // ── Layers: get canvas objects ──
  const getObjects = () => fabricCanvas?.getObjects() ?? [];
  const deleteSelected = () => {
    const active = fabricCanvas?.getActiveObject();
    if (active && fabricCanvas) {
      fabricCanvas.remove(active);
      fabricCanvas.renderAll();
    }
  };

  return (
    <div className="w-80 bg-[#111] border-l border-[#1E1E1E] flex flex-col h-full overflow-hidden shrink-0">
      {/* Tab header */}
      <div className="flex border-b border-[#1E1E1E]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setRightPanel(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-all",
                rightPanel === tab.id
                  ? "text-[#00E5FF] border-b-2 border-[#00E5FF]"
                  : "text-[#444] hover:text-[#888]",
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* ───── AI PANEL ──── */}
        {rightPanel === "ai" && (
          <div className="space-y-4">
            <div>
              <p className="text-white font-bold text-sm mb-1">
                ✨ AI Graphic Generator
              </p>
              <p className="text-[#555] text-xs mb-3">
                Describe a pattern, graphic, or illustration. Gemini AI will
                generate it directly on your canvas.
              </p>

              <div className="space-y-2">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. a bold dragon breathing fire in neon colors, cyberpunk style…"
                  rows={4}
                  className="w-full bg-[#1A1A1A] text-white text-xs px-3 py-2.5 rounded-xl border border-[#2A2A2A] outline-none focus:border-[#00E5FF]/40 placeholder-[#444] resize-none"
                />
                <button
                  onClick={generateAIGraphic}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-[#00E5FF] text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Generate Graphic
                    </>
                  )}
                </button>
                {aiError && <p className="text-red-400 text-xs">{aiError}</p>}
              </div>
            </div>

            {/* Quick prompts */}
            <div>
              <p className="text-[10px] text-[#555] uppercase tracking-[3px] mb-2 font-bold">
                Quick Prompts
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Abstract geometric pattern",
                  "Vintage floral print",
                  "Bold graffiti tag",
                  "Japanese wave art",
                  "Minimalist logo mark",
                  "Tie-dye swirl effect",
                  "Leopard print texture",
                  "Circuit board pattern",
                ].map((p) => (
                  <button
                    key={p}
                    onClick={() => setAiPrompt(p)}
                    className="text-[10px] px-2.5 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-[#666] hover:text-[#00E5FF] hover:border-[#00E5FF]/30 transition-all font-medium"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ───── LAYERS PANEL ──── */}
        {rightPanel === "layers" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-bold text-sm">
                Layers ({getObjects().length})
              </p>
              <button
                onClick={deleteSelected}
                className="text-[#555] hover:text-red-400 transition-colors p-1 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {getObjects().length === 0 && (
              <p className="text-[#444] text-xs text-center py-8">
                No objects on canvas yet.
                <br />
                Add text, shapes, or images!
              </p>
            )}
            {[...getObjects()].reverse().map((obj, i) => (
              <div
                key={i}
                onClick={() => {
                  if (fabricCanvas) {
                    fabricCanvas.setActiveObject(obj);
                    fabricCanvas.renderAll();
                  }
                }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] cursor-pointer hover:border-[#00E5FF]/30 transition-all group"
              >
                <div
                  className="w-6 h-6 rounded-md border border-[#333] shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: (obj as any).fill || "#333" }}
                >
                  {(obj as any).type === "i-text" ||
                  (obj as any).type === "text" ? (
                    <span className="text-[8px] text-white font-bold">T</span>
                  ) : null}
                </div>
                <span className="text-[#888] text-xs font-medium capitalize flex-1 truncate">
                  {(obj as any).type === "i-text"
                    ? `"${(obj as any).text?.substring(0, 20)}…"`
                    : (obj as any).type}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ───── FILTERS/ADJUST PANEL ──── */}
        {rightPanel === "filters" && (
          <div className="space-y-4">
            <p className="text-white font-bold text-sm mb-2">
              Object Adjustments
            </p>
            <p className="text-[#555] text-xs">
              Select an object on the canvas to apply adjustments.
            </p>
            <div className="space-y-3">
              {[
                {
                  label: "Opacity",
                  prop: "opacity",
                  min: 0,
                  max: 1,
                  step: 0.01,
                },
                { label: "Rotation", prop: "angle", min: 0, max: 360, step: 1 },
              ].map(({ label, prop, min, max, step }) => (
                <div key={prop}>
                  <div className="flex justify-between text-xs text-[#555] mb-1">
                    <span>{label}</span>
                    <span>
                      {Math.round(
                        ((fabricCanvas?.getActiveObject() as any)?.[prop] ??
                          1) * (prop === "opacity" ? 100 : 1),
                      )}
                      {prop === "opacity" ? "%" : "°"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={
                      (fabricCanvas?.getActiveObject() as any)?.[prop] ??
                      (prop === "opacity" ? 1 : 0)
                    }
                    onChange={(e) => {
                      const obj = fabricCanvas?.getActiveObject();
                      if (obj && fabricCanvas) {
                        obj.set(prop as any, +e.target.value);
                        fabricCanvas.renderAll();
                      }
                    }}
                    className="w-full accent-[#00E5FF]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ───── EXPORT PANEL ──── */}
        {rightPanel === "export" && (
          <div className="space-y-4">
            <div>
              <p className="text-white font-bold text-sm mb-1">Export Design</p>
              <p className="text-[#555] text-xs mb-4">
                All exports are production-ready for tailors and factories.
              </p>
            </div>

            <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] p-4 space-y-2">
              <p className="text-xs font-bold text-[#888] uppercase tracking-wider">
                Print Specifications
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#555]">Garment</span>
                  <span className="text-white font-medium">
                    {currentGarment.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#555]">Print Size</span>
                  <span className="text-white font-medium">
                    {currentGarment.printWidth} × {currentGarment.printHeight}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#555]">Print Zone</span>
                  <span className="text-white font-medium capitalize">
                    {currentGarment.printZone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#555]">Export DPI</span>
                  <span className="text-[#00E5FF] font-bold">300 DPI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#555]">Format</span>
                  <span className="text-white font-medium">
                    PNG (transparent)
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={exportPNG}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#00E5FF] text-[#0A0A0A] font-black text-sm hover:bg-[#33eeff] transition-all"
            >
              <Download className="w-4 h-4" />
              Download 300 DPI PNG
            </button>

            <button
              onClick={exportPDF}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#00E5FF]/30 text-[#00E5FF] font-bold text-sm hover:bg-[#00E5FF]/5 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Tech Spec PDF
            </button>

            <div className="w-full h-px bg-[#1E1E1E]" />

            <button
              onClick={saveDesign}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#F5C842] text-[#0A0A0A] font-black text-sm hover:bg-yellow-300 transition-all"
            >
              ☁️ Save to My Locker
            </button>
            <p className="text-center text-[10px] text-[#444]">
              Designs saved here appear in your profile history and can be sent
              to tailors or our partner factories.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

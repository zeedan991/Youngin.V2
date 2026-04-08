"use client";
import { useEffect, useRef, useCallback } from "react";
import { Canvas, FabricImage, FabricText, Rect, Circle, Triangle } from "fabric";
import { useStudioStore } from "@/store/useStudioStore";

export function FabricCanvas() {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const {
    currentGarment,
    garmentColor,
    activeTool,
    setFabricCanvas,
    pushHistory,
    fabricCanvas,
  } = useStudioStore();

  // Initialize canvas once
  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new Canvas(canvasElRef.current, {
      width: currentGarment.canvasWidth,
      height: currentGarment.canvasHeight,
      backgroundColor: garmentColor,
      selection: true,
      preserveObjectStacking: true,
    });

    setFabricCanvas(canvas);

    // Push initial state to history
    canvas.toJSON && pushHistory(JSON.stringify(canvas.toJSON()));

    // Track changes for history
    const handleModified = () => {
      pushHistory(JSON.stringify(canvas.toJSON()));
    };

    canvas.on("object:added", handleModified);
    canvas.on("object:modified", handleModified);
    canvas.on("object:removed", handleModified);

    return () => {
      canvas.dispose();
      setFabricCanvas(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync garment color changes to canvas background
  useEffect(() => {
    if (!fabricCanvas) return;
    fabricCanvas.set("backgroundColor", garmentColor);
    fabricCanvas.renderAll();
  }, [garmentColor, fabricCanvas]);

  // Sync canvas size when garment changes
  useEffect(() => {
    if (!fabricCanvas) return;
    fabricCanvas.setWidth(currentGarment.canvasWidth);
    fabricCanvas.setHeight(currentGarment.canvasHeight);
    fabricCanvas.set("backgroundColor", currentGarment.bgColor);
    fabricCanvas.clear();
    fabricCanvas.renderAll();
  }, [currentGarment.id]); // eslint-disable-line

  // Sync active tool: drawing mode
  useEffect(() => {
    if (!fabricCanvas) return;
    fabricCanvas.isDrawingMode = activeTool === "draw";
    if (activeTool === "draw" && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.width = 4;
      // @ts-ignore
      fabricCanvas.freeDrawingBrush.color = "#000000";
    }
  }, [activeTool, fabricCanvas]);

const GARMENT_SHAPES: Record<string, string> = {
  tshirt: "polygon(30% 10%, 40% 15%, 60% 15%, 70% 10%, 95% 25%, 85% 45%, 75% 35%, 70% 95%, 30% 95%, 25% 35%, 15% 45%, 5% 25%)",
  hoodie: "polygon(35% 0%, 65% 0%, 70% 15%, 95% 30%, 85% 55%, 75% 40%, 70% 95%, 30% 95%, 25% 40%, 15% 55%, 5% 30%, 30% 15%)",
  crewneck: "polygon(35% 10%, 65% 10%, 75% 15%, 95% 30%, 85% 50%, 75% 38%, 70% 95%, 30% 95%, 25% 38%, 15% 50%, 5% 30%, 25% 15%)",
  jacket: "polygon(35% 5%, 50% 15%, 65% 5%, 75% 15%, 95% 35%, 80% 50%, 70% 35%, 70% 95%, 30% 95%, 30% 35%, 20% 50%, 5% 35%, 25% 15%)",
  pants: "polygon(25% 5%, 75% 5%, 85% 95%, 55% 95%, 50% 35%, 45% 95%, 15% 95%)",
  sneakers: "polygon(10% 40%, 30% 20%, 50% 20%, 70% 40%, 90% 70%, 90% 90%, 10% 90%)",
  totebag: "polygon(25% 10%, 35% 10%, 35% 25%, 65% 25%, 65% 10%, 75% 10%, 75% 30%, 95% 30%, 95% 95%, 5% 95%, 5% 30%, 25% 30%)",
  cap: "polygon(25% 40%, 40% 20%, 60% 20%, 75% 40%, 95% 50%, 95% 60%, 75% 55%, 75% 90%, 25% 90%, 25% 55%, 5% 60%, 5% 50%)"
};

  return (
    <div className="flex items-center justify-center w-full h-full overflow-auto bg-[#111111] relative">
      
      {/* PROFESSIONAL CAD BLUEPRINT SILHOUETTE */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none opacity-20">
        <div 
          className="bg-[#00E5FF] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{ 
            width: "800px", 
            height: "900px",
            clipPath: GARMENT_SHAPES[currentGarment.id] || GARMENT_SHAPES.tshirt,
            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,229,255,0.2) 10px, rgba(0,229,255,0.2) 20px)"
          }}
        />
      </div>

      {/* DESIGN BOUNDING BOX (Print Safe Zone) */}
      <div
        className="relative shadow-2xl transition-all duration-500 z-10"
        style={{
          boxShadow: "0 0 60px rgba(0,229,255,0.05)",
        }}
      >
        {/* Print Safe Zone Guidelines */}
        <div className="absolute inset-0 border-2 border-dashed border-[#00E5FF]/40 pointer-events-none" />
        <div className="absolute -top-6 left-0 right-0 flex justify-between text-[10px] text-[#555] font-mono px-2">
          <span>0cm</span>
          <span className="text-[#00E5FF] font-bold px-2 py-0.5 bg-black/40 rounded-full">{currentGarment.printWidth} × {currentGarment.printHeight} (Print Safe Zone)</span>
          <span>{currentGarment.printWidth}</span>
        </div>

        {/* Height Indicators */}
        <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-between text-[10px] text-[#555] font-mono py-2">
          <span>0cm</span>
          <span className="[writing-mode:vertical-rl] rotate-180 text-[#00E5FF]">{currentGarment.printHeight}</span>
          <span>&darr;</span>
        </div>

        <canvas
          ref={canvasElRef}
          className="block"
          style={{ cursor: activeTool === "text" ? "text" : activeTool === "draw" ? "crosshair" : "default" }}
        />

        {/* Bottom label */}
        <div className="absolute -bottom-8 left-0 right-0 flex items-center justify-between px-2 text-[10px] text-[#555] font-mono">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/> 300 DPI READY</span>
          <span>{currentGarment.label} — Placement: <span className="text-[#00E5FF] capitalize">{currentGarment.printZone}</span></span>
        </div>
      </div>
    </div>
  );
}

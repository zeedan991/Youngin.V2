import TailorSidebar from "@/components/tailor/TailorSidebar";
import { ReactNode } from "react";

export default function TailorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0D0D12", color: "#F0EBE3" }}>
      <TailorSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

import Sidebar from "@/components/dashboard/Sidebar";
import LoadingScreen from "@/components/LoadingScreen";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex bg-[#06060A] min-h-screen font-sans text-white relative">
      {/* The heavy loader triggers only once when crossing into the web app */}
      <LoadingScreen />
      
      {/* Universal Sidebar Navigation */}
      <Sidebar />
      
      {/* Main Extensible Content Pane */}
      <main className="flex-1 flex flex-col min-h-screen transition-all pb-24 md:pb-0 relative border-l border-white/5">
        <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-8 xl:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}

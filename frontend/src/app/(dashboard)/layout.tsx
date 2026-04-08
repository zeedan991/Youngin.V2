import Sidebar from "@/components/dashboard/Sidebar";
import LoadingScreen from "@/components/LoadingScreen";
import ChatbotWidget from "@/components/dashboard/ChatbotWidget";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-900 relative">
      {/* The heavy loader triggers only once when crossing into the web app */}
      <LoadingScreen />
      
      {/* Universal Sidebar Navigation */}
      <Sidebar />
      
      {/* Main Extensible Content Pane */}
      <main className="flex-1 flex flex-col min-h-screen transition-all pb-24 md:pb-0 relative border-l border-slate-200">
        <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-8 xl:p-12">
          {children}
        </div>
      </main>

      {/* Global Chatbot */}
      <ChatbotWidget />
    </div>
  );
}

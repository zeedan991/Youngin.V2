import Sidebar from "@/components/dashboard/Sidebar";
import LoadingScreen from "@/components/LoadingScreen";
import ChatbotWidget from "@/components/dashboard/ChatbotWidget";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen font-sans relative" style={{ background: "var(--dash-bg)", color: "var(--dash-text)" }}>
      <LoadingScreen />
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-h-screen transition-all pb-24 md:pb-0 relative" style={{ borderLeft: "1px solid var(--dash-border)" }}>
        <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-8 xl:p-12">
          {children}
        </div>
      </main>

      <ChatbotWidget />
    </div>
  );
}

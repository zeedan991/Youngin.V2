import Navbar from "@/components/dashboard/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
import ChatbotWidget from "@/components/dashboard/ChatbotWidget";
import UsernameOnboarding from "@/components/dashboard/UsernameOnboarding";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen font-sans relative" style={{ background: "var(--dash-bg)", color: "var(--dash-text)" }}>
      <LoadingScreen />
      <UsernameOnboarding />
      <Navbar />
      
      <main className="flex-1 flex flex-col transition-all pb-[70px] lg:pb-0 relative">
        <div className="flex-1 w-full max-w-[1700px] mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>

      <ChatbotWidget />
    </div>
  );
}

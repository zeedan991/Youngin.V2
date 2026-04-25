import Navbar from "@/components/dashboard/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
import UsernameOnboarding from "@/components/dashboard/UsernameOnboarding";
import { ReactNode } from "react";
import { fetchLiveProfile } from "@/app/(dashboard)/profile/actions";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Fetch profile server-side to eliminate visual delay on the Navbar
  const profileRes = await fetchLiveProfile();
  let initialProfile = undefined;

  if (profileRes.success && profileRes.data) {
    initialProfile = {
      name:
        (profileRes.data as any).username ||
        (profileRes.data as any).full_name ||
        "Creator",
      level: (profileRes.data as any).level || 1,
      avatar_url: (profileRes.data as any).avatar_url || null,
      role: (profileRes.data as any).role || "user",
    };
  }

  return (
    <div
      className="flex flex-col min-h-screen font-sans relative"
      style={{ background: "var(--dash-bg)", color: "var(--dash-text)" }}
    >
      <LoadingScreen />
      <UsernameOnboarding />
      <Navbar initialProfile={initialProfile} />

      <main className="flex-1 flex flex-col transition-all pb-[70px] lg:pb-0 pt-[80px] relative">
        <div className="flex-1 w-full max-w-[1700px] mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

import TailorSidebar from "@/components/tailor/TailorSidebar";
import { ReactNode } from "react";
import { fetchLiveProfile } from "@/app/(dashboard)/profile/actions";

export default async function TailorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profileRes = await fetchLiveProfile();
  let initialProfile = undefined;

  if (profileRes.success && profileRes.data) {
    initialProfile = {
      full_name:
        (profileRes.data as any).username ||
        (profileRes.data as any).full_name ||
        "Tailor",
      username: (profileRes.data as any).username || "",
      level: (profileRes.data as any).level || 1,
      avatar_url: (profileRes.data as any).avatar_url || null,
    };
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--dash-bg)", color: "var(--dash-text)" }}
    >
      <TailorSidebar initialProfile={initialProfile} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

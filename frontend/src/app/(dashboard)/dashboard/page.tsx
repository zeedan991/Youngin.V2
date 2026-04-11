import { redirect } from "next/navigation";
import { fetchLiveProfile, awardDailyLoginXP } from "@/app/(dashboard)/profile/actions";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardOverviewPage() {
  // Fetch profile FIRST so we can check role before rendering anything
  const res = await fetchLiveProfile();
  const initialProfile = res.success && res.data ? res.data : null;

  // ── Role-based redirect (server-side, zero flash) ──
  // If user is a tailor, redirect them immediately before any HTML is sent.
  if (initialProfile?.role === "tailor") {
    redirect("/tailor/dashboard");
  }

  // Award daily login XP for non-tailor users
  const xpResult = await awardDailyLoginXP();

  return (
    <DashboardClient
      initialProfile={initialProfile as any}
      dailyXPAwarded={xpResult.awarded ? xpResult : null}
    />
  );
}

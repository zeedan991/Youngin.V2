import { redirect } from "next/navigation";
import {
  fetchLiveProfile,
  awardDailyLoginXP,
  syncAchievementsXP,
} from "@/app/(dashboard)/profile/actions";
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

  // Synchronize XP for any achievements they earned since last load
  await syncAchievementsXP();

  // Re-fetch profile data AFTER the synchronization so Dashboard reflects today's accurate XP
  const freshRes = await fetchLiveProfile();
  const finalProfile =
    freshRes.success && freshRes.data ? freshRes.data : initialProfile;

  return (
    <DashboardClient
      initialProfile={finalProfile as any}
      dailyXPAwarded={xpResult.awarded ? xpResult : null}
    />
  );
}

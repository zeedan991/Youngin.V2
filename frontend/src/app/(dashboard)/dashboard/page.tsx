import { fetchLiveProfile, awardDailyLoginXP } from "@/app/(dashboard)/profile/actions";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardOverviewPage() {
  // Award daily login XP (idempotent — only fires once per calendar day per user)
  const xpResult = await awardDailyLoginXP();

  // Fetch fresh profile data AFTER the XP award so XP bar reflects today's award
  const res = await fetchLiveProfile();
  const initialProfile = res.success && res.data ? res.data : null;

  return (
    <DashboardClient
      initialProfile={initialProfile as any}
      dailyXPAwarded={xpResult.awarded ? xpResult : null}
    />
  );
}

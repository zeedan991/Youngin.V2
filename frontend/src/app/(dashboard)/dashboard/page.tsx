import { fetchLiveProfile } from "@/app/(dashboard)/profile/actions";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardOverviewPage() {
  const res = await fetchLiveProfile();
  const initialProfile = res.success && res.data ? res.data : null;

  return <DashboardClient initialProfile={initialProfile as any} />;
}

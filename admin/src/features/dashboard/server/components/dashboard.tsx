import "server-only";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { DashboardContent } from "../../shared/components/dashboard-content";

export async function Dashboard() {
  await requireAdmin();
  return <DashboardContent />;
}

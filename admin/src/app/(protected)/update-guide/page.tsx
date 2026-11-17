import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { ManualUpdateGuide } from "@/features/dashboard/shared/components/manual-update-guide";

export default async function Page() {
  await requireAdmin();
  return <ManualUpdateGuide />;
}

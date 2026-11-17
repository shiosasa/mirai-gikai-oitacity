import { MayorProfileAdminView } from "@/features/politicians/server/components/mayor-profile-admin-view";

export default async function MayorProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ person?: string }>;
}) {
  const { person } = await searchParams;
  return <MayorProfileAdminView selection={person} />;
}

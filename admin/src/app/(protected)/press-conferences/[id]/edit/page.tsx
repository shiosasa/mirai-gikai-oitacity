import { ConferenceEdit } from "@/features/press-conferences/server/components/conference-pages";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <ConferenceEdit id={(await params).id} />;
}

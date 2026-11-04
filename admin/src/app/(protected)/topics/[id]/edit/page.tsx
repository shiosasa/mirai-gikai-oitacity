import { TopicEditView } from "@/features/topics/server/components/topic-edit-view";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TopicEditView id={id} />;
}

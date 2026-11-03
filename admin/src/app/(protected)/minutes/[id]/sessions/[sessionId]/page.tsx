import { SessionDetail } from "@/features/minutes/server/components/minutes-pages";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const { id, sessionId } = await params;
  return <SessionDetail meetingId={id} sessionId={sessionId} />;
}

import { getAllMeetingsAndCommittees } from "@/features/committee-minutes/server/loaders/get-all-meetings";
import { Container } from "@/components/layouts/container";
import { PlenaryMeetingSection } from "@/features/committee-minutes/shared/components/plenary-meeting-section";
import Link from "next/link";

export const metadata = {
  title: "本会議 | みらいぎかいっち＠大分",
};

export default async function PlenaryPage() {
  const { plenaryMeetings } = await getAllMeetingsAndCommittees();

  if (plenaryMeetings.length === 0) {
    return (
      <Container className="py-8">
        <div className="text-center">
          <p className="text-sm text-mirai-text-muted">
            本会議の記録は準備中です。
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mb-8">
        <Link
          href="/committees"
          className="text-sm text-primary-accent hover:text-primary font-medium mb-4 inline-block"
        >
          ← 戻る
        </Link>
        <h1 className="text-2xl font-bold text-mirai-text">本会議</h1>
      </div>

      <div className="space-y-8">
        {plenaryMeetings.map((meeting) => (
          <PlenaryMeetingSection key={meeting.id} meeting={meeting} />
        ))}
      </div>
    </Container>
  );
}

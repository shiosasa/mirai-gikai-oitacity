import { Container } from "@/components/layouts/container";
import { CommitteesView } from "@/features/committee-minutes/server/components/committees-view";
import { getAllMeetingsAndCommittees } from "@/features/committee-minutes/server/loaders/get-all-meetings";
import { buildBillPickupItems } from "@/features/committee-minutes/shared/utils/build-bill-pickup-items";

export const metadata = {
  title: "本会議・委員会で話し合われたこと | 大分市議会",
};

export default async function CommitteesPage() {
  const { plenaryMeetings, committeeMeetings, allCommitteeMeetings } =
    await getAllMeetingsAndCommittees();
  const billPickupCount = buildBillPickupItems([
    ...plenaryMeetings,
    ...committeeMeetings,
  ]).length;

  return (
    <Container className="py-8">
      <CommitteesView
        plenaryMeetings={plenaryMeetings}
        allCommitteeMeetings={allCommitteeMeetings}
        billPickupCount={billPickupCount}
      />
    </Container>
  );
}

import { Container } from "@/components/layouts/container";
import { CommitteesView } from "@/features/committee-minutes/server/components/committees-view";
import { getAllMeetingsAndCommittees } from "@/features/committee-minutes/server/loaders/get-all-meetings";

export const metadata = {
  title: "委員会・本会議で話し合われたこと | 大分市議会",
};

export default async function CommitteesPage() {
  const {
    plenaryMeetings,
    committeeMeetings,
    committeeArchives,
    allMeetings,
    allCommitteeMeetings,
  } = await getAllMeetingsAndCommittees();

  return (
    <Container className="py-8">
      <CommitteesView
        plenaryMeetings={plenaryMeetings}
        committeeMeetings={committeeMeetings}
        committeeArchives={committeeArchives}
        allMeetings={allMeetings}
        allCommitteeMeetings={allCommitteeMeetings}
      />
    </Container>
  );
}

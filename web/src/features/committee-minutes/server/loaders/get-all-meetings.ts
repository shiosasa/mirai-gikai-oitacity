import "server-only";
import {
  findAllMeetings,
  buildMeetingArchives,
} from "../repositories/meeting-repository";

export async function getAllMeetingsAndCommittees() {
  // すべての会議データ（本会議も委員会も）を、新しい大分用の meetings テーブルから一括取得する
  const meetings = await findAllMeetings();

  const meetingsByType = buildMeetingArchives(meetings);

  // 本会議と委員会を同じ仕組みで安全に分割する
  const plenaryMeetings = meetingsByType.get("本会議") ?? [];
  const committeeMeetings = meetingsByType.get("委員会") ?? [];

  return {
    plenaryMeetings,
    committeeMeetings,
    committeeArchives: [], // 古いアーカイブ依存を解消
    allMeetings: plenaryMeetings, // 本会議のみ
    allCommitteeMeetings: committeeMeetings, // 委員会のみ
  };
}

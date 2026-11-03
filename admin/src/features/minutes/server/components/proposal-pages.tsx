import "server-only";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { ListPagination } from "@/features/content-management/server/components/list-pagination";
import {
  type ListSearchParams,
  listQueryInput,
  numericId,
} from "@/features/content-management/shared/utils/content-input";
import { ProposalForm } from "../../client/components/proposal-form";
import {
  getMeeting,
  listProposalMeetings,
} from "../repositories/minutes-repository";

export async function ProposalList({ search }: { search: ListSearchParams }) {
  await requireAdmin();
  const { page } = listQueryInput.parse(search);
  const { entries, count } = await listProposalMeetings(page);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">市長提案理由</h1>
      <p className="rounded-md border bg-card p-4">
        市長紹介ページに表示する提案理由を編集します。下書きはなく、保存で公開サイトに反映されます。
      </p>
      <p className="text-sm text-muted-foreground">
        対象の会議がない場合は、
        <Link className="underline" href="/minutes">
          議事録要約
        </Link>
        から本会議を追加してください。
      </p>
      <ul className="space-y-3">
        {entries.map((meeting) => (
          <li key={meeting.id}>
            <Link
              href={`/mayor-proposals/${meeting.id}`}
              className="block rounded-lg border bg-card p-4 hover:border-primary"
            >
              <p className="text-sm text-muted-foreground">
                {meeting.date ?? "日付未登録"} /{" "}
                {meeting.mayor_proposal_text?.trim()
                  ? "原文登録済み"
                  : "未登録"}
              </p>
              <h2 className="font-semibold">
                {meeting.title ?? "会議名未登録"}
              </h2>
            </Link>
          </li>
        ))}
      </ul>
      {entries.length === 0 && <p>本会議はまだ登録されていません。</p>}
      <ListPagination
        path="/mayor-proposals"
        search={search}
        page={page}
        count={count}
      />
    </div>
  );
}

export async function ProposalDetail({ id }: { id: string }) {
  await requireAdmin();
  const parsed = numericId.safeParse(id);
  if (!parsed.success) notFound();
  const meeting = await getMeeting(parsed.data);
  if (!meeting || meeting.meeting_type !== "本会議") notFound();
  return (
    <div className="space-y-6">
      <Link className="text-sm underline" href="/mayor-proposals">
        提案理由一覧に戻る
      </Link>
      <header>
        <h1 className="text-2xl font-bold">{meeting.title}</h1>
        <p className="text-muted-foreground">
          {meeting.date} / {meeting.term}
        </p>
      </header>
      <ProposalForm meeting={meeting} />
    </div>
  );
}

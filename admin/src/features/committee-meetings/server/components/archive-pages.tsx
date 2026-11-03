import "server-only";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import {
  EditField,
  SelectField,
} from "@/features/content-management/client/components/edit-field";
import { ListPagination } from "@/features/content-management/server/components/list-pagination";
import {
  archiveListQueryInput,
  httpUrl,
  type ListSearchParams,
  recordId,
} from "@/features/content-management/shared/utils/content-input";
import {
  ArchiveForm,
  ArchiveTopicForm,
} from "../../client/components/archive-form";
import {
  getArchiveMeeting,
  listArchiveMeetings,
} from "../repositories/archive-repository";

export async function ArchiveList({ search }: { search: ListSearchParams }) {
  await requireAdmin();
  const query = archiveListQueryInput.parse(search);
  const { entries, count } = await listArchiveMeetings(
    query.page,
    query.status,
    query.committee
  );
  return (
    <div className="space-y-6">
      <Link href="/minutes" className="text-sm underline">
        開催日ごとの議事録要約に戻る
      </Link>
      <h1 className="text-2xl font-bold">委員会アーカイブ</h1>
      <p className="text-muted-foreground">
        議題・発言単位の既存アーカイブを管理します。新規取り込み・AI生成は従来の手順で行い、ここでは要約の修正・公開確認を行います。
      </p>
      <form className="flex flex-wrap items-end gap-3">
        <SelectField
          name="status"
          label="公開状態"
          value={query.status}
          options={[
            { value: "", label: "すべて" },
            { value: "draft", label: "下書き" },
            { value: "published", label: "公開" },
          ]}
        />
        <EditField
          name="committee"
          label="委員会スラッグ"
          value={query.committee}
          hint="空欄ですべて表示"
        />
        <Button type="submit" variant="outline">
          絞り込む
        </Button>
      </form>
      <ul className="space-y-3">
        {entries.map((meeting) => (
          <li key={meeting.id}>
            <Link
              href={`/committee-meetings/${meeting.id}`}
              className="block rounded-lg border bg-card p-4 hover:border-primary"
            >
              <p className="text-sm text-muted-foreground">
                {meeting.meeting_date} /{" "}
                {meeting.publish_status === "published" ? "公開" : "下書き"} /{" "}
                {meeting.summary?.trim() ? "要約あり" : "要約未登録"}
              </p>
              <h2 className="font-semibold">{meeting.title}</h2>
              <p className="text-sm">
                {meeting.committee_name}（{meeting.committee_slug}）
              </p>
            </Link>
          </li>
        ))}
      </ul>
      {entries.length === 0 && <p>該当するアーカイブはありません。</p>}
      <ListPagination
        path="/committee-meetings"
        search={search}
        page={query.page}
        count={count}
      />
    </div>
  );
}

export async function ArchiveDetail({ id }: { id: string }) {
  await requireAdmin();
  const parsed = recordId.safeParse(id);
  if (!parsed.success) notFound();
  const meeting = await getArchiveMeeting(parsed.data);
  if (!meeting) notFound();
  const source = httpUrl.safeParse(meeting.source_url);
  return (
    <div className="space-y-6">
      <Link href="/committee-meetings" className="text-sm underline">
        アーカイブ一覧に戻る
      </Link>
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{meeting.title}</h1>
        <p>
          {meeting.committee_name} / {meeting.meeting_date}
        </p>
        {source.success && source.data ? (
          <a
            href={source.data}
            target="_blank"
            rel="noreferrer"
            className="text-sm underline"
          >
            公式原文を確認
          </a>
        ) : (
          <p className="text-sm text-destructive">
            出典URLが未登録、または形式が不正です。
          </p>
        )}
      </header>
      <ArchiveForm meeting={meeting} />
      <h2 className="text-xl font-semibold">議題ごとの編集</h2>
      {[...meeting.committee_meeting_topics]
        .sort((a, b) => a.topic_order - b.topic_order)
        .map((topic) => (
          <details key={topic.id} className="space-y-3 rounded-lg border p-4">
            <summary className="cursor-pointer font-semibold">
              {topic.topic_order}. {topic.title}
            </summary>
            <ArchiveTopicForm topic={topic} />
          </details>
        ))}
      <details className="rounded-lg border bg-card p-4 space-y-3">
        <summary className="cursor-pointer font-semibold">
          原文（参照用・編集不可）
        </summary>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words text-sm">
          {meeting.raw_text}
        </pre>
      </details>
      <details className="rounded-lg border bg-card p-4 space-y-3">
        <summary className="cursor-pointer font-semibold">
          発言データ（参照用）
        </summary>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words text-sm">
          {JSON.stringify(meeting.speeches, null, 2)}
        </pre>
      </details>
    </div>
  );
}

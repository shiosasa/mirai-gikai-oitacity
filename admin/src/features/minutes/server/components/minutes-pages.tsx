import "server-only";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { SelectField } from "@/features/content-management/client/components/edit-field";
import { ListPagination } from "@/features/content-management/server/components/list-pagination";
import {
  type ListSearchParams,
  listQueryInput,
  numericId,
} from "@/features/content-management/shared/utils/content-input";
import { MeetingForm } from "../../client/components/meeting-form";
import { SessionForm } from "../../client/components/session-form";
import {
  getMeeting,
  getSession,
  listMeetings,
  listSessions,
} from "../repositories/minutes-repository";

export async function MinutesList({ search }: { search: ListSearchParams }) {
  await requireAdmin();
  const query = listQueryInput.parse(search);
  const { entries, count } = await listMeetings(query.page, query.type);
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">議事録要約</h1>
        <p className="text-muted-foreground">
          公開サイトの本会議・委員会一覧と同じ会議を管理します。会議を選び、開催日ごとの内容を編集してください。
        </p>
      </header>
      <p className="rounded-md border bg-card p-4 text-sm">
        下書き機能はありません。保存すると公開サイトに反映されます。
      </p>
      <form className="flex flex-wrap items-end gap-3">
        <SelectField
          name="type"
          label="会議区分"
          value={query.type}
          options={[
            { value: "", label: "すべて" },
            { value: "本会議", label: "本会議" },
            { value: "委員会", label: "委員会" },
          ]}
        />
        <Button type="submit" variant="outline">
          絞り込む
        </Button>
      </form>
      <details className="space-y-3 rounded-lg border p-4">
        <summary className="cursor-pointer font-semibold">
          新しい会議を追加
        </summary>
        <MeetingForm />
      </details>
      <ul className="space-y-3">
        {entries.map((meeting) => (
          <li key={meeting.id}>
            <Link
              href={`/minutes/${meeting.id}`}
              className="block rounded-lg border bg-card p-4 hover:border-primary"
            >
              <p className="text-sm text-muted-foreground">
                {meeting.meeting_type} / {meeting.date ?? "日付未登録"} /{" "}
                {meeting.term}
              </p>
              <h2 className="font-semibold">
                {meeting.title ?? "会議名未登録"}
              </h2>
              <span className="text-sm underline">開催日・要約を編集</span>
            </Link>
          </li>
        ))}
      </ul>
      {entries.length === 0 && <p>該当する会議はありません。</p>}
      <ListPagination
        path="/minutes"
        search={search}
        page={query.page}
        count={count}
      />
      <section className="border-t pt-4 text-sm space-y-2">
        <h2 className="font-semibold">別形式の委員会アーカイブ</h2>
        <p className="text-muted-foreground">
          従来の議題・発言単位のアーカイブは別データです。開催日ごとの要約とは区別して管理します。
        </p>
        <Link href="/committee-meetings" className="underline">
          委員会アーカイブを管理
        </Link>
      </section>
    </div>
  );
}

export async function MinutesDetail({ id }: { id: string }) {
  await requireAdmin();
  const parsed = numericId.safeParse(id);
  if (!parsed.success) notFound();
  const meeting = await getMeeting(parsed.data);
  if (!meeting) notFound();
  const sessions = await listSessions(meeting.id);
  return (
    <div className="space-y-6">
      <Link href="/minutes" className="text-sm underline">
        議事録要約一覧に戻る
      </Link>
      <h1 className="text-2xl font-bold">{meeting.title}</h1>
      <details className="space-y-3 rounded-lg border p-4">
        <summary className="cursor-pointer font-semibold">
          会議の基本情報を編集
        </summary>
        <MeetingForm meeting={meeting} />
      </details>
      <h2 className="text-lg font-semibold">開催日ごとの議事録</h2>
      <ul className="space-y-3">
        {sessions.map((session) => (
          <li key={session.id}>
            <Link
              href={`/minutes/${meeting.id}/sessions/${session.id}`}
              className="block rounded-lg border bg-card p-4 hover:border-primary"
            >
              <p className="text-sm text-muted-foreground">
                {session.date ?? "日付未登録"} /{" "}
                {session.summary?.trim() ? "要約あり" : "要約未登録"}
              </p>
              <h3 className="font-semibold">
                {session.session_title ?? "見出し未登録"}
              </h3>
            </Link>
          </li>
        ))}
      </ul>
      {sessions.length === 0 && <p>開催日はまだ登録されていません。</p>}
      <details className="space-y-3 rounded-lg border p-4">
        <summary className="cursor-pointer font-semibold">
          開催日と議事録を追加
        </summary>
        <SessionForm meetingId={meeting.id} />
      </details>
    </div>
  );
}

export async function SessionDetail({
  meetingId,
  sessionId,
}: {
  meetingId: string;
  sessionId: string;
}) {
  await requireAdmin();
  const parent = numericId.safeParse(meetingId);
  const child = numericId.safeParse(sessionId);
  if (!parent.success || !child.success) notFound();
  const [meeting, session] = await Promise.all([
    getMeeting(parent.data),
    getSession(parent.data, child.data),
  ]);
  if (!meeting || !session) notFound();
  return (
    <div className="space-y-6">
      <Link href={`/minutes/${meeting.id}`} className="text-sm underline">
        開催日一覧に戻る
      </Link>
      <header>
        <h1 className="text-2xl font-bold">
          {session.session_title ?? "議事録を編集"}
        </h1>
        <p className="text-muted-foreground">
          {meeting.title} / {session.date}
        </p>
      </header>
      <SessionForm meetingId={meeting.id} session={session} />
    </div>
  );
}

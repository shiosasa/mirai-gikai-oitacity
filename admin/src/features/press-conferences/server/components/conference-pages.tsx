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
  recordId,
} from "@/features/content-management/shared/utils/content-input";
import { ConferenceForm } from "../../client/components/conference-form";
import {
  ConferenceItemForm,
  ConferenceTurnForm,
} from "../../client/components/conference-item-form";
import { speakerOptions, statusOptions } from "../../shared/conference-options";
import {
  getConference,
  getConferenceItems,
  listConferences,
} from "../repositories/conference-repository";

export async function ConferenceList({ search }: { search: ListSearchParams }) {
  await requireAdmin();
  const query = listQueryInput.parse(search);
  const { entries, count } = await listConferences(query.page, query.status);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">記者会見</h1>
      <p className="text-muted-foreground">
        市長の発表・質疑・動画・配付資料を管理します。まず下書きを作成し、内容を確認してから公開します。
      </p>
      <Button asChild>
        <Link href="/press-conferences/new">新しい会見を追加</Link>
      </Button>
      <form className="flex flex-wrap items-end gap-3">
        <SelectField
          name="status"
          label="公開状態"
          value={query.status}
          options={[{ value: "", label: "すべて" }, ...statusOptions]}
        />
        <Button type="submit" variant="outline">
          絞り込む
        </Button>
      </form>
      <ul className="space-y-3">
        {entries.map((conference) => (
          <li key={conference.id}>
            <Link
              href={`/press-conferences/${conference.id}/edit`}
              className="block rounded-lg border bg-card p-4 hover:border-primary"
            >
              <p className="text-sm text-muted-foreground">
                {conference.held_at} /{" "}
                {statusOptions.find(
                  (option) => option.value === conference.status
                )?.label ?? conference.status}{" "}
                / {conference.press_conference_items[0]?.count ?? 0}項目
              </p>
              <h2 className="font-semibold">{conference.title}</h2>
            </Link>
          </li>
        ))}
      </ul>
      {entries.length === 0 && <p>該当する会見はありません。</p>}
      <ListPagination
        path="/press-conferences"
        search={search}
        page={query.page}
        count={count}
      />
    </div>
  );
}

export async function ConferenceNew() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <Link href="/press-conferences" className="text-sm underline">
        会見一覧に戻る
      </Link>
      <h1 className="text-2xl font-bold">会見を追加</h1>
      <ConferenceForm />
    </div>
  );
}

export async function ConferenceEdit({ id }: { id: string }) {
  await requireAdmin();
  const parsed = recordId.safeParse(id);
  if (!parsed.success) notFound();
  const conference = await getConference(parsed.data);
  if (!conference) notFound();
  const items = await getConferenceItems(conference.id);
  return (
    <div className="space-y-6">
      <Link href="/press-conferences" className="text-sm underline">
        会見一覧に戻る
      </Link>
      <h1 className="text-2xl font-bold">{conference.title}</h1>
      {conference.status === "published" && (
        <p role="status" className="rounded-md border bg-card p-4">
          この会見は公開中です。項目や発言の保存・削除も公開サイトに反映されます。編集を始める前に下書きへ戻してください。
        </p>
      )}
      <ConferenceForm conference={conference} />
      <h2 className="text-xl font-semibold">
        発表・質疑（各項目を個別に保存）
      </h2>
      {items.map((item) => {
        const turns = [...item.press_conference_turns].sort(
          (a, b) => a.order_index - b.order_index || a.id.localeCompare(b.id)
        );
        return (
          <details key={item.id} className="space-y-4 rounded-lg border p-4">
            <summary className="cursor-pointer font-semibold">
              {item.order_index}.{" "}
              {item.item_type === "announcement" ? "発表" : "質疑"}：
              {item.title}（{turns.length}発言）
            </summary>
            <ConferenceItemForm conferenceId={id} item={item} nextOrder={0} />
            <h3 className="font-semibold">発言のやりとり</h3>
            <p className="text-sm text-muted-foreground">
              確認できた発言だけ登録します。要約のみの項目に発言を無理に作る必要はありません。
            </p>
            {turns.map((turn) => (
              <details
                className="space-y-3 rounded-md border p-3"
                key={turn.id}
              >
                <summary className="cursor-pointer text-sm">
                  {turn.order_index}.{" "}
                  {speakerOptions.find(
                    (option) => option.value === turn.speaker
                  )?.label ?? turn.speaker}{" "}
                  {turn.speaker_name}
                </summary>
                <ConferenceTurnForm
                  conferenceId={id}
                  itemId={item.id}
                  turn={turn}
                  nextOrder={0}
                />
              </details>
            ))}
            <details className="space-y-3 rounded-md border p-3">
              <summary className="cursor-pointer text-sm font-medium">
                発言を追加
              </summary>
              <ConferenceTurnForm
                key={`new-${turns.length}-${turns.at(-1)?.order_index}`}
                conferenceId={id}
                itemId={item.id}
                nextOrder={(turns.at(-1)?.order_index ?? -1) + 1}
              />
            </details>
          </details>
        );
      })}
      <details className="space-y-3 rounded-lg border p-4">
        <summary className="cursor-pointer font-semibold">
          発表・質疑を追加
        </summary>
        <ConferenceItemForm
          key={`new-${items.length}-${items.at(-1)?.order_index}`}
          conferenceId={id}
          nextOrder={(items.at(-1)?.order_index ?? -1) + 1}
        />
      </details>
    </div>
  );
}

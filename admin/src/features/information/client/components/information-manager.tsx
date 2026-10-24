"use client";

import type { Database } from "@mirai-gikai/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveInformation } from "../../server/actions/save-information";

type Information = Database["public"]["Tables"]["site_information"]["Row"];

export function InformationManager({ entries }: { entries: Information[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Information | null>(null);
  const [published, setPublished] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const title = form.get("title");
    const body = form.get("body");
    if (typeof title !== "string" || typeof body !== "string") {
      toast.error("入力を読み取れませんでした");
      return;
    }
    if (published && !window.confirm("このお知らせをTOPに公開しますか？"))
      return;
    setPending(true);
    try {
      await saveInformation({
        id: editing?.id,
        title,
        body,
        publishedAt: editing?.published_at ?? new Date().toISOString(),
        isPublished: published,
      });
      toast.success("お知らせを保存しました");
      setEditing(null);
      setPublished(false);
      router.refresh();
      formElement.reset();
    } catch (error) {
      console.error("Information save failed:", error);
      toast.error(
        error instanceof Error ? error.message : "保存できませんでした"
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        key={editing?.id ?? "new"}
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg border p-4"
      >
        <h2 className="font-semibold">
          {editing ? "お知らせを編集" : "新しいお知らせ"}
        </h2>
        <div className="space-y-2">
          <Label htmlFor="information-title">タイトル</Label>
          <Input
            id="information-title"
            name="title"
            required
            maxLength={200}
            defaultValue={editing?.title ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="information-body">本文</Label>
          <Textarea
            id="information-body"
            name="body"
            maxLength={10000}
            defaultValue={editing?.body ?? ""}
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="information-published"
            checked={published}
            onCheckedChange={(value) => setPublished(value === true)}
          />
          <Label htmlFor="information-published">TOPに公開する</Label>
        </div>
        <p className="text-sm">
          新規登録時の日時で並びます。編集しても元の日付を維持します。
        </p>
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "保存中…" : "保存"}
          </Button>
          {editing && (
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => {
                setEditing(null);
                setPublished(false);
              }}
            >
              新規作成に戻る
            </Button>
          )}
        </div>
      </form>
      <ul className="space-y-3">
        {entries.map((entry) => (
          <li key={entry.id} className="rounded-lg border p-4 space-y-2">
            <h2 className="font-semibold">{entry.title}</h2>
            <p>
              {entry.is_published ? "公開" : "下書き"} /{" "}
              {new Date(entry.published_at).toLocaleString("ja-JP", {
                timeZone: "Asia/Tokyo",
              })}
            </p>
            <Button
              disabled={pending}
              variant="outline"
              onClick={() => {
                setEditing(entry);
                setPublished(entry.is_published);
              }}
            >
              編集
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

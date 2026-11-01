"use client";

import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  SpeechPolitician,
  SpeechRecord,
  SpeechSession,
} from "../../shared/types/speech";
import type { SpeechInput } from "../../shared/utils/speech-input";
import {
  buildSpeechSessionUrl,
  formatSpeechSession,
} from "../../shared/utils/speech-session-options";

type SpeechForm = {
  politicianId: string;
  sessionId: string;
  title: string;
  quote: string;
  context: string;
  isPublished: boolean;
};

const EMPTY_FORM: SpeechForm = {
  politicianId: "",
  sessionId: "",
  title: "",
  quote: "",
  context: "",
  isPublished: false,
};

export type SpeechManagerData = {
  entries: SpeechRecord[];
  politicians: SpeechPolitician[];
  sessions: SpeechSession[];
  webUrl: string;
};

type SpeechManagerProps = SpeechManagerData & {
  onSave: (input: SpeechInput) => Promise<{ error: string | null }>;
  onUnpublish: (id: string) => Promise<{ error: string | null }>;
  onRefresh: () => void;
  confirm: (message: string) => boolean;
  scrollToForm: () => void;
};

export function SpeechManager({
  entries,
  politicians,
  sessions,
  webUrl,
  onSave,
  onUnpublish,
  onRefresh,
  confirm,
  scrollToForm,
}: SpeechManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SpeechForm>(EMPTY_FORM);
  const [speakerConfirmed, setSpeakerConfirmed] = useState(false);
  const [pending, setPending] = useState(false);
  const selectedSession = sessions.find(
    (session) => String(session.id) === form.sessionId
  );
  const selectedPolitician = politicians.find(
    (politician) => politician.id === form.politicianId
  );

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSpeakerConfirmed(false);
  }

  function startEditing(entry: SpeechRecord) {
    setEditingId(entry.id);
    setForm({
      politicianId: entry.politician_id,
      sessionId: String(entry.meeting_session_id),
      title: entry.title,
      quote: entry.quote,
      context: entry.context ?? "",
      isPublished: entry.is_published,
    });
    setSpeakerConfirmed(false);
    scrollToForm();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.isPublished && !speakerConfirmed) {
      toast.error("議員本人の発言と前後の文脈を確認してください");
      return;
    }
    if (
      form.isPublished &&
      !confirm("この発言を公開しますか？公開サイトに表示されます。")
    ) {
      return;
    }

    setPending(true);
    try {
      const result = await onSave({
        id: editingId ?? undefined,
        politicianId: form.politicianId,
        sessionId: Number(form.sessionId),
        title: form.title,
        quote: form.quote,
        context: form.context,
        isPublished: form.isPublished,
        speakerConfirmed,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(
        form.isPublished ? "発言を公開しました" : "下書きを保存しました"
      );
      resetForm();
      onRefresh();
    } catch (error) {
      console.error("Speech save failed:", error);
      toast.error(
        error instanceof Error ? error.message : "発言を保存できませんでした"
      );
    } finally {
      setPending(false);
    }
  }

  async function handleUnpublish(entry: SpeechRecord) {
    if (!confirm("この発言を非公開にしますか？")) return;
    setPending(true);
    try {
      const result = await onUnpublish(entry.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("発言を非公開にしました");
      if (editingId === entry.id) resetForm();
      onRefresh();
    } catch (error) {
      console.error("Speech unpublish failed:", error);
      toast.error(
        error instanceof Error ? error.message : "非公開にできませんでした"
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-lg border bg-card p-5"
      >
        <div>
          <h2 className="text-lg font-semibold">
            {editingId ? "発言を編集" : "新しい発言"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            議員本人の発言を議事録から原文のまま引用してください。公開時には、引用と議事録の一致を確認します。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="speech-politician">議員</Label>
            <select
              id="speech-politician"
              required
              value={form.politicianId}
              onChange={(event) => {
                setForm({ ...form, politicianId: event.target.value });
                setSpeakerConfirmed(false);
              }}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">議員を選択してください</option>
              {politicians.map((politician) => (
                <option key={politician.id} value={politician.id}>
                  {politician.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="speech-session">出典の議事録</Label>
            <select
              id="speech-session"
              required
              value={form.sessionId}
              onChange={(event) => {
                setForm({ ...form, sessionId: event.target.value });
                setSpeakerConfirmed(false);
              }}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">議事録を選択してください</option>
              {form.sessionId && !selectedSession && (
                <option value={form.sessionId}>
                  元の議事録を確認できません（ID: {form.sessionId}）
                </option>
              )}
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {formatSpeechSession(session)}
                </option>
              ))}
            </select>
            {selectedSession && (
              <a
                href={buildSpeechSessionUrl(webUrl, selectedSession)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary underline"
              >
                選択した議事録を開く
                <ExternalLink aria-hidden="true" className="size-3.5" />
              </a>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="speech-title">見出し</Label>
          <Input
            id="speech-title"
            required
            value={form.title}
            onChange={(event) => {
              setForm({ ...form, title: event.target.value });
              setSpeakerConfirmed(false);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="speech-quote">発言の引用</Label>
          <Textarea
            id="speech-quote"
            required
            rows={5}
            value={form.quote}
            onChange={(event) => {
              setForm({ ...form, quote: event.target.value });
              setSpeakerConfirmed(false);
            }}
          />
          <p className="text-xs text-muted-foreground">
            発言者名を含めず、1人の発言を続けてコピーしてください。改行や空白も原文と一致させてください。
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="speech-context">補足（任意）</Label>
          <Textarea
            id="speech-context"
            rows={3}
            value={form.context}
            onChange={(event) => {
              setForm({ ...form, context: event.target.value });
              setSpeakerConfirmed(false);
            }}
          />
          <p className="text-xs text-muted-foreground">
            発言の背景や議題を説明します。引用とは区別して表示します。
          </p>
        </div>

        {(form.title || form.quote || form.context) && (
          <div className="space-y-2 rounded-lg border bg-muted p-4">
            <p className="text-xs font-semibold text-muted-foreground">
              見え方の確認（管理画面内）
            </p>
            <p className="font-bold">{form.title || "見出し"}</p>
            <blockquote className="whitespace-pre-line border-l-2 border-primary pl-3 text-sm leading-7">
              「{form.quote || "発言の引用"}」
            </blockquote>
            {form.context.trim() && (
              <p className="whitespace-pre-line text-sm text-muted-foreground">
                補足：{form.context}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {selectedPolitician?.name ?? "議員"}・
              {selectedSession
                ? formatSpeechSession(selectedSession)
                : "議事録"}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Checkbox
            id="speech-published"
            checked={form.isPublished}
            onCheckedChange={(checked) => {
              setForm({ ...form, isPublished: checked === true });
              setSpeakerConfirmed(false);
            }}
          />
          <Label htmlFor="speech-published">この発言を公開する</Label>
        </div>
        {form.isPublished && (
          <div className="flex items-start gap-2">
            <Checkbox
              id="speech-confirmed"
              checked={speakerConfirmed}
              onCheckedChange={(checked) =>
                setSpeakerConfirmed(checked === true)
              }
            />
            <Label htmlFor="speech-confirmed" className="leading-5">
              議事録で議員本人の発言と前後の文脈を確認しました
            </Label>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={pending}>
            {pending
              ? "保存中…"
              : form.isPublished
                ? "確認して公開"
                : "下書きを保存"}
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={resetForm}
            >
              新規作成に戻る
            </Button>
          )}
        </div>
      </form>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">登録済みの発言</h2>
        {entries.length === 0 && (
          <p className="text-sm text-muted-foreground">
            まだ登録されていません。
          </p>
        )}
        <ul className="space-y-3">
          {entries.map((entry) => {
            const politician = politicians.find(
              (item) => item.id === entry.politician_id
            );
            const session = sessions.find(
              (item) => item.id === entry.meeting_session_id
            );
            return (
              <li
                key={entry.id}
                className="space-y-2 rounded-lg border bg-card p-4"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="font-semibold">{entry.title}</h3>
                  <span className="text-xs text-muted-foreground">
                    {entry.is_published ? "公開中" : "下書き"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {politician?.name ?? "議員情報を確認できません"}・
                  {session
                    ? formatSpeechSession(session)
                    : "議事録を確認できません"}
                </p>
                <p className="whitespace-pre-line text-sm">{entry.quote}</p>
                {entry.context && (
                  <p className="whitespace-pre-line text-sm text-muted-foreground">
                    補足：{entry.context}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={() => startEditing(entry)}
                  >
                    編集
                  </Button>
                  {entry.is_published && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={pending}
                      onClick={() => handleUnpublish(entry)}
                    >
                      非公開にする
                    </Button>
                  )}
                  {session && (
                    <Button asChild variant="outline">
                      <a
                        href={buildSpeechSessionUrl(webUrl, session)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        議事録を開く{" "}
                        <ExternalLink aria-hidden="true" className="size-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

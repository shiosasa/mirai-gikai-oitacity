"use client";

import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createGeneralQuestionAction,
  updateGeneralQuestionAction,
} from "../../server/actions/general-question-actions";
import type {
  AdminGeneralQuestion,
  AdminGeneralQuestionTopic,
  CouncilSessionOption,
  PoliticianOption,
} from "../../shared/types";

type Props = {
  mode: "create" | "edit";
  initial?: AdminGeneralQuestion;
  sessions: CouncilSessionOption[];
  politicians: PoliticianOption[];
};

type EditableTopic = AdminGeneralQuestionTopic & { _key: string };

let nextTopicKey = 0;
function createTopicKey(): string {
  nextTopicKey += 1;
  return `topic-${nextTopicKey}`;
}

const createEmptyTopic = (): EditableTopic => ({
  _key: createTopicKey(),
  title: "",
  question_summary: "",
  answer_summary: "",
  answerer_role: "",
  answerer_name: "",
  question_raw_text: "",
  answer_raw_text: "",
});

export function GeneralQuestionForm({
  mode,
  initial,
  sessions,
  politicians,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const [councilSessionId, setCouncilSessionId] = useState(
    initial?.council_session_id ?? sessions[0]?.id ?? ""
  );
  const [politicianId, setPoliticianId] = useState(
    initial?.politician_id ?? ""
  );
  const [questionerName, setQuestionerName] = useState(
    initial?.questioner_name ?? ""
  );
  const [questionerParty, setQuestionerParty] = useState(
    initial?.questioner_party ?? ""
  );
  const [questionerNumber, setQuestionerNumber] = useState(
    initial?.questioner_number ? String(initial.questioner_number) : ""
  );
  const [sessionDay, setSessionDay] = useState(
    String(initial?.session_day ?? 1)
  );
  const [questionOrder, setQuestionOrder] = useState(
    String(initial?.question_order ?? 1)
  );
  const [sourceUrl, setSourceUrl] = useState(initial?.source_url ?? "");
  const [publishStatus, setPublishStatus] = useState<"draft" | "published">(
    initial?.publish_status === "published" ? "published" : "draft"
  );
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [topics, setTopics] = useState<EditableTopic[]>(
    initial?.topics.length
      ? initial.topics.map((t) => ({
          ...t,
          _key: createTopicKey(),
          question_raw_text: t.question_raw_text ?? initial.raw_text ?? "",
          answer_raw_text: t.answer_raw_text ?? initial.answer_raw_text ?? "",
        }))
      : [createEmptyTopic()]
  );

  function handlePoliticianChange(nextId: string) {
    setPoliticianId(nextId);
    const matched = politicians.find((p) => p.id === nextId);
    if (matched) {
      setQuestionerName(matched.name);
      setQuestionerParty(matched.faction ?? "");
      if (matched.seat_number) {
        setQuestionerNumber(String(matched.seat_number));
      }
    }
  }

  function updateTopic(
    index: number,
    patch: Partial<AdminGeneralQuestionTopic>
  ) {
    setTopics((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSavedMessage(null);

    const payload = {
      council_session_id: councilSessionId,
      politician_id: politicianId || null,
      questioner_name: questionerName,
      questioner_party: questionerParty || null,
      questioner_number: questionerNumber ? Number(questionerNumber) : null,
      session_day: Number(sessionDay),
      question_order: Number(questionOrder),
      summary,
      source_url: sourceUrl || null,
      publish_status: publishStatus,
      topics: topics.map(({ _key: _, ...rest }) => rest),
    };

    startTransition(async () => {
      try {
        if (mode === "create") {
          const { id } = await createGeneralQuestionAction(payload);
          router.push(`/general-questions/${id}`);
          router.refresh();
          return;
        }
        if (initial) {
          await updateGeneralQuestionAction(initial.id, payload);
          setSavedMessage("一般質問を更新しました");
          router.refresh();
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "保存中にエラーが発生しました"
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/general-questions">
            <ArrowLeft className="size-4" aria-hidden="true" />
            一般質問一覧に戻る
          </Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          <Save className="size-4" aria-hidden="true" />
          {isPending
            ? "保存中..."
            : mode === "create"
              ? "登録する"
              : "変更を保存"}
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      {savedMessage ? (
        <div className="rounded-lg border border-border bg-muted px-4 py-3 text-sm font-medium text-foreground">
          {savedMessage}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">基本情報</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="council_session_id">会期</Label>
            <select
              id="council_session_id"
              value={councilSessionId}
              onChange={(e) => setCouncilSessionId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="publish_status">公開状態</Label>
            <select
              id="publish_status"
              value={publishStatus}
              onChange={(e) =>
                setPublishStatus(e.target.value as "draft" | "published")
              }
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="draft">下書き（非公開）</option>
              <option value="published">公開中</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="politician_id">議員マスタから選択（任意）</Label>
            <select
              id="politician_id"
              value={politicianId}
              onChange={(e) => handlePoliticianChange(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="">（手動入力 / 未紐づけ）</option>
              {politicians.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.faction ? `（${p.faction}）` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="questioner_name">質問者名</Label>
            <Input
              id="questioner_name"
              value={questionerName}
              onChange={(e) => setQuestionerName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="questioner_party">会派</Label>
            <Input
              id="questioner_party"
              value={questionerParty}
              onChange={(e) => setQuestionerParty(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="questioner_number">議席番号</Label>
              <Input
                id="questioner_number"
                type="number"
                min={1}
                value={questionerNumber}
                onChange={(e) => setQuestionerNumber(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="session_day">第〇日</Label>
              <Input
                id="session_day"
                type="number"
                min={1}
                value={sessionDay}
                onChange={(e) => setSessionDay(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="question_order">順番</Label>
              <Input
                id="question_order"
                type="number"
                min={1}
                value={questionOrder}
                onChange={(e) => setQuestionOrder(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="source_url">
              議事録要約ページURL（例: /committees/plenary/2/10）
            </Label>
            <Input
              id="source_url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="/committees/plenary/2/10"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="summary">一覧カード用・全体概要</Label>
            <Textarea
              id="summary"
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">
            トピック・一問一答 ({topics.length}件)
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTopics((prev) => [...prev, createEmptyTopic()])}
          >
            <Plus className="size-4" aria-hidden="true" />
            トピックを追加
          </Button>
        </div>

        {topics.map((topic, index) => (
          <Card key={topic._key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">トピック {index + 1}</CardTitle>
              {topics.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setTopics((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  削除
                </Button>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor={`topic-title-${index}`}>タイトル</Label>
                <Input
                  id={`topic-title-${index}`}
                  value={topic.title}
                  onChange={(e) =>
                    updateTopic(index, { title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor={`topic-role-${index}`}>答弁者 役職</Label>
                  <Input
                    id={`topic-role-${index}`}
                    value={topic.answerer_role}
                    onChange={(e) =>
                      updateTopic(index, { answerer_role: e.target.value })
                    }
                    placeholder="福祉保健部長"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`topic-name-${index}`}>答弁者 氏名</Label>
                  <Input
                    id={`topic-name-${index}`}
                    value={topic.answerer_name}
                    onChange={(e) =>
                      updateTopic(index, { answerer_name: e.target.value })
                    }
                    placeholder="田崎敢"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor={`topic-qsum-${index}`}>
                    AI要約（質問吹き出し）
                  </Label>
                  <Textarea
                    id={`topic-qsum-${index}`}
                    rows={4}
                    value={topic.question_summary}
                    onChange={(e) =>
                      updateTopic(index, { question_summary: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`topic-asum-${index}`}>
                    AI要約（答弁吹き出し）
                  </Label>
                  <Textarea
                    id={`topic-asum-${index}`}
                    rows={4}
                    value={topic.answer_summary}
                    onChange={(e) =>
                      updateTopic(index, { answer_summary: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor={`topic-qraw-${index}`}>
                    会議録イメージ（質問本文）
                  </Label>
                  <Textarea
                    id={`topic-qraw-${index}`}
                    rows={6}
                    value={topic.question_raw_text ?? ""}
                    onChange={(e) =>
                      updateTopic(index, { question_raw_text: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`topic-araw-${index}`}>
                    会議録イメージ（答弁本文）
                  </Label>
                  <Textarea
                    id={`topic-araw-${index}`}
                    rows={6}
                    value={topic.answer_raw_text ?? ""}
                    onChange={(e) =>
                      updateTopic(index, { answer_raw_text: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </form>
  );
}

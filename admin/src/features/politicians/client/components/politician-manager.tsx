"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getPoliticianProfileFormValues,
  type PoliticianProfileInput,
  type PoliticianProfileRecord,
  parsePoliticianProfileForm,
} from "../../shared/utils/politician-profile";

const fields = [
  { key: "name", label: "氏名", type: "text" },
  { key: "name_kana", label: "ふりがな", type: "text" },
  { key: "number", label: "議席番号", type: "number" },
  { key: "birth_date", label: "生年月日", type: "text" },
  { key: "election_count", label: "当選回数", type: "number" },
  { key: "faction", label: "所属会派", type: "text" },
  { key: "standing_committee", label: "常任委員会", type: "text" },
  { key: "special_committee", label: "特別委員会", type: "text" },
  { key: "image_url", label: "顔写真URL", type: "url" },
  { key: "homepage", label: "公式サイトURL", type: "url" },
  { key: "address", label: "公開住所", type: "text" },
  { key: "contact", label: "公開電話番号", type: "text" },
] as const;

export function PoliticianManager({
  politicians,
  onSave,
  onRefresh,
  scrollToForm,
}: {
  politicians: PoliticianProfileRecord[];
  onSave: (
    input: PoliticianProfileInput
  ) => Promise<{ data?: { id: string }; error?: string; warning?: string }>;
  onRefresh: () => void;
  scrollToForm: () => void;
}) {
  const [editingId, setEditingId] = useState<string>();
  const [form, setForm] = useState(getPoliticianProfileFormValues);
  const [preview, setPreview] = useState<PoliticianProfileInput | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function startEditing(politician?: PoliticianProfileRecord) {
    setEditingId(politician?.id);
    setForm(getPoliticianProfileFormValues(politician));
    setPreview(null);
    setConfirmed(false);
    setError("");
    setMessage("");
    scrollToForm();
  }

  function showPreview() {
    const result = parsePoliticianProfileForm(form, editingId);
    if (!result.success) {
      setError(result.error.issues.map((issue) => issue.message).join("、"));
      setPreview(null);
      setConfirmed(false);
      return;
    }
    setError("");
    setPreview(result.data);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!preview || !confirmed) {
      setError("保存前の表示と公式資料を確認してください");
      return;
    }
    setIsSubmitting(true);
    setError("");
    setMessage("");
    try {
      const result = await onSave(preview);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (!result.data) {
        setError(
          "保存結果を確認できませんでした。再読み込みして確認してください"
        );
        return;
      }
      setEditingId(undefined);
      setForm(getPoliticianProfileFormValues());
      setPreview(null);
      setConfirmed(false);
      setMessage("議員情報を保存しました。公開サイトの更新対象になりました。");
      setError(result.warning ?? "");
      onRefresh();
    } catch (error) {
      console.error("Politician form error:", error);
      setError("議員情報を保存できませんでした");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-5 rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold">
          {editingId ? "議員情報を編集" : "議員を登録"}
        </h2>
        <p className="text-sm text-muted-foreground">
          下書き・非公開機能はありません。新規登録も変更も、保存すると公開サイトに反映されます。公式資料と表示を確認してから保存してください。
        </p>
        <p className="text-sm text-muted-foreground">
          生年月日は「昭和50年4月1日」「1975-04-01」など原資料の表記で入力できます。常任・特別委員会は別々に入力し、役職も含めて記載してください。
        </p>
        <p className="text-sm text-muted-foreground">
          住所・電話番号は議会などが公式に公開している情報のみ入力してください。空欄で保存した項目は公開表示から消えます。年齢は生年月日から計算されます。
        </p>
        {editingId && (
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/politician-speeches" className="underline">
              議会での発言を管理
            </Link>
          </div>
        )}
        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        <form onSubmit={handleSubmit}>
          <fieldset disabled={isSubmitting} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={`politician-${field.key}`}>
                    {field.label}
                  </Label>
                  <Input
                    id={`politician-${field.key}`}
                    type={field.type}
                    min={field.key === "number" ? 1 : 0}
                    step={field.type === "number" ? 1 : undefined}
                    required={field.key === "name" || field.key === "number"}
                    value={form[field.key]}
                    onChange={(event) => {
                      setForm({ ...form, [field.key]: event.target.value });
                      setPreview(null);
                      setConfirmed(false);
                      setMessage("");
                    }}
                  />
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" onClick={showPreview}>
              保存前に表示を確認
            </Button>
            {preview && (
              <section
                aria-label="保存前の議員情報"
                className="space-y-3 rounded-lg border p-4"
              >
                <h3 className="font-semibold">{preview.name}</h3>
                <dl className="space-y-2 text-sm">
                  {fields.map((field) => (
                    <div key={field.key}>
                      <dt className="font-medium">{field.label}</dt>
                      <dd className="break-words whitespace-pre-wrap">
                        {preview[field.key] ?? "未設定"}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="text-sm text-muted-foreground">
                  当選回数が未設定の場合、公開サイトは1回と表示します。写真URLは画像の参照先、公式サイトURLはリンクの参照先に使われます。
                </p>
              </section>
            )}
            <div className="flex items-start gap-2">
              <Checkbox
                id="politician-confirmed"
                checked={confirmed}
                disabled={!preview}
                onCheckedChange={(checked) => setConfirmed(checked === true)}
              />
              <Label htmlFor="politician-confirmed">
                公式資料と入力内容を確認しました。保存すると公開されることを確認しました
              </Label>
            </div>
            <div className="flex justify-end gap-2">
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => startEditing()}
                >
                  編集をやめる
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting || !preview || !confirmed}
              >
                {isSubmitting
                  ? "保存中..."
                  : editingId
                    ? "変更を保存して公開"
                    : "議員を登録して公開"}
              </Button>
            </div>
          </fieldset>
        </form>
      </section>
      <section className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">
          登録済み議員 ({politicians.length}人)
        </h2>
        <ul className="divide-y">
          {politicians.map((politician) => (
            <li
              key={politician.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-semibold">{politician.name}</p>
                <p className="text-sm text-muted-foreground">
                  議席{politician.number}番・{politician.faction || "無所属"}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label={`${politician.name}を編集`}
                disabled={isSubmitting}
                onClick={() => startEditing(politician)}
              >
                編集
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

"use client";

import { extractMayorPolicy } from "@mirai-gikai/shared/politicians/mayor-policy";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getMayorProfileFormValues,
  type MayorProfileContent,
  type MayorProfileInput,
  type MayorProfileRecord,
  parseMayorProfileForm,
} from "../../shared/utils/mayor-profile";

const fields = [
  { key: "name", label: "氏名", type: "text" },
  { key: "name_kana", label: "ふりがな", type: "text" },
  { key: "birth_date", label: "生年月日", type: "text" },
  { key: "start_date", label: "就任日", type: "date" },
  { key: "term_number", label: "期数", type: "number" },
  { key: "image_url", label: "顔写真URL", type: "url" },
  { key: "official_url", label: "公式の市長室URL", type: "url" },
] as const;

export function MayorProfileForm({
  initial,
  onSave,
}: {
  initial: MayorProfileRecord;
  onSave: (input: MayorProfileInput) => Promise<{
    data?: MayorProfileRecord;
    error?: string;
    warning?: string;
  }>;
}) {
  const [form, setForm] = useState(() => getMayorProfileFormValues(initial));
  const [saved, setSaved] = useState(initial);
  const [preview, setPreview] = useState<MayorProfileContent | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const policy = extractMayorPolicy(preview?.bio ?? null);

  function changeField(key: keyof typeof form, value: string) {
    setForm({ ...form, [key]: value });
    setPreview(null);
    setConfirmed(false);
    setMessage("");
  }

  function showPreview() {
    const result = parseMayorProfileForm(form);
    setConfirmed(false);
    if (!result.success) {
      setError(result.error.issues.map((issue) => issue.message).join("、"));
      setPreview(null);
      return;
    }
    setError("");
    setPreview(result.data);
  }

  function resetForm() {
    setForm(getMayorProfileFormValues(saved));
    setPreview(null);
    setConfirmed(false);
    setError("");
    setMessage("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!preview || !confirmed) {
      setError("公式資料と保存前の表示を確認してください");
      return;
    }
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const result = await onSave({
        id: saved.id || undefined,
        content: preview,
      });
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
      setSaved(result.data);
      setForm(getMayorProfileFormValues(result.data));
      setPreview(null);
      setConfirmed(false);
      setMessage(
        saved.id
          ? "市長プロフィールを保存しました。公開サイトの更新対象になりました。"
          : "人物を登録しました。「交代と任期履歴」で就任を登録すると一覧に掲載されます。"
      );
      setError(result.warning ?? "");
    } catch (error) {
      console.error("Mayor profile form error:", error);
      setError("市長プロフィールを保存できませんでした");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      <fieldset disabled={submitting} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <div className="space-y-2" key={field.key}>
              <Label htmlFor={`mayor-${field.key}`}>{field.label}</Label>
              <Input
                id={`mayor-${field.key}`}
                type={field.type}
                min={field.type === "number" ? 1 : undefined}
                step={field.type === "number" ? 1 : undefined}
                required={field.key === "name"}
                readOnly={
                  field.key === "start_date" || field.key === "term_number"
                }
                value={form[field.key]}
                onChange={(event) => changeField(field.key, event.target.value)}
              />
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          就任日・期数は「交代と任期履歴」で管理します。新規の人物はプロフィール登録だけでは現職・歴代の一覧に掲載されません。
        </p>
        <div className="space-y-2">
          <Label htmlFor="mayor-bio">紹介文・経歴・基本方針</Label>
          <Textarea
            id="mayor-bio"
            rows={12}
            value={form.bio}
            onChange={(event) => changeField("bio", event.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            一覧カードの「まちづくりの5つの柱」は、この紹介文から読み取ります。文章を変えると柱の表示が消える場合があるため、下のプレビューを確認してください。
          </p>
        </div>
        <Button type="button" variant="outline" onClick={showPreview}>
          保存前に表示を確認
        </Button>
        {preview && (
          <section
            aria-label="保存前の市長プロフィール"
            className="space-y-4 rounded-lg border bg-card p-5"
          >
            <div className="flex items-center gap-4">
              {preview.image_url && (
                <Image
                  src={preview.image_url}
                  alt="顔写真プレビュー"
                  width={96}
                  height={96}
                  unoptimized
                  className="size-24 rounded-full object-cover"
                />
              )}
              <div>
                <p className="text-sm">{preview.name_kana}</p>
                <h2 className="text-xl font-bold">{preview.name}</h2>
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              <div>
                <dt>生年月日（年齢は公開時に自動計算）</dt>
                <dd>{preview.birth_date ?? "未設定"}</dd>
              </div>
              <div>
                <dt>就任日</dt>
                <dd>{preview.start_date ?? "未設定"}</dd>
              </div>
              <div>
                <dt>期数</dt>
                <dd>
                  {preview.term_number == null
                    ? "未設定"
                    : `${preview.term_number}期目`}
                </dd>
              </div>
            </dl>
            <p className="whitespace-pre-wrap">{preview.bio}</p>
            {preview.official_url && (
              <a
                href={preview.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                大分市公式サイトの市長室を見る
              </a>
            )}
            <section
              aria-label="一覧カードの政策表示"
              className="space-y-2 border-t pt-4"
            >
              <h3 className="font-semibold">
                一覧カードの「まちづくりの5つの柱」
              </h3>
              {policy.pillars.length > 0 ? (
                <>
                  {policy.motto && <p>基本方針「{policy.motto}」</p>}
                  <ul className="list-disc pl-5">
                    {policy.pillars.map((pillar, index) => (
                      <li key={`${index}-${pillar}`}>{pillar}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p>
                  紹介文から5つの柱を読み取れないため、一覧カードには柱を表示しません。
                </p>
              )}
            </section>
          </section>
        )}
        <div className="flex items-start gap-2">
          <Checkbox
            id="mayor-confirmed"
            checked={confirmed}
            disabled={!preview}
            onCheckedChange={(checked) => setConfirmed(checked === true)}
          />
          <Label htmlFor="mayor-confirmed">
            公式資料と表示、保存後の公開範囲を確認しました
          </Label>
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={resetForm}>
            変更を取り消す
          </Button>
          <Button type="submit" disabled={submitting || !preview || !confirmed}>
            {submitting
              ? "保存中..."
              : saved.id
                ? "変更を保存して公開"
                : "人物を登録（就任は別途）"}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}

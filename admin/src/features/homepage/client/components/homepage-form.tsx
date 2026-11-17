"use client";

import {
  type HomepageContent,
  type HomepageField,
  type HomepageRecord,
  homepageFields,
  homepageKeys,
  parseHomepageContent,
} from "@mirai-gikai/shared/homepage/content";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  homepageImageAccept,
  homepageImageLimit,
} from "../../shared/utils/image-file";

const sections = [
  ...new Set(homepageKeys.map((key) => homepageFields[key].section)),
];

export function HomepageForm({
  initial,
  onSave,
  onUpload,
}: {
  initial: HomepageRecord;
  onSave: (
    content: HomepageContent,
    revision: number
  ) => Promise<{ data?: HomepageRecord; error?: string; warning?: string }>;
  onUpload: (input: FormData) => Promise<{ url?: string; error?: string }>;
}) {
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState(initial.content);
  const [files, setFiles] = useState<Partial<Record<HomepageField, File>>>({});
  const [preview, setPreview] = useState<HomepageContent | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const hasFiles = Object.keys(files).length > 0;

  function invalidatePreview() {
    setPreview(null);
    setConfirmed(false);
    setMessage("");
    setError("");
  }

  function change(key: HomepageField, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    invalidatePreview();
  }

  async function upload(key: HomepageField) {
    const file = files[key];
    if (!file) return;
    setBusy(true);
    invalidatePreview();
    try {
      const input = new FormData();
      input.set("image", file);
      const result = await onUpload(input);
      if (!result.url) {
        setError(result.error ?? "アップロード結果を確認できませんでした");
        return;
      }
      change(key, result.url);
      setFiles((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
      setMessage(
        "画像をアップロードしました。トップページにはまだ反映されません。プレビュー後に保存してください。"
      );
    } catch (error) {
      console.error("Homepage image upload failed:", error);
      setError("画像をアップロードできませんでした");
    } finally {
      setBusy(false);
    }
  }

  function showPreview() {
    invalidatePreview();
    try {
      if (hasFiles)
        throw new Error(
          "選択中の画像をアップロードするか、選択を取り消してください"
        );
      setPreview(parseHomepageContent(form));
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "入力を確認してください"
      );
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!preview || !confirmed || hasFiles) {
      setError("プレビューとリンク先を確認し、確認欄にチェックしてください");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await onSave(preview, saved.revision);
      if (!result.data) {
        setError(
          result.error ??
            "保存結果を確認できません。再読み込みして確認してください"
        );
        return;
      }
      setSaved(result.data);
      setForm(result.data.content);
      setPreview(null);
      setConfirmed(false);
      setMessage(
        "トップページを保存しました。公開サイトの更新対象になりました。"
      );
      setError(result.warning ?? "");
    } catch (error) {
      console.error("Homepage save failed:", error);
      setError("トップページを保存できませんでした");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      <p className="text-sm text-muted-foreground">
        画像はPNG・JPEG・GIF・WebP（5MB以下）をアップロードするか、httpsの画像URL・サイト内パスを入力できます。アップロードした画像は公開URLに保存されるため、個人情報や利用権限のない画像を選ばないでください。アップロードだけではトップの表示は変わりません。既存の画像は削除しません。
      </p>
      <fieldset disabled={busy} className="space-y-5">
        {sections.map((section) => (
          <details
            key={section}
            open
            className="space-y-4 rounded-lg border p-4"
          >
            <summary className="cursor-pointer text-lg font-bold">
              {section}
            </summary>
            {homepageKeys
              .filter((key) => homepageFields[key].section === section)
              .map((key) => {
                const field = homepageFields[key];
                return (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`home-${key}`}>{field.label}</Label>
                    {field.kind === "body" ? (
                      <Textarea
                        id={`home-${key}`}
                        rows={3}
                        value={form[key]}
                        onChange={(event) => change(key, event.target.value)}
                      />
                    ) : (
                      <Input
                        id={`home-${key}`}
                        value={form[key]}
                        onChange={(event) => change(key, event.target.value)}
                      />
                    )}
                    {field.kind === "image" && (
                      <div className="space-y-2">
                        <Input
                          aria-label={`${field.label}のファイル`}
                          type="file"
                          accept={homepageImageAccept}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            event.target.value = "";
                            if (!file) return;
                            invalidatePreview();
                            if (
                              file.size > homepageImageLimit ||
                              !homepageImageAccept
                                .split(",")
                                .includes(file.type)
                            ) {
                              setError(
                                "5MB以下のPNG・JPEG・GIF・WebPを選んでください"
                              );
                              return;
                            }
                            setFiles((current) => ({
                              ...current,
                              [key]: file,
                            }));
                          }}
                        />
                        {files[key] && (
                          <div className="flex flex-wrap items-center gap-2">
                            <span>{files[key]?.name}</span>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => upload(key)}
                            >
                              {field.label}をアップロード
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setFiles((current) => {
                                  const next = { ...current };
                                  delete next[key];
                                  return next;
                                });
                                invalidatePreview();
                              }}
                            >
                              選択を取り消す
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </details>
        ))}
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={showPreview}>
            保存前に表示を確認
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setForm(saved.content);
              setFiles({});
              invalidatePreview();
            }}
          >
            最後に保存した内容に戻す
          </Button>
        </div>
        {preview && (
          <section
            aria-label="保存前のトップページ"
            className="space-y-5 rounded-lg border bg-card p-5"
          >
            <h2 className="text-xl font-bold">内容確認プレビュー</h2>
            <p className="text-sm text-muted-foreground">
              文章・画像・リンクの確認用です。公開ページの配置・装飾は変わりません。一般質問はリンク先が空欄なら最新会期へ自動で案内し、対象会期がない場合は表示されません。トピックス案内も公開記事がある場合のみ表示されます。
            </p>
            {sections.map((section) => (
              <section
                key={section}
                className="space-y-3 rounded-lg border p-4"
              >
                <h3 className="font-bold">{section}</h3>
                <dl className="space-y-3">
                  {homepageKeys
                    .filter((key) => homepageFields[key].section === section)
                    .map((key) => {
                      const field = homepageFields[key];
                      return (
                        <div key={key}>
                          <dt className="text-sm text-muted-foreground">
                            {field.label}
                          </dt>
                          <dd className="whitespace-pre-wrap break-words">
                            {field.kind === "image" ? (
                              <Image
                                src={preview[key]}
                                alt={`${field.label}プレビュー`}
                                width={640}
                                height={240}
                                unoptimized
                                className="max-h-60 w-auto max-w-full object-contain"
                              />
                            ) : field.kind === "link" ||
                              field.kind === "optional-link" ? (
                              preview[key] ? (
                                <a
                                  href={preview[key]}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="underline"
                                >
                                  {preview[key]}
                                </a>
                              ) : (
                                "最新会期へ自動設定"
                              )
                            ) : (
                              preview[key]
                            )}
                          </dd>
                        </div>
                      );
                    })}
                </dl>
              </section>
            ))}
            <div className="flex items-center gap-2">
              <Checkbox
                id="homepage-confirm"
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked === true)}
              />
              <Label htmlFor="homepage-confirm">
                文章・画像の利用権限・リンク先を確認しました。保存して公開サイトに反映します。
              </Label>
            </div>
            <Button type="submit" disabled={!confirmed || busy}>
              トップページを保存して反映
            </Button>
          </section>
        )}
      </fieldset>
    </form>
  );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  EditField,
  SelectField,
} from "@/features/content-management/client/components/edit-field";
import {
  type TopicContentInput,
  type TopicFormValues,
  topicCategories,
  topicContentSchema,
  topicFormData,
} from "../../shared/utils/topic-edit";
import type { TopicSourceOption } from "../../shared/utils/topic-sources";
import { TopicRelatedLinkFields } from "./topic-related-link-fields";
import { TopicSourceFields } from "./topic-source-fields";

const sections = [
  ["summary_line_1", "３つの要点：1"],
  ["summary_line_2", "３つの要点：2"],
  ["summary_line_3", "３つの要点：3"],
  ["details", "取り組みの具体的な詳細内容"],
  ["reason", "この取り組みが必要な理由"],
  ["point_1", "重要ポイント：1"],
  ["point_2", "重要ポイント：2"],
  ["point_3", "重要ポイント：3"],
  ["target_audience", "主に影響を受ける人・対象者"],
  ["positive_voice", "議論の争点：賛成・期待の声"],
  ["cautious_voice", "議論の争点：慎重・懸念の声"],
] as const;

export function TopicEditFields({
  initial,
  sources = [],
}: {
  initial: TopicFormValues;
  sources?: TopicSourceOption[];
}) {
  const [preview, setPreview] = useState<TopicContentInput | null>(null);
  return (
    <div className="space-y-4" onChange={() => setPreview(null)}>
      <input type="hidden" name="id" value={initial.id} />
      <input
        type="hidden"
        name="expected_updated_at"
        value={initial.expected_updated_at}
      />
      <EditField
        name="title"
        label="記事タイトル"
        value={initial.title}
        required
      />
      <SelectField
        name="category"
        label="カテゴリ"
        value={initial.category}
        options={topicCategories}
      />
      <EditField
        name="status_label"
        label="取り組みの状況（例：予算可決・審議中）"
        value={initial.status_label}
        required
      />
      <SelectField
        name="status_class"
        label="状況バッジの種類"
        value={initial.status_class}
        options={[
          { value: initial.status_class, label: "現在の種類を維持" },
          ...[
            { value: "status-settled", label: "決定・可決・承認" },
            { value: "status-review", label: "審議中" },
            { value: "status-discussions", label: "提言・議論中" },
            { value: "status-before", label: "提出前" },
          ].filter((item) => item.value !== initial.status_class),
        ]}
      />
      {sections.map(([name, label]) => (
        <EditField
          key={name}
          name={name}
          label={label}
          value={initial[name]}
          multiline
        />
      ))}
      <EditField
        name="decision_date"
        label="議決日"
        type="date"
        value={initial.decision_date}
      />
      <input type="hidden" name="link_label" value={initial.link_label} />
      <input type="hidden" name="link_url" value={initial.link_url} />
      <TopicRelatedLinkFields
        initial={initial.related_links}
        onChange={() => setPreview(null)}
      />
      <TopicSourceFields initial={initial.source_refs} options={sources} />
      <Button
        type="button"
        variant="outline"
        onClick={(event) => {
          const form = event.currentTarget.form;
          if (!form) return;
          try {
            setPreview(
              topicContentSchema.parse(topicFormData(new FormData(form)))
            );
          } catch (error) {
            console.error("Topic preview failed:", error);
            toast.error(
              "入力内容を確認してください。タイトル・状況・URL・日付が正しいか確認してください。"
            );
          }
        }}
      >
        保存前に内容を確認する
      </Button>
      {preview && (
        <section
          aria-label="保存前の記事プレビュー"
          className="space-y-4 rounded-lg border p-4"
        >
          <h2 className="text-xl font-bold">{preview.title}</h2>
          <p>
            {
              topicCategories.find((item) => item.value === preview.category)
                ?.label
            }{" "}
            / {preview.status_label}
          </p>
          {sections.map(
            ([name, label]) =>
              preview[name] && (
                <section key={name}>
                  <h3 className="font-semibold">{label}</h3>
                  <p className="whitespace-pre-wrap">{preview[name]}</p>
                </section>
              )
          )}
          {preview.related_links.length > 0 && (
            <section aria-label="関連リンクのプレビュー">
              <h3 className="font-semibold">関連リンク</h3>
              <ul className="space-y-2">
                {preview.related_links.map((link, index) => (
                  <li key={`${link.url}-${index}`}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {link.label || "詳しく見る"}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <h3 className="font-semibold">出典の議事録・議案</h3>
          {preview.source_refs.map((source, index) => (
            <p key={`${source.session_id}-${index}`}>
              {source.meeting_title} / {source.date} / {source.session_label}
              {" / "}
              {source.bill_number} {source.bill_name}
              {source.evidence_quote && ` / 引用：${source.evidence_quote}`}
            </p>
          ))}
          <p className="text-sm text-muted-foreground">
            入力内容の確認用です。公開・非公開はこの保存では変更しません。
          </p>
        </section>
      )}
    </div>
  );
}

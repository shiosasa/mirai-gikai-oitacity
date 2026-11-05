"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  selectTopicSource,
  type TopicSource,
  type TopicSourceOption,
} from "../../shared/utils/topic-sources";

export function TopicSourceFields({
  initial,
  options,
}: {
  initial: TopicSource[];
  options: TopicSourceOption[];
}) {
  const [sources, setSources] = useState(initial);
  const [selected, setSelected] = useState("");
  const id = useId();
  function update(index: number, source: TopicSource) {
    setSources((current) =>
      current.map((item, position) => (position === index ? source : item))
    );
  }
  return (
    <section
      aria-label="出典の議事録・議案"
      className="space-y-4 rounded-lg border p-4"
    >
      <h2 className="font-semibold">出典の議事録・議案</h2>
      <p className="text-sm text-muted-foreground">
        記事の根拠となる開催日を選び、必要に応じて議案を指定してください。公開記事の議事録リンク、議案との関連、カテゴリ検索に使われます。
      </p>
      <input type="hidden" name="source_refs" value={JSON.stringify(sources)} />
      {sources.map((source, index) => {
        const option = options.find(
          (item) => item.sessionId === source.session_id
        );
        const billIndex =
          option?.bills.findIndex(
            (bill) =>
              bill.name === source.bill_name &&
              bill.number === source.bill_number
          ) ?? -1;
        const missingBill =
          (source.bill_name !== null || source.bill_number !== null) &&
          billIndex < 0;
        return (
          <fieldset
            key={`${source.session_id}-${index}`}
            className="space-y-3 rounded-md border p-3"
          >
            <legend className="px-1 font-medium">出典 {index + 1}</legend>
            <p>
              {source.meeting_title} / {source.date} / {source.session_label}
            </p>
            {!option && (
              <p role="alert" className="text-destructive">
                この開催日が見つかりません。原文を確認して出典を選び直してください。
              </p>
            )}
            {option && (
              <div className="space-y-2">
                <Label htmlFor={`${id}-bill-${index}`}>
                  出典 {index + 1} の議案
                </Label>
                <select
                  id={`${id}-bill-${index}`}
                  value={
                    missingBill
                      ? "missing"
                      : billIndex < 0
                        ? ""
                        : String(billIndex)
                  }
                  className="w-full rounded-md border bg-background p-2 text-sm"
                  onChange={(event) => {
                    update(
                      index,
                      selectTopicSource(
                        option,
                        event.target.value === ""
                          ? undefined
                          : Number(event.target.value)
                      )
                    );
                  }}
                >
                  <option value="">議案を指定しない（開催日全体）</option>
                  {missingBill && (
                    <option value="missing" disabled>
                      現在の議案が見つかりません：{source.bill_number}{" "}
                      {source.bill_name}
                    </option>
                  )}
                  {option.bills.map((bill, position) => (
                    <option
                      key={`${position}-${bill.name}`}
                      value={String(position)}
                    >
                      {bill.number} {bill.name}
                    </option>
                  ))}
                </select>
                <a
                  href={`/minutes/${option.meetingId}/sessions/${option.sessionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline"
                >
                  出典の原文を別タブで確認
                </a>
              </div>
            )}
            <Label htmlFor={`${id}-quote-${index}`}>
              出典 {index + 1} の根拠引用（任意）
            </Label>
            <Textarea
              id={`${id}-quote-${index}`}
              value={source.evidence_quote ?? ""}
              onChange={(event) =>
                update(index, {
                  ...source,
                  evidence_quote: event.target.value || null,
                })
              }
            />
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setSources((current) =>
                  current.filter((_, position) => position !== index)
                )
              }
            >
              出典 {index + 1} を外す
            </Button>
          </fieldset>
        );
      })}
      <Label htmlFor={`${id}-session`}>追加する開催日</Label>
      <select
        id={`${id}-session`}
        value={selected}
        onChange={(event) => setSelected(event.target.value)}
        className="w-full rounded-md border bg-background p-2 text-sm"
      >
        <option value="">開催日を選択してください</option>
        {options.map((option) => (
          <option key={option.sessionId} value={option.sessionId}>
            {option.meetingType} / {option.meetingTitle} / {option.date} /{" "}
            {option.sessionLabel}
          </option>
        ))}
      </select>
      <Button
        type="button"
        variant="outline"
        disabled={!selected}
        onClick={() => {
          const option = options.find(
            (item) => String(item.sessionId) === selected
          );
          if (!option) throw new Error("開催日を選択してください");
          setSources((current) => [...current, selectTopicSource(option)]);
          setSelected("");
        }}
      >
        出典を追加
      </Button>
      <p className="text-sm text-muted-foreground">
        追加・解除の変更は「保存」するまで反映されません。議案を変更すると根拠引用はクリアされます。
      </p>
    </section>
  );
}

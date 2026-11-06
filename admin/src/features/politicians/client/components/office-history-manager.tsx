"use client";

import {
  formatOfficeTerm,
  type OfficeTerm,
} from "@mirai-gikai/shared/politicians/office-history";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type OfficeChangeInput,
  type OfficePerson,
  officeChangeSchema,
} from "../../shared/utils/office-change";

const actions = {
  begin: "就任・再就任",
  retire: "退任のみ",
  renew: "再選（同じ人物の次の任期）",
  replace: "後任への交代",
  "confirm-start": "未確認の就任日を公式資料で確定",
};

export function OfficeHistoryManager({
  people,
  terms,
  onSave,
  onRefresh,
}: {
  people: OfficePerson[];
  terms: OfficeTerm[];
  onSave: (
    input: OfficeChangeInput
  ) => Promise<{ data?: { id: number }; error?: string; warning?: string }>;
  onRefresh: () => void;
}) {
  const [personKey, setPersonKey] = useState("");
  const [action, setAction] = useState("begin");
  const [startedOn, setStartedOn] = useState("");
  const [endedOn, setEndedOn] = useState("");
  const [successor, setSuccessor] = useState("");
  const [seat, setSeat] = useState("");
  const [termNumber, setTermNumber] = useState("");
  const [source, setSource] = useState("");
  const [preview, setPreview] = useState<OfficeChangeInput | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const person = people.find((item) => `${item.role}:${item.id}` === personKey);
  const history = terms.filter(
    (item) =>
      item.role === person?.role &&
      (person.role === "mayor" ? String(item.mayor_id) : item.politician_id) ===
        person.id
  );
  const current = history.find((item) => item.ended_on === null);
  const successorPerson = people.find(
    (item) => item.role === person?.role && item.id === successor
  );

  function invalidate() {
    setPreview(null);
    setConfirmed(false);
    setError("");
    setMessage("");
  }
  function showPreview() {
    const parsed = officeChangeSchema.safeParse({
      role: person?.role,
      personId: person?.id,
      action,
      expectedTerm: current?.id ?? null,
      startedOn: action === "retire" ? null : startedOn || null,
      endedOn:
        action === "begin" || action === "confirm-start"
          ? null
          : endedOn || null,
      successorId: action === "replace" ? successor || null : null,
      seatNumber: seat ? Number(seat) : null,
      termNumber: termNumber ? Number(termNumber) : null,
      sourceUrl: source,
    });
    setConfirmed(false);
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join("、"));
      setPreview(null);
      return;
    }
    setError("");
    setPreview(parsed.data);
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!preview || !confirmed) {
      setError("変更内容と公式資料を確認してください");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await onSave(preview);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (!result.data) {
        setError("保存結果を確認できませんでした。再読み込みしてください");
        return;
      }
      setPreview(null);
      setConfirmed(false);
      setPersonKey("");
      setSuccessor("");
      setStartedOn("");
      setEndedOn("");
      setTermNumber("");
      setSeat("");
      setSource("");
      setMessage(
        "任期の変更を保存しました。人物と過去の活動は削除されません。"
      );
      setError(result.warning ?? "");
      onRefresh();
    } catch (error) {
      console.error("Office history form error:", error);
      setError("任期の変更を保存できませんでした");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <p>
        新しい人は先に
        <Link href="/mayor-profile" className="underline">
          市長プロフィール
        </Link>
        または
        <Link href="/politicians" className="underline">
          議員紹介
        </Link>
        で登録してください。同一人物の再選・再就任では新しい人物を作らず、既存の人物を選びます。
      </p>
      <form onSubmit={save} className="space-y-5 rounded-lg border p-5">
        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        <fieldset disabled={busy} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="office-person">対象の人物</Label>
            <select
              id="office-person"
              className="w-full rounded-md border bg-background p-2"
              value={personKey}
              onChange={(event) => {
                invalidate();
                setPersonKey(event.target.value);
                setSuccessor("");
                setSeat("");
                setTermNumber("");
                setStartedOn("");
                setEndedOn("");
                setSource("");
                const selected = people.find(
                  (item) => `${item.role}:${item.id}` === event.target.value
                );
                setAction(selected?.isCurrent ? "retire" : "begin");
              }}
            >
              <option value="">選択してください</option>
              {people.map((item) => (
                <option
                  key={`${item.role}:${item.id}`}
                  value={`${item.role}:${item.id}`}
                >
                  {item.role === "mayor" ? "市長" : "議員"}：{item.name}（
                  {item.isCurrent ? "現職" : "非現職"}）
                </option>
              ))}
            </select>
          </div>
          {person && (
            <>
              <section aria-label="登録済みの任期">
                <h2 className="font-semibold">登録済みの任期</h2>
                {history.length ? (
                  <ul>
                    {history.map((item) => (
                      <li key={item.id}>
                        {formatOfficeTerm(item)}
                        {item.seat_number ? `・議席${item.seat_number}番` : ""}
                        {item.faction ? `・${item.faction}` : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    任期は未登録です。現職・歴代の一覧にはまだ掲載されません。
                  </p>
                )}
              </section>
              <div className="space-y-2">
                <Label htmlFor="office-action">操作</Label>
                <select
                  id="office-action"
                  className="w-full rounded-md border bg-background p-2"
                  value={action}
                  onChange={(event) => {
                    invalidate();
                    setAction(event.target.value);
                  }}
                >
                  {Object.entries(actions)
                    .filter(([key]) =>
                      person.isCurrent
                        ? key !== "begin" &&
                          (key !== "confirm-start" ||
                            current?.started_on === null)
                        : key === "begin"
                    )
                    .map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                </select>
              </div>
              {action === "replace" && (
                <div className="space-y-2">
                  <Label htmlFor="office-successor">後任の人物</Label>
                  <select
                    id="office-successor"
                    className="w-full rounded-md border bg-background p-2"
                    value={successor}
                    onChange={(event) => {
                      invalidate();
                      setSuccessor(event.target.value);
                    }}
                  >
                    <option value="">選択してください</option>
                    {people
                      .filter(
                        (item) =>
                          item.role === person.role &&
                          !item.isCurrent &&
                          item.id !== person.id
                      )
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
              {action !== "begin" && action !== "confirm-start" && (
                <div className="space-y-2">
                  <Label htmlFor="office-end">退任日（在任最終日）</Label>
                  <Input
                    id="office-end"
                    type="date"
                    value={endedOn}
                    onChange={(event) => {
                      invalidate();
                      setEndedOn(event.target.value);
                    }}
                  />
                </div>
              )}
              {action !== "retire" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="office-start">新しい任期の就任日</Label>
                    <Input
                      id="office-start"
                      type="date"
                      value={startedOn}
                      onChange={(event) => {
                        invalidate();
                        setStartedOn(event.target.value);
                      }}
                    />
                  </div>
                  {action !== "confirm-start" && (
                    <div className="space-y-2">
                      <Label htmlFor="office-term">
                        通算の期数（再就任を含む）
                      </Label>
                      <Input
                        id="office-term"
                        type="number"
                        min={1}
                        step={1}
                        value={termNumber}
                        onChange={(event) => {
                          invalidate();
                          setTermNumber(event.target.value);
                        }}
                      />
                    </div>
                  )}
                  {person.role === "councillor" &&
                    action !== "confirm-start" && (
                      <div className="space-y-2">
                        <Label htmlFor="office-seat">
                          新しい任期の議席番号
                        </Label>
                        <Input
                          id="office-seat"
                          type="number"
                          min={1}
                          step={1}
                          value={seat}
                          onChange={(event) => {
                            invalidate();
                            setSeat(event.target.value);
                          }}
                        />
                      </div>
                    )}
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="office-source">
                  就退任を確認した公式出典URL
                </Label>
                <Input
                  id="office-source"
                  type="url"
                  value={source}
                  onChange={(event) => {
                    invalidate();
                    setSource(event.target.value);
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                未来日の予約はできません。退任日は在任最終日、新任は翌日以降で登録します。一括選挙では退任を先に保存すると議席を引き継げます。入力に誤りがあれば保存せず確認してください。
              </p>
              <Button type="button" variant="outline" onClick={showPreview}>
                任期の変更を確認
              </Button>
            </>
          )}
          {preview && (
            <section
              aria-label="任期変更の確認"
              className="space-y-2 rounded-lg border p-4"
            >
              <h2 className="font-semibold">{actions[preview.action]}</h2>
              <p>
                対象：{person?.name}
                {preview.action === "replace"
                  ? ` → ${successorPerson?.name}`
                  : ""}
              </p>
              {preview.endedOn && <p>旧任期の在任最終日：{preview.endedOn}</p>}
              {preview.startedOn && (
                <p>
                  {preview.action === "confirm-start"
                    ? "確認した就任日"
                    : "新任期"}
                  ：{preview.startedOn}
                  {preview.action !== "confirm-start" &&
                    ` ～ 在任中（${preview.termNumber}期目）`}
                  {preview.role === "councillor" &&
                  preview.action !== "confirm-start"
                    ? `・議席${preview.seatNumber}番`
                    : ""}
                </p>
              )}
              <p>
                過去の人物ID・発言・議事録は残ります。市長の提案理由・会見は確認済みの任期の日付で振り分け、日付不明・任期不明の資料を新市長に引き継ぎません。
              </p>
              <p>
                退任した人は現職一覧から外れ、歴代一覧に表示されます。保存後は公開対象になります。
              </p>
            </section>
          )}
          <div className="flex items-start gap-2">
            <Checkbox
              id="office-confirm"
              disabled={!preview}
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
            />
            <Label htmlFor="office-confirm">
              公式資料・対象人物・日付・公開表示の変更を確認しました
            </Label>
          </div>
          <Button type="submit" disabled={!preview || !confirmed || busy}>
            {busy ? "保存中…" : "任期の変更を保存して公開"}
          </Button>
        </fieldset>
      </form>
    </div>
  );
}

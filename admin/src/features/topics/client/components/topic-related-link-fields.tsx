"use client";

import type { RelatedLink } from "@mirai-gikai/shared/bills/related-links";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TopicRelatedLinkFields({
  initial,
  onChange,
}: {
  initial: RelatedLink[];
  onChange: () => void;
}) {
  const prefix = useId();
  const [links, setLinks] = useState(
    initial.map((link, id) => ({ ...link, id }))
  );
  const [nextId, setNextId] = useState(initial.length);
  function move(index: number, offset: number) {
    onChange();
    setLinks((current) => {
      const reordered = [...current];
      [reordered[index], reordered[index + offset]] = [
        reordered[index + offset],
        reordered[index],
      ];
      return reordered;
    });
  }
  return (
    <section
      aria-label="関連リンクの編集"
      className="space-y-3 rounded-lg border p-4"
    >
      <h2 className="font-semibold">関連リンク</h2>
      <p className="text-sm text-muted-foreground">
        市公式ページや資料を複数登録できます。上から順に公開されます。表示名が空欄の場合は「詳しく見る」と表示します。議事録・議案は下の出典欄で設定してください。
      </p>
      <input
        type="hidden"
        name="related_links"
        value={JSON.stringify(links.map(({ label, url }) => ({ label, url })))}
      />
      {links.map((link, index) => (
        <fieldset key={link.id} className="space-y-2 rounded-md border p-3">
          <legend>関連リンク {index + 1}</legend>
          <Label htmlFor={`${prefix}-${link.id}-label`}>
            関連リンク {index + 1} の表示名
          </Label>
          <Input
            id={`${prefix}-${link.id}-label`}
            value={link.label}
            maxLength={200}
            onChange={(event) => {
              setLinks(
                links.map((item) =>
                  item.id === link.id
                    ? { ...item, label: event.target.value }
                    : item
                )
              );
            }}
          />
          <Label htmlFor={`${prefix}-${link.id}-url`}>
            関連リンク {index + 1} のURL
          </Label>
          <Input
            id={`${prefix}-${link.id}-url`}
            type="url"
            required
            maxLength={4000}
            value={link.url}
            onChange={(event) => {
              setLinks(
                links.map((item) =>
                  item.id === link.id
                    ? { ...item, url: event.target.value }
                    : item
                )
              );
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              aria-label={`関連リンク ${index + 1} を上へ`}
              disabled={index === 0}
              onClick={() => move(index, -1)}
            >
              <ArrowUp aria-hidden="true" />
              上へ
            </Button>
            <Button
              type="button"
              variant="outline"
              aria-label={`関連リンク ${index + 1} を下へ`}
              disabled={index === links.length - 1}
              onClick={() => move(index, 1)}
            >
              <ArrowDown aria-hidden="true" />
              下へ
            </Button>
            <Button
              type="button"
              variant="outline"
              aria-label={`関連リンク ${index + 1} を削除`}
              onClick={() => {
                onChange();
                setLinks(links.filter((item) => item.id !== link.id));
              }}
            >
              <Trash2 aria-hidden="true" />
              削除
            </Button>
          </div>
        </fieldset>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          onChange();
          setLinks([...links, { id: nextId, label: "", url: "" }]);
          setNextId(nextId + 1);
        }}
      >
        <Plus aria-hidden="true" />
        関連リンクを追加
      </Button>
    </section>
  );
}

"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  joinMarkdownSections,
  splitMarkdownSections,
} from "../../shared/utils/markdown-sections";

export function MarkdownContentEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [sourceMode, setSourceMode] = useState(false);
  const id = useId();
  const sections = splitMarkdownSections(value);
  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setSourceMode((current) => !current)}
      >
        {sourceMode ? "項目ごとの編集に戻る" : "本文全体・見出しを編集"}
      </Button>
      {sourceMode || sections.length === 1 ? (
        <div className="space-y-2">
          <Label htmlFor={id}>詳細本文（Markdown）</Label>
          <Textarea
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={18}
          />
        </div>
      ) : (
        sections.map((section, index) => (
          <div key={section.key} className="space-y-2">
            <Label htmlFor={`${id}-${index}`}>
              {section.heading.replace(/^##\s+/, "").trim() || "冒頭の説明"}
            </Label>
            <Textarea
              id={`${id}-${index}`}
              rows={6}
              value={section.body}
              onChange={(event) =>
                onChange(
                  joinMarkdownSections(
                    sections.map((entry, entryIndex) =>
                      entryIndex === index
                        ? { ...entry, body: event.target.value }
                        : entry
                    )
                  )
                )
              }
            />
          </div>
        ))
      )}
    </div>
  );
}

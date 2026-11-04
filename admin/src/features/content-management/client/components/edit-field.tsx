"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function EditField({
  name,
  label,
  value,
  multiline = false,
  required = false,
  type = "text",
  hint,
}: {
  name: string;
  label: string;
  value?: string | number | null;
  multiline?: boolean;
  required?: boolean;
  type?: "text" | "date" | "url" | "number";
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {multiline ? (
        <Textarea
          id={id}
          name={name}
          defaultValue={value ?? ""}
          required={required}
          rows={6}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
      ) : (
        <Input
          id={id}
          name={name}
          type={type}
          defaultValue={value ?? ""}
          required={required}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
      )}
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

export function SelectField({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
}) {
  const id = useId();
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        name={name}
        defaultValue={value}
        className="w-full rounded-md border bg-background p-2 text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function OrderField({ value }: { value: number }) {
  const [order, setOrder] = useState(value);
  const id = useId();
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>表示順（小さい数字が先）</Label>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          aria-label="表示順を1つ小さくする"
          disabled={order <= 0}
          onClick={() => setOrder(order - 1)}
        >
          −
        </Button>
        <Input
          id={id}
          name="order_index"
          type="number"
          min={0}
          step={1}
          required
          value={order}
          onChange={(event) => setOrder(event.target.valueAsNumber)}
          className="w-28"
        />
        <Button
          type="button"
          variant="outline"
          aria-label="表示順を1つ大きくする"
          onClick={() => setOrder(order + 1)}
        >
          ＋
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        同じ順序の項目がある場合は数字を調整し、それぞれ保存してください。
      </p>
    </div>
  );
}

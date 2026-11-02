"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";

export function SaveForm({
  children,
  save,
  confirmMessage,
  label = "保存する",
  resetAfterSave = false,
}: {
  children?: ReactNode;
  save: (data: FormData) => Promise<void>;
  confirmMessage: string;
  label?: string;
  resetAfterSave?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <form
      className="space-y-4 rounded-lg border bg-card p-4 sm:p-6"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        if (!window.confirm(confirmMessage)) return;
        setPending(true);
        setErrorMessage(null);
        try {
          await save(data);
          toast.success("保存しました");
          if (resetAfterSave) form.reset();
          router.refresh();
        } catch (error) {
          console.error("Content save failed:", error);
          const message =
            error instanceof z.ZodError
              ? error.issues.map((issue) => issue.message).join(" / ")
              : error instanceof Error
                ? error.message
                : "保存できませんでした";
          setErrorMessage(message);
          toast.error(message);
        } finally {
          setPending(false);
        }
      }}
    >
      <fieldset disabled={pending} className="min-w-0 space-y-4">
        {children}
        {errorMessage && (
          <p role="alert" className="text-sm text-destructive">
            {errorMessage}
          </p>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "保存中…" : label}
        </Button>
      </fieldset>
    </form>
  );
}

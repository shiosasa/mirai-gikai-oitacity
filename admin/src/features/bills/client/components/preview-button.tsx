"use client";

import { Eye } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generatePreviewUrl } from "../../server/actions/generate-preview-url";

interface PreviewButtonProps {
  billId: string;
  disabled?: boolean;
}

export function PreviewButton({
  billId,
  disabled = false,
}: PreviewButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePreview = async () => {
    const previewWindow = window.open("about:blank", "_blank");
    if (!previewWindow) {
      alert(
        "プレビューを開けませんでした。ブラウザーのポップアップ設定をご確認ください"
      );
      return;
    }

    previewWindow.opener = null;
    setIsLoading(true);
    try {
      const result = await generatePreviewUrl(billId);

      if (result.success && result.url) {
        previewWindow.location.href = result.url;
      } else {
        previewWindow.close();
        alert(result.error || "プレビューURLの生成に失敗しました");
      }
    } catch (error) {
      previewWindow.close();
      console.error("Preview URL generation failed:", error);
      alert("プレビューURLの生成中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handlePreview}
      disabled={isLoading || disabled}
      title={disabled ? "変更を保存してからプレビューしてください" : undefined}
    >
      <Eye className="h-4 w-4" />
      {isLoading ? "プレビュー準備中..." : "プレビュー"}
    </Button>
  );
}

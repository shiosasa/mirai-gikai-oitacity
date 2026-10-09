"use client";

import { useState } from "react";
import { User, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** ニックネーム未入力（匿名）のときに使う呼び名 */
export const ANONYMOUS_NICKNAME = "大分市民さん";

interface NicknameDialogProps {
  isOpen: boolean;
  /** 入力されたニックネーム（未入力なら ANONYMOUS_NICKNAME）を返す */
  onConfirm: (nickname: string) => void;
}

export function NicknameDialog({ isOpen, onConfirm }: NicknameDialogProps) {
  const [nickname, setNickname] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(nickname.trim() || ANONYMOUS_NICKNAME);
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-white border border-mirai-border p-6 shadow-lg">
        <DialogHeader className="space-y-2 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-oita-pink-light border border-oita-pink-accent flex items-center justify-center text-primary">
            <User className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-bold text-mirai-text">
            ニックネームを教えてな
          </DialogTitle>
          <DialogDescription className="text-xs text-mirai-text-secondary leading-relaxed">
            大分弁AI聞き役がお呼びする名前を入力してな。匿名でもいいんよ。未入力のときは「
            {ANONYMOUS_NICKNAME}」ってお呼びするけんな。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Input
              type="text"
              placeholder="例: おおいた太郎、みらい子（未入力でもOK）"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="text-sm rounded-xl border-mirai-border focus:border-primary"
              autoFocus
            />
          </div>

          <div className="bg-mirai-surface/60 border border-mirai-border rounded-xl p-3 flex items-start gap-2 text-xs text-mirai-text-muted">
            <ShieldAlert className="w-4 h-4 text-mirai-reaction-active shrink-0 mt-0.5" />
            <span>本名や住所、電話番号なんかの個人情報は書かんでな。</span>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              className="w-full bg-oita-pink hover:bg-oita-pink/90 text-white font-bold rounded-xl py-2"
            >
              対話を開始する🌸
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

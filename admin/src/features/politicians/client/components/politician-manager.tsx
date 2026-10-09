"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  savePolitician,
  type SavePoliticianInput,
} from "../../server/actions/save-politician";

type PoliticianRecord = {
  id: string;
  name: string;
  name_kana: string;
  avatar_url: string | null;
  terms_count: number;
  faction_id: string | null;
  committee_names: string[];
  website_url: string | null;
  twitter_url: string | null;
  contact_info: string | null;
  bio: string | null;
  profile_source_url: string | null;
  is_published: boolean;
};

type FactionOption = { id: string; display_name: string };

const EMPTY_FORM: Omit<SavePoliticianInput, "id"> = {
  name: "",
  name_kana: "",
  avatar_url: null,
  terms_count: 0,
  faction_id: null,
  committee_names: [],
  website_url: null,
  twitter_url: null,
  contact_info: null,
  bio: null,
  profile_source_url: null,
  is_published: false,
};

function optionalValue(value: string): string | null {
  return value.trim() || null;
}

export function PoliticianManager({
  politicians,
  factions,
}: {
  politicians: PoliticianRecord[];
  factions: FactionOption[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<SavePoliticianInput, "id">>(EMPTY_FORM);
  const [committeeText, setCommitteeText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function startEditing(politician: PoliticianRecord) {
    setEditingId(politician.id);
    setForm({
      name: politician.name,
      name_kana: politician.name_kana,
      avatar_url: politician.avatar_url,
      terms_count: politician.terms_count,
      faction_id: politician.faction_id,
      committee_names: politician.committee_names,
      website_url: politician.website_url,
      twitter_url: politician.twitter_url,
      contact_info: politician.contact_info,
      bio: politician.bio,
      profile_source_url: politician.profile_source_url,
      is_published: politician.is_published,
    });
    setCommitteeText(politician.committee_names.join("\n"));
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setCommitteeText("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await savePolitician({
        ...form,
        id: editingId ?? undefined,
        avatar_url: optionalValue(form.avatar_url ?? ""),
        website_url: optionalValue(form.website_url ?? ""),
        twitter_url: optionalValue(form.twitter_url ?? ""),
        contact_info: optionalValue(form.contact_info ?? ""),
        bio: optionalValue(form.bio ?? ""),
        profile_source_url: optionalValue(form.profile_source_url ?? ""),
        committee_names: committeeText
          .split(/[\n,、]/)
          .map((name) => name.trim())
          .filter(Boolean),
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        form.is_published ? "議員情報を公開しました" : "議員情報を保存しました"
      );
      resetForm();
      router.refresh();
    } catch (error) {
      console.error("Politician form error:", error);
      toast.error("議員情報を保存できませんでした");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border bg-white p-6">
        <h2 className="mb-1 text-lg font-semibold">
          {editingId ? "議員情報を編集" : "議員を登録"}
        </h2>
        <p className="mb-5 text-sm text-gray-600">
          公開する場合は、公式プロフィールなど確認可能な出典URLを登録してください。住所や非公開の連絡先は登録しないでください。
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="politician-name">氏名</Label>
              <Input
                id="politician-name"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="politician-kana">ふりがな</Label>
              <Input
                id="politician-kana"
                value={form.name_kana}
                onChange={(event) =>
                  setForm({ ...form, name_kana: event.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="politician-terms">当選回数（期数）</Label>
              <Input
                id="politician-terms"
                type="number"
                min={0}
                value={form.terms_count}
                onChange={(event) =>
                  setForm({ ...form, terms_count: Number(event.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="politician-faction">所属会派</Label>
              <select
                id="politician-faction"
                value={form.faction_id ?? ""}
                onChange={(event) =>
                  setForm({ ...form, faction_id: event.target.value || null })
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">未設定・無所属</option>
                {factions.map((faction) => (
                  <option key={faction.id} value={faction.id}>
                    {faction.display_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="politician-avatar">顔写真URL</Label>
              <Input
                id="politician-avatar"
                type="url"
                value={form.avatar_url ?? ""}
                onChange={(event) =>
                  setForm({ ...form, avatar_url: event.target.value })
                }
                placeholder="https://www.city.oita.oita.jp/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="politician-source">プロフィール出典URL</Label>
              <Input
                id="politician-source"
                type="url"
                value={form.profile_source_url ?? ""}
                onChange={(event) =>
                  setForm({ ...form, profile_source_url: event.target.value })
                }
                placeholder="https://www.city.oita.oita.jp/..."
                required={form.is_published}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="politician-committees">所属委員会</Label>
              <Textarea
                id="politician-committees"
                value={committeeText}
                onChange={(event) => setCommitteeText(event.target.value)}
                placeholder="1行に1つ入力"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="politician-bio">一言コメント</Label>
              <Textarea
                id="politician-bio"
                value={form.bio ?? ""}
                onChange={(event) =>
                  setForm({ ...form, bio: event.target.value })
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="politician-website">関連リンク</Label>
              <Input
                id="politician-website"
                type="url"
                value={form.website_url ?? ""}
                onChange={(event) =>
                  setForm({ ...form, website_url: event.target.value })
                }
                placeholder="公式サイトURL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="politician-social">SNS URL</Label>
              <Input
                id="politician-social"
                type="url"
                value={form.twitter_url ?? ""}
                onChange={(event) =>
                  setForm({ ...form, twitter_url: event.target.value })
                }
                placeholder="https://x.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="politician-contact">公開連絡先</Label>
              <Input
                id="politician-contact"
                value={form.contact_info ?? ""}
                onChange={(event) =>
                  setForm({ ...form, contact_info: event.target.value })
                }
                placeholder="本人が公開している連絡先のみ"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="politician-published"
              checked={form.is_published}
              onCheckedChange={(checked) =>
                setForm({ ...form, is_published: checked === true })
              }
            />
            <Label htmlFor="politician-published">出典を確認して公開する</Label>
          </div>

          <div className="flex justify-end gap-2">
            {editingId && (
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "保存中..."
                : editingId
                  ? "変更を保存"
                  : "議員を登録"}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">
          登録済み議員 ({politicians.length}人)
        </h2>
        {politicians.length === 0 ? (
          <p className="text-sm text-gray-500">
            議員情報はまだ登録されていません。
          </p>
        ) : (
          <ul className="divide-y">
            {politicians.map((politician) => (
              <li
                key={politician.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold">{politician.name}</p>
                  <p className="text-sm text-gray-500">
                    {politician.name_kana}・
                    {politician.is_published ? "公開中" : "非公開"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => startEditing(politician)}
                >
                  編集
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

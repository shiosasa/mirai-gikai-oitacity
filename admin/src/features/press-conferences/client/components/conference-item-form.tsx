"use client";

import type { Database } from "@mirai-gikai/supabase";
import {
  EditField,
  OrderField,
  SelectField,
} from "@/features/content-management/client/components/edit-field";
import { SaveForm } from "@/features/content-management/client/components/save-form";
import {
  conferenceItemInput,
  conferenceTurnInput,
} from "@/features/content-management/shared/utils/content-input";
import {
  deleteConferenceItem,
  deleteConferenceTurn,
  saveConferenceItem,
  saveConferenceTurn,
} from "../../server/actions/save-conference";
import { itemOptions, speakerOptions } from "../../shared/conference-options";

type Item = Database["public"]["Tables"]["press_conference_items"]["Row"];
type Turn = Database["public"]["Tables"]["press_conference_turns"]["Row"];

export function ConferenceItemForm({
  conferenceId,
  item,
  nextOrder,
}: {
  conferenceId: string;
  item?: Item;
  nextOrder: number;
}) {
  return (
    <div className="space-y-3">
      <SaveForm
        label={item ? "この発表・質疑を保存" : "発表・質疑を追加"}
        resetAfterSave={!item}
        confirmMessage="この発表・質疑だけを保存します。公開中の会見の場合はすぐ反映されます。原文と内容を確認済みですか？"
        save={async (data) => {
          await saveConferenceItem(
            conferenceId,
            item?.id ?? null,
            conferenceItemInput.parse(Object.fromEntries(data))
          );
        }}
      >
        <SelectField
          name="item_type"
          label="項目の種類"
          value={item?.item_type ?? "announcement"}
          options={itemOptions}
        />
        <EditField name="title" label="見出し" value={item?.title} required />
        <EditField
          name="summary"
          label="要約"
          value={item?.summary}
          multiline
        />
        <EditField
          name="detail"
          label="詳しい内容"
          value={item?.detail}
          multiline
        />
        <EditField
          name="material_url"
          label="配付資料URL"
          type="url"
          value={item?.material_url}
          hint="この項目に対応する公式PDF等のURLを指定してください。"
        />
        <OrderField value={item?.order_index ?? nextOrder} />
      </SaveForm>
      {item && (
        <SaveForm
          label="この項目と配下の発言を削除"
          confirmMessage="この発表・質疑と、それに属する発言をすべて削除します。元に戻せません。よろしいですか？"
          save={async () => {
            await deleteConferenceItem(conferenceId, item.id);
          }}
        />
      )}
    </div>
  );
}

export function ConferenceTurnForm({
  conferenceId,
  itemId,
  turn,
  nextOrder,
}: {
  conferenceId: string;
  itemId: string;
  turn?: Turn;
  nextOrder: number;
}) {
  return (
    <div className="space-y-3">
      <SaveForm
        label={turn ? "この発言を保存" : "発言を追加"}
        resetAfterSave={!turn}
        confirmMessage="この発言だけを保存します。公開中なら反映されます。発言内容・話者を原文で確認しましたか？"
        save={async (data) => {
          await saveConferenceTurn(
            conferenceId,
            itemId,
            turn?.id ?? null,
            conferenceTurnInput.parse(Object.fromEntries(data))
          );
        }}
      >
        <SelectField
          name="speaker"
          label="話者の区分"
          value={turn?.speaker ?? "governor"}
          options={speakerOptions}
        />
        <EditField
          name="speaker_name"
          label="話者名・担当課名"
          value={turn?.speaker_name}
        />
        <EditField
          name="content"
          label="発言内容"
          value={turn?.content}
          multiline
          required
        />
        <OrderField value={turn?.order_index ?? nextOrder} />
      </SaveForm>
      {turn && (
        <SaveForm
          label="この発言を削除"
          confirmMessage="この発言を削除します。元に戻せません。よろしいですか？"
          save={async () => {
            await deleteConferenceTurn(conferenceId, itemId, turn.id);
          }}
        />
      )}
    </div>
  );
}

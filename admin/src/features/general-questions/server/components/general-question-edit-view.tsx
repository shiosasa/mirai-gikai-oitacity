import "server-only";
import { notFound } from "next/navigation";
import { GeneralQuestionForm } from "../../client/components/general-question-form";
import {
  findGeneralQuestionById,
  findGeneralQuestionFormOptions,
} from "../repositories/general-question-repository";

export async function GeneralQuestionEditView({ id }: { id: string }) {
  const [question, { sessions, politicians }] = await Promise.all([
    findGeneralQuestionById(id),
    findGeneralQuestionFormOptions(),
  ]);

  if (!question) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          一般質問を編集：{question.questioner_name}議員
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          概要・トピックごとのAI要約や会議録イメージ・議事録リンクを変更できます。
        </p>
      </div>
      <GeneralQuestionForm
        mode="edit"
        initial={question}
        sessions={sessions}
        politicians={politicians}
      />
    </div>
  );
}

import "server-only";
import { GeneralQuestionForm } from "../../client/components/general-question-form";
import { findGeneralQuestionFormOptions } from "../repositories/general-question-repository";

export async function GeneralQuestionCreateView() {
  const { sessions, politicians } = await findGeneralQuestionFormOptions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">一般質問を新規登録</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          新しい一般質問の要約・一問一答・会議録イメージを登録します。
        </p>
      </div>
      <GeneralQuestionForm
        mode="create"
        sessions={sessions}
        politicians={politicians}
      />
    </div>
  );
}

import "server-only";
import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneralQuestionRowActions } from "../../client/components/general-question-row-actions";
import { findAllGeneralQuestions } from "../repositories/general-question-repository";

export async function GeneralQuestionsAdminView() {
  const questions = await findAllGeneralQuestions();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">一般質問</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            一般質問の概要・AI要約吹き出し・会議録イメージ・議事録リンク・公開状態を管理します。
          </p>
        </div>
        <Button asChild>
          <Link href="/general-questions/new">
            <Plus className="size-4" aria-hidden="true" />
            新規登録
          </Link>
        </Button>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            登録されている一般質問はまだありません。
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <Card key={q.id}>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0 pb-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">
                      {q.questioner_name}議員
                    </CardTitle>
                    {q.questioner_party ? (
                      <span className="text-xs text-muted-foreground">
                        {q.questioner_party}
                      </span>
                    ) : null}
                    <Badge
                      variant={
                        q.publish_status === "published"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {q.publish_status === "published" ? "公開中" : "下書き"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    第{q.session_day}日（{q.question_order}番目） / トピック{" "}
                    {q.topics.length}件
                    {q.source_url ? ` / 議事録: ${q.source_url}` : ""}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/general-questions/${q.id}`}>
                      <Pencil className="size-4" aria-hidden="true" />
                      編集
                    </Link>
                  </Button>
                  <GeneralQuestionRowActions
                    id={q.id}
                    publishStatus={q.publish_status}
                    questionerName={q.questioner_name}
                  />
                </div>
              </CardHeader>
              {q.summary ? (
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  {q.summary}
                </CardContent>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { GeneralQuestionEditView } from "@/features/general-questions/server/components/general-question-edit-view";

export default async function GeneralQuestionEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GeneralQuestionEditView id={id} />;
}

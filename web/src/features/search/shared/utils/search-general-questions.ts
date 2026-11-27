import {
  formatQuestionerHonorific,
  type OitaGeneralQuestion,
} from "@/app/dev/features/general-questions/oita-prototype/_lib/oita-prototype-helpers";
import type { ArticleCategoryFilter } from "@/features/bills/shared/utils/article-category";
import type { GeneralQuestionSearchResult } from "../types/search-types";

export function filterSearchGeneralQuestions(
  questions: OitaGeneralQuestion[],
  query: string,
  category: ArticleCategoryFilter
): GeneralQuestionSearchResult[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  return questions
    .filter((question) => {
      const categoryMatched =
        category === "すべて" ||
        question.topics.some((topic) => topic.tag === category);
      if (!categoryMatched) return false;
      if (!normalizedQuery) return true;

      return [
        question.questionerName,
        formatQuestionerHonorific(question.questionerName),
        question.faction,
        question.sessionLabel,
        question.sessionDayLabel,
        question.overview,
        ...question.topics.flatMap((topic) => [
          topic.tag,
          topic.title,
          ...topic.exchanges.map(
            (turn) => `${turn.speakerLabel} ${turn.summary}`
          ),
        ]),
      ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
    })
    .map((question) => ({
      id: question.id,
      questionerName: formatQuestionerHonorific(question.questionerName),
      faction: question.faction,
      sessionDayLabel: question.sessionDayLabel,
      summary: question.overview,
      matchedTopics: question.topics
        .filter((topic) => category === "すべて" || topic.tag === category)
        .map((topic) => `${topic.tag}：${topic.title}`),
    }));
}

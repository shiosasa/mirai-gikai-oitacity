export type TopicPublicationStatus = "draft" | "published";

export function parseTopicPublicationStatus(
  value: string
): TopicPublicationStatus {
  if (value !== "draft" && value !== "published") {
    throw new Error("公開状態が不正です");
  }
  return value;
}

export type SearchTab = "all" | "bills" | "topics" | "committees";

export type BillSearchResult = {
  id: string;
  title: string;
  summary: string | null;
  session: string;
  publishedAt: string | null;
  tags: string[];
};

export type TopicSearchResult = {
  id: string;
  title: string;
  category: string;
  summary: string;
};

export type CommitteeSearchResult = {
  id: string;
  committeeName: string;
  committeeSlug: string;
  title: string;
  summary: string | null;
  meetingDate: string;
  sourceDocumentId: number;
  matchedTopics: string[];
};

export type SearchResults = {
  bills: BillSearchResult[];
  topics: TopicSearchResult[];
  committees: CommitteeSearchResult[];
};

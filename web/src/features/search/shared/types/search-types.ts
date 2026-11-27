export type SearchTab =
  | "all"
  | "bills"
  | "topics"
  | "committees"
  | "generalQuestions";

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
  href: string;
  title: string;
  summary: string | null;
  meetingDate: string;
  matchedTopics: string[];
};

export type GeneralQuestionSearchResult = {
  id: string;
  questionerName: string;
  faction: string;
  sessionDayLabel: string;
  summary: string;
  matchedTopics: string[];
};

export type SearchResults = {
  bills: BillSearchResult[];
  topics: TopicSearchResult[];
  committees: CommitteeSearchResult[];
  generalQuestions?: GeneralQuestionSearchResult[];
};

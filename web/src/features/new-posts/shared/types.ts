import { z } from "zod";

export const publicationTypeSchema = z.enum([
  "bill_articles",
  "bills",
  "meeting_sessions",
  "committee_meetings",
  "politician_speech_highlights",
  "press_conferences",
  "site_information",
  "general_questions",
  "meetings",
  "interview_report",
  "topic_voice",
]);

export type PublicationType = z.infer<typeof publicationTypeSchema>;

export const recentPublicationsSchema = z.object({
  now: z.iso.datetime({ offset: true }),
  publications: z.array(
    z.object({
      content_type: publicationTypeSchema,
      content_id: z.string().min(1),
      first_published_at: z.iso.datetime({ offset: true }),
    })
  ),
});

export type RecentPublications = z.infer<typeof recentPublicationsSchema>;

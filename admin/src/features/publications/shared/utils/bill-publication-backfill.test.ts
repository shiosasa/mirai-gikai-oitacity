import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const db = new PGlite();
const verifiedId = "6f59b59b-4bc4-4a15-a895-6af3b079b760";
const knownId = "cb796842-2109-4772-8bc9-a74d5b2ffa78";
const draftId = "596b332b-e866-45ab-94e6-e9af36d40368";
const topicId = "e5bd2620-4154-4cdc-88aa-4f01f68480c8";
const confirmedAt = "2026-11-04 06:28:26.883+00";
const explicitAt = "2026-10-31 13:26:20.278+00";
let migrations: string[];

beforeAll(async () => {
  migrations = await Promise.all(
    [
      "20261105090000_backfill_bill_publication_dates.sql",
      "20261105110000_repair_verified_bill_publication_history.sql",
      "20261105130000_backfill_confirmed_publication_days.sql",
    ].map((file) =>
      readFile(
        new URL(
          `../../../../../../supabase/migrations/${file}`,
          import.meta.url
        ),
        "utf8"
      )
    )
  );
  await db.exec(`
    create table bills (
      id text primary key, source text, publish_status text,
      published_at timestamptz
    );
    create table content_publications (
      content_type text, content_id text, first_published_at timestamptz,
      is_public boolean, historical_date_unknown boolean,
      primary key (content_type, content_id)
    );
    create table politician_speech_highlights (id text, is_published boolean);
    create table meetings (id integer, mayor_proposal_text text);
    create table press_conferences (id text, status text);
    insert into politician_speech_highlights values
      ('0791361b-4cc7-4c6f-a01c-0608d88538b4', true),
      ('0a5115f2-10d9-486d-ab95-feefbb0da2f4', true),
      ('145c1442-0e5e-41bb-9365-4f0e38ac9689', false),
      ('unconfirmed', true);
    insert into meetings values (1, 'proposal'), (2, ''), (99, 'other');
    insert into press_conferences values
      ('16361e93-7fca-4b63-ac68-38fc70d87abd', 'published'),
      ('fc093e2b-6ae0-4262-aef2-5c6230b8166e', 'draft'),
      ('unconfirmed', 'published');
    insert into bills values
      ('${verifiedId}', 'meeting', 'published', null),
      ('${knownId}', 'meeting', 'published', null),
      ('${draftId}', 'meeting', 'draft', null),
      ('${topicId}', 'topic', 'published', null),
      ('exact-date', 'meeting', 'published', '${explicitAt}'),
      ('unknown-date', 'meeting', 'published', null),
      ('dated-draft', 'meeting', 'draft', '${explicitAt}'),
      ('dated-topic', 'topic', 'published', '${explicitAt}');
    insert into content_publications
      select 'bills', id, null, false, true from bills;
    update content_publications
      set first_published_at = '2000-01-01T00:00:00Z',
        historical_date_unknown = false
      where content_id = '${knownId}';
  `);
  for (const migration of migrations) await db.exec(migration);
}, 60_000);

afterAll(async () => {
  await db.close();
});

async function history(id: string) {
  const { rows } = await db.query<{
    first_published_at: string | null;
    is_public: boolean;
    historical_date_unknown: boolean;
  }>(
    `select first_published_at::text, is_public, historical_date_unknown
      from content_publications
      where content_type = 'bills' and content_id = $1`,
    [id]
  );
  return rows[0];
}

describe("verified bill publication backfills (PostgreSQL)", () => {
  it("uses confirmed JST publication days only for the specified public content", async () => {
    const { rows } = await db.query<{
      content_type: string;
      content_id: string;
      date: string;
    }>(`
      select content_type, content_id, first_published_at::text as date
      from content_publications where content_type <> 'bills'
      order by content_type, content_id
    `);
    expect(rows).toEqual([
      {
        content_type: "meetings",
        content_id: "1",
        date: "2026-10-31 15:00:00+00",
      },
      {
        content_type: "politician_speech_highlights",
        content_id: "0791361b-4cc7-4c6f-a01c-0608d88538b4",
        date: "2026-11-01 15:00:00+00",
      },
      {
        content_type: "politician_speech_highlights",
        content_id: "0a5115f2-10d9-486d-ab95-feefbb0da2f4",
        date: "2026-11-03 15:00:00+00",
      },
      {
        content_type: "press_conferences",
        content_id: "16361e93-7fca-4b63-ac68-38fc70d87abd",
        date: "2026-10-31 15:00:00+00",
      },
    ]);
  });
  it("uses the explicit date when available", async () => {
    expect(await history("exact-date")).toEqual({
      first_published_at: explicitAt,
      is_public: true,
      historical_date_unknown: false,
    });
  });

  it("repairs only the verified public meeting bills without inventing edit dates", async () => {
    expect(await history(verifiedId)).toEqual({
      first_published_at: confirmedAt,
      is_public: true,
      historical_date_unknown: false,
    });
    for (const id of [
      draftId,
      topicId,
      "unknown-date",
      "dated-draft",
      "dated-topic",
    ]) {
      expect(await history(id)).toEqual({
        first_published_at: null,
        is_public: false,
        historical_date_unknown: true,
      });
    }
  });

  it("preserves known history and is safe to rerun", async () => {
    const before = await history(verifiedId);
    for (const migration of migrations) await db.exec(migration);
    expect(await history(verifiedId)).toEqual(before);
    expect(await history(knownId)).toEqual({
      first_published_at: "2000-01-01 00:00:00+00",
      is_public: true,
      historical_date_unknown: false,
    });
    const { rows } = await db.query<{ published_at: string | null }>(
      "select published_at from bills where id = $1",
      [verifiedId]
    );
    expect(rows[0].published_at).toBeNull();
  });
});

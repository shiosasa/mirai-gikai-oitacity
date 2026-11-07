import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const db = new PGlite();

beforeAll(async () => {
  // An isolated PostgreSQL engine: no Supabase credentials or network access.
  await db.exec(`
    create role service_role bypassrls;
    create role anon;
    create table bill_articles (
      id text primary key, publish_status text default 'draft',
      first_published_at timestamptz, title text
    );
    create table bills (
      id text primary key, publish_status text default 'draft', title text
    );
    create table committee_meetings (
      id text primary key, publish_status text default 'draft', title text
    );
    create table general_questions (
      id text primary key, publish_status text default 'draft', title text
    );
    create table press_conferences (
      id text primary key, status text default 'draft', title text
    );
    create table politician_speech_highlights (
      id text primary key, is_published boolean default false, title text
    );
    create table site_information (
      id text primary key, is_published boolean default false,
      published_at timestamptz default now(), title text
    );
    create table meeting_sessions (
      id bigint primary key, content text, summary text, detailed_summary text
    );
    create table meetings (
      id bigint primary key, mayor_proposal_summary text, mayor_proposal_text text
    );
    create table interview_report (
      id text primary key, is_public_by_user boolean default false,
      is_public_by_admin boolean default false, summary text,
      topic_voice_featured_at timestamptz
    );
    insert into bill_articles values
      ('known-topic', 'published', '2000-01-01T00:00:00Z', 'old'),
      ('unknown-topic', 'published', null, 'old'),
      ('known-unpublished', 'draft', '2000-01-01T00:00:00Z', 'old');
    insert into bills values
      ('legacy-bill', 'published', 'old'),
      ('legacy-draft-with-unknown-history', 'draft', 'old');
    insert into interview_report values ('legacy-report', true, true, 'old', null);
    insert into meeting_sessions values (1, 'old minutes', null, null);
    insert into site_information (id, is_published, published_at) values
      ('scheduled-legacy', true, now() + interval '30 days'),
      ('never-published-scheduled-draft', false, now() + interval '30 days');
  `);
  const migration = await readFile(
    new URL(
      "../../../../../../supabase/migrations/20261103120000_track_content_first_publication.sql",
      import.meta.url
    ),
    "utf8"
  );
  await db.exec(migration);
  await db.exec(
    "update interview_report set topic_voice_featured_at = '2026-11-03T00:00:00Z' where id = 'legacy-report'"
  );
  await db.exec(
    await readFile(
      new URL(
        "../../../../../../supabase/migrations/20261105120000_preserve_topic_voice_first_publication.sql",
        import.meta.url
      ),
      "utf8"
    )
  );
}, 60_000);

afterAll(async () => {
  await db.close();
});

async function history(type: string, id: string | number) {
  const { rows } = await db.query<{
    first_published_at: string | null;
    is_public: boolean;
    historical_date_unknown: boolean;
  }>(
    `select first_published_at::text, is_public, historical_date_unknown
      from content_publications where content_type = $1 and content_id = $2`,
    [type, String(id)]
  );
  return rows[0];
}

describe("first-publication migration (PostgreSQL)", () => {
  it("keeps the original voice listing date after removal, edits and relisting", async () => {
    const first = async () =>
      (
        await db.query<{ date: string }>(
          `select topic_voice_first_featured_at::text as date
            from interview_report where id = 'legacy-report'`
        )
      ).rows[0].date;
    expect(await first()).toBe("2026-11-03 00:00:00+00");
    await db.exec(`
      update interview_report set topic_voice_featured_at = null
        where id = 'legacy-report';
      update interview_report
        set topic_voice_featured_at = now(),
          topic_voice_first_featured_at = now()
        where id = 'legacy-report';
    `);
    expect(await first()).toBe("2026-11-03 00:00:00+00");
  });

  it("records the first voice listing only when consent and approval are both present", async () => {
    await db.exec(`
      insert into interview_report (
        id, is_public_by_admin, topic_voice_featured_at,
        topic_voice_first_featured_at
      ) values ('consented-voice', true, now(), now());
    `);
    const first = async () =>
      (
        await db.query<{ date: string | null }>(
          `select topic_voice_first_featured_at::text as date
            from interview_report where id = 'consented-voice'`
        )
      ).rows[0].date;
    expect(await first()).toBeNull();
    await db.exec(
      "update interview_report set is_public_by_user = true where id = 'consented-voice'"
    );
    const original = await first();
    expect(original).not.toBeNull();
    await db.exec(`
      update interview_report set is_public_by_user = false
        where id = 'consented-voice';
      update interview_report set is_public_by_user = true
        where id = 'consented-voice';
    `);
    expect(await first()).toBe(original);
  });
  it("preserves confirmed topic history, but does not invent legacy dates", async () => {
    expect(
      (await history("bill_articles", "known-topic")).first_published_at
    ).toBe("2000-01-01 00:00:00+00");
    expect(await history("bills", "legacy-bill")).toMatchObject({
      first_published_at: null,
      is_public: true,
      historical_date_unknown: true,
    });
    expect(
      (await history("meeting_sessions", 1)).first_published_at
    ).toBeNull();
    expect(
      (await history("bill_articles", "known-unpublished")).is_public
    ).toBe(false);
    await db.exec("update bills set title = 'edited' where id = 'legacy-bill'");
    expect(
      (await history("bills", "legacy-bill")).first_published_at
    ).toBeNull();
    await db.exec(
      "update bills set publish_status = 'published' where id = 'legacy-draft-with-unknown-history'"
    );
    expect(
      (await history("bills", "legacy-draft-with-unknown-history"))
        .first_published_at
    ).toBeNull();
    await db.exec(
      "update bill_articles set publish_status = 'draft' where id = 'unknown-topic'; update bill_articles set publish_status = 'published' where id = 'unknown-topic'"
    );
    expect(
      (await history("bill_articles", "unknown-topic")).first_published_at
    ).toBeNull();
  });

  it.each([
    ["bill_articles", "publish_status", "'published'", "'draft'"],
    ["bills", "publish_status", "'published'", "'draft'"],
    ["committee_meetings", "publish_status", "'published'", "'draft'"],
    ["general_questions", "publish_status", "'published'", "'draft'"],
    ["press_conferences", "status", "'published'", "'draft'"],
    ["politician_speech_highlights", "is_published", "true", "false"],
    ["site_information", "is_published", "true", "false"],
  ] as const)("tracks %s from first publication, not edits, republication, or recreation", async (table, field, published, draft) => {
    await db.exec(`insert into ${table} (id) values ('lifecycle')`);
    expect((await history(table, "lifecycle")).first_published_at).toBeNull();
    await db.exec(
      `update ${table} set ${field} = ${published} where id = 'lifecycle'`
    );
    const original = (await history(table, "lifecycle")).first_published_at;
    expect(original).not.toBeNull();
    await db.exec("select pg_sleep(0.005)");
    await db.exec(
      `update ${table} set title = 'edited' where id = 'lifecycle'`
    );
    expect((await history(table, "lifecycle")).first_published_at).toBe(
      original
    );
    await db.exec(
      `update ${table} set ${field} = ${draft} where id = 'lifecycle'`
    );
    expect((await history(table, "lifecycle")).is_public).toBe(false);
    await db.exec(
      `update ${table} set ${field} = ${published} where id = 'lifecycle'`
    );
    expect((await history(table, "lifecycle")).first_published_at).toBe(
      original
    );
    await db.exec(`delete from ${table} where id = 'lifecycle'`);
    expect((await history(table, "lifecycle")).is_public).toBe(false);
    await db.exec(
      `insert into ${table} (id, ${field}) values ('lifecycle', ${published})`
    );
    expect((await history(table, "lifecycle")).first_published_at).toBe(
      original
    );
  });

  it("tracks minutes when the first public content becomes available", async () => {
    await db.exec("insert into meeting_sessions (id) values (2)");
    expect(
      (await history("meeting_sessions", 2)).first_published_at
    ).toBeNull();
    await db.exec(
      "update meeting_sessions set summary = 'summary' where id = 2"
    );
    const first = (await history("meeting_sessions", 2)).first_published_at;
    expect(first).not.toBeNull();
    await db.exec(
      "select pg_sleep(0.005); update meeting_sessions set detailed_summary = 'detailed' where id = 2"
    );
    expect((await history("meeting_sessions", 2)).first_published_at).toBe(
      first
    );
  });

  it("tracks newly posted mayor proposal explanations, not meeting dates", async () => {
    await db.exec("insert into meetings (id) values (2)");
    expect((await history("meetings", 2)).first_published_at).toBeNull();
    await db.exec(
      "update meetings set mayor_proposal_text = 'proposal' where id = 2"
    );
    const first = (await history("meetings", 2)).first_published_at;
    expect(first).not.toBeNull();
    await db.exec(
      "select pg_sleep(0.005); update meetings set mayor_proposal_summary = 'summary' where id = 2"
    );
    expect((await history("meetings", 2)).first_published_at).toBe(first);
  });

  it("publishes reports only after both consent and approval, and never renews NEW", async () => {
    expect(
      (await history("interview_report", "legacy-report")).first_published_at
    ).toBeNull();
    await db.exec("insert into interview_report (id) values ('report')");
    await db.exec(
      "update interview_report set is_public_by_user = true where id = 'report'"
    );
    expect(
      (await history("interview_report", "report")).first_published_at
    ).toBeNull();
    await db.exec(
      "update interview_report set is_public_by_user = false, is_public_by_admin = true where id = 'report'"
    );
    expect((await history("interview_report", "report")).is_public).toBe(false);
    await db.exec(
      "update interview_report set is_public_by_user = true where id = 'report'"
    );
    const first = (await history("interview_report", "report"))
      .first_published_at;
    expect(first).not.toBeNull();
    await db.exec(
      "select pg_sleep(0.005); update interview_report set summary = 'edited' where id = 'report'"
    );
    expect(
      (await history("interview_report", "report")).first_published_at
    ).toBe(first);
    await db.exec(
      "update interview_report set is_public_by_admin = false where id = 'report'"
    );
    expect((await history("interview_report", "report")).is_public).toBe(false);
    await db.exec(
      "update interview_report set is_public_by_admin = true where id = 'report'"
    );
    expect(
      (await history("interview_report", "report")).first_published_at
    ).toBe(first);
  });

  it("does not start NEW before a scheduled announcement, and handles schedule changes/cancellation", async () => {
    expect(
      (await history("site_information", "scheduled-legacy"))
        .historical_date_unknown
    ).toBe(false);
    expect(
      await history("site_information", "never-published-scheduled-draft")
    ).toMatchObject({
      first_published_at: null,
      is_public: false,
      historical_date_unknown: true,
    });
    await db.exec(
      "insert into site_information (id, is_published, published_at) values ('scheduled', true, now() + interval '30 days')"
    );
    const initial = (await history("site_information", "scheduled"))
      .first_published_at;
    expect(Date.parse(initial ?? "")).toBeGreaterThan(Date.now());
    await db.exec(
      "update site_information set published_at = now() + interval '40 days' where id = 'scheduled'"
    );
    const rescheduled = (await history("site_information", "scheduled"))
      .first_published_at;
    expect(Date.parse(rescheduled ?? "")).toBeGreaterThan(
      Date.parse(initial ?? "")
    );
    await db.exec(
      "update site_information set is_published = false where id = 'scheduled'"
    );
    expect(
      (await history("site_information", "scheduled")).first_published_at
    ).toBeNull();
    await db.exec(
      "update site_information set is_published = true, published_at = now() - interval '1 day' where id = 'scheduled'"
    );
    const firstActual = (await history("site_information", "scheduled"))
      .first_published_at;
    expect(firstActual).not.toBeNull();
    expect(Date.parse(firstActual ?? "")).toBeLessThanOrEqual(Date.now());
    await db.exec(
      "update site_information set published_at = now() + interval '100 days' where id = 'scheduled'"
    );
    expect(
      (await history("site_information", "scheduled")).first_published_at
    ).toBe(firstActual);
  });

  it("enables RLS without creating public policies", async () => {
    const { rows } = await db.query<{ relrowsecurity: boolean }>(
      "select relrowsecurity from pg_class where relname = 'content_publications'"
    );
    expect(rows[0].relrowsecurity).toBe(true);
    const { rows: policies } = await db.query(
      "select * from pg_policies where tablename = 'content_publications'"
    );
    expect(policies).toHaveLength(0);
    await db.exec(
      "grant select on content_publications to anon; set role anon"
    );
    try {
      expect(
        (await db.query("select * from content_publications")).rows
      ).toHaveLength(0);
    } finally {
      await db.exec("reset role");
    }
  });
});

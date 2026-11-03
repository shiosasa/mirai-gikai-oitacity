import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const id = "00000000-0000-4000-8000-000000000001";
const interviewId = "00000000-0000-4000-8000-000000000002";
const originalTime = "2026-11-03T00:00:00Z";
const content = {
  title: "更新後のタイトル",
  category: "safety_disaster",
  status_label: "計画承認",
  status_class: "status-settled",
  summary_line_1: "要点",
  summary_line_2: "",
  summary_line_3: "",
  details: "",
  reason: "必要な理由",
  point_1: "重要",
  point_2: "",
  point_3: "",
  target_audience: "市民",
  positive_voice: "期待",
  cautious_voice: "懸念",
  link_label: "出典",
  link_url: "https://example.com",
  decision_date: "2026-11-03",
};
let db: PGlite;

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role;
    create type public.article_category_enum as enum
      ('childcare_education','safety_disaster','community_living','governance_election');
    create table public.bills (id uuid primary key, name text, source text);
    create table public.proposals (
      id integer primary key, title text, published_date date, badge text,
      status text, "statusClass" text, summary1 text, summary2 text, summary3 text,
      "gikaiDetail" text, reason text, point1 text, point2 text, point3 text,
      impact text, pro text, con text
    );
    create table public.bill_articles (
      id uuid primary key, bill_id integer, proposal_id integer,
      interview_bill_id uuid references public.bills(id),
      title text not null, category public.article_category_enum not null,
      status_label text not null, status_class text not null,
      summary_line_1 text not null, summary_line_2 text not null, summary_line_3 text not null,
      details text not null, reason text not null,
      point_1 text not null, point_2 text not null, point_3 text not null,
      target_audience text not null, positive_voice text not null, cautious_voice text not null,
      link_label text, link_url text, decision_date date,
      publish_status text, first_published_at timestamptz,
      source_refs jsonb, updated_at timestamptz
    );
  `);
  const publicationSql = readFileSync(
    resolve(
      process.cwd(),
      "../supabase/migrations/20261010110000_add_topic_publication.sql"
    ),
    "utf8"
  );
  await db.exec(
    publicationSql.slice(
      publicationSql.indexOf(
        "create function public.record_topic_publication()"
      ),
      publicationSql.lastIndexOf("commit;")
    )
  );
  await db.exec(
    readFileSync(
      resolve(
        process.cwd(),
        "../supabase/migrations/20261103080000_add_admin_topic_content_save.sql"
      ),
      "utf8"
    )
  );
}, 30000);

beforeEach(async () => {
  await db.exec(
    "truncate public.bill_articles, public.proposals, public.bills;"
  );
  await db.query(
    "insert into public.bills values ($1,'元のタイトル','topic')",
    [interviewId]
  );
  await db.exec(`
    insert into public.proposals (id,title,published_date,"gikaiDetail") values (1,'元のタイトル','2026-10-01','古い詳細');
    insert into public.bill_articles
      (id,bill_id,proposal_id,title,category,status_label,status_class,
       summary_line_1,summary_line_2,summary_line_3,details,reason,point_1,point_2,point_3,
       target_audience,positive_voice,cautious_voice,publish_status,first_published_at,source_refs,updated_at)
    values ('${id}',1,1,'元のタイトル','childcare_education','審議中','status-review',
      '旧要点','','','古い詳細','','','','','','','','published','2026-10-01',
      '[{"session_id":3,"other":"保持"}]','${originalTime}');
  `);
});
afterAll(async () => {
  await db?.close();
});

async function save(values = content, time = originalTime) {
  await db.query("select public.save_admin_topic_content($1,$2,$3)", [
    id,
    time,
    JSON.stringify(values),
  ]);
}

describe("topic saving in real PostgreSQL", () => {
  it("atomically updates both public display sources and clears old fallback text", async () => {
    await save();
    const article = (
      await db.query<{ title: string; details: string }>(
        "select title,details from public.bill_articles"
      )
    ).rows[0];
    const proposal = (
      await db.query<{ detail: string; badge: string }>(
        'select "gikaiDetail" as detail,badge from public.proposals'
      )
    ).rows[0];
    expect(article).toEqual({ title: content.title, details: "" });
    expect(proposal).toEqual({ detail: "", badge: "安心・安全・防災" });
  });
  it("keeps publication dates, original proposal title, references and interview identities", async () => {
    await save();
    const article = (
      await db.query<{
        interview_bill_id: string;
        bill_id: number;
        proposal_id: number;
        publish_status: string;
        source_refs: unknown;
        first_published_at: Date;
      }>("select * from public.bill_articles")
    ).rows[0];
    expect(article.interview_bill_id).toBe(interviewId);
    expect(article.bill_id).toBe(1);
    expect(article.proposal_id).toBe(1);
    expect(article.publish_status).toBe("published");
    expect(article.source_refs).toEqual([{ session_id: 3, other: "保持" }]);
    expect(article.first_published_at.toISOString()).toBe(
      "2026-10-01T00:00:00.000Z"
    );
    const proposal = (
      await db.query<{ title: string }>("select title from public.proposals")
    ).rows[0];
    expect(proposal.title).toBe("元のタイトル");
  });
  it("does not replace an explicit interview association with a name match", async () => {
    const explicit = "00000000-0000-4000-8000-000000000003";
    await db.query(
      "insert into public.bills values ($1,'別のタイトル','topic')",
      [explicit]
    );
    await db.query("update public.bill_articles set interview_bill_id=$1", [
      explicit,
    ]);
    await save();
    expect(
      (
        await db.query<{ interview_bill_id: string }>(
          "select interview_bill_id from public.bill_articles"
        )
      ).rows[0].interview_bill_id
    ).toBe(explicit);
  });
  it("rejects stale edits without changing either source", async () => {
    await expect(save(content, "2026-10-01T00:00:00Z")).rejects.toThrow(
      "別の操作"
    );
    expect(
      (
        await db.query<{ details: string }>(
          "select details from public.bill_articles"
        )
      ).rows[0].details
    ).toBe("古い詳細");
  });
  it("rolls back the proposal update if the article update fails", async () => {
    await expect(
      save({ ...content, decision_date: "not-a-date" })
    ).rejects.toThrow();
    expect(
      (
        await db.query<{ detail: string }>(
          'select "gikaiDetail" as detail from public.proposals'
        )
      ).rows[0].detail
    ).toBe("古い詳細");
    expect(
      (
        await db.query<{ title: string }>(
          "select title from public.bill_articles"
        )
      ).rows[0].title
    ).toBe("元のタイトル");
  });
  it("rejects ambiguous legacy interview links", async () => {
    await db.exec(
      "insert into public.bills values ('00000000-0000-4000-8000-000000000004','元のタイトル','topic')"
    );
    await expect(save()).rejects.toThrow("複数");
  });
  it("updates the public bill_id relation even when proposal_id points elsewhere", async () => {
    await db.exec(`
      insert into public.proposals (id,title,"gikaiDetail") values (2,'別の出典','保持する詳細');
      update public.bill_articles set proposal_id=2;
    `);
    await save();
    const result = await db.query<{ id: number; details: string }>(
      'select id,"gikaiDetail" as details from public.proposals order by id'
    );
    expect(result.rows).toEqual([
      { id: 1, details: "" },
      { id: 2, details: "保持する詳細" },
    ]);
  });
  it("updates the public source even without a provenance proposal_id", async () => {
    await db.exec("update public.bill_articles set proposal_id=null");
    await save();
    expect(
      (
        await db.query<{ details: string }>(
          'select "gikaiDetail" as details from public.proposals'
        )
      ).rows[0].details
    ).toBe("");
  });
  it("restricts execution to the service role", async () => {
    const result = await db.query<{
      anon: boolean;
      authenticated: boolean;
      service: boolean;
    }>(`
      select
        has_function_privilege('anon','public.save_admin_topic_content(uuid,timestamptz,jsonb)','execute') as anon,
        has_function_privilege('authenticated','public.save_admin_topic_content(uuid,timestamptz,jsonb)','execute') as authenticated,
        has_function_privilege('service_role','public.save_admin_topic_content(uuid,timestamptz,jsonb)','execute') as service
    `);
    expect(result.rows[0]).toEqual({
      anon: false,
      authenticated: false,
      service: true,
    });
  });
  it("rejects a missing public proposal without modifying the article", async () => {
    await db.exec("delete from public.proposals");
    await expect(save()).rejects.toThrow("元データが見つかりません");
    expect(
      (
        await db.query<{ title: string }>(
          "select title from public.bill_articles"
        )
      ).rows[0].title
    ).toBe("元のタイトル");
  });
});

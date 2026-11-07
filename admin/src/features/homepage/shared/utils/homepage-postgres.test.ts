import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

let db: PGlite;

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    create schema storage;
    create table storage.buckets (
      id text primary key, name text, public boolean,
      file_size_limit bigint, allowed_mime_types text[]
    );
    create table public.existing_content (body text);
    insert into public.existing_content values ('既存の公開本文');
  `);
  await db.exec(
    readFileSync(
      resolve(
        process.cwd(),
        "../supabase/migrations/20261106130000_add_homepage_content.sql"
      ),
      "utf8"
    )
  );
}, 30000);

afterAll(async () => {
  await db.close();
});

describe("homepage persistence", () => {
  it("adds only empty storage and configuration, without publishing or changing existing content", async () => {
    expect(
      (await db.query("select * from public.homepage_content")).rows
    ).toEqual([]);
    expect(
      (await db.query("select * from public.existing_content")).rows
    ).toEqual([{ body: "既存の公開本文" }]);
    expect(
      (
        await db.query<{
          file_size_limit: number;
          allowed_mime_types: string[];
        }>("select file_size_limit,allowed_mime_types from storage.buckets")
      ).rows[0]
    ).toMatchObject({
      file_size_limit: 5242880,
      allowed_mime_types: [
        "image/png",
        "image/jpeg",
        "image/gif",
        "image/webp",
      ],
    });
  });
  it("has RLS and no policies, and denies non-admin RPC execution", async () => {
    expect(
      (
        await db.query<{ relrowsecurity: boolean }>(
          "select relrowsecurity from pg_class where oid = 'public.homepage_content'::regclass"
        )
      ).rows[0].relrowsecurity
    ).toBe(true);
    expect(
      (
        await db.query(
          "select * from pg_policies where tablename = 'homepage_content'"
        )
      ).rows
    ).toEqual([]);
    for (const role of ["anon", "authenticated"]) {
      expect(
        (
          await db.query<{ permitted: boolean }>(
            "select has_function_privilege($1, 'public.save_admin_homepage_content(jsonb,integer)', 'execute') as permitted",
            [role]
          )
        ).rows[0].permitted
      ).toBe(false);
    }
  });
  it("atomically creates and updates one row and rejects stale initial and subsequent saves", async () => {
    await db.exec("set role service_role");
    const save = (content: object, revision: number) =>
      db.query<{ revision: number }>(
        "select public.save_admin_homepage_content($1::jsonb,$2) as revision",
        [JSON.stringify(content), revision]
      );
    expect((await save({ title: "最初" }, 0)).rows[0].revision).toBe(1);
    await expect(save({ title: "古い画面" }, 0)).rejects.toThrow("他の画面");
    expect((await save({ title: "更新" }, 1)).rows[0].revision).toBe(2);
    await expect(save({ title: "上書き禁止" }, 1)).rejects.toThrow("他の画面");
    expect(
      (await db.query("select content,revision from public.homepage_content"))
        .rows
    ).toEqual([{ content: { title: "更新" }, revision: 2 }]);
  });
  it("rejects non-object content and invalid revisions without changing stored data", async () => {
    for (const [content, revision] of [
      ["null", 2],
      ["[]", 2],
      ["{}", -1],
      ["{}", null],
    ]) {
      await expect(
        db.query("select public.save_admin_homepage_content($1::jsonb,$2)", [
          content,
          revision,
        ])
      ).rejects.toThrow("保存形式");
    }
    expect(
      (await db.query("select revision from public.homepage_content")).rows
    ).toEqual([{ revision: 2 }]);
  });
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  parseArguments,
  planSampleInserts,
  validateSamples,
} from "./apply-politician-speech-samples.mjs";

const politicians = [{ id: "p1", name: "見本 太郎" }];
const session = {
  id: 28,
  meeting_id: 4,
  date: "2026-06-24",
  content: "○見本委員\n　内容について伺います。",
  attendees: { members: ["見本太郎"] },
  meetings: { id: 4, title: "見本委員会", meeting_type: "委員会" },
};
const sample = {
  id: "sample-1",
  politician_id: "p1",
  politician_name: "見本 太郎",
  meeting_session_id: 28,
  meeting_id: 4,
  meeting_type: "委員会",
  meeting_title: "見本委員会",
  meeting_date: "2026-06-24",
  title: "質問の見本",
  quote: "内容について伺います。",
  context: "見本の補足です。",
  approved: true,
};

test("requires an explicit sample file and rejects invalid arguments", () => {
  assert.deepEqual(parseArguments(["--file=private.json"]), {
    samplePath: "private.json",
    write: false,
  });
  assert.deepEqual(parseArguments(["--write", "--file=private.json"]), {
    samplePath: "private.json",
    write: true,
  });
  assert.throws(() => parseArguments([]));
  assert.throws(() => parseArguments(["--file="]));
  assert.throws(() => parseArguments(["--file=one.json", "--file=two.json"]));
  assert.throws(() => parseArguments(["--file=one.json", "--write", "--write"]));
});

test("validates politician, original quote and source", () => {
  assert.doesNotThrow(() => validateSamples([sample], politicians, [session]));
  assert.throws(() => validateSamples([], politicians, [session]));
  assert.throws(() =>
    validateSamples([{ ...sample, quote: "別の発言。" }], politicians, [session])
  );
  assert.throws(() =>
    validateSamples([sample], politicians, [{ ...session, attendees: null }])
  );
  assert.throws(() =>
    validateSamples([sample], politicians, [{ ...session, date: "2026-06-25" }])
  );
});

test("inserts drafts only, leaves existing entries intact and rejects edits", () => {
  assert.throws(() => planSampleInserts([], []));
  const [draft] = planSampleInserts([sample], []);
  assert.equal(draft.is_published, false);
  assert.equal(draft.context, sample.context);
  assert.deepEqual(planSampleInserts([sample], [draft]), []);
  assert.deepEqual(planSampleInserts([sample], [{ ...draft, is_published: true }]), []);
  assert.throws(() =>
    planSampleInserts([sample], [{ ...draft, title: "編集後の見出し" }])
  );
  assert.throws(() =>
    planSampleInserts([sample], [{ ...draft, context: "編集後の補足" }])
  );
  assert.throws(() => planSampleInserts([{ ...sample, approved: false }], []));
});

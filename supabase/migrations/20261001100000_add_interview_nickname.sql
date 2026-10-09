alter table public.interview_sessions
  add column if not exists nickname text
  check (nickname is null or char_length(nickname) <= 24);

comment on column public.interview_sessions.nickname is
  '本人を特定しない任意の表示用ニックネーム';
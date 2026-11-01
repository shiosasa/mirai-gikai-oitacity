create table public.politician_speech_highlights (
  id uuid primary key default gen_random_uuid(),
  politician_id uuid not null references public.politicians(id) on delete restrict,
  meeting_session_id integer not null references public.meeting_sessions(id) on delete restrict,
  title text not null check (length(trim(title)) > 0),
  quote text not null check (length(trim(quote)) > 0),
  context text check (context is null or length(trim(context)) > 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.politician_speech_highlights enable row level security;

create index politician_speech_highlights_published_idx
  on public.politician_speech_highlights (politician_id, created_at desc)
  where is_published;

create index politician_speech_highlights_session_idx
  on public.politician_speech_highlights (meeting_session_id);

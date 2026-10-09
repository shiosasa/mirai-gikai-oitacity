-- Create meetings table
create table public.meetings (
  id integer primary key generated always as identity,
  title text not null,
  meeting_type text not null,
  date date not null,
  term text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meeting_type_check check (meeting_type in ('本会議', '委員会'))
);

-- Create meeting_sessions table
create table public.meeting_sessions (
  id integer primary key generated always as identity,
  meeting_id integer not null references public.meetings(id) on delete cascade,
  session_title text not null,
  date date not null,
  content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.meetings enable row level security;
alter table public.meeting_sessions enable row level security;

-- Create indexes
create index idx_meetings_date on public.meetings(date desc);
create index idx_meetings_meeting_type on public.meetings(meeting_type);
create index idx_meeting_sessions_meeting_id on public.meeting_sessions(meeting_id);
create index idx_meeting_sessions_date on public.meeting_sessions(date desc);

-- Create triggers for updated_at
create trigger set_meetings_updated_at
  before update on public.meetings
  for each row
  execute function update_updated_at_column();

create trigger set_meeting_sessions_updated_at
  before update on public.meeting_sessions
  for each row
  execute function update_updated_at_column();

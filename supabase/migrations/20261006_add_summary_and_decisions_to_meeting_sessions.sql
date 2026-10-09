-- Add summary and decisions columns to meeting_sessions table
alter table if exists public.meeting_sessions
add column if not exists summary text,
add column if not exists decisions text;

-- Create indexes for better query performance
create index if not exists idx_meeting_sessions_summary on public.meeting_sessions(summary);

-- Add attendees and bills columns to meeting_sessions table
-- attendees: 出席者情報 { chair, vice_chair, members[], absent[], officials[] }
-- bills: 審議された議案 [{ number, name, description, result }]
alter table public.meeting_sessions
add column if not exists attendees jsonb,
add column if not exists bills jsonb;

comment on column public.meeting_sessions.attendees is '出席者情報（chair/vice_chair/members/absent/officials）';
comment on column public.meeting_sessions.bills is '審議された議案・条例のリスト（number/name/description/result）';

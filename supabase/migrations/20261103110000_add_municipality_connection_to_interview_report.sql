alter table public.interview_report
  add column municipality_connection text
  check (
    municipality_connection is null
    or municipality_connection in ('resident', 'connected', 'other')
  );

comment on column public.interview_report.municipality_connection is
  '回答者と大分市とのつながり: resident, connected, other';

alter table public.interview_report enable row level security;

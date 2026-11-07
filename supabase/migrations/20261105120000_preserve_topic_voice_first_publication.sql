alter table public.interview_report
  add column topic_voice_first_featured_at timestamptz;

update public.interview_report
set topic_voice_first_featured_at = topic_voice_featured_at
where topic_voice_featured_at is not null
  and is_public_by_admin and is_public_by_user;

create function public.preserve_topic_voice_first_publication()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    new.topic_voice_first_featured_at := old.topic_voice_first_featured_at;
  else
    new.topic_voice_first_featured_at := null;
  end if;
  if new.topic_voice_first_featured_at is null
    and new.topic_voice_featured_at is not null
    and new.is_public_by_admin and new.is_public_by_user then
    new.topic_voice_first_featured_at := now();
  end if;
  return new;
end;
$$;

create trigger preserve_topic_voice_first_publication
before insert or update on public.interview_report
for each row execute function public.preserve_topic_voice_first_publication();

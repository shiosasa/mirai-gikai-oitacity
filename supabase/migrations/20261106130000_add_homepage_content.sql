begin;

create table public.homepage_content (
  id boolean primary key default true check (id),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  revision integer not null check (revision > 0),
  updated_at timestamptz not null default now()
);
alter table public.homepage_content enable row level security;
revoke all on public.homepage_content from anon, authenticated;
grant select, insert, update on public.homepage_content to service_role;

create function public.save_admin_homepage_content(
  content_input jsonb,
  expected_revision integer
) returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  saved_revision integer;
begin
  if expected_revision is null or expected_revision < 0
    or jsonb_typeof(content_input) is distinct from 'object' then
    raise exception 'トップページの保存形式が不正です。';
  end if;
  if expected_revision = 0 then
    insert into public.homepage_content (id, content, revision)
    values (true, content_input, 1)
    on conflict (id) do nothing
    returning revision into saved_revision;
  else
    update public.homepage_content
    set content = content_input, revision = revision + 1, updated_at = clock_timestamp()
    where id and revision = expected_revision
    returning revision into saved_revision;
  end if;
  if saved_revision is null then
    raise exception '他の画面で更新されています。再読み込みして変更内容を確認してください。';
  end if;
  return saved_revision;
end;
$$;
revoke all on function public.save_admin_homepage_content(jsonb, integer) from public, anon, authenticated;
grant execute on function public.save_admin_homepage_content(jsonb, integer) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('homepage-images', 'homepage-images', true, 5242880,
  array['image/png', 'image/jpeg', 'image/gif', 'image/webp']);

commit;

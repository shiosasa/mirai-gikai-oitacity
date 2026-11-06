begin;

-- NULL keeps the existing single link; [] explicitly removes every link.
alter table public.bill_articles add column related_links jsonb
  check (related_links is null or jsonb_typeof(related_links) = 'array');
alter table public.bill_articles enable row level security;

alter function public.save_admin_topic_content(uuid, timestamptz, jsonb)
  rename to save_admin_topic_content_legacy;

create function public.save_admin_topic_content(
  article_id uuid,
  expected_updated_at timestamptz,
  content_input jsonb
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  link jsonb;
  links jsonb := content_input->'related_links';
begin
  if content_input ? 'related_links' then
    if jsonb_typeof(links) is distinct from 'array' then
      raise exception '関連リンクの形式が不正です。';
    end if;
    for link in select value from jsonb_array_elements(links)
    loop
      if jsonb_typeof(link->'label') is distinct from 'string'
        or jsonb_typeof(link->'url') is distinct from 'string'
        or length(link->>'label') > 200
        or length(link->>'url') > 4000
        or (link->>'url') !~ '^https?://[^/[:space:]@?#]+([/?#][^[:space:]]*)?$' then
        raise exception '関連リンクの表示名とhttp(s)のURLを確認してください。';
      end if;
    end loop;
    -- Keep old readers compatible with the first related link.
    content_input := content_input || jsonb_build_object(
      'link_label', coalesce(links->0->>'label', ''),
      'link_url', coalesce(links->0->>'url', '')
    );
  end if;
  perform public.save_admin_topic_content_legacy(
    article_id, expected_updated_at, content_input
  );
  if content_input ? 'related_links' then
    update public.bill_articles set related_links = links where id = article_id;
  end if;
end;
$$;

revoke all on function public.save_admin_topic_content(uuid, timestamptz, jsonb)
  from public, anon, authenticated;
grant execute on function public.save_admin_topic_content(uuid, timestamptz, jsonb)
  to service_role;

commit;

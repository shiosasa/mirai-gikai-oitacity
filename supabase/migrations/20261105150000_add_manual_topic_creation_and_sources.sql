begin;

create or replace function public.save_admin_topic_with_sources(
  article_id uuid,
  expected_updated_at timestamptz,
  content_input jsonb
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  reference jsonb;
  source_session record;
  references_input jsonb := content_input->'source_refs';
  validated_references jsonb := '[]'::jsonb;
begin
  if jsonb_typeof(references_input) is distinct from 'array' then
    raise exception '出典は開催日・議案から選択してください。';
  end if;
  for reference in select value from jsonb_array_elements(references_input)
  loop
    select s.*, m.title as meeting_title, m.meeting_type
      into source_session
      from public.meeting_sessions s
      join public.meetings m on m.id = s.meeting_id
      where s.id = (reference->>'session_id')::bigint
        and s.meeting_id = (reference->>'meeting_id')::bigint;
    if not found then
      raise exception '出典の議事録が見つかりません。出典を選び直してください。';
    end if;
    if nullif(reference->>'bill_name', '') is not null
      or nullif(reference->>'bill_number', '') is not null then
      if not exists (
        select 1 from jsonb_array_elements(coalesce(source_session.bills, '[]'::jsonb)) bill
        where bill->>'name' = reference->>'bill_name'
          and nullif(bill->>'number', '') is not distinct from nullif(reference->>'bill_number', '')
      ) then
        raise exception '出典の議案が変更されています。議案を選び直してください。';
      end if;
    end if;
    if coalesce(reference->>'evidence_quote', '') <> '' and
      position((reference->>'evidence_quote') in coalesce(source_session.content, '')) = 0 then
      raise exception '根拠引用が出典の原文と一致しません。';
    end if;
    validated_references := validated_references || jsonb_build_array(
      reference || jsonb_build_object(
        'meeting_type', source_session.meeting_type,
        'meeting_title', coalesce(source_session.meeting_title, ''),
        'session_label', coalesce(source_session.session_title, ''),
        'date', coalesce(source_session.date::text, ''),
        'bill_name', nullif(reference->>'bill_name', ''),
        'bill_number', nullif(reference->>'bill_number', '')
      )
    );
  end loop;

  perform public.save_admin_topic_content(article_id, expected_updated_at, content_input);
  update public.bill_articles set source_refs = validated_references
    where id = article_id;
end;
$$;

create or replace function public.create_admin_topic_content(content_input jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  proposal_id_new bigint;
  article_id_new uuid := gen_random_uuid();
  interview_id_new uuid := gen_random_uuid();
  initial_updated_at timestamptz;
begin
  if coalesce(btrim(content_input->>'title'), '') = '' then
    raise exception 'タイトルを入力してください。';
  end if;
  insert into public.proposals(title)
    values(content_input->>'title') returning id into proposal_id_new;
  insert into public.bills(id, name, source, status, publish_status)
    values(interview_id_new, content_input->>'title', 'topic', 'preparing', 'draft');
  insert into public.bill_articles(
    id, bill_id, proposal_id, interview_bill_id, title, category,
    status_label, status_class, summary_line_1, summary_line_2, summary_line_3,
    details, reason, point_1, point_2, point_3, target_audience,
    positive_voice, cautious_voice, publish_status, first_published_at, updated_at
  ) values (
    article_id_new, proposal_id_new, proposal_id_new, interview_id_new,
    content_input->>'title', (content_input->>'category')::public.article_category_enum,
    '', '', '', '', '', '', '', '', '', '', '', '', '', 'draft', null, clock_timestamp()
  ) returning updated_at into initial_updated_at;
  perform public.save_admin_topic_with_sources(
    article_id_new, initial_updated_at, content_input
  );
  return article_id_new;
end;
$$;

revoke all on function public.save_admin_topic_with_sources(uuid, timestamptz, jsonb)
  from public, anon, authenticated;
grant execute on function public.save_admin_topic_with_sources(uuid, timestamptz, jsonb)
  to service_role;
revoke all on function public.create_admin_topic_content(jsonb)
  from public, anon, authenticated;
grant execute on function public.create_admin_topic_content(jsonb) to service_role;

commit;

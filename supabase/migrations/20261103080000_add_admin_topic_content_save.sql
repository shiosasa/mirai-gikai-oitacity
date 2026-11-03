begin;

-- 記事と公開表示で優先されるproposalsを同一トランザクションで更新する。
create or replace function public.save_admin_topic_content(
  article_id uuid,
  expected_updated_at timestamptz,
  content_input jsonb
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_article public.bill_articles%rowtype;
  linked_interview uuid;
  matches integer;
  category_label text;
begin
  select * into strict current_article from public.bill_articles
    where id = article_id for update;
  if current_article.updated_at is distinct from expected_updated_at then
    raise exception '別の操作で記事が更新されました。再読み込みして確認してください。';
  end if;
  if coalesce(btrim(content_input->>'title'), '') = '' then
    raise exception 'タイトルを入力してください。';
  end if;

  category_label := case content_input->>'category'
    when 'childcare_education' then '子育て・教育'
    when 'safety_disaster' then '安心・安全・防災'
    when 'community_living' then 'まちづくり・暮らし'
    when 'governance_election' then 'まちの仕組み・選挙'
    else null end;
  if category_label is null then raise exception 'カテゴリが不正です。'; end if;

  -- 名前一致による旧リンクも、タイトルを変える前にIDとして固定する。
  linked_interview := current_article.interview_bill_id;
  if linked_interview is null then
    select count(*), (array_agg(id))[1] into matches, linked_interview
      from public.bills where name = current_article.title and source = 'topic';
    if matches > 1 then
      raise exception '同名のインタビューが複数あります。紐づけを確認してください。';
    end if;
  end if;

  perform 1 from public.proposals where id = current_article.bill_id for update;
  if not found then raise exception '元データが見つかりません。'; end if;
  update public.proposals set
      badge = category_label,
      status = content_input->>'status_label',
      "statusClass" = content_input->>'status_class',
      summary1 = content_input->>'summary_line_1',
      summary2 = content_input->>'summary_line_2',
      summary3 = content_input->>'summary_line_3',
      "gikaiDetail" = content_input->>'details',
      reason = content_input->>'reason',
      point1 = content_input->>'point_1',
      point2 = content_input->>'point_2',
      point3 = content_input->>'point_3',
      impact = content_input->>'target_audience',
      pro = content_input->>'positive_voice',
      con = content_input->>'cautious_voice'
  where id = current_article.bill_id;

  update public.bill_articles set
    title = content_input->>'title',
    category = (content_input->>'category')::public.article_category_enum,
    status_label = content_input->>'status_label',
    status_class = content_input->>'status_class',
    summary_line_1 = content_input->>'summary_line_1',
    summary_line_2 = content_input->>'summary_line_2',
    summary_line_3 = content_input->>'summary_line_3',
    details = content_input->>'details',
    reason = content_input->>'reason',
    point_1 = content_input->>'point_1',
    point_2 = content_input->>'point_2',
    point_3 = content_input->>'point_3',
    target_audience = content_input->>'target_audience',
    positive_voice = content_input->>'positive_voice',
    cautious_voice = content_input->>'cautious_voice',
    link_label = nullif(content_input->>'link_label', ''),
    link_url = nullif(content_input->>'link_url', ''),
    decision_date = nullif(content_input->>'decision_date', '')::date,
    interview_bill_id = linked_interview,
    updated_at = clock_timestamp()
  where id = article_id;
end;
$$;

revoke all on function public.save_admin_topic_content(uuid, timestamptz, jsonb)
  from public, anon, authenticated;
grant execute on function public.save_admin_topic_content(uuid, timestamptz, jsonb)
  to service_role;

commit;

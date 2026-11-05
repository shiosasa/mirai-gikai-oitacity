-- Publication days confirmed by the operator on 2026-11-05.
-- Times were not recorded: use 00:00 JST, never meeting/creation/edit dates.
with speech_dates as (
  select id, '2026-11-02T00:00:00+09:00'::timestamptz as published_at
  from public.politician_speech_highlights
  where is_published and id::text in (
    '0791361b-4cc7-4c6f-a01c-0608d88538b4',
    '145c1442-0e5e-41bb-9365-4f0e38ac9689',
    '1506bbf8-9c7c-4b4a-8330-40ca9a40d613',
    '1a133484-d57f-415b-9597-7e1197ae2793',
    '1beb9202-37ef-4400-8ca7-39bcfb40b9f6',
    '3e8941a2-7c0d-4f90-9e08-4392bbce0f24',
    '3ee18ae1-7fa7-4706-b8fa-d0c7e878e281',
    '68c4ddcc-1976-44a7-88a8-c05fce3f75cd',
    '6c372cd9-55f2-4392-b592-04746263af51',
    '789e2beb-9e6e-4942-8585-c0aeed8c7e2c',
    '7e46e3a3-0d86-4d3c-b224-57d77fa323a3',
    'bbeec7ce-7994-492b-9087-ee0c06ca2cb0',
    'bcecf039-04b1-43f5-a5a1-95eb776b8a37',
    'bdd1b794-9711-460b-9298-f2e8ad4533e0',
    'c223fe68-3ed4-4f53-a877-85d5bbadb2d5',
    'c943d8a3-d96f-485c-9c54-782b502ef1e7',
    'd2ac1457-190f-4174-9a2b-65e1e7493dd7',
    'd43ba5ad-339c-41f5-bdbe-ef6cb7791dd7'
  )
  union all
  select id, '2026-11-04T00:00:00+09:00'::timestamptz
  from public.politician_speech_highlights
  where is_published and id::text in (
    '0a5115f2-10d9-486d-ab95-feefbb0da2f4',
    '1e0d53e6-bc1a-4ca8-99f0-6f45d0c8bd7d',
    '3358190b-8940-41a2-94e1-861c7c4ea300',
    '3665db56-e2b4-4cb0-9d4c-e2eab007ef25',
    '3a241aa9-369a-4164-858a-92d84e309a14',
    '3f8966df-66a2-4309-9746-7d9524493f22',
    '44da5cc9-3e1a-4232-ae8a-ff5d5b74d0d6',
    '4eccf5ed-dbce-4414-91e0-6bf3bb2f1593',
    '709acb92-e23b-48c2-bbf0-9c687324c3d3',
    '7587d7b4-cedc-4aa9-8c0b-948dc40300be',
    '7c95edad-d50c-482d-98f5-6e24478005da',
    '7fe71dcd-a9c0-4532-a9b0-ca31e47904e1',
    '82d1d491-fa93-4588-83ab-d31b9e4dce76',
    '898a4f2f-3566-4648-84bb-b9f39248f045',
    '8b4acd0d-db66-4626-bf3c-7b4ab026c13e',
    '8f7c8664-24f9-4b7f-8e20-4e20ed297b46',
    '905592d3-50cc-4e9f-b3ee-0d36c62248d7',
    'a3690098-6b04-4f52-991d-71dd3cefee60',
    'aafdd221-de86-407e-9447-923a4d1c00fe',
    'c9c61fd1-004a-4d34-a647-9baa69428494',
    'e5e38aa0-a6e4-49e7-93af-45305ab40bd6',
    'f508e9a8-88f2-4664-88a1-66728598902a',
    'f7d90428-311d-4b36-950f-8e46fb4f05f9',
    'fb0e74f7-ea25-4a84-aaca-3cf71ceef5ed'
  )
), confirmed as (
  select 'politician_speech_highlights' as content_type,
    id::text as content_id, published_at from speech_dates
  union all
  select 'meetings', id::text, '2026-11-01T00:00:00+09:00'::timestamptz
  from public.meetings
  where id in (1, 2, 11)
    and nullif(btrim(mayor_proposal_text), '') is not null
  union all
  select 'press_conferences', id::text,
    '2026-11-01T00:00:00+09:00'::timestamptz
  from public.press_conferences
  where status = 'published' and id::text in (
    '16361e93-7fca-4b63-ac68-38fc70d87abd',
    'fc093e2b-6ae0-4262-aef2-5c6230b8166e',
    '6efa92a0-433a-409c-8b22-f59f303a160e',
    'a8f9cac2-82e8-4188-82fb-d4535109be3d',
    'fc331ff8-c4c5-4425-b826-2b19ff61d1c1',
    '93aea506-f46a-4e91-9ea6-e705a5b09ac2',
    'e2b225a1-4d88-4fef-b6ad-aea32cf566e5',
    'd6ed0c00-cff5-4a06-a401-b2f2f1b31c70',
    '8c5cff15-8d85-4248-8211-52659924c6af',
    'ca724d22-181e-48fb-941e-2bdae32cce71'
  )
)
insert into public.content_publications as history (
  content_type, content_id, first_published_at, is_public,
  historical_date_unknown
)
select content_type, content_id, published_at, true, false from confirmed
on conflict (content_type, content_id) do update set
  first_published_at = coalesce(
    history.first_published_at, excluded.first_published_at
  ),
  is_public = true,
  historical_date_unknown = false;

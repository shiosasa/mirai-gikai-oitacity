-- These 30 bills were verified public at 2026-11-04T06:28:26.883Z.
-- This is the first confirmed-public timestamp, not an inferred meeting/edit date.
insert into public.content_publications as history (
  content_type, content_id, first_published_at, is_public,
  historical_date_unknown
)
select
  'bills', bill.id::text,
  coalesce(bill.published_at, '2026-11-04T06:28:26.883Z'::timestamptz),
  true, false
from public.bills as bill
where bill.source = 'meeting'
  and bill.publish_status = 'published'
  and bill.id::text in (
    '6f59b59b-4bc4-4a15-a895-6af3b079b760',
    'cb796842-2109-4772-8bc9-a74d5b2ffa78',
    '596b332b-e866-45ab-94e6-e9af36d40368',
    'e5bd2620-4154-4cdc-88aa-4f01f68480c8',
    '4bcb032c-e8f7-4ece-8c0f-d2023187bbfa',
    'a537a257-6829-417c-9c57-1bed1055e87f',
    '33938ae5-84be-4739-9269-8642a1a58356',
    '7b13d1a9-9d78-452b-9746-66ec5fa7958b',
    'eb192eb5-362b-4b3a-94f7-9287230ee532',
    'f5e79916-bed6-458f-b913-45a2dfd29d7d',
    'f36b625b-ab1a-4ded-93f0-114526d1702c',
    '609d7f8f-b055-48c3-af07-9921415b0e91',
    'ad66a39c-9dbf-41ca-99b5-1868484a3afa',
    'cad34975-2d2c-4389-bab4-2f14a164723c',
    'e0e0d063-7433-4d8c-8b70-f59e2bc2e6d5',
    'c3452338-d404-4fb8-a6ec-42e72ae82bfa',
    '2ca10a05-08c3-4e62-8c3b-bc47e1614024',
    'a6040e22-ef46-40a4-a5cc-d9a6d8af5324',
    'e5372a7d-42c1-43f7-85c3-905223256eee',
    '4e1bfd78-0696-49c7-8d7f-15ff632e074a',
    '937e2287-0b63-420f-a870-08c7b8e7fc55',
    '03d840d3-97c0-4a94-8f50-45808544c41c',
    'b0e0ca0b-9101-4ec9-a645-ba02a7594237',
    'b01b72cc-fa3a-4ad2-b2bc-aaf183ba321f',
    '82aa4855-61da-46e3-b3ba-e4b9d575253e',
    '5a1665bd-d5eb-4951-8694-208be8bbdbe9',
    '5bc3bf4c-b731-445a-9e24-e8d83cca62c2',
    '4216e079-74ac-47dd-9dea-0a3c4c9b9584',
    'f4cde743-e242-4e15-b796-c097bbcfa572',
    'a30606ad-4d61-4eb0-8323-de18b1423e24'
  )
on conflict (content_type, content_id) do update set
  first_published_at = coalesce(
    history.first_published_at, excluded.first_published_at
  ),
  is_public = true,
  historical_date_unknown = false;

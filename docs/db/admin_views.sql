-- BEE log admin analytics views. Run this file in the Supabase SQL Editor
-- after docs/db/track_schema.sql.

-- Event counts use the Japan time-zone calendar date, rather than UTC.
create or replace view public.events_daily as
select
  (created_at at time zone 'Asia/Tokyo')::date as event_date,
  event_type,
  count(*)::bigint as event_count
from public.events
group by 1, 2;

-- Each row is an application of one filter value. Empty arrays and strings are
-- deliberately omitted, so the count represents selected values only.
create or replace view public.filter_apply_stats as
with filter_events as (
  select metadata
  from public.events
  where event_type = 'filter_apply'
    and metadata is not null
), array_values as (
  select
    filter_name,
    btrim(filter_value) as filter_value
  from filter_events
  cross join lateral (
    values
      ('categories', case when jsonb_typeof(metadata->'categories') = 'array' then metadata->'categories' else '[]'::jsonb end),
      ('grades', case when jsonb_typeof(metadata->'grades') = 'array' then metadata->'grades' else '[]'::jsonb end),
      ('formats', case when jsonb_typeof(metadata->'formats') = 'array' then metadata->'formats' else '[]'::jsonb end),
      ('periods', case when jsonb_typeof(metadata->'periods') = 'array' then metadata->'periods' else '[]'::jsonb end)
  ) as filters(filter_name, filter_values)
  cross join lateral jsonb_array_elements_text(filters.filter_values) as value(filter_value)
), keyword_values as (
  select btrim(metadata->>'keyword') as filter_value
  from filter_events
)
select
  filter_name,
  filter_value,
  count(*)::bigint as apply_count
from array_values
where filter_value <> ''
group by 1, 2

union all

select
  'keyword' as filter_name,
  filter_value,
  count(*)::bigint as apply_count
from keyword_values
where filter_value <> ''
group by 1, 2;

grant select on public.events_daily to service_role;
grant select on public.filter_apply_stats to service_role;

-- BEE log event tracking schema. Run this file in the Supabase SQL Editor.

create table if not exists public.events (
  id bigint generated always as identity primary key,
  session_id text not null,
  event_type text not null,
  activity_id text null,
  slug text null,
  tags jsonb null,
  metadata jsonb null,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_stats (
  activity_id text primary key,
  slug text,
  view_count bigint not null default 0,
  card_click_count bigint not null default 0,
  apply_click_count bigint not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.tag_stats (
  tag text primary key,
  view_count bigint not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists tag_stats_view_count_idx on public.tag_stats (view_count desc);
create index if not exists activity_stats_view_count_idx on public.activity_stats (view_count desc);
create index if not exists events_created_at_idx on public.events (created_at);
create index if not exists events_event_type_idx on public.events (event_type);

create or replace function public.record_event(
  p_session_id text,
  p_event_type text,
  p_activity_id text,
  p_slug text,
  p_tags jsonb,
  p_metadata jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into events (session_id, event_type, activity_id, slug, tags, metadata)
  values (p_session_id, p_event_type, p_activity_id, p_slug, p_tags, p_metadata);

  if p_activity_id is not null then
    if p_event_type = 'page_view' then
      insert into activity_stats (activity_id, slug, view_count)
      values (p_activity_id, p_slug, 1)
      on conflict (activity_id) do update
        set view_count = activity_stats.view_count + 1,
            slug = coalesce(excluded.slug, activity_stats.slug),
            updated_at = now();
    elsif p_event_type = 'card_click' then
      insert into activity_stats (activity_id, slug, card_click_count)
      values (p_activity_id, p_slug, 1)
      on conflict (activity_id) do update
        set card_click_count = activity_stats.card_click_count + 1,
            slug = coalesce(excluded.slug, activity_stats.slug),
            updated_at = now();
    elsif p_event_type = 'apply_click' then
      insert into activity_stats (activity_id, slug, apply_click_count)
      values (p_activity_id, p_slug, 1)
      on conflict (activity_id) do update
        set apply_click_count = activity_stats.apply_click_count + 1,
            slug = coalesce(excluded.slug, activity_stats.slug),
            updated_at = now();
    end if;
  end if;

  if p_event_type = 'page_view' and jsonb_typeof(p_tags) = 'array' then
    insert into tag_stats (tag, view_count)
    select distinct tag, 1
    from jsonb_array_elements_text(p_tags) as tag
    where tag <> ''
    on conflict (tag) do update
      set view_count = tag_stats.view_count + 1,
          updated_at = now();
  end if;
end;
$$;

revoke all on function public.record_event(text, text, text, text, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.record_event(text, text, text, text, jsonb, jsonb) to service_role;

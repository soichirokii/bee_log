import "server-only";

import { cache } from "react";
import { getAllPublishedPosts } from "@/lib/notion";
import { getSupabase } from "@/lib/supabase";
import type { Post } from "@/types/notion";

export type DailyEvent = {
  date: string;
  eventType: string;
  count: number;
};

export type ActivityStat = {
  activityId: string;
  title: string;
  slug: string;
  category: string;
  viewCount: number;
  cardClickCount: number;
  applyClickCount: number;
};

export type ApplyRate = ActivityStat & { applyRate: number };

export type FilterStat = {
  filterName: string;
  filterValue: string;
  applyCount: number;
};

export type TagStat = { tag: string; viewCount: number };

const asNumber = (value: unknown) => Number(value ?? 0);

export async function getDailyEvents(): Promise<DailyEvent[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.from("events_daily").select("event_date, event_type, event_count").order("event_date");
  if (error) return [];
  return (data ?? []).map((row) => ({
    date: String(row.event_date),
    eventType: String(row.event_type),
    count: asNumber(row.event_count),
  }));
}

const getActivityStats = cache(async (): Promise<ActivityStat[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];

  const [{ data, error }, posts] = await Promise.all([
    supabase
      .from("activity_stats")
      .select("activity_id, slug, view_count, card_click_count, apply_click_count")
      .order("view_count", { ascending: false }),
    getAllPublishedPosts(),
  ]);
  if (error) return [];

  const postsById = new Map<string, Post>(posts.map((post) => [post.id, post]));
  return (data ?? []).map((row) => {
    const post = postsById.get(String(row.activity_id));
    const fallback = String(row.slug || row.activity_id);
    return {
      activityId: String(row.activity_id),
      title: post?.title ?? fallback,
      slug: post?.slug ?? fallback,
      category: post?.category ?? "",
      viewCount: asNumber(row.view_count),
      cardClickCount: asNumber(row.card_click_count),
      applyClickCount: asNumber(row.apply_click_count),
    };
  });
});

export async function getActivityRanking(): Promise<ActivityStat[]> {
  return getActivityStats();
}

export async function getApplyRates(): Promise<ApplyRate[]> {
  const activities = await getActivityStats();
  return activities
    .filter((activity) => activity.viewCount >= 10)
    .map((activity) => ({ ...activity, applyRate: (activity.applyClickCount / activity.viewCount) * 100 }))
    .sort((a, b) => b.applyRate - a.applyRate);
}

export async function getFilterStats(): Promise<FilterStat[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("filter_apply_stats")
    .select("filter_name, filter_value, apply_count")
    .order("apply_count", { ascending: false });
  if (error) return [];
  return (data ?? []).map((row) => ({
    filterName: String(row.filter_name),
    filterValue: String(row.filter_value),
    applyCount: asNumber(row.apply_count),
  }));
}

export async function getTagRanking(): Promise<TagStat[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("tag_stats")
    .select("tag, view_count")
    .order("view_count", { ascending: false });
  if (error) return [];
  return (data ?? []).map((row) => ({ tag: String(row.tag), viewCount: asNumber(row.view_count) }));
}

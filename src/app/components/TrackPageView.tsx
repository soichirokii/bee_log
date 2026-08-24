"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/track";

type Props = { activityId: string; slug: string; category: string; tags: string[] };

export default function TrackPageView({ activityId, slug, category, tags }: Props) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    void track("page_view", { activity_id: activityId, slug, tags, metadata: { category } });
  }, [activityId, slug, category, tags]);

  return null;
}

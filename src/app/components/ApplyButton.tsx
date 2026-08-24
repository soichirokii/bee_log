"use client";

import { trackBeacon } from "@/lib/track";

type Props = { applyUrl: string; activityId: string; slug: string; id?: string; className: string };

export default function ApplyButton({ applyUrl, activityId, slug, id, className }: Props) {
  return (
    <a id={id} href={applyUrl} target="_blank" rel="noopener noreferrer" className={className}
      onClick={() => trackBeacon("apply_click", { activity_id: activityId, slug })}>
      応募する →
    </a>
  );
}

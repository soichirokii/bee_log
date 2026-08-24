import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

const EVENT_TYPES = new Set(["page_view", "card_click", "filter_apply", "apply_click"]);
const MAX_METADATA_BYTES = 2 * 1024;

type TrackRequest = {
  session_id?: unknown;
  event_type?: unknown;
  activity_id?: unknown;
  slug?: unknown;
  tags?: unknown;
  metadata?: unknown;
};

export async function POST(request: NextRequest) {
  let payload: TrackRequest;
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json")
      ? await request.json()
      : JSON.parse(await request.text());
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ ok: true });
    }
    payload = body as TrackRequest;
  } catch {
    return NextResponse.json({ ok: true });
  }

  if (typeof payload.event_type !== "string" || !EVENT_TYPES.has(payload.event_type)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (typeof payload.session_id !== "string" || !payload.session_id) {
    return NextResponse.json({ ok: true });
  }
  if (payload.metadata !== undefined && Buffer.byteLength(JSON.stringify(payload.metadata), "utf8") > MAX_METADATA_BYTES) {
    return NextResponse.json({ ok: true });
  }

  const activityId = typeof payload.activity_id === "string" ? payload.activity_id : null;
  const slug = typeof payload.slug === "string" ? payload.slug : null;
  const tags = Array.isArray(payload.tags) && payload.tags.every((tag) => typeof tag === "string") ? payload.tags : null;
  const metadata = payload.metadata && typeof payload.metadata === "object" && !Array.isArray(payload.metadata)
    ? payload.metadata
    : null;
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ ok: true });

  try {
    await supabase.rpc("record_event", {
      p_session_id: payload.session_id,
      p_event_type: payload.event_type,
      p_activity_id: activityId,
      p_slug: slug,
      p_tags: tags,
      p_metadata: metadata,
    });
  } catch {
    // Fire-and-forget tracking intentionally does not expose storage errors.
  }

  return NextResponse.json({ ok: true });
}

"use client";

type TrackPayload = {
  activity_id?: string;
  slug?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
};

export type TrackEventType = "page_view" | "card_click" | "filter_apply" | "apply_click";

export function getSessionId(): string {
  const existing = localStorage.getItem("beelog_sid");
  if (existing) return existing;

  const sessionId = crypto.randomUUID();
  localStorage.setItem("beelog_sid", sessionId);
  return sessionId;
}

export async function track(eventType: TrackEventType, payload: TrackPayload = {}) {
  try {
    await fetch("/api/track", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: getSessionId(), event_type: eventType, ...payload }),
    });
  } catch {
    // Tracking must never interrupt the user flow.
  }
}

export function trackBeacon(eventType: TrackEventType, payload: TrackPayload = {}) {
  try {
    const body = JSON.stringify({ session_id: getSessionId(), event_type: eventType, ...payload });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const sent = navigator.sendBeacon("/api/track", new Blob([body], { type: "text/plain" }));
      if (sent) return;
    }
  } catch {
    // Fall through to fetch.
  }
  void track(eventType, payload);
}

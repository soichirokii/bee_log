import { NextRequest, NextResponse } from "next/server";
import { getPublishedPosts } from "@/lib/notion";
import { Post } from "@/types/notion";

// 必要な環境変数:
//   LINE_CHANNEL_ACCESS_TOKEN ... LINE Messaging API のチャネルアクセストークン
//   CRON_SECRET               ... Vercel Cron からのリクエスト認証用シークレット
//                                 （openssl rand -hex 32 などで生成した任意の文字列）
//
// ⚠️ LINE Messaging API の無料プランは月200通（受信者×送信数でカウント）。
//    友達が増えてきたら有料プランへの移行を検討してください。

function buildMessage(p: Post, label: string, now: Date): string {
  const url = `https://www.beelog-jp.com/posts/${p.slug}`;
  const lines = [
    label,
    ``,
    `【${p.title}】`,
    p.organizer ? `主催: ${p.organizer}` : "",
    p.category ? `カテゴリ: ${p.category}` : "",
  ];

  if (p.deadline) {
    const deadline = new Date(p.deadline);
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const deadlineStr = deadline.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
    lines.push(`締切: ${deadlineStr}（あと${daysLeft}日）`);
  }

  if (p.fee) lines.push(`参加費: ${p.fee}`);
  lines.push(``, `詳細はこちら👇`, url);

  return lines.filter((l) => l !== "").join("\n");
}

export async function GET(req: NextRequest) {
  // ── セキュリティ検証 ──────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "LINE_CHANNEL_ACCESS_TOKEN is not set" }, { status: 500 });
  }

  const posts = await getPublishedPosts();
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // ── ① 新着活動（過去24h以内に追加）を優先 ────────────────
  const newPosts = posts
    .filter((p) => new Date(p.createdAt) >= oneDayAgo)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (newPosts.length > 0) {
    const p = newPosts[0];
    const text = buildMessage(p, "🐝 新着活動のご紹介", now);
    const res = await fetch("https://api.line.me/v2/bot/message/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ messages: [{ type: "text", text }] }),
    });
    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json({ error: `LINE API error: ${res.status}`, detail: body }, { status: 500 });
    }
    return NextResponse.json({ message: "Sent (new post).", activity: p.title });
  }

  // ── ② 新着なし → 締切順で日付ローテーション ─────────────
  // 日付ベースのインデックスで毎日違う活動を紹介（連続を防止）
  const upcoming = posts
    .filter((p) => p.deadline && new Date(p.deadline) >= now)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

  if (upcoming.length === 0) {
    return NextResponse.json({ message: "No upcoming activities. Nothing sent." }, { status: 200 });
  }

  // UTC日数をリストの長さで割った余りでインデックスを決定
  const dayIndex = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
  const pick = upcoming[dayIndex % upcoming.length];
  const text = buildMessage(pick, "🐝 本日のおすすめ活動", now);

  const res = await fetch("https://api.line.me/v2/bot/message/broadcast", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ messages: [{ type: "text", text }] }),
  });

  if (!res.ok) {
    const body = await res.text();
    return NextResponse.json({ error: `LINE API error: ${res.status}`, detail: body }, { status: 500 });
  }

  return NextResponse.json({ message: "Sent (rotation).", activity: pick.title });
}

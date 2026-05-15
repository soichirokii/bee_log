import { NextRequest, NextResponse } from "next/server";
import { getPublishedPosts } from "@/lib/notion";

// 必要な環境変数:
//   LINE_CHANNEL_ACCESS_TOKEN ... LINE Messaging API のチャネルアクセストークン
//   CRON_SECRET               ... Vercel Cron からのリクエスト認証用シークレット
//                                 （openssl rand -hex 32 などで生成した任意の文字列）
//
// ⚠️ LINE Messaging API の無料プランは月200通（受信者×送信数でカウント）。
//    友達が増えてきたら有料プランへの移行を検討してください。

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

  // ── 全活動取得・締切昇順ソート ───────────────────────────
  const posts = await getPublishedPosts();
  const now = new Date();

  const upcoming = posts
    .filter((p) => p.deadline && new Date(p.deadline) >= now)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

  if (upcoming.length === 0) {
    return NextResponse.json({ message: "No upcoming activities. Nothing sent." }, { status: 200 });
  }

  // ── 締切が最も早い活動を1件紹介 ──────────────────────────
  const p = upcoming[0];
  const deadline = new Date(p.deadline!);
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const deadlineStr = deadline.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
  const url = `https://www.beelog-jp.com/posts/${p.slug}`;

  const text = [
    `🐝 本日のおすすめ活動`,
    ``,
    `【${p.title}】`,
    p.organizer ? `主催: ${p.organizer}` : "",
    p.category ? `カテゴリ: ${p.category}` : "",
    `締切: ${deadlineStr}（あと${daysLeft}日）`,
    p.fee ? `参加費: ${p.fee}` : "",
    ``,
    `詳細はこちら👇`,
    url,
  ]
    .filter((line) => line !== "")
    .join("\n");

  // ── LINE ブロードキャスト送信 ─────────────────────────────
  const res = await fetch("https://api.line.me/v2/bot/message/broadcast", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages: [{ type: "text", text }] }),
  });

  if (!res.ok) {
    const body = await res.text();
    return NextResponse.json({ error: `LINE API error: ${res.status}`, detail: body }, { status: 500 });
  }

  return NextResponse.json({
    message: "Sent.",
    activity: p.title,
    daysLeft,
  });
}

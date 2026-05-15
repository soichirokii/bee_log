import { NextRequest, NextResponse } from "next/server";
import { getPublishedPosts } from "@/lib/notion";
import { Post } from "@/types/notion";

// 必要な環境変数:
//   LINE_CHANNEL_ACCESS_TOKEN ... LINE Messaging API のチャネルアクセストークン
//   CRON_SECRET               ... Vercel Cron からのリクエスト認証用シークレット
//                                 （openssl rand -hex 32 などで生成した任意の文字列）

function buildDailyMessage(deadlineSoon: Post[], newPosts: Post[], now: Date): string {
  const lines: string[] = [];

  const dateStr = now.toLocaleDateString("ja-JP", { month: "long", day: "numeric" });
  lines.push(`🐝 BEE log 本日（${dateStr}）のお知らせ`);

  // ── 締切間近 ──
  if (deadlineSoon.length > 0) {
    lines.push("", "⏰ 締切が近い活動");
    deadlineSoon.forEach((p) => {
      const deadline = new Date(p.deadline!);
      const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const deadlineStr = deadline.toLocaleDateString("ja-JP", { month: "long", day: "numeric" });
      lines.push(`・${p.title}（あと${daysLeft}日 / ${deadlineStr}締切）`);
      lines.push(`  https://www.beelog-jp.com/posts/${p.slug}`);
    });
  }

  // ── 新着 ──
  if (newPosts.length > 0) {
    lines.push("", "✨ 新着活動");
    newPosts.forEach((p) => {
      lines.push(`・${p.title}`);
      lines.push(`  https://www.beelog-jp.com/posts/${p.slug}`);
    });
  }

  return lines.join("\n");
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

  // ── 全活動取得 ────────────────────────────────────────────
  const posts = await getPublishedPosts();
  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // ── 締切7日以内の活動 ─────────────────────────────────────
  const deadlineSoon = posts.filter((p) => {
    if (!p.deadline) return false;
    const deadline = new Date(p.deadline);
    return deadline >= now && deadline <= sevenDaysLater;
  });

  // ── 過去24時間以内に追加された新着活動 ───────────────────
  const newPosts = posts.filter((p) => {
    const created = new Date(p.createdAt);
    return created >= oneDayAgo;
  });

  if (deadlineSoon.length === 0 && newPosts.length === 0) {
    return NextResponse.json({ message: "Nothing to notify." }, { status: 200 });
  }

  // ── 1通にまとめてブロードキャスト送信 ────────────────────
  const text = buildDailyMessage(deadlineSoon, newPosts, now);

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
    message: "Sent 1 message.",
    deadlineSoon: deadlineSoon.map((p) => p.title),
    newPosts: newPosts.map((p) => p.title),
  });
}

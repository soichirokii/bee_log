import { NextRequest, NextResponse } from "next/server";
import { getPublishedPosts } from "@/lib/notion";
import { Post } from "@/types/notion";

// 必要な環境変数:
//   LINE_CHANNEL_ACCESS_TOKEN ... LINE Messaging API のチャネルアクセストークン
//   CRON_SECRET               ... Vercel Cron からのリクエスト認証用シークレット
//                                 （openssl rand -hex 32 などで生成した任意の文字列）

function toLineMessage(text: string) {
  return { type: "text", text };
}

function buildDeadlineMessage(p: Post, now: Date): string {
  const deadline = new Date(p.deadline!);
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const deadlineStr = deadline.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const url = `https://www.beelog-jp.com/posts/${p.slug}`;

  return [
    `⏰ 締切まであと${daysLeft}日！`,
    ``,
    `【${p.title}】`,
    `主催: ${p.organizer || "ー"}`,
    `締切: ${deadlineStr}`,
    ``,
    `詳細はこちら👇`,
    url,
  ].join("\n");
}

function buildNewPostMessage(p: Post): string {
  const url = `https://www.beelog-jp.com/posts/${p.slug}`;

  return [
    `🐝 新着活動が追加されました！`,
    ``,
    `【${p.title}】`,
    `主催: ${p.organizer || "ー"}`,
    p.category ? `カテゴリ: ${p.category}` : "",
    p.deadline
      ? `締切: ${new Date(p.deadline).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}`
      : "",
    ``,
    `詳細はこちら👇`,
    url,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

async function broadcastMessages(messages: { type: string; text: string }[], token: string): Promise<string[]> {
  const CHUNK = 5;
  const errors: string[] = [];

  for (let i = 0; i < messages.length; i += CHUNK) {
    const chunk = messages.slice(i, i + CHUNK);
    const res = await fetch("https://api.line.me/v2/bot/message/broadcast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ messages: chunk }),
    });

    if (!res.ok) {
      const body = await res.text();
      errors.push(`chunk ${Math.floor(i / CHUNK) + 1}: ${res.status} ${body}`);
    }
  }

  return errors;
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

  // ── メッセージ組み立て ────────────────────────────────────
  const messages: { type: string; text: string }[] = [];

  if (deadlineSoon.length > 0) {
    deadlineSoon.forEach((p) => messages.push(toLineMessage(buildDeadlineMessage(p, now))));
  }

  if (newPosts.length > 0) {
    newPosts.forEach((p) => messages.push(toLineMessage(buildNewPostMessage(p))));
  }

  // ── LINE ブロードキャスト送信 ──────────────────────────────
  const errors = await broadcastMessages(messages, token);

  if (errors.length > 0) {
    return NextResponse.json({ error: "Some messages failed", details: errors }, { status: 500 });
  }

  return NextResponse.json({
    message: `Sent ${messages.length} message(s).`,
    deadlineSoon: deadlineSoon.map((p) => p.title),
    newPosts: newPosts.map((p) => p.title),
  });
}

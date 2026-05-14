import { NextRequest, NextResponse } from "next/server";
import { getPublishedPosts } from "@/lib/notion";

// 必要な環境変数:
//   LINE_CHANNEL_ACCESS_TOKEN ... LINE Messaging API のチャネルアクセストークン
//   CRON_SECRET               ... Vercel Cron からのリクエスト認証用シークレット
//                                 （openssl rand -hex 32 などで生成した任意の文字列）

export async function GET(req: NextRequest) {
  // ── セキュリティ検証 ──────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 締切7日以内の活動を抽出 ──────────────────────────────
  const posts = await getPublishedPosts();
  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcoming = posts.filter((p) => {
    if (!p.deadline) return false;
    const deadline = new Date(p.deadline);
    return deadline >= now && deadline <= sevenDaysLater;
  });

  if (upcoming.length === 0) {
    return NextResponse.json({ message: "No upcoming deadlines. Nothing sent." }, { status: 200 });
  }

  // ── LINE Messaging API でブロードキャスト送信 ────────────
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "LINE_CHANNEL_ACCESS_TOKEN is not set" }, { status: 500 });
  }

  const messages = upcoming.map((p) => {
    const deadline = new Date(p.deadline!);
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const deadlineStr = deadline.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const url = `https://www.beelog-jp.com/posts/${p.slug}`;

    return {
      type: "text",
      text: [
        `🐝 締切まであと${daysLeft}日！`,
        ``,
        `【${p.title}】`,
        `主催: ${p.organizer || "ー"}`,
        `締切: ${deadlineStr}`,
        ``,
        `詳細はこちら👇`,
        url,
      ].join("\n"),
    };
  });

  // LINE は1回のブロードキャストで最大5件まで
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
      errors.push(`chunk ${i / CHUNK + 1}: ${res.status} ${body}`);
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: "Some messages failed", details: errors }, { status: 500 });
  }

  return NextResponse.json({
    message: `Sent ${upcoming.length} notification(s).`,
    titles: upcoming.map((p) => p.title),
  });
}

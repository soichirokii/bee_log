import { NextRequest, NextResponse } from "next/server";
import { getPublishedPosts } from "@/lib/notion";
import { BASE_URL } from "@/constants/site";
import { daysUntilJst } from "@/lib/date";
import { verifyCronAuth } from "@/lib/cron-auth";

// 必要な環境変数:
//   LINE_CHANNEL_ACCESS_TOKEN ... LINE Messaging API のチャネルアクセストークン
//   CRON_SECRET               ... Vercel Cron からのリクエスト認証用シークレット
//
// 毎週金曜 JST 9:00（UTC 0:00）に自動送信。
// 今週の新着活動（最大3件）と締切間近の活動（最大3件）を1通にまとめる。

export async function GET(req: NextRequest) {
  // ── セキュリティ検証 ──────────────────────────────────────
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "LINE_CHANNEL_ACCESS_TOKEN is not set" }, { status: 500 });
  }

  const posts = await getPublishedPosts();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // ── 今週の新着（過去7日以内に追加、新しい順）───────────
  const newPosts = posts
    .filter((p) => new Date(p.createdAt) >= sevenDaysAgo)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // ── 締切間近（14日以内、締切昇順）───────────────────────
  const deadlineSoon = posts
    .filter((p) => {
      if (!p.deadline) return false;
      const d = daysUntilJst(p.deadline);
      return d >= 0 && d <= 14;
    })
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 3);

  if (newPosts.length === 0 && deadlineSoon.length === 0) {
    return NextResponse.json({ message: "Nothing to notify." }, { status: 200 });
  }

  // ── メッセージ組み立て（1通）────────────────────────────
  const lines: string[] = [];
  const weekStr = `${sevenDaysAgo.toLocaleDateString("ja-JP", { month: "long", day: "numeric" })}〜${now.toLocaleDateString("ja-JP", { month: "long", day: "numeric" })}`;

  lines.push(`🐝 BEE log 週間まとめ（${weekStr}）`);

  if (newPosts.length > 0) {
    lines.push("", "✨ 今週の新着活動");
    newPosts.forEach((p) => {
      lines.push(`・${p.title}`);
      if (p.deadline) {
        const dl = new Date(p.deadline);
        lines.push(`  締切: ${dl.toLocaleDateString("ja-JP", { month: "long", day: "numeric" })}`);
      }
      lines.push(`  ${BASE_URL}/posts/${p.slug}`);
    });
  }

  if (deadlineSoon.length > 0) {
    lines.push("", "⏰ 締切が近い活動");
    deadlineSoon.forEach((p) => {
      const dl = new Date(p.deadline!);
      const daysLeft = daysUntilJst(p.deadline!);
      const dlStr = dl.toLocaleDateString("ja-JP", { month: "long", day: "numeric" });
      lines.push(`・${p.title}`);
      lines.push(`  締切: ${dlStr}（あと${daysLeft}日）`);
      lines.push(`  ${BASE_URL}/posts/${p.slug}`);
    });
  }

  const text = lines.join("\n");

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
    newPosts: newPosts.map((p) => p.title),
    deadlineSoon: deadlineSoon.map((p) => p.title),
  });
}

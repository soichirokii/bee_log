import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

// Vercel Cron からのリクエストを CRON_SECRET で検証する（タイミング攻撃耐性あり）。
// CRON_SECRET 未設定・ヘッダー欠落・不一致はいずれも false。
export function verifyCronAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;
  const expected = `Bearer ${cronSecret}`;
  return (
    !!cronSecret &&
    !!authHeader &&
    authHeader.length === expected.length &&
    timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
  );
}

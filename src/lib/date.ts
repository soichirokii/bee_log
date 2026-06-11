// 締切判定はすべてJST基準で行う。
// サーバー（Vercel = UTC）とブラウザで結果が一致するよう、実行環境のタイムゾーンに依存しない。
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** JSTでの今日の日付文字列（YYYY-MM-DD） */
export function todayJst(): string {
  return new Date(Date.now() + JST_OFFSET_MS).toISOString().split("T")[0];
}

/**
 * JST基準で締切日まであと何日か（締切当日=0、経過後は負の値）。
 * Notionのdate（"YYYY-MM-DD" または ISO形式）を受け取る。
 */
export function daysUntilJst(dateStr: string): number {
  const deadline = new Date(dateStr.split("T")[0]);
  const today = new Date(todayJst());
  return Math.round((deadline.getTime() - today.getTime()) / 86400000);
}

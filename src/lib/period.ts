// 活動期間の文字列（例: "3ヶ月", "2週間", "10日"）を長期/中期/短期に分類する。
// カード表示と検索フィルターの両方で使うため共通化。
export function getPeriodLabel(period: string): "長期" | "中期" | "短期" | null {
  if (!period) return null;
  const text = period.replace(/\s/g, "");
  const monthMatch = text.match(/(\d+)ヶ?月/);
  if (monthMatch) { const d = parseInt(monthMatch[1]) * 30; return d >= 15 ? "長期" : d >= 7 ? "中期" : "短期"; }
  const weekMatch = text.match(/(\d+)週間?/);
  if (weekMatch) { const d = parseInt(weekMatch[1]) * 7; return d >= 15 ? "長期" : d >= 7 ? "中期" : "短期"; }
  const dayMatch = text.match(/(\d+)日/);
  if (dayMatch) { const d = parseInt(dayMatch[1]); return d >= 15 ? "長期" : d >= 7 ? "中期" : "短期"; }
  return null;
}

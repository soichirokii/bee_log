// 参加費が実質無料かどうか。Notionの表記ゆれ（"無料" / "0円" / "0"）を吸収する。
// カード・スライダー・検索フィルターで共通利用する。
export function isFree(fee: string): boolean {
  return fee === "無料" || fee === "0円" || fee === "0";
}

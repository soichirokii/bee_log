export type Category = {
  name: string;
  slug: string;
};

export const CATEGORIES: Category[] = [
  { name: "コンテスト・大会", slug: "contest" },
  { name: "インターンシップ", slug: "internship" },
  { name: "ボランティア", slug: "volunteer" },
  { name: "留学・国際", slug: "study-abroad" },
  { name: "研究・論文", slug: "research" },
  { name: "起業・ビジネス", slug: "business" },
  { name: "奨学金", slug: "scholarship" },
  { name: "科学・テクノロジー", slug: "science-tech" },
  { name: "イベント", slug: "event" },
  { name: "政治", slug: "politics" },
];

// 後方互換: カテゴリ名だけの配列を参照している箇所（検索フィルタ等）向け
export const CATEGORY_NAMES: string[] = CATEGORIES.map((c) => c.name);

// Notionの日本語カテゴリ名を、Heroなどで使う英字大文字ラベルに変換する（slugベース）。
// 例: "コンテスト・大会" → "CONTEST" / "留学・国際" → "STUDY ABROAD"
export function categoryToEnglishLabel(name: string): string | null {
  const cat = CATEGORIES.find((c) => c.name === name);
  return cat ? cat.slug.replace(/-/g, " ").toUpperCase() : null;
}

// カテゴリタグの共通デザイン（色分けは廃止し、全ページ・全カテゴリで統一）
export const CATEGORY_TAG_CLASS =
  "bg-[#FFFFEE] text-[#092040] border border-[#092040] rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap";

export const SEASON_TAGS = ["夏休み", "冬休み", "春休み"];
export const GRADES = ["中学生", "高校生", "大学生"];
export const FORMATS = ["オンライン", "対面", "ハイブリッド"];

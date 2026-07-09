export type Category = {
  name: string;
  slug: string;
  description: string;
};

export const CATEGORIES: Category[] = [
  {
    name: "コンテスト・大会",
    slug: "contest",
    description:
      "小論文、プレゼンテーション、プログラミング、アートなど、高校生が挑戦できるコンテスト・大会の情報を掲載している。入賞実績は総合型選抜の実績づくりにもつながる。募集中の大会を締切日とあわせて確認でき、自分の得意分野に合った挑戦の場を見つけられる。",
  },
  {
    name: "インターンシップ",
    slug: "internship",
    description:
      "高校生が参加できるインターンシップの情報を掲載している。企業やスタートアップでの就業体験を通じて、働くことのリアルや業界の実情を知ることができる。オンライン参加可能なプログラムや短期プログラムも多く、学業と両立しながら参加先を探せる。",
  },
  {
    name: "ボランティア",
    slug: "volunteer",
    description:
      "高校生が参加できるボランティア活動の情報を掲載している。地域貢献、国際協力、災害支援、環境保全など分野はさまざまで、社会課題に直接ふれる経験ができる。単発で参加できるものから継続型まで、自分のペースに合った活動を探せる。",
  },
  {
    name: "留学・国際",
    slug: "study-abroad",
    description:
      "高校生向けの留学プログラムや国際交流の情報を掲載している。短期留学、交換留学、国際会議、サマースクールなど、海外や多文化環境で学ぶ機会をまとめている。奨学金付きプログラムの情報もあり、費用面の条件からも探すことができる。",
  },
  {
    name: "研究・論文",
    slug: "research",
    description:
      "高校生が研究活動に取り組める機会の情報を掲載している。大学や研究機関が主催する研究プログラム、論文コンテスト、学会発表の機会などをまとめている。探究学習を一歩深めたい人や、研究者の指導を受けながら本格的に取り組みたい人が対象だ。",
  },
  {
    name: "起業・ビジネス",
    slug: "business",
    description:
      "高校生が起業やビジネスを学べる機会の情報を掲載している。ビジネスコンテスト、起業家育成プログラム、アントレプレナーシップ教育などをまとめている。アイデアを形にする経験や、実際に事業を立ち上げる挑戦への入口を見つけられる。",
  },
  {
    name: "奨学金",
    slug: "scholarship",
    description:
      "高校生が応募できる奨学金・助成金の情報を掲載している。給付型奨学金、留学支援、活動資金の助成など、返済不要のものを中心にまとめている。学業成績だけでなく、課外活動や挑戦意欲を評価する奨学金も多く、条件に合うものを探せる。",
  },
  {
    name: "科学・テクノロジー",
    slug: "science-tech",
    description:
      "科学やテクノロジーに関心のある高校生向けの活動情報を掲載している。科学オリンピック、プログラミング講座、研究体験、ハッカソンなどをまとめている。最先端の技術にふれたり、同じ関心を持つ仲間と出会えたりする機会を探すことができる。",
  },
  {
    name: "イベント",
    slug: "event",
    description:
      "高校生が参加できるイベント情報を掲載している。講演会、ワークショップ、サミット、文化祭的な大型企画など、単発で気軽に参加できるものが中心だ。興味のある分野の第一線で活躍する人の話を聞いたり、全国の同世代とつながったりする機会になる。",
  },
  {
    name: "政治",
    slug: "politics",
    description:
      "政治や社会に関心のある高校生向けの活動情報を掲載している。模擬国連、模擬選挙、政策提言プログラム、議員インターンなどをまとめている。社会の仕組みを当事者として学び、若者の視点から意見を発信する経験を得ることができる。",
  },
];

// 後方互換: カテゴリ名だけの配列を参照している箇所（検索フィルタ等）向け
export const CATEGORY_NAMES: string[] = CATEGORIES.map((c) => c.name);

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryByName(name: string): Category | undefined {
  return CATEGORIES.find((c) => c.name === name);
}

// カテゴリタグの共通デザイン（色分けは廃止し、全ページ・全カテゴリで統一）
export const CATEGORY_TAG_CLASS =
  "bg-[#FFFFEE] text-[#092040] border border-[#092040] rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap";

export const SEASON_TAGS = ["夏休み", "冬休み", "春休み"];
export const GRADES = ["中学生", "高校生", "大学生"];
export const FORMATS = ["オンライン", "対面", "ハイブリッド"];

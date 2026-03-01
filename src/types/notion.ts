export type PostStatus = "Published" | "Draft";

export type Post = {
  id: string;
  slug: string;          // ※ Notionにslugがないのでpage.idを使用
  title: string;
  organizer: string;     // 主催者
  category: string;      // カテゴリ（select）
  deadline: string | null;     // 応募締切（date）
  period: string;        // 活動期間（text）
  targetGrade: string[]; // 対象学年（multi_select）
  format: string;        // 形式（select）
  region: string;        // 地域（text）
  fee: string;           // 参加費（text）
  tags: string[];        // タグ（multi_select）
  summary: string;       // 概要（text）
  applyUrl: string;      // 応募URL（url）
  isFeatured: boolean;   // 注目（checkbox）
  isPublished: boolean;  // 公開（checkbox）
};

export type PostWithContent = Post & {
  blocks: NotionBlock[];
};

export type NotionBlockType =
  | "paragraph"
  | "heading_1"
  | "heading_2"
  | "heading_3"
  | "bulleted_list_item"
  | "numbered_list_item"
  | "code"
  | "quote"
  | "divider"
  | "image"
  | "unsupported";

export type RichText = {
  plain_text: string;
  href: string | null;
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
  };
};

export type NotionBlock = {
  id: string;
  type: NotionBlockType;
  richText: RichText[];
  language?: string;
  imageUrl?: string;
  caption?: RichText[];
};
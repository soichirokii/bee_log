export type PostStatus = "Published" | "Draft";

export type Post = {
  id: string;
  slug: string;
  title: string;
  organizer: string;
  category: string;
  deadline: string | null;
  period: string;
  targetGrade: string[];
  format: string;
  region: string;
  fee: string;
  tags: string[];
  summary: string;
  applyUrl: string;
  isFeatured: boolean;
  isPublished: boolean;
  imageUrl: string | null; // ← 追加
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
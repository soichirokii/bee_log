import { cache } from "react";
import {
  Post,
  PostWithContent,
  NotionBlock,
  NotionBlockType,
  RichText,
} from "@/types/notion";
import { todayJst } from "@/lib/date";

const NOTION_TOKEN = process.env.NOTION_TOKEN!;
const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

const notionHeaders = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

// Notion S3画像URLは約1時間で期限切れになるため、60秒でリバリデートする
// S3 URL有効期限（1時間）より十分短いため画像の期限切れは発生しない
const REVALIDATE = 60;

// Notion API raw response types
type RawRichTextItem = {
  plain_text?: string;
  href?: string | null;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
  };
};

type RawFile = {
  file?: { url: string };
  external?: { url: string };
};

type RawPropertyValue = {
  title?: RawRichTextItem[];
  rich_text?: RawRichTextItem[];
  select?: { name: string };
  multi_select?: { name: string }[];
  date?: { start: string };
  checkbox?: boolean;
  url?: string | null;
  files?: RawFile[];
};

type RawPage = {
  id: string;
  created_time: string;
  properties: Record<string, RawPropertyValue>;
};

type RawBlockData = {
  rich_text?: RawRichTextItem[];
  caption?: RawRichTextItem[];
  language?: string;
  type?: string;
  external?: { url: string };
  file?: { url: string };
};

type RawBlock = {
  id: string;
  type: string;
} & Record<string, RawBlockData>;

type NotionQueryResult = {
  results: RawPage[];
  has_more: boolean;
  next_cursor: string | null;
};

type NotionBlockResult = {
  results: RawBlock[];
  has_more: boolean;
  next_cursor: string | null;
};

function extractRichText(richTextArray: RawRichTextItem[]): RichText[] {
  if (!Array.isArray(richTextArray)) return [];
  return richTextArray.map((rt) => ({
    plain_text: rt.plain_text ?? "",
    href: rt.href ?? null,
    annotations: {
      bold: rt.annotations?.bold ?? false,
      italic: rt.annotations?.italic ?? false,
      strikethrough: rt.annotations?.strikethrough ?? false,
      underline: rt.annotations?.underline ?? false,
      code: rt.annotations?.code ?? false,
    },
  }));
}

function pageToPost(page: RawPage): Post {
  const props = page.properties;

  const filesData = props["ファイル&メディア"]?.files ?? null;

  const imageUrl: string | null =
    filesData?.[0]?.file?.url ??
    filesData?.[0]?.external?.url ??
    null;

  return {
    id: page.id,
    slug: props["slug"]?.rich_text?.[0]?.plain_text || page.id,
    title: props["タイトル"]?.title?.[0]?.plain_text ?? "Untitled",
    organizer: props["主催者"]?.rich_text?.[0]?.plain_text ?? "",
    category: props["カテゴリ"]?.select?.name ?? "",
    deadline: props["応募締切"]?.date?.start ?? null,
    period: props["活動期間"]?.rich_text?.[0]?.plain_text ?? "",
    targetGrade: (props["対象学年"]?.multi_select ?? []).map((t) => t.name),
    format: props["形式"]?.select?.name ?? "",
    region: props["地域"]?.rich_text?.[0]?.plain_text ?? "",
    fee: props["参加費"]?.rich_text?.[0]?.plain_text ?? "",
    tags: (props["タグ"]?.multi_select ?? []).map((t) => t.name),
    summary: props["概要"]?.rich_text?.[0]?.plain_text ?? "",
    applyUrl: props["応募URL"]?.url ?? "",
    isFeatured: props["注目"]?.checkbox ?? false,
    isPublished: props["公開"]?.checkbox ?? false,
    imageUrl,
    createdAt: page.created_time,
  };
}

function rawBlockToNotionBlock(block: RawBlock): NotionBlock {
  const type: NotionBlockType = [
    "paragraph","heading_1","heading_2","heading_3",
    "bulleted_list_item","numbered_list_item",
    "code","quote","divider","image",
  ].includes(block.type)
    ? (block.type as NotionBlockType)
    : "unsupported";

  const blockData: RawBlockData = block[block.type] ?? {};
  const richText = extractRichText(blockData.rich_text ?? []);

  let imageUrl: string | undefined;
  let caption: RichText[] | undefined;
  if (type === "image") {
    imageUrl = blockData.type === "external"
      ? blockData.external?.url
      : blockData.file?.url;
    caption = extractRichText(blockData.caption ?? []);
  }

  const language = type === "code" ? (blockData.language ?? "plain text") : undefined;

  return { id: block.id, type, richText, language, imageUrl, caption };
}

// cache(): 同一リクエスト内（generateMetadata とページ本体など）の重複呼び出しを1回にまとめる
export const getPublishedPosts = cache(async (): Promise<Post[]> => {
  const res = await fetch(
    `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
    {
      method: "POST",
      headers: notionHeaders,
      body: JSON.stringify({
        sorts: [{ property: "応募締切", direction: "ascending" }],
        filter: {
          and: [
            { property: "公開", checkbox: { equals: true } },
            {
              or: [
                { property: "応募締切", date: { on_or_after: todayJst() } },
                { property: "応募締切", date: { is_empty: true } },
              ],
            },
          ],
        },
      }),
      next: { revalidate: REVALIDATE },
    }
  );

  if (!res.ok) throw new Error(`Notion API error: ${res.status}`);
  const data = await res.json() as NotionQueryResult;
  return data.results.map(pageToPost);
});

// 公開中の全記事（締切経過分も含む）。記事ページ・sitemap用。
export const getAllPublishedPosts = cache(async (): Promise<Post[]> => {
  const res = await fetch(
    `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
    {
      method: "POST",
      headers: notionHeaders,
      body: JSON.stringify({
        sorts: [{ property: "応募締切", direction: "descending" }],
        filter: { property: "公開", checkbox: { equals: true } },
      }),
      next: { revalidate: REVALIDATE },
    }
  );

  if (!res.ok) throw new Error(`Notion API error: ${res.status}`);
  const data = await res.json() as NotionQueryResult;
  return data.results.map(pageToPost);
});

export const getPostById = cache(async (id: string): Promise<Post | null> => {
  const res = await fetch(`https://api.notion.com/v1/pages/${id}`, {
    headers: notionHeaders,
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) return null;
  return pageToPost(await res.json() as RawPage);
});

export const getPostBlocks = cache(async (pageId: string): Promise<NotionBlock[]> => {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;

  do {
    const url = `https://api.notion.com/v1/blocks/${pageId}/children?page_size=100${
      cursor ? `&start_cursor=${cursor}` : ""
    }`;
    const res = await fetch(url, {
      headers: notionHeaders,
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) throw new Error(`Notion API error: ${res.status}`);
    const data = await res.json() as NotionBlockResult;
    blocks.push(...data.results.map(rawBlockToNotionBlock));
    cursor = data.has_more ? (data.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return blocks;
});

export async function getPostWithContent(id: string): Promise<PostWithContent | null> {
  const post = await getPostById(id);
  if (!post) return null;
  const blocks = await getPostBlocks(post.id);
  return { ...post, blocks };
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  const posts = await getAllPublishedPosts();
  return posts.map((p) => p.slug);
}

// slugで1件取得。締切経過後も記事ページが404にならないよう、締切では絞らない。
export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  const res = await fetch(
    `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
    {
      method: "POST",
      headers: notionHeaders,
      body: JSON.stringify({
        page_size: 1,
        filter: {
          and: [
            { property: "公開", checkbox: { equals: true } },
            { property: "slug", rich_text: { equals: slug } },
          ],
        },
      }),
      next: { revalidate: REVALIDATE },
    }
  );

  if (!res.ok) throw new Error(`Notion API error: ${res.status}`);
  const data = await res.json() as NotionQueryResult;
  if (data.results[0]) return pageToPost(data.results[0]);

  // slug未設定の記事はページIDをslugとして配信しているため、ID形式ならフォールバック
  if (/^[0-9a-f]{32}$|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(slug)) {
    const post = await getPostById(slug);
    return post?.isPublished ? post : null;
  }
  return null;
});

export async function getPostWithContentBySlug(slug: string): Promise<PostWithContent | null> {
  const post = await getPostBySlug(slug);
  if (!post) return null;
  const blocks = await getPostBlocks(post.id);
  return { ...post, blocks };
}

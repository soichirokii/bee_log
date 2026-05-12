import {
  Post,
  PostWithContent,
  NotionBlock,
  NotionBlockType,
  RichText,
} from "@/types/notion";

const NOTION_TOKEN = process.env.NOTION_TOKEN!;
const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

const notionHeaders = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

const REVALIDATE = 3600; // 1時間キャッシュ
const TIMEOUT_MS = 10000; // 10秒タイムアウト

async function notionFetch(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

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

export async function getPublishedPosts(): Promise<Post[]> {
  const res = await notionFetch(
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
                { property: "応募締切", date: { on_or_after: new Date().toISOString().split("T")[0] } },
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
}

export async function getPostById(id: string): Promise<Post | null> {
  const res = await notionFetch(`https://api.notion.com/v1/pages/${id}`, {
    headers: notionHeaders,
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) return null;
  return pageToPost(await res.json() as RawPage);
}

export async function getPostBlocks(pageId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;

  do {
    const url = `https://api.notion.com/v1/blocks/${pageId}/children?page_size=100${
      cursor ? `&start_cursor=${cursor}` : ""
    }`;
    const res = await notionFetch(url, {
      headers: notionHeaders,
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) throw new Error(`Notion API error: ${res.status}`);
    const data = await res.json() as NotionBlockResult;
    blocks.push(...data.results.map(rawBlockToNotionBlock));
    cursor = data.has_more ? (data.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return blocks;
}

export async function getPostWithContent(id: string): Promise<PostWithContent | null> {
  const post = await getPostById(id);
  if (!post) return null;
  const blocks = await getPostBlocks(post.id);
  return { ...post, blocks };
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  const posts = await getPublishedPosts();
  return posts.map((p) => p.slug);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await getPublishedPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function getPostWithContentBySlug(slug: string): Promise<PostWithContent | null> {
  const post = await getPostBySlug(slug);
  if (!post) return null;
  const blocks = await getPostBlocks(post.id);
  return { ...post, blocks };
}

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

function extractRichText(richTextArray: any[]): RichText[] {
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

function pageToPost(page: any): Post {
  const props = page.properties;

  return {
    id: page.id,
    slug: page.id, // NotionにSlugプロパティがないのでIDを使用
    title: props["タイトル"]?.title?.[0]?.plain_text ?? "Untitled",
    organizer: props["主催者"]?.rich_text?.[0]?.plain_text ?? "",
    category: props["カテゴリ"]?.select?.name ?? "",
    deadline: props["応募締切"]?.date?.start ?? null,
    period: props["活動期間"]?.rich_text?.[0]?.plain_text ?? "",
    targetGrade: (props["対象学年"]?.multi_select ?? []).map((t: any) => t.name),
    format: props["形式"]?.select?.name ?? "",
    region: props["地域"]?.rich_text?.[0]?.plain_text ?? "",
    fee: props["参加費"]?.rich_text?.[0]?.plain_text ?? "",
    tags: (props["タグ"]?.multi_select ?? []).map((t: any) => t.name),
    summary: props["概要"]?.rich_text?.[0]?.plain_text ?? "",
    applyUrl: props["応募URL"]?.url ?? "",
    isFeatured: props["注目"]?.checkbox ?? false,
    isPublished: props["公開"]?.checkbox ?? false,
  };
}

function rawBlockToNotionBlock(block: any): NotionBlock {
  const type: NotionBlockType = [
    "paragraph","heading_1","heading_2","heading_3",
    "bulleted_list_item","numbered_list_item",
    "code","quote","divider","image",
  ].includes(block.type)
    ? (block.type as NotionBlockType)
    : "unsupported";

  const blockData = block[block.type] ?? {};
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

/** 公開済み記事一覧（「公開」チェックボックスがtrueのもの） */
export async function getPublishedPosts(): Promise<Post[]> {
  const res = await fetch(
    `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
    {
      method: "POST",
      headers: notionHeaders,
      body: JSON.stringify({
        filter: {
          property: "公開",
          checkbox: { equals: true },
        },
        sorts: [
          { property: "応募締切", direction: "ascending" },
        ],
      }),
      next: { revalidate: 60 },
    }
  );

  if (!res.ok) throw new Error(`Notion API error: ${res.status}`);
  const data = await res.json();
  return (data.results as any[]).map(pageToPost);
}

/** IDから記事1件を取得 */
export async function getPostById(id: string): Promise<Post | null> {
  const res = await fetch(`https://api.notion.com/v1/pages/${id}`, {
    headers: notionHeaders,
    next: { revalidate: 60 },
  });

  if (!res.ok) return null;
  const page = await res.json();
  return pageToPost(page);
}

/** ページIDからブロック一覧（ページネーション対応） */
export async function getPostBlocks(pageId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;

  do {
    const url = `https://api.notion.com/v1/blocks/${pageId}/children?page_size=100${
      cursor ? `&start_cursor=${cursor}` : ""
    }`;
    const res = await fetch(url, {
      headers: notionHeaders,
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`Notion API error: ${res.status}`);

    const data = await res.json();
    blocks.push(...(data.results as any[]).map(rawBlockToNotionBlock));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return blocks;
}

/** ID から記事＋本文ブロックをまとめて取得 */
export async function getPostWithContent(id: string): Promise<PostWithContent | null> {
  const post = await getPostById(id);
  if (!post) return null;
  const blocks = await getPostBlocks(post.id);
  return { ...post, blocks };
}

/** 静的生成用: 全公開IDを取得 */
export async function getAllPublishedSlugs(): Promise<string[]> {
  const posts = await getPublishedPosts();
  return posts.map((p) => p.id);
}
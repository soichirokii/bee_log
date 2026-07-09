import { NextRequest, NextResponse } from "next/server";

const notionHeaders = {
  Authorization: `Bearer ${process.env.NOTION_TOKEN!}`,
  "Notion-Version": "2022-06-28",
};

const CACHE_HEADER = "public, max-age=1800, stale-while-revalidate=60";
const NOIMAGE = "/noimage.svg";

// Notion ID（ハイフンあり/なしのUUID）。API へ渡す前の形式検証に使う。
const NOTION_ID = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

// 指定ページが「公開」チェック済みか。取得失敗・非公開はいずれも false。
async function isPagePublished(pageId: string): Promise<boolean> {
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    headers: notionHeaders,
    next: { revalidate: 1800 },
  });
  if (!res.ok) return false;
  const page = await res.json();
  return page.properties?.["公開"]?.checkbox === true;
}

// ブロックの parent を最大3階層まで遡り、到達した親ページが公開なら true。
// page_id に到達できない（ネストが深すぎる/取得失敗）場合は false。
async function isBlockOnPublishedPage(
  parent: { type?: string; page_id?: string; block_id?: string } | undefined
): Promise<boolean> {
  for (let depth = 0; depth < 3 && parent; depth++) {
    if (parent.type === "page_id" && parent.page_id) {
      return isPagePublished(parent.page_id);
    }
    if (parent.type === "block_id" && parent.block_id) {
      const res = await fetch(`https://api.notion.com/v1/blocks/${parent.block_id}`, {
        headers: notionHeaders,
        next: { revalidate: 1800 },
      });
      if (!res.ok) return false;
      const block = await res.json();
      parent = block.parent;
      continue;
    }
    // page_id / block_id 以外（database_id 等）は判定不能
    return false;
  }
  return false;
}

// Cloudinary画像を全カード共通の見た目に揃える変換。
// c_fill,g_auto: 16:9にスマート切り抜き（AIが重要部分を残す）/ f_auto,q_auto: 自動WebP化・容量最適化 / w_1200: 解像度上限
const CLOUDINARY_TRANSFORM = "c_fill,g_auto,ar_16:9,f_auto,q_auto,w_1200";

// Cloudinary URL の /image/upload/ 直後に変換パラメータを差し込む。
// Cloudinary以外のURLや変換済みURLはそのまま返す（冪等）。
function withCloudinaryTransform(url: string): string {
  if (!url.includes("res.cloudinary.com/") || !url.includes("/image/upload/")) {
    return url;
  }
  if (url.includes(`/image/upload/${CLOUDINARY_TRANSFORM}/`)) return url;
  return url.replace("/image/upload/", `/image/upload/${CLOUDINARY_TRANSFORM}/`);
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const pageId = searchParams.get("pageId");
  const blockId = searchParams.get("blockId");

  // Notion API に渡す前に ID 形式を検証
  if (pageId && !NOTION_ID.test(pageId)) return new NextResponse(null, { status: 400 });
  if (blockId && !NOTION_ID.test(blockId)) return new NextResponse(null, { status: 400 });

  try {
    if (pageId) {
      const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        headers: notionHeaders,
        next: { revalidate: 1800 },
      });
      if (!res.ok) return NextResponse.redirect(new URL(NOIMAGE, origin));
      const page = await res.json();
      if (page.properties?.["公開"]?.checkbox !== true) {
        return NextResponse.redirect(new URL(NOIMAGE, origin));
      }
      const files = page.properties?.["ファイル&メディア"]?.files;
      const url: string | undefined = files?.[0]?.file?.url ?? files?.[0]?.external?.url;
      if (!url) return NextResponse.redirect(new URL(NOIMAGE, origin));
      return NextResponse.redirect(withCloudinaryTransform(url), {
        status: 302,
        headers: { "Cache-Control": CACHE_HEADER },
      });
    }

    if (blockId) {
      const res = await fetch(`https://api.notion.com/v1/blocks/${blockId}`, {
        headers: notionHeaders,
        next: { revalidate: 1800 },
      });
      if (!res.ok) return new NextResponse(null, { status: 404 });
      const block = await res.json();

      // 非公開記事の本文画像が blockId 直叩きで漏れないよう、親ページの公開状態を確認
      if (!(await isBlockOnPublishedPage(block.parent))) {
        return new NextResponse(null, { status: 404 });
      }

      const img = block.image;
      const url: string | undefined =
        img?.type === "external" ? img.external?.url : img?.file?.url;
      if (!url) return new NextResponse(null, { status: 404 });
      return NextResponse.redirect(withCloudinaryTransform(url), {
        status: 302,
        headers: { "Cache-Control": CACHE_HEADER },
      });
    }

    return new NextResponse(null, { status: 400 });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}

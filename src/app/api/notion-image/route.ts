import { NextRequest, NextResponse } from "next/server";

const notionHeaders = {
  Authorization: `Bearer ${process.env.NOTION_TOKEN!}`,
  "Notion-Version": "2022-06-28",
};

const CACHE_HEADER = "public, max-age=1800, stale-while-revalidate=60";
const NOIMAGE = "/noimage.svg";

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

  try {
    if (pageId) {
      const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        headers: notionHeaders,
        next: { revalidate: 1800 },
      });
      if (!res.ok) return NextResponse.redirect(new URL(NOIMAGE, origin));
      const page = await res.json();
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

// カード・記事ヘッダー共通の変換（16:9スマート切り抜き・自動WebP化・容量最適化）
export const CARD_TRANSFORM = "c_fill,g_auto,ar_16:9,f_auto,q_auto,w_1200";

// カバー画像のsrc。Cloudinary（永続URL）なら直接参照し、
// 未移行のNotion S3画像（期限切れURL）のみプロキシ経由にフォールバックする。
export function coverImageSrc(
  imageUrl: string | null,
  pageId: string,
  transform: string = CARD_TRANSFORM
): string {
  if (imageUrl?.includes("res.cloudinary.com")) {
    return toCloudinaryUrl(imageUrl, transform);
  }
  return `/api/notion-image?pageId=${pageId}`;
}

// Cloudinary URL の /image/upload/ 直後に変換パラメータを差し込む。
// Cloudinary以外のURLや、既に同じ変換が適用済みのURLはそのまま返す（冪等）。
export function toCloudinaryUrl(url: string, transform: string): string {
  if (!url.includes("res.cloudinary.com/") || !url.includes("/image/upload/")) {
    return url;
  }
  if (url.includes(`/image/upload/${transform}/`)) return url;
  return url.replace("/image/upload/", `/image/upload/${transform}/`);
}

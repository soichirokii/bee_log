// Cloudinary URL の /image/upload/ 直後に変換パラメータを差し込む。
// Cloudinary以外のURLや、既に同じ変換が適用済みのURLはそのまま返す（冪等）。
export function toCloudinaryUrl(url: string, transform: string): string {
  if (!url.includes("res.cloudinary.com/") || !url.includes("/image/upload/")) {
    return url;
  }
  if (url.includes(`/image/upload/${transform}/`)) return url;
  return url.replace("/image/upload/", `/image/upload/${transform}/`);
}

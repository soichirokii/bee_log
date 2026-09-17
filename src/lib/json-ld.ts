// JSON-LD を <script> に埋め込む際、< をエスケープして </script> ブレイクアウトを防ぐ
export function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

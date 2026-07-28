// ローディング全画面オーバーレイの中身（ロゴ＋プログレスバー）。
// PageTransition（ルート遷移）と search/loading.tsx（Suspenseフォールバック）で共通利用。
// 外側の全画面コンテナ（pointer-events等）は利用側で持つ。
export default function LoadingIndicator() {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/Logo.svg" alt="BEE log" className="h-16 w-auto animate-pulse" />
      <div className="w-48 h-1.5 bg-[#092040]/20 rounded-full overflow-hidden">
        <div className="h-full bg-[#FCBC2A] rounded-full animate-loading-bar" />
      </div>
      <p className="text-[#092040]/50 text-sm font-bold">読み込み中...</p>
    </div>
  );
}

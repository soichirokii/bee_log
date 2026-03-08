export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[#FFFFF0] flex flex-col items-center justify-center z-[999]">
      <div className="flex flex-col items-center gap-6">
        <img src="/Logo.svg" alt="BEE log" className="h-16 w-auto animate-pulse" />
        <div className="w-48 h-1.5 bg-[#092040]/20 rounded-full overflow-hidden">
          <div className="h-full bg-[#FCBC2A] rounded-full animate-loading-bar" />
        </div>
        <p className="text-[#092040]/50 text-sm font-bold">読み込み中...</p>
      </div>
    </div>
  );
}
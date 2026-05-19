import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFFFF0] flex flex-col items-center justify-center px-6">
      <Link href="/" className="mb-8">
        <Image src="/Logo.svg" alt="BEE log" width={120} height={48} className="h-12 w-auto" />
      </Link>
      <div className="text-6xl mb-4">🍯</div>
      <p className="text-[#092040]/40 font-bold text-sm mb-1">404</p>
      <h1 className="text-[#092040] text-2xl font-black mb-2">ページが見つかりません</h1>
      <p className="text-[#092040]/60 text-sm mb-8 text-center">
        お探しのページは移動または削除された可能性があります。
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="bg-[#092040] text-white font-bold px-6 py-3 rounded-2xl hover:opacity-90 transition-opacity text-center"
        >
          HOMEに戻る
        </Link>
        <Link
          href="/search"
          className="border-2 border-[#092040] text-[#092040] font-bold px-6 py-3 rounded-2xl hover:bg-[#092040] hover:text-white transition-colors text-center"
        >
          活動を探す
        </Link>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーをログに記録（本番では外部サービスに送信）
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FFFFF0] flex flex-col items-center justify-center px-6">
      <Link href="/" className="mb-8">
        <Image src="/Logo.svg" alt="BEE log" width={120} height={48} className="h-12 w-auto" />
      </Link>
      <div className="text-6xl mb-4">🐝</div>
      <h1 className="text-[#092040] text-2xl font-black mb-2">一時的なエラーが発生しました</h1>
      <p className="text-[#092040]/60 text-sm mb-8 text-center">
        コンテンツの読み込みに失敗しました。<br />しばらく待ってから再試行してください。
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-[#092040] text-white font-bold px-6 py-3 rounded-2xl hover:opacity-90 transition-opacity"
        >
          再試行する
        </button>
        <Link
          href="/"
          className="border-2 border-[#092040] text-[#092040] font-bold px-6 py-3 rounded-2xl hover:bg-[#FCBC2A] transition-colors"
        >
          HOMEに戻る
        </Link>
      </div>
    </div>
  );
}

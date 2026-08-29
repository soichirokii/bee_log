"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const LINE_URL = "https://lin.ee/FD2mNHZ";
const STORAGE_KEY = "line_popup_dismissed";

export default function LinePopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 一度閉じたユーザーには表示しない
    if (localStorage.getItem(STORAGE_KEY)) return;
    // 少し遅らせてから表示（ページ読み込み直後は避ける）
    const t = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  };

  if (!visible) return null;

  return (
    <div className={`fixed bottom-6 right-4 z-50 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      <div className="bg-white shadow-2xl border border-gray-100 w-52 md:w-64 overflow-hidden">
        {/* 閉じるボタン */}
        <button
          onClick={dismiss}
          className="absolute top-2 right-2 w-5 h-5 md:w-6 md:h-6 flex items-center justify-center bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors text-xs md:text-sm font-bold z-10"
          aria-label="閉じる"
        >
          ×
        </button>

        {/* ヘッダー */}
        <div className="bg-[#092040] px-3 md:px-4 py-2 md:py-3 flex items-center gap-2">
          <Image src="/beelog.svg" alt="BEE log" width={20} height={20} />
          <span className="text-white text-xs md:text-sm font-bold">BEE log LINE公式</span>
        </div>

        {/* 本文 */}
        <div className="px-3 md:px-4 py-2 md:py-3">
          <p className="text-[#092040] text-xs md:text-sm font-bold mb-1">
            締切・新着を毎週お届け🐝
          </p>
          <p className="text-gray-500 text-[10px] md:text-xs mb-2 md:mb-3">
            見逃しゼロ！活動情報を週1でLINEに送ります
          </p>
          <Link
            href={LINE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#06C755] text-white font-bold text-xs md:text-sm py-2 md:py-2.5 hover:opacity-90 transition-opacity"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
            友だち追加する
          </Link>
        </div>
      </div>
    </div>
  );
}

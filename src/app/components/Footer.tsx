import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/constants/categories";

export default function Footer() {
  return (
    <footer className="bg-[#FFFFF0] border-t-2 border-[#092040]">
      {/* 上部 */}
      <div className="px-8 md:px-16 py-10">
        <div className="flex flex-col md:flex-row gap-10">
          {/* ロゴ */}
          <div className="shrink-0">
            <Link href="/">
              <Image src="/Logo.svg" alt="BEE log" width={120} height={48} className="h-12 w-auto" />
            </Link>
          </div>

          {/* リンク群 */}
          <div className="flex flex-1 flex-wrap gap-10">
            {/* ナビリンク */}
            <div className="flex flex-col gap-4">
              <Link href="/" className="text-[#092040] font-bold text-sm hover:opacity-70 transition-opacity">HOME</Link>
              <Link href="/search" className="text-[#092040] font-bold text-sm hover:opacity-70 transition-opacity">活動を探す</Link>
              <Link href="/about" className="text-[#092040] font-bold text-sm hover:opacity-70 transition-opacity">About us</Link>
            </div>

            {/* SNS */}
            <div className="flex flex-col gap-4">
              <a href="https://www.instagram.com/beelog_jp?igsh=MTNieHBjanBkOTc4cA==" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#092040] font-bold text-sm hover:opacity-70 transition-opacity">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                Instagram
              </a>
              <a href="https://x.com/beelog_jp?s=21" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#092040] font-bold text-sm hover:opacity-70 transition-opacity">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X(Twitter)
              </a>
              <a href="https://lin.ee/FD2mNHZ" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#092040] font-bold text-sm hover:opacity-70 transition-opacity">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
                LINE
              </a>
            </div>

            {/* お問い合わせ */}
            <div className="flex flex-col gap-4">
              <a href="mailto:beelog.jp@gmail.com" className="text-[#092040] font-bold text-sm hover:opacity-70 transition-opacity">お問い合わせ</a>
            </div>

            {/* カテゴリ */}
            <div className="flex flex-col gap-3 min-w-[180px]">
              <span className="text-[#092040] font-bold text-sm">カテゴリ</span>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {CATEGORIES.map((cat) => (
                  <Link key={cat.slug} href={`/search?category=${encodeURIComponent(cat.name)}`}
                    className="text-[#092040]/80 text-xs hover:text-[#092040] hover:opacity-100 transition-colors">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 下部 */}
      <div className="border-t border-gray-200 px-8 md:px-16 py-4">
        <p className="text-gray-400 text-xs">©2026 BEE log</p>
      </div>
    </footer>
  );
}
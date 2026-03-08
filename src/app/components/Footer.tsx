import Image from "next/image";
import Link from "next/link";

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
            <div className="flex flex-col gap-4">
              <Link href="/" className="text-[#092040] font-bold text-sm hover:opacity-70 transition-opacity">HOME</Link>
              <Link href="/search" className="text-[#092040] font-bold text-sm hover:opacity-70 transition-opacity">活動を探す</Link>
              <a href="mailto:beelog.jp@gmail.com" className="text-[#092040] font-bold text-sm hover:opacity-70 transition-opacity">お問い合わせ</a>
            </div>

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
            </div>
          </div>
        </div>
      </div>

      {/* 下部 */}
      <div className="border-t border-gray-200 px-8 md:px-16 py-4">
        <p className="text-gray-400 text-xs">©2023-2026 BEE log</p>
      </div>
    </footer>
  );
}
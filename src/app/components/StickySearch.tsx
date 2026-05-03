"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Props = {
  keyword: string;
  setKeyword: (v: string) => void;
  searchRef: React.RefObject<HTMLDivElement>;
};

export default function StickySearch({ keyword, setKeyword, searchRef }: Props) {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (searchRef.current) observer.observe(searchRef.current);
    return () => observer.disconnect();
  }, [searchRef]);

  if (!visible) return null;

  return (
    <>
      {/* PC：Navbarの右に */}
      <div className="hidden md:flex items-center gap-2 animate-fadeInDown"
        style={{ position: "absolute", right: "24px", top: "50%", transform: "translateY(-50%)" }}>
        <div className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-sm w-64">
          <Image src="/icons/Magnifying Glass.svg" alt="" width={14} height={14} className="opacity-40 shrink-0" />
          <input
            type="search"
            placeholder="検索..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") router.push(`/search?q=${encodeURIComponent(keyword)}`); }}
            className="flex-1 text-sm outline-none text-[#092040] placeholder-[#092040]/40 bg-transparent"
            autoFocus
          />
        </div>
      </div>

      {/* モバイル：上部中央に固定 */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[60] bg-[#FFFFF0]/95 backdrop-blur-sm border-b border-gray-200 px-4 py-2 flex items-center gap-2 animate-fadeInDown">
        <div className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-2">
          <Image src="/icons/Magnifying Glass.svg" alt="" width={14} height={14} className="opacity-40 shrink-0" />
          <input
            type="search"
            placeholder="活動を検索..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") router.push(`/search?q=${encodeURIComponent(keyword)}`); }}
            className="flex-1 text-sm outline-none text-[#092040] placeholder-[#092040]/40 bg-transparent"
          />
        </div>
        <button
          onClick={() => router.push(`/search?q=${encodeURIComponent(keyword)}`)}
          className="bg-[#092040] text-white text-xs font-bold px-4 py-2 rounded-xl shrink-0">
          検索
        </button>
      </div>
    </>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export const FAB_BASE_CLASS =
  "fixed right-4 z-50 w-14 h-14 rounded-full bg-[#FCBC2A] border-2 border-[#092040] shadow-[0_4px_0_#092040] flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:translate-y-px active:scale-[0.93] active:shadow-[0_2px_0_#092040] motion-reduce:transition-none motion-reduce:transform-none md:hidden";

export default function MobileSearchFab() {
  const pathname = usePathname();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const isPostPage = pathname.startsWith("/posts/");
  const hasSearchBox = pathname === "/" || pathname === "/search";
  const [searchBoxVisible, setSearchBoxVisible] = useState(true);
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (!hasSearchBox) return;
    const el = document.getElementById("search-box");
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setSearchBoxVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pathname, hasSearchBox]);

  useEffect(() => {
    setOpen(false);
    setKeyword("");
  }, [pathname]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const visible = isPostPage || (hasSearchBox && !searchBoxVisible);
  if (!visible) return null;

  const submit = () => {
    if (!keyword.trim()) return;
    router.push(`/search?q=${encodeURIComponent(keyword.trim())}`);
    setOpen(false);
    setKeyword("");
  };

  const closeQuickSearch = () => {
    setOpen(false);
    setKeyword("");
  };

  return (
    <div
      className={`mobile-fab fixed right-4 z-50 flex items-center md:hidden ${isPostPage ? "bottom-[104px]" : "bottom-6"}`}
    >
      <div
        className={`flex items-center overflow-hidden bg-[#FFFFF0] border-2 border-[#092040] rounded-full transition-[width,opacity,margin,padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          open ? "w-[190px] opacity-100 mr-2 px-3 py-2" : "w-0 opacity-0 mr-0 px-0 py-2"
        }`}
      >
        <input
          ref={inputRef}
          type="search"
          placeholder="検索"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          className="flex-1 min-w-0 text-sm outline-none focus-visible:outline-none text-[#092040] placeholder-[#092040]/50 bg-transparent"
        />
        <button
          type="button"
          aria-label="検索を閉じる"
          onClick={closeQuickSearch}
          className="shrink-0 w-6 h-6 flex items-center justify-center text-[#092040]/60 hover:text-[#092040] text-lg leading-none"
        >
          ×
        </button>
      </div>
      <button
        type="button"
        aria-label={open ? "検索を実行" : "活動を探す"}
        onClick={() => (open ? submit() : setOpen(true))}
        className="w-14 h-14 rounded-full bg-[#FCBC2A] border-2 border-[#092040] shadow-[0_4px_0_#092040] flex items-center justify-center shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:translate-y-px active:scale-[0.93] active:shadow-[0_2px_0_#092040] motion-reduce:transition-none motion-reduce:transform-none"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#092040" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </div>
  );
}

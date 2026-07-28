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
  // ソフトキーボードの高さ（visualViewportで検知）。0 = 閉じている。
  const [keyboardInset, setKeyboardInset] = useState(0);

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

  // ソフトキーボードの高さを visualViewport で監視。
  // iOS/Android とも、キーボード表示時は visualViewport.height がその分縮む。
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      // 数pxの誤差でチラつかないよう、実質キーボードのみ反応させる
      setKeyboardInset(inset > 80 ? inset : 0);
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

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

  // 通常時の位置（safe-area分を上乗せしてホームインジケーターに被らせない）。
  // 記事ページは応募バーの上に出すため従来どおり高め。
  const restBottom = isPostPage
    ? "104px"
    : "calc(env(safe-area-inset-bottom, 0px) + 3.5rem)";
  // 検索窓を開いてキーボードが出ている間は、その真上に浮かせて隠れないようにする。
  const bottom =
    open && keyboardInset > 0 ? `${keyboardInset + 12}px` : restBottom;

  return (
    <div
      className="mobile-fab fixed right-4 z-50 flex items-center md:hidden transition-[bottom] duration-200 ease-out motion-reduce:transition-none"
      style={{ bottom }}
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
        aria-label={open ? (keyword.trim() ? "検索を実行" : "検索を閉じる") : "活動を探す"}
        onClick={() => {
          if (!open) { setOpen(true); return; }
          if (keyword.trim()) { submit(); } else { closeQuickSearch(); }
        }}
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

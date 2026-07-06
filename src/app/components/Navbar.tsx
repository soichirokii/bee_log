"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "HOME" },
  { href: "/search", label: "活動を探す" },
  { href: "/about", label: "About us" },
] as const;

export type NavbarSearch = {
  keyword: string;
  setKeyword: (v: string) => void;
  onSearch: () => void;
};

function useScrolled(threshold: number) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

const LINK_CLASS =
  "font-bold text-[#092040] rounded-full transition-[background-color,transform] ease-[cubic-bezier(0.34,1.56,0.64,1)] duration-300 hover:bg-[#FCBC2A] hover:-translate-y-0.5 hover:scale-[1.05] active:translate-y-px active:scale-[0.96] motion-reduce:transition-none motion-reduce:transform-none";

const ICON_BTN_CLASS =
  "flex items-center justify-center rounded-full shrink-0 transition-[background-color,transform] ease-[cubic-bezier(0.34,1.56,0.64,1)] duration-300 hover:bg-[#FCBC2A] hover:-translate-y-0.5 hover:scale-[1.05] active:translate-y-px active:scale-[0.96] motion-reduce:transition-none motion-reduce:transform-none";

export default function Navbar({ search }: { search?: NavbarSearch }) {
  const pathname = usePathname();
  const scrolled = useScrolled(80);
  const [menuOpen, setMenuOpen] = useState(false);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // カプセル化しても下の固定検索窓(モバイル)が navbar の高さに追従できるよう、
  // 実際の高さを CSS 変数として公開する
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const setVar = () => document.documentElement.style.setProperty("--navbar-h", `${el.offsetHeight}px`);
    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scrolled]);

  useEffect(() => {
    if (!quickSearchOpen) return;
    const close = () => setQuickSearchOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [quickSearchOpen]);

  const pillPad = scrolled ? "px-4 py-1.5 text-sm" : "px-6 py-2.5 text-base";

  return (
    <>
      <div style={{ height: "var(--navbar-h, 80px)" }} aria-hidden="true" />
      <div ref={wrapRef} className="fixed inset-x-0 top-0 z-50">
        {/* PC */}
        <nav
          className={`hidden md:flex items-center mx-auto transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            scrolled
              ? "w-[min(560px,calc(100%-28px))] mt-3 rounded-full border-2 border-[#092040] bg-[rgba(255,255,238,0.82)] backdrop-blur-[8px] shadow-[0_4px_0_rgba(9,32,64,0.9)] px-5 py-2"
              : "w-full mt-0 rounded-none border-0 border-b-2 border-[#092040] bg-[#FFFFEE] px-16 py-4"
          }`}
        >
          <Link href="/" className="mr-8 shrink-0 transition-opacity duration-200 hover:opacity-70">
            <Image
              src="/Logo.svg"
              alt="BEE log"
              width={120}
              height={48}
              className={`w-auto transition-[height] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${scrolled ? "h-8" : "h-12"}`}
            />
          </Link>
          <div className="flex items-center gap-2">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`${LINK_CLASS} ${pillPad} ${pathname === href ? "bg-[#FCBC2A]" : ""}`}
              >
                {label}
              </Link>
            ))}
          </div>

          {search && (
            <div className="relative ml-auto">
              <button
                type="button"
                aria-label="検索を開く"
                onClick={() => setQuickSearchOpen((v) => !v)}
                className={`${ICON_BTN_CLASS} ${scrolled ? "w-8 h-8" : "w-10 h-10"}`}
              >
                <Image src="/icons/Magnifying Glass.svg" alt="" width={16} height={16} className="opacity-70" />
              </button>
              {quickSearchOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#FFFFEE] border-2 border-[#092040] rounded-2xl px-3 py-2.5 flex items-center gap-2 shadow-[0_4px_0_rgba(9,32,64,0.9)]">
                  <Image src="/icons/Magnifying Glass.svg" alt="" width={16} height={16} className="opacity-40 shrink-0" />
                  <input
                    autoFocus
                    type="search"
                    placeholder="検索"
                    value={search.keyword}
                    onChange={(e) => search.setKeyword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") search.onSearch(); }}
                    className="flex-1 min-w-0 text-sm outline-none text-[#092040] placeholder-[#092040]/50 bg-transparent"
                  />
                </div>
              )}
            </div>
          )}
        </nav>

        {/* モバイル */}
        <nav
          className={`md:hidden flex items-center mx-auto transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            scrolled
              ? "w-[min(560px,calc(100%-28px))] mt-3 rounded-full border-2 border-[#092040] bg-[rgba(255,255,238,0.82)] backdrop-blur-[8px] shadow-[0_4px_0_rgba(9,32,64,0.9)] px-[4vw] py-[1.5vw]"
              : "w-full mt-0 rounded-none border-0 border-b-2 border-[#092040] bg-[#FFFFEE] px-[5vw] py-[3vw]"
          }`}
        >
          <div className="flex-1" />
          <Link href="/" className="flex justify-center">
            <Image
              src="/Logo.svg"
              alt="BEE log"
              width={120}
              height={48}
              className={`w-auto transition-[height] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${scrolled ? "h-[7vw]" : "h-[10vw]"}`}
            />
          </Link>
          <div className="flex-1 flex justify-end">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="メニューを開く"
              className="p-2 flex flex-col justify-center gap-[5px]"
            >
              <span className="block w-[22px] h-[2px] bg-[#092040]" />
              <span className="block w-[22px] h-[2px] bg-[#092040]" />
              <span className="block w-[22px] h-[2px] bg-[#092040]" />
            </button>
          </div>
        </nav>
      </div>

      {/* モバイル フルスクリーンオーバーレイ */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex flex-col" role="dialog" aria-modal="true">
          <div className="flex items-center bg-[#FFFFEE] border-b-2 border-[#092040] px-[5vw] py-[3vw] shrink-0">
            <div className="flex-1" />
            <Link href="/" onClick={() => setMenuOpen(false)} className="flex justify-center">
              <Image src="/Logo.svg" alt="BEE log" width={120} height={48} className="h-[10vw] w-auto" />
            </Link>
            <div className="flex-1 flex justify-end">
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="メニューを閉じる"
                className="p-2 flex flex-col justify-center gap-[5px]"
              >
                <span className="block w-[22px] h-[2px] bg-[#092040] origin-center translate-y-[7px] rotate-45" />
                <span className="block w-[22px] h-[2px] bg-[#092040] opacity-0" />
                <span className="block w-[22px] h-[2px] bg-[#092040] origin-center -translate-y-[7px] -rotate-45" />
              </button>
            </div>
          </div>
          <nav className="flex-1 bg-[#FFFFEE] flex flex-col items-center justify-center gap-12" role="menu">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className={`text-3xl font-bold tracking-wide transition-colors ${
                  pathname === href ? "text-[#FCBC2A]" : "text-[#092040] hover:text-[#FCBC2A]"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}

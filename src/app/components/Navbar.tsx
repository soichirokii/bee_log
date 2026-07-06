"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "HOME" },
  { href: "/search", label: "活動を探す" },
  { href: "/about", label: "About us" },
] as const;

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
  "font-bold text-[#092040] rounded-full whitespace-nowrap transition-[background-color,transform] ease-[cubic-bezier(0.34,1.56,0.64,1)] duration-300 hover:bg-[#FCBC2A] hover:-translate-y-0.5 hover:scale-[1.05] active:translate-y-px active:scale-[0.96] motion-reduce:transition-none motion-reduce:transform-none";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const scrolled = useScrolled(80);
  const [menuOpen, setMenuOpen] = useState(false);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [quickKeyword, setQuickKeyword] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const quickInputRef = useRef<HTMLInputElement>(null);

  const showSearchButton = pathname === "/search" || pathname.startsWith("/posts/");

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
  }, []);

  useEffect(() => {
    setQuickSearchOpen(false);
    setQuickKeyword("");
  }, [pathname]);

  useEffect(() => {
    if (quickSearchOpen) quickInputRef.current?.focus();
  }, [quickSearchOpen]);

  const submitQuickSearch = () => {
    if (!quickKeyword.trim()) return;
    router.push(`/search?q=${encodeURIComponent(quickKeyword.trim())}`);
  };

  const closeQuickSearch = () => {
    setQuickSearchOpen(false);
    setQuickKeyword("");
  };

  const pillPad = scrolled ? "px-5 py-2.5 text-sm" : "px-6 py-2.5 text-base";

  return (
    <>
      <div style={{ height: "var(--navbar-h, 80px)" }} aria-hidden="true" />
      <div ref={wrapRef} className="fixed inset-x-0 top-0 z-50">
        {/* PC */}
        <nav
          className={`hidden md:flex items-center mx-auto transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            scrolled
              ? "w-[calc(100%-28px)] max-w-[560px] mt-3 rounded-full border-2 border-[#092040] bg-[rgba(255,255,238,0.82)] backdrop-blur-[8px] [-webkit-backdrop-filter:blur(8px)] shadow-[0_4px_0_rgba(9,32,64,0.9)] px-[14px] py-2.5"
              : "w-full mt-0 rounded-none border-0 border-b-2 border-dashed border-[rgba(9,32,64,0.18)] bg-[#FFFFEE] px-16 py-4"
          }`}
        >
          <Link href="/" className="group mr-8 shrink-0">
            <Image
              src="/Logo.svg"
              alt="BEE log"
              width={120}
              height={48}
              className={`w-auto transition-transform duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-[20deg] group-hover:scale-[1.15] motion-reduce:transition-none motion-reduce:transform-none ${scrolled ? "h-11" : "h-12"}`}
            />
          </Link>

          <div
            className={`flex items-center gap-2 min-w-0 transition-opacity duration-300 motion-reduce:transition-none ${
              quickSearchOpen ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
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

          {showSearchButton && (
            <div className="ml-auto flex items-center shrink-0">
              <div
                className={`flex items-center overflow-hidden transition-[width,opacity,margin] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  quickSearchOpen ? "w-[220px] opacity-100 mr-2" : "w-0 opacity-0 mr-0"
                }`}
              >
                <input
                  ref={quickInputRef}
                  type="search"
                  placeholder="検索"
                  value={quickKeyword}
                  onChange={(e) => setQuickKeyword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") submitQuickSearch(); }}
                  className="w-[190px] shrink-0 text-sm outline-none text-[#092040] placeholder-[#092040]/50 bg-transparent border-0 border-b-2 border-[#092040] py-1"
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
                aria-label={quickSearchOpen ? "検索を閉じる" : "検索を開く"}
                onClick={() => (quickSearchOpen ? closeQuickSearch() : setQuickSearchOpen(true))}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FCBC2A] border-2 border-[#092040] shadow-[0_3px_0_#092040] shrink-0 transition-transform duration-200 hover:scale-105 active:scale-95 motion-reduce:transition-none motion-reduce:transform-none"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#092040" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </div>
          )}
        </nav>

        {/* モバイル */}
        <nav
          className={`md:hidden flex items-center mx-auto transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            scrolled
              ? "w-[min(560px,calc(100%-28px))] mt-3 rounded-full border-2 border-[#092040] bg-[rgba(255,255,238,0.82)] backdrop-blur-[8px] [-webkit-backdrop-filter:blur(8px)] shadow-[0_4px_0_rgba(9,32,64,0.9)] px-[6vw] py-[3vw]"
              : "w-full mt-0 rounded-none border-0 border-b-2 border-dashed border-[rgba(9,32,64,0.18)] bg-[#FFFFEE] px-[5vw] py-[3vw]"
          }`}
        >
          <div className="flex-1" />
          <Link href="/" className="group flex justify-center">
            <Image
              src="/Logo.svg"
              alt="BEE log"
              width={120}
              height={48}
              className={`w-auto transition-transform duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-[20deg] group-hover:scale-[1.15] motion-reduce:transition-none motion-reduce:transform-none ${scrolled ? "h-[9.5vw]" : "h-[10vw]"}`}
            />
          </Link>
          <div className="flex-1 flex justify-end">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
              className="p-2 flex flex-col justify-center gap-[5px]"
            >
              <span className={`block w-[22px] h-[2px] bg-[#092040] transition-transform duration-200 motion-reduce:transition-none ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
              <span className={`block w-[22px] h-[2px] bg-[#092040] transition-opacity duration-200 motion-reduce:transition-none ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-[22px] h-[2px] bg-[#092040] transition-transform duration-200 motion-reduce:transition-none ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
            </button>
          </div>
        </nav>
      </div>

      {/* モバイル フルスクリーンオーバーレイ: Navbar自体(丸まっている場合はその状態)はそのまま残し、下に被せる */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-x-0 bottom-0 z-40 flex flex-col"
          style={{ top: "var(--navbar-h, 80px)" }}
          role="dialog"
          aria-modal="true"
        >
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

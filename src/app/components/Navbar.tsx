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

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

const LINK_CLASS =
  "font-bold text-[#092040] rounded-full whitespace-nowrap transition-[background-color,transform] ease-[cubic-bezier(0.34,1.56,0.64,1)] duration-300 hover:bg-[#FCBC2A] hover:-translate-y-0.5 hover:scale-[1.05] active:translate-y-px active:scale-[0.96] motion-reduce:transition-none motion-reduce:transform-none";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const scrolled = useScrolled(80);
  const reducedMotion = usePrefersReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuOrigin, setMenuOrigin] = useState({ x: 0, y: 0 });
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [quickKeyword, setQuickKeyword] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const quickInputRef = useRef<HTMLInputElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const showSearchButton = scrolled;

  // カプセル化しても下の固定検索窓(モバイル)が navbar の高さに追従できるよう、
  // 実際の高さを CSS 変数として公開する
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let last = -1;
    let raf = 0;
    const setVar = () => {
      raf = 0;
      const h = Math.round(el.offsetHeight);
      if (h === last) return;
      last = h;
      document.documentElement.style.setProperty("--navbar-h", `${h}px`);
    };
    setVar();
    const ro = new ResizeObserver(() => {
      if (raf) return;
      raf = requestAnimationFrame(setVar);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    setQuickSearchOpen(false);
    setQuickKeyword("");
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!scrolled) {
      setQuickSearchOpen(false);
      setQuickKeyword("");
    }
  }, [scrolled]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

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

  const toggleMenu = () => {
    if (!menuOpen && hamburgerRef.current) {
      const rect = hamburgerRef.current.getBoundingClientRect();
      setMenuOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
    setMenuOpen((v) => !v);
  };

  const pillPad = scrolled ? "px-6 py-3 text-base" : "px-6 py-2.5 text-base";

  return (
    <>
      <div style={{ height: "var(--navbar-h, 80px)" }} aria-hidden="true" />
      <div ref={wrapRef} className="fixed inset-x-0 top-0 z-50">
        {/* PC */}
        <nav
          className={`hidden md:flex items-center mx-auto transition-[width,margin,padding,border-color,border-width,border-radius,background-color,box-shadow] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[backdrop-filter] motion-reduce:transition-none ${
            scrolled
              ? "w-[min(800px,calc(100%-28px))] mt-3 rounded-[42px] border-2 border-[#092040] bg-[rgba(255,255,240,0.82)] backdrop-blur-[8px] [-webkit-backdrop-filter:blur(8px)] shadow-[0_4px_0_rgba(9,32,64,0.9)] px-8 py-4 overflow-hidden"
              : "w-full mt-0 rounded-none border-0 border-b-2 border-[#092040] bg-[#FFFFF0] px-16 py-4"
          }`}
        >
          <Link href="/" className="mr-8 shrink-0">
            <Image
              src="/Logo.svg"
              alt="BEE log"
              width={120}
              height={48}
              className={`w-auto h-12 origin-left transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${scrolled ? "scale-[0.9167]" : "scale-100"}`}
            />
          </Link>

          {/* scale はロゴの flex 上の幅を縮めないため、旧 h-11 時のリンク開始位置を transform で維持する */}
          <div
            className={`min-w-0 transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              scrolled ? "-translate-x-[9.387px]" : "translate-x-0"
            }`}
          >
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
          </div>

          {showSearchButton && (
            <div className="relative ml-auto flex items-center shrink-0">
              <div
                className={`absolute top-1/2 right-[3.25rem] w-[220px] flex items-center overflow-hidden -translate-y-1/2 transition-[transform,opacity] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  quickSearchOpen ? "translate-x-0 opacity-100 pointer-events-auto" : "translate-x-2 opacity-0 pointer-events-none"
                }`}
              >
                <input
                  ref={quickInputRef}
                  type="search"
                  aria-label="活動を検索"
                  placeholder="検索"
                  value={quickKeyword}
                  onChange={(e) => setQuickKeyword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") submitQuickSearch(); }}
                  className="w-[190px] shrink-0 text-sm text-[#092040] placeholder-[#092040]/50 bg-transparent border-0 border-b-2 border-[#092040] py-1"
                />
                <button
                  type="button"
                  aria-label="検索を閉じる"
                  onClick={closeQuickSearch}
                  className="shrink-0 w-11 h-11 flex items-center justify-center text-[#092040]/60 hover:text-[#092040] text-lg leading-none"
                >
                  ×
                </button>
              </div>
              <button
                type="button"
                aria-label={quickSearchOpen ? "検索を閉じる" : "検索を開く"}
                onClick={() => (quickSearchOpen ? closeQuickSearch() : setQuickSearchOpen(true))}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-[#FCBC2A] border-2 border-[#092040] shadow-[0_3px_0_#092040] shrink-0 transition-transform duration-200 hover:scale-105 active:scale-95 motion-reduce:transition-none motion-reduce:transform-none"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#092040" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </div>
          )}
        </nav>

        {/* モバイル */}
        <nav
          className={`md:hidden flex items-center mx-auto transition-[width,margin,padding,border-color,border-width,border-radius,background-color,box-shadow] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[backdrop-filter] motion-reduce:transition-none ${
            scrolled
              ? "w-[min(800px,calc(100%-28px))] mt-3 rounded-[max(50px,9vw)] border-2 border-[#092040] bg-[rgba(255,255,240,0.82)] backdrop-blur-[8px] [-webkit-backdrop-filter:blur(8px)] shadow-[0_4px_0_rgba(9,32,64,0.9)] px-[6vw] py-[3.5vw]"
              : "w-full mt-0 rounded-none border-0 border-b-2 border-[#092040] bg-[#FFFFF0] px-[5vw] py-[3vw]"
          }`}
        >
          <div className="flex-1" />
          <Link href="/" className={`flex items-center justify-center ${scrolled ? "h-[9.5vw]" : "h-[10vw]"}`}>
            <Image
              src="/Logo.svg"
              alt="BEE log"
              width={120}
              height={48}
              className={`w-auto h-[10vw] origin-center transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${scrolled ? "scale-[0.95]" : "scale-100"}`}
            />
          </Link>
          <div className="flex-1 flex justify-end">
            <button
              ref={hamburgerRef}
              type="button"
              onClick={toggleMenu}
              aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
              className={`relative z-[60] w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-full transition-colors duration-[400ms] motion-reduce:transition-none ${menuOpen ? "bg-[#092040]" : ""}`}
            >
              <span className={`block w-[22px] h-[2px] transition-transform duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none motion-reduce:transform-none ${menuOpen ? "bg-[#FFFFF0] translate-y-[7.5px] rotate-45" : "bg-[#092040]"}`} />
              <span className={`block w-[22px] h-[2px] transition-transform duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none motion-reduce:transform-none ${menuOpen ? "bg-[#FFFFF0] -rotate-45" : "bg-[#092040]"}`} />
              <span className={`block w-[22px] h-[2px] transition-[opacity,transform] duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none motion-reduce:transform-none ${menuOpen ? "bg-[#FFFFF0] -translate-y-[7.5px] rotate-45 opacity-0" : "bg-[#092040]"}`} />
            </button>
          </div>
        </nav>
      </div>

      {/* モバイル フルスクリーンメニュー: ハンバーガー起点のサークル展開 */}
      <div
        className="md:hidden fixed inset-0 z-40 bg-[#FCBC2A]"
        style={{
          clipPath: `circle(${menuOpen ? "150vmax" : "0px"} at ${menuOrigin.x}px ${menuOrigin.y}px)`,
          transition: reducedMotion ? "none" : "clip-path 0.9s cubic-bezier(0.22,1,0.36,1)",
          pointerEvents: menuOpen ? "auto" : "none",
        }}
        role="dialog"
        aria-modal="true"
        aria-hidden={!menuOpen}
      >
        <nav
          className="h-full flex flex-col items-center justify-center gap-10"
          role="menu"
          style={{
            opacity: menuOpen ? 1 : 0,
            transition: reducedMotion ? "none" : `opacity 0.45s ease ${menuOpen ? "0.35s" : "0s"}`,
          }}
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className={`text-[28px] font-black text-[#092040] px-6 py-2 rounded-full transition-transform motion-reduce:transform-none active:scale-95 ${
                pathname === href ? "border-[2.5px] border-[#092040]" : ""
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}

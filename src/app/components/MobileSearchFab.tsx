"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export const FAB_BASE_CLASS =
  "fixed right-4 z-50 w-14 h-14 rounded-full bg-[#FCBC2A] border-2 border-[#092040] shadow-[0_4px_0_#092040] flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:translate-y-px active:scale-[0.93] active:shadow-[0_2px_0_#092040] motion-reduce:transition-none motion-reduce:transform-none md:hidden";

export default function MobileSearchFab() {
  const pathname = usePathname();
  const router = useRouter();

  const isPostPage = pathname.startsWith("/posts/");
  const hasSearchBox = pathname === "/" || pathname === "/search";
  const [searchBoxVisible, setSearchBoxVisible] = useState(true);

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

  const visible = isPostPage || (hasSearchBox && !searchBoxVisible);
  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="活動を探す"
      onClick={() => router.push("/search")}
      className={`${FAB_BASE_CLASS} mobile-fab ${isPostPage ? "bottom-[104px]" : "bottom-6"}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#092040" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </button>
  );
}

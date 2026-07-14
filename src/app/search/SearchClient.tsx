"use client";

import { useState, useMemo, Suspense, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Post } from "@/types/notion";
import { useRouter } from "next/navigation";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ActivityCard from "../components/ActivityCard";
import { FAB_BASE_CLASS } from "../components/MobileSearchFab";
import { CATEGORY_NAMES, CATEGORY_TAG_CLASS, GRADES, FORMATS } from "@/constants/categories";
import { getPeriodLabel } from "@/lib/period";

/* ① カウントアップフック */
function useCountUp(target: number, duration = 400) {
  const [display, setDisplay] = useState(target);
  const rafRef = useRef<number | null>(null);
  const prevRef = useRef(target);
  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = target;
    if (from === target) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (target - from) * e));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);
  return display;
}

/* ④ スケルトンカード */
function SkeletonCard() {
  return (
    <div className="bg-[#FFFFF0] overflow-hidden">
      <div className="w-full aspect-video bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded-full w-1/3 animate-pulse" />
        <div className="h-5 bg-gray-200 rounded-full w-full animate-pulse" />
        <div className="h-5 bg-gray-200 rounded-full w-2/3 animate-pulse" />
      </div>
    </div>
  );
}

/* ⑥ スクロールfadeInラッパー */
function FadeInCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

/* ① 件数カウントアップ表示 */
function ResultsCount({ count }: { count: number }) {
  const display = useCountUp(count);
  return <p className="text-[#092040] font-bold mb-4 text-base">{display} 件の活動が見つかりました</p>;
}


const PAGE_SIZE = 12;

function SearchInner({ posts, keyword, setKeyword }: {
  posts: Post[];
  keyword: string;
  setKeyword: (v: string) => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category")?.split(",").filter(Boolean) ?? []
  );
  const [selectedGrades, setSelectedGrades] = useState<string[]>(
    searchParams.get("grade")?.split(",").filter(Boolean) ?? []
  );
  const [selectedFormats, setSelectedFormats] = useState<string[]>(
    searchParams.get("format") ? [searchParams.get("format")!] : []
  );
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(
    searchParams.get("period")?.split(",").filter(Boolean) ?? []
  );
  const [freeOnly, setFreeOnly] = useState(searchParams.get("free") === "1");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [filterOpen, setFilterOpen] = useState(false);
  /* ⑦ ページ切替トランジション */
  const [cardsVisible, setCardsVisible] = useState(true);
  const skipUrlToStateRef = useRef(false);
  const goToPage = useCallback((p: number) => {
    setCardsVisible(false);
    setTimeout(() => { setPage(p); setCardsVisible(true); }, 180);
  }, []);
  /* ⑨ Pull-to-refresh */
  const pullStartY = useRef(0);
  const pullDistRef = useRef(0);
  const [pullDist, setPullDist] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // URL → 状態（シェアURLや戻るボタンで状態を復元）
  useEffect(() => {
    if (skipUrlToStateRef.current) {
      skipUrlToStateRef.current = false;
      return;
    }
    setKeyword(searchParams.get("q") ?? "");
    setSelectedCategories(searchParams.get("category")?.split(",").filter(Boolean) ?? []);
    setSelectedGrades(searchParams.get("grade")?.split(",").filter(Boolean) ?? []);
    setSelectedFormats(searchParams.get("format") ? [searchParams.get("format")!] : []);
    setSelectedPeriods(searchParams.get("period")?.split(",").filter(Boolean) ?? []);
    setFreeOnly(searchParams.get("free") === "1");
    setPage(Number(searchParams.get("page")) || 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchParams]);

  // 状態 → URL（フィルター変更時にURLを更新）
  useEffect(() => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (selectedCategories.length) params.set("category", selectedCategories.join(","));
    if (selectedGrades.length) params.set("grade", selectedGrades.join(","));
    if (selectedFormats.length) params.set("format", selectedFormats[0]);
    if (selectedPeriods.length) params.set("period", selectedPeriods.join(","));
    if (freeOnly) params.set("free", "1");
    if (page > 1) params.set("page", String(page));
    skipUrlToStateRef.current = true;
    router.replace(`/search?${params.toString()}`, { scroll: false });
  }, [selectedCategories, selectedGrades, selectedFormats, selectedPeriods, freeOnly, page]);

  /* ⑨ Pull-to-refresh イベント */
  useEffect(() => {
    const THRESHOLD = 70;
    const onStart = (e: TouchEvent) => {
      if (window.scrollY === 0) pullStartY.current = e.touches[0].clientY;
    };
    const onMove = (e: TouchEvent) => {
      if (!pullStartY.current) return;
      const d = e.touches[0].clientY - pullStartY.current;
      if (d > 0 && window.scrollY === 0) {
        pullDistRef.current = Math.min(d * 0.4, THRESHOLD + 20);
        setPullDist(pullDistRef.current);
      }
    };
    const onEnd = () => {
      if (pullDistRef.current >= THRESHOLD) {
        setIsRefreshing(true);
        router.refresh();
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDist(0);
          pullDistRef.current = 0;
          pullStartY.current = 0;
        }, 1200);
      } else {
        setPullDist(0);
        pullDistRef.current = 0;
        pullStartY.current = 0;
      }
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [router]);

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
    setPage(1);
  };

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (selectedCategories.length) params.set("category", selectedCategories.join(","));
    if (selectedGrades.length) params.set("grade", selectedGrades.join(","));
    if (selectedFormats.length) params.set("format", selectedFormats[0]);
    if (selectedPeriods.length) params.set("period", selectedPeriods.join(","));
    if (freeOnly) params.set("free", "1");
    router.push(`/search?${params.toString()}`);
  }, [keyword, selectedCategories, selectedGrades, selectedFormats, selectedPeriods, freeOnly, router]);

  const activeFilterCount = selectedCategories.length + selectedGrades.length + selectedFormats.length + selectedPeriods.length + (freeOnly ? 1 : 0);

  const filtered = useMemo(() => {
    let result = posts;
    if (keyword.trim()) {
      const kw = keyword.toLowerCase();
      result = result.filter((p) =>
        p.title.toLowerCase().includes(kw) || p.summary.toLowerCase().includes(kw) ||
        p.organizer.toLowerCase().includes(kw) || p.tags.some((t) => t.toLowerCase().includes(kw))
      );
    }
    if (selectedCategories.length > 0) result = result.filter((p) => selectedCategories.includes(p.category));
    if (selectedGrades.length > 0) result = result.filter((p) => selectedGrades.every((g) => p.targetGrade.includes(g)));
    if (selectedFormats.length > 0) result = result.filter((p) => selectedFormats.includes(p.format));
    if (selectedPeriods.length > 0) result = result.filter((p) => { const l = getPeriodLabel(p.period); return l !== null && selectedPeriods.includes(l); });
    if (freeOnly) result = result.filter((p) => p.fee === "無料" || p.fee === "0円" || p.fee === "0");
    // 常に締切が近い順で表示（締切なしは末尾）
    result = [...result].sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
    return result;
  }, [posts, keyword, selectedCategories, selectedGrades, selectedFormats, selectedPeriods, freeOnly]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const FilterPanel = () => (
    <div className="bg-[#FFFFF0] p-5">
      <h2 className="font-bold text-[#092040] text-lg mb-4">絞り込み検索</h2>
      <div className="mb-5">
        <h3 className="text-sm font-bold text-[#092040] mb-2">カテゴリ</h3>
        {CATEGORY_NAMES.map((cat) => (
          <label key={cat} className="flex items-center gap-2 mb-2 cursor-pointer">
            <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleItem(selectedCategories, setSelectedCategories, cat)} className="relative appearance-none shrink-0 w-4 h-4 border-2 border-[#092040] rounded bg-[#FFFFF0] checked:bg-[#092040] checked:after:content-[''] checked:after:absolute checked:after:left-[4px] checked:after:top-[1px] checked:after:w-[4px] checked:after:h-[8px] checked:after:border-white checked:after:border-b-2 checked:after:border-r-2 checked:after:rotate-45 focus:outline-none cursor-pointer" />
            <span className="text-sm text-[#092040] font-medium">{cat}</span>
          </label>
        ))}
      </div>
      <div className="mb-5">
        <h3 className="text-sm font-bold text-[#092040] mb-2">対象学年</h3>
        <div className="flex flex-wrap gap-2">
          {GRADES.map((grade) => (
            <button key={grade} onClick={() => toggleItem(selectedGrades, setSelectedGrades, grade)}
              className={`px-3 py-1 rounded-full text-sm font-medium border-2 transition-colors ${selectedGrades.includes(grade) ? "bg-[#092040] border-[#092040] text-white" : "border-[#092040] text-[#092040] hover:bg-[#092040]/10"}`}>
              {grade}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-5">
        <h3 className="text-sm font-bold text-[#092040] mb-2">形式</h3>
        {FORMATS.map((fmt) => (
          <label key={fmt} className="flex items-center gap-2 mb-2 cursor-pointer">
            <input type="radio" name="format" checked={selectedFormats.includes(fmt)}
              onChange={() => setSelectedFormats(selectedFormats.includes(fmt) ? [] : [fmt])}
              onClick={() => { if (selectedFormats.includes(fmt)) setSelectedFormats([]); }}
              className="relative appearance-none shrink-0 w-4 h-4 border-2 border-[#092040] rounded-full bg-[#FFFFF0] checked:bg-[#092040] checked:after:content-[''] checked:after:absolute checked:after:inset-[3px] checked:after:rounded-full checked:after:bg-white focus:outline-none cursor-pointer" />
            <span className="text-sm text-[#092040] font-medium">{fmt}</span>
          </label>
        ))}
      </div>
      <div className="mb-5">
        <h3 className="text-sm font-bold text-[#092040] mb-2">活動期間</h3>
        {["長期", "中期", "短期"].map((period) => (
          <label key={period} className="flex items-center gap-2 mb-2 cursor-pointer">
            <input type="checkbox" checked={selectedPeriods.includes(period)} onChange={() => toggleItem(selectedPeriods, setSelectedPeriods, period)} className="relative appearance-none shrink-0 w-4 h-4 border-2 border-[#092040] rounded bg-[#FFFFF0] checked:bg-[#092040] checked:after:content-[''] checked:after:absolute checked:after:left-[4px] checked:after:top-[1px] checked:after:w-[4px] checked:after:h-[8px] checked:after:border-white checked:after:border-b-2 checked:after:border-r-2 checked:after:rotate-45 focus:outline-none cursor-pointer" />
            <span className="text-sm text-[#092040] font-medium">{period}</span>
          </label>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-[#092040]">無料のみ</span>
        <button onClick={() => { setFreeOnly(!freeOnly); setPage(1); }}
          className={`w-12 h-6 rounded-full transition-colors relative ${freeOnly ? "bg-[#092040]" : "bg-[#092040]/30"}`}>
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${freeOnly ? "left-7" : "left-1"}`} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-[#FFFFF0] flex flex-col min-h-screen">

      {/* ⑨ Pull-to-refresh インジケーター */}
      {pullDist > 0 && (
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex justify-center items-end pointer-events-none"
          style={{ height: `${pullDist}px` }}>
          <span className="text-2xl mb-1" style={{
            transform: `rotate(${Math.min(pullDist / 70, 1) * 360}deg) scale(${Math.min(pullDist / 70, 1)})`,
            transition: "transform 0.05s",
          }}>🐝</span>
        </div>
      )}
      {isRefreshing && (
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex justify-center items-center h-12 pointer-events-none">
          <span className="text-2xl animate-bounce">🐝</span>
        </div>
      )}

      {/* モバイル：絞り込みFAB(検索FABの上) */}
      <button
        type="button"
        aria-label={filterOpen ? "絞り込みを閉じる" : "絞り込み"}
        onClick={() => setFilterOpen((v) => !v)}
        className={`${FAB_BASE_CLASS} mobile-fab bottom-[88px]`}
      >
        {filterOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#092040" strokeWidth="2.5" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#092040" strokeWidth="2.5" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
          </svg>
        )}
        {!filterOpen && activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-[#FFFFEE]">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* モバイル：絞り込みボトムシート */}
      {filterOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setFilterOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-[#FFFFEE] border-t-2 border-[#092040] rounded-t-[24px] max-h-[80vh] overflow-y-auto animate-[bottomSheetIn_400ms_cubic-bezier(0.22,1,0.36,1)_forwards] motion-reduce:animate-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[rgba(9,32,64,0.2)]" />
            </div>
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-black text-[#092040] text-lg">絞り込み</span>
                <button onClick={() => setFilterOpen(false)} aria-label="フィルターを閉じる" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-[#092040] text-xl font-bold hover:bg-gray-200 transition-colors focus-visible:outline-2 focus-visible:outline-[#FCBC2A]">×</button>
              </div>
              <FilterPanel />
              <button onClick={() => setFilterOpen(false)} className="w-full mt-4 bg-[#092040] text-white font-bold py-4 rounded-2xl">{filtered.length}件を表示</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-w-0 gap-6 px-[5vw] md:px-0 py-[4vw] md:py-0">
        <aside className="w-64 shrink-0 hidden md:block">
          <div className="sticky top-[calc(var(--navbar-h,73px)+16px)] p-5">
            <FilterPanel />
          </div>
        </aside>
        <main className="flex-1 min-w-0 md:px-6 md:py-6">
          {/* PC：検索窓 */}
          <div className="hidden md:flex mb-4 items-center bg-[#FFFFF0] border-[3px] border-[#092040] rounded-2xl pl-5 pr-2 py-2 gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#092040" strokeWidth="2" strokeLinecap="round" className="opacity-40 shrink-0">
              <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="search" placeholder="活動名、スキル、主催者などで検索..." value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              className="flex-1 min-w-0 border-none text-sm outline-none focus-visible:outline-none text-[#092040] placeholder-[#092040]/50 bg-transparent" />
            <button onClick={() => handleSearch()}
              className="bg-[#FCBC2A] text-[#092040] font-bold px-5 py-2 rounded-[10px] border-2 border-[#092040] text-sm shrink-0">
              検索
            </button>
          </div>

          {/* モバイル：検索窓 */}
<div id="search-box" className="md:hidden mb-[3vw] flex items-center bg-[#FFFFF0] border-[3px] border-[#092040] rounded-2xl pl-5 pr-2 py-2 gap-3">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#092040" strokeWidth="2" strokeLinecap="round" className="opacity-40 shrink-0">
    <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
  <input type="search" placeholder="活動名、スキル、主催者などで検索..." value={keyword}
    onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
    onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
    className="flex-1 min-w-0 border-none text-sm outline-none focus-visible:outline-none text-[#092040] placeholder-[#092040]/50 bg-transparent" />
  <button onClick={() => handleSearch()}
    className="bg-[#FCBC2A] text-[#092040] font-bold text-sm px-5 py-2 rounded-[10px] border-2 border-[#092040] shrink-0">
    検索
  </button>
</div>

          {/* ⑤ アクティブフィルターチップ（PC） */}
          {activeFilterCount > 0 && (
            <div className="hidden md:flex flex-wrap gap-2 mb-3 items-center">
              {selectedCategories.map((cat) => (
                <button key={cat} onClick={() => toggleItem(selectedCategories, setSelectedCategories, cat)}
                  aria-label={`${cat}フィルターを解除`}
                  className="flex items-center gap-1 bg-[#092040] text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-[#EF4444] transition-colors animate-fadeInDown focus-visible:outline-2 focus-visible:outline-[#FCBC2A]">
                  {cat} <span aria-hidden="true">×</span>
                </button>
              ))}
              {selectedGrades.map((g) => (
                <button key={g} onClick={() => toggleItem(selectedGrades, setSelectedGrades, g)}
                  aria-label={`${g}フィルターを解除`}
                  className="flex items-center gap-1 bg-[#092040] text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-[#EF4444] transition-colors animate-fadeInDown focus-visible:outline-2 focus-visible:outline-[#FCBC2A]">
                  {g} <span aria-hidden="true">×</span>
                </button>
              ))}
              {selectedFormats.map((f) => (
                <button key={f} onClick={() => setSelectedFormats([])}
                  aria-label={`${f}フィルターを解除`}
                  className="flex items-center gap-1 bg-[#092040] text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-[#EF4444] transition-colors animate-fadeInDown focus-visible:outline-2 focus-visible:outline-[#FCBC2A]">
                  {f} <span aria-hidden="true">×</span>
                </button>
              ))}
              {selectedPeriods.map((p) => (
                <button key={p} onClick={() => toggleItem(selectedPeriods, setSelectedPeriods, p)}
                  aria-label={`${p}フィルターを解除`}
                  className="flex items-center gap-1 bg-[#092040] text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-[#EF4444] transition-colors animate-fadeInDown focus-visible:outline-2 focus-visible:outline-[#FCBC2A]">
                  {p} <span aria-hidden="true">×</span>
                </button>
              ))}
              {freeOnly && (
                <button onClick={() => setFreeOnly(false)}
                  aria-label="無料のみフィルターを解除"
                  className="flex items-center gap-1 bg-[#092040] text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-[#EF4444] transition-colors animate-fadeInDown focus-visible:outline-2 focus-visible:outline-[#FCBC2A]">
                  無料のみ <span aria-hidden="true">×</span>
                </button>
              )}
              <button onClick={() => { setSelectedCategories([]); setSelectedGrades([]); setSelectedFormats([]); setSelectedPeriods([]); setFreeOnly(false); setPage(1); }}
                className="text-xs text-[#092040]/50 font-bold hover:text-[#EF4444] transition-colors underline ml-1">すべてクリア</button>
            </div>
          )}

          {/* ① カウントアップ件数表示 */}
          <ResultsCount count={filtered.length} />

          {/* ⑦ ページ切替トランジション + ⑥ カードfadeIn */}
          {paginated.length === 0 ? (
            <div className="bg-[#FFFFEE] rounded-2xl p-10 text-center">
              <div className="flex flex-col items-center gap-4">
                <p className="font-bold text-[#092040]">その活動、まだ載ってないかも🐝</p>
                <p className="text-sm text-gray-400">条件を変えて探してみよう</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => { setSelectedCategories([]); setSelectedGrades([]); setSelectedFormats([]); setSelectedPeriods([]); setFreeOnly(false); setKeyword(""); setPage(1); }}
                    className="bg-[#092040] text-white rounded-xl px-6 py-2 font-bold text-sm hover:opacity-80 transition-opacity"
                  >
                    絞り込みをリセット
                  </button>
                  <a
                    href="https://lin.ee/FD2mNHZ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-2 border-[#092040] text-[#092040] rounded-xl px-6 py-2 font-bold text-sm hover:bg-[#092040] hover:text-white transition-colors"
                  >
                    LINEで締切・新着通知を受け取る
                  </a>
                </div>
                <div className="mt-2 w-full">
                  <p className="text-xs text-gray-400 mb-3">他のカテゴリも見てみよう</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {CATEGORY_NAMES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { setSelectedCategories([cat]); setSelectedGrades([]); setSelectedFormats([]); setSelectedPeriods([]); setFreeOnly(false); setKeyword(""); setPage(1); }}
                        className={`${CATEGORY_TAG_CLASS} transition-colors hover:bg-[#FCBC2A]`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6"
              style={{ opacity: cardsVisible ? 1 : 0, transition: "opacity 0.18s ease" }}>
              {paginated.map((post, i) => (
                <FadeInCard key={post.id} delay={i * 40}>
                  <ActivityCard post={post} deadlineStyle="count" />
                </FadeInCard>
              ))}
            </div>
          )}

          {totalPages > 1 && (() => {
            const btnBase = "w-10 h-10 rounded-full font-bold transition-colors bg-[#FFFFF0] border-2 border-[#092040] text-[#092040] hover:bg-[#FCBC2A] hover:border-[#FCBC2A]";
            const btnActive = "w-10 h-10 rounded-full font-bold border-2 border-[#092040] bg-[#092040] text-white";
            const btnArrow = "w-10 h-10 rounded-full font-bold transition-colors bg-[#FFFFF0] border-2 border-[#092040] text-[#092040] hover:bg-[#FCBC2A] hover:border-[#FCBC2A] disabled:opacity-20 disabled:pointer-events-none flex items-center justify-center";
            const left = Math.max(1, page - 2);
            const right = Math.min(totalPages, page + 2);
            const windowPages = Array.from({ length: right - left + 1 }, (_, i) => left + i);
            return (
              <div className="flex justify-center items-center gap-2 pb-6">
                <button onClick={() => goToPage(Math.max(1, page - 1))} disabled={page === 1}
                  aria-label="前のページ" className={btnArrow}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#092040" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 6 9 12 15 18" />
                  </svg>
                </button>
                {left > 1 && (
                  <>
                    <button onClick={() => goToPage(1)} className={btnBase}>1</button>
                    {left > 2 && <span className="text-[#092040] font-bold px-1">…</span>}
                  </>
                )}
                {windowPages.map((p) => (
                  <button key={p} onClick={() => goToPage(p)} className={page === p ? btnActive : btnBase}>{p}</button>
                ))}
                {right < totalPages && (
                  <>
                    {right < totalPages - 1 && <span className="text-[#092040] font-bold px-1">…</span>}
                    <button onClick={() => goToPage(totalPages)} className={btnBase}>{totalPages}</button>
                  </>
                )}
                <button onClick={() => goToPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                  aria-label="次のページ" className={btnArrow}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#092040" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </button>
              </div>
            );
          })()}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default function SearchClient({ posts }: { posts: Post[] }) {
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");

  return (
    <>
      <Navbar />
      {/* ④ スケルトンローディング */}
      <Suspense fallback={
        <div className="bg-[#FFFFF0] min-h-screen px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      }>
        <SearchInner posts={posts} keyword={keyword} setKeyword={setKeyword} />
      </Suspense>
    </>
  );
}
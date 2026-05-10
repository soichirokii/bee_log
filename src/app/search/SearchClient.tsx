"use client";

import { useState, useMemo, Suspense, useEffect, useRef } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { Post } from "@/types/notion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Footer from "../components/Footer";

const CATEGORIES = [
  "コンテスト・大会", "インターンシップ", "ボランティア", "留学・国際",
  "研究・論文", "起業・ビジネス", "奨学金", "科学・テクノロジー",
];

const GRADES = ["中学生", "高校生", "大学生"];
const FORMATS = ["オンライン", "対面", "ハイブリッド"];
const SEASON_TAGS = ["夏休み", "冬休み", "春休み"];

const CATEGORY_BG: Record<string, string> = {
  "コンテスト・大会": "bg-orange-100 text-orange-700",
  "インターンシップ": "bg-lime-100 text-lime-700",
  "ボランティア": "bg-blue-100 text-blue-700",
  "留学・国際": "bg-red-100 text-red-700",
  "研究・論文": "bg-purple-100 text-purple-700",
  "起業・ビジネス": "bg-blue-100 text-blue-700",
  "奨学金": "bg-green-100 text-green-700",
  "科学・テクノロジー": "bg-pink-100 text-pink-700",
};

function getPeriodLabel(period: string): "長期" | "中期" | "短期" | null {
  if (!period) return null;
  const text = period.replace(/\s/g, "");
  const monthMatch = text.match(/(\d+)ヶ?月/);
  if (monthMatch) { const d = parseInt(monthMatch[1]) * 30; return d >= 15 ? "長期" : d >= 7 ? "中期" : "短期"; }
  const weekMatch = text.match(/(\d+)週間?/);
  if (weekMatch) { const d = parseInt(weekMatch[1]) * 7; return d >= 15 ? "長期" : d >= 7 ? "中期" : "短期"; }
  const dayMatch = text.match(/(\d+)日/);
  if (dayMatch) { const d = parseInt(dayMatch[1]); return d >= 15 ? "長期" : d >= 7 ? "中期" : "短期"; }
  return null;
}

function Navbar({ keyword, setKeyword, searchVisible }: {
  keyword: string;
  setKeyword: (v: string) => void;
  searchVisible: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      <nav className="hidden md:flex items-center px-16 py-4 bg-[#FFFFF0] border-b-2 border-[#092040] sticky top-0 z-50 relative mb-0">
        <Link href="/" className="mr-10">
          <Image src="/Logo.svg" alt="BEE log" width={120} height={48} className="h-12 w-auto" />
        </Link>
        <Link href="/" className={`text-base font-bold px-6 py-2.5 rounded-full mr-3 transition-colors ${pathname === "/" ? "bg-[#FCBC2A]" : "hover:bg-[#FCBC2A]"}`}>HOME</Link>
        <Link href="/search" className={`text-base font-bold px-6 py-2.5 rounded-full transition-colors ${pathname === "/search" ? "bg-[#FCBC2A]" : "hover:bg-[#FCBC2A]"}`}>活動を探す</Link>

        {/* スティッキー検索窓（PC） */}
        <div className={`absolute right-8 top-1/2 -translate-y-1/2 transition-all duration-300 flex items-center gap-2 ${searchVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"}`}>
          <div className="bg-[#FFFFF0] border-2 border-[#092040] rounded-2xl px-3 py-2.5 flex items-center gap-2">
            <Image src="/icons/Magnifying Glass.svg" alt="" width={16} height={16} className="opacity-40 shrink-0" />
            <input
              type="search"
              placeholder="検索"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") router.push(`/search?q=${encodeURIComponent(keyword)}`); }}
              className="flex-1 text-sm outline-none text-[#092040] placeholder-[#092040]/50 bg-transparent"
            />
          </div>
          <button onClick={() => router.push(`/search?q=${encodeURIComponent(keyword)}`)}
            className="bg-[#092040] text-white font-bold px-5 py-2.5 rounded-2xl text-sm hover:opacity-90 transition-opacity shrink-0">検索</button>
        </div>
      </nav>

      <nav className="md:hidden flex items-center bg-[#FFFFF0] border-b-2 border-[#092040] px-[5vw] py-[3vw] sticky top-0 z-50 w-full">
  <div className="flex-1" />
  <Link href="/" className="flex justify-center">
    <Image src="/Logo.svg" alt="BEE log" width={120} height={48} className="h-[10vw] w-auto" />
  </Link>
  <div className="flex-1 flex justify-end">
    <Link href="/" className="bg-[#FCBC2A] text-[#092040] font-bold text-[3.5vw] px-[4vw] py-[2vw] rounded-full transition-all duration-200 hover:bg-[#092040] hover:text-white">HOME</Link>
  </div>
</nav>
    </>
  );
}

function ActivityCard({ post, onTagClick }: { post: Post; onTagClick?: (tag: string) => void }) {
  const router = useRouter();
  const now = new Date();
  const daysLeft = post.deadline ? Math.ceil((new Date(post.deadline).getTime() - now.getTime()) / 86400000) : null;
  const categoryStyle = post.category ? CATEGORY_BG[post.category] ?? "bg-gray-100 text-gray-700" : "";
  const seasonTag = post.tags.find((t) => SEASON_TAGS.includes(t));
  const periodLabel = getPeriodLabel(post.period);

  return (
    <div
      onClick={() => router.push(`/posts/${post.slug}`)}
      className="group relative bg-[#FFFFF0] transition-all duration-300 cursor-pointer overflow-hidden"
      style={{ fontFamily: "'toppan-bunkyu-midashi-gothic', sans-serif" }}
    >
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-70 transition-opacity duration-300 z-10 pointer-events-none" />
      <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <span className="text-white text-lg font-bold tracking-widest">VIEW MORE</span>
      </div>
      <div className="w-full aspect-video bg-gray-200 relative overflow-hidden">
        {post.imageUrl
          ? <Image src={post.imageUrl} alt={post.title} fill className="object-cover" />
          : <Image src="/noimage.svg" alt="No Image" fill className="object-cover" />}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap max-w-[70%]">
          {post.isFeatured && <span className="bg-white text-[#092040] text-xs font-bold px-2 py-1 rounded-full border border-gray-200">おすすめ</span>}
          {seasonTag && <span className="bg-[#F59E0B] text-white text-xs font-bold px-2 py-1 rounded-full">{seasonTag}</span>}
          {periodLabel && <span className="bg-[#092040] text-white text-xs font-bold px-2 py-1 rounded-full">{periodLabel}</span>}
        </div>
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {(post.fee === "無料" || post.fee === "0円" || post.fee === "0") && <span className="bg-[#4ADE80] text-white text-xs font-bold px-2 py-1 rounded-full">無料</span>}
          {daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 && <span className="bg-[#EF4444] text-white text-xs font-bold px-2 py-1 rounded-full">締切間近</span>}
        </div>
      </div>
      <div className="p-4 bg-[#FFFFF0]">
        <div className="flex items-center gap-2 text-xs mb-2 flex-wrap">
          {post.category && <span className={`px-3 py-1 rounded-full font-medium text-xs whitespace-nowrap ${categoryStyle}`}>{post.category}</span>}
          {post.organizer && <span className="text-gray-400">{post.organizer}</span>}
        </div>
        <h3 className="font-bold text-[#092040] text-xl line-clamp-2">{post.title}</h3>
      </div>
    </div>
  );
}

const PAGE_SIZE = 12;

function SearchInner({ posts, keyword, setKeyword, mobileSearchRef, setPcSearchRef }: {
  posts: Post[];
  keyword: string;
  setKeyword: (v: string) => void;
  mobileSearchRef: React.RefObject<HTMLDivElement | null>;
  setPcSearchRef: (el: HTMLDivElement | null) => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category") ? [searchParams.get("category")!] : []
  );
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
  const [freeOnly, setFreeOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "deadline">("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    setKeyword(q);
    setPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchParams]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setMobileSearchVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    const el = mobileSearchRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
    setPage(1);
  };

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
    if (selectedGrades.length > 0) result = result.filter((p) => p.targetGrade.some((g) => selectedGrades.includes(g)));
    if (selectedFormats.length > 0) result = result.filter((p) => selectedFormats.includes(p.format));
    if (selectedPeriods.length > 0) result = result.filter((p) => { const l = getPeriodLabel(p.period); return l !== null && selectedPeriods.includes(l); });
    if (freeOnly) result = result.filter((p) => p.fee === "無料" || p.fee === "0円" || p.fee === "0");
    if (sortOrder === "deadline") {
      result = [...result].sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    }
    return result;
  }, [posts, keyword, selectedCategories, selectedGrades, selectedFormats, selectedPeriods, freeOnly, sortOrder]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const FilterPanel = () => (
    <div className="bg-[#FFFFF0] p-5">
      <h2 className="font-bold text-[#092040] text-lg mb-4">絞り込み検索</h2>
      <div className="mb-5">
        <h3 className="text-sm font-bold text-[#092040] mb-2">カテゴリ</h3>
        {CATEGORIES.map((cat) => (
          <label key={cat} className="flex items-center gap-2 mb-2 cursor-pointer">
            <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleItem(selectedCategories, setSelectedCategories, cat)} className="accent-[#092040] w-4 h-4" />
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
              className="accent-[#092040] w-4 h-4" />
            <span className="text-sm text-[#092040] font-medium">{fmt}</span>
          </label>
        ))}
      </div>
      <div className="mb-5">
        <h3 className="text-sm font-bold text-[#092040] mb-2">活動期間</h3>
        {["長期", "中期", "短期"].map((period) => (
          <label key={period} className="flex items-center gap-2 mb-2 cursor-pointer">
            <input type="checkbox" checked={selectedPeriods.includes(period)} onChange={() => toggleItem(selectedPeriods, setSelectedPeriods, period)} className="accent-[#092040] w-4 h-4" />
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

      {/* モバイル固定検索バー */}
      {mobileSearchVisible && (
        <div className="md:hidden fixed top-[17vw] left-0 right-0 z-40 bg-[#FFFFF0]/95 backdrop-blur-sm border-b border-gray-200 px-[5vw] py-[2vw] animate-fadeInDown">
  <div className="flex items-center gap-[2vw]">
    <div className="flex-1 min-w-0 bg-[#FFFFF0] border-2 border-[#092040] rounded-2xl px-3 py-2.5 flex items-center gap-2">
      <Image src="/icons/Magnifying Glass.svg" alt="" width={16} height={16} className="opacity-40 shrink-0" />
      <input
        type="search"
        placeholder="活動を検索..."
        value={keyword}
        onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
        onKeyDown={(e) => { if (e.key === "Enter") router.push(`/search?q=${encodeURIComponent(keyword)}`); }}
        className="flex-1 min-w-0 text-sm outline-none text-[#092040] placeholder-[#092040]/50 bg-transparent"
      />
    </div>
    <button onClick={() => router.push(`/search?q=${encodeURIComponent(keyword)}`)}
      className="bg-[#092040] text-white font-bold text-sm px-[3vw] py-2.5 rounded-2xl shrink-0">
      検索
    </button>
  </div>
</div>
      )}

      {filterOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setFilterOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute bottom-0 left-0 right-0 bg-[#FFFFF0] rounded-t-3xl p-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <span className="font-black text-[#092040] text-lg">絞り込み</span>
              <button onClick={() => setFilterOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-[#092040] text-xl font-bold hover:bg-gray-200 transition-colors">×</button>
            </div>
            <FilterPanel />
            <button onClick={() => setFilterOpen(false)} className="w-full mt-4 bg-[#092040] text-white font-bold py-4 rounded-2xl">{filtered.length}件を表示</button>
          </div>
        </div>
      )}

      <div className="flex flex-1 gap-6 px-[5vw] md:px-0 py-[4vw] md:py-0">
        <aside className="w-64 shrink-0 hidden md:block">
          <div className="sticky top-[73px] p-5">
            <FilterPanel />
          </div>
        </aside>
        <main className="flex-1 md:px-6 md:py-6">
          {/* PC：検索窓＋ソート */}
          <div className="hidden md:flex gap-2 mb-4 items-center">
            <div ref={setPcSearchRef} className="flex-1 bg-[#FFFFF0] border-2 border-[#092040] rounded-2xl px-3 py-2.5 flex items-center gap-2">
              <Image src="/icons/Magnifying Glass.svg" alt="" width={16} height={16} className="opacity-40 shrink-0" />
              <input type="search" placeholder="活動名、スキル、主催者などで検索..." value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
                onKeyDown={(e) => { if (e.key === "Enter") router.push(`/search?q=${encodeURIComponent(keyword)}`); }}
                className="flex-1 min-w-0 text-sm outline-none text-[#092040] placeholder-[#092040]/50 bg-transparent" />
            </div>
            <button onClick={() => router.push(`/search?q=${encodeURIComponent(keyword)}`)}
              className="bg-[#092040] text-white font-bold px-5 py-2.5 rounded-2xl text-sm hover:opacity-90 transition-opacity shrink-0">
              検索
            </button>
            <div className="relative">
              <button onClick={() => setSortOpen(!sortOpen)}
                className="bg-[#FFFFF0] border-2 border-[#092040] rounded-2xl px-4 py-3 text-sm text-[#092040] font-bold whitespace-nowrap relative pr-8">
                {sortOrder === "newest" ? "新着順" : "締切順"}
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">{sortOpen ? "▲" : "▼"}</span>
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-14 bg-[#FFFFF0] rounded-2xl shadow-xl z-20 overflow-hidden w-36 border-2 border-[#092040]">
                  {[{ value: "newest", label: "新着順" }, { value: "deadline", label: "締切順" }].map((opt) => (
                    <button key={opt.value} onClick={() => { setSortOrder(opt.value as typeof sortOrder); setSortOpen(false); }}
                      className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors ${sortOrder === opt.value ? "bg-[#092040] text-white" : "text-[#092040] hover:bg-gray-50"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* モバイル：検索窓 */}
<div className="md:hidden mb-[3vw] flex items-center gap-[2vw]">
  <div ref={mobileSearchRef} className="flex-1 min-w-0 bg-[#FFFFF0] border-2 border-[#092040] rounded-2xl px-3 py-2.5 flex items-center gap-2">
    <Image src="/icons/Magnifying Glass.svg" alt="" width={16} height={16} className="opacity-40 shrink-0" />
    <input type="search" placeholder="活動を検索..." value={keyword}
      onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
      onKeyDown={(e) => { if (e.key === "Enter") router.push(`/search?q=${encodeURIComponent(keyword)}`); }}
      className="flex-1 min-w-0 text-sm outline-none text-[#092040] placeholder-[#092040]/50 bg-transparent" />
  </div>
  <button onClick={() => router.push(`/search?q=${encodeURIComponent(keyword)}`)}
    className="bg-[#092040] text-white font-bold text-sm px-[3vw] py-2.5 rounded-2xl shrink-0">
    検索
  </button>
</div>

          {/* モバイル：絞り込み＋ソート */}
          <div className="md:hidden flex gap-2 mb-[3vw]">
            <button onClick={() => setFilterOpen(true)}
              className="flex-1 bg-[#FFFFF0] border-2 border-[#092040] rounded-2xl py-3 flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#092040" strokeWidth="2.5" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              <span className="text-[#092040] font-bold text-sm">絞り込み</span>
              {activeFilterCount > 0 && <span className="bg-[#EF4444] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{activeFilterCount}</span>}
            </button>
            <div className="relative flex-1">
              <button onClick={() => setSortOpen(!sortOpen)}
                className="w-full bg-[#FFFFF0] border-2 border-[#092040] rounded-2xl py-3 flex items-center justify-center gap-2">
                <span className="text-[#092040] font-bold text-sm">{sortOrder === "newest" ? "新着順" : "締切順"}</span>
                <span className="text-[#092040] text-xs">{sortOpen ? "▲" : "▼"}</span>
              </button>
              {sortOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#FFFFF0] rounded-2xl shadow-xl z-20 overflow-hidden border-2 border-[#092040]">
                  {[{ value: "newest", label: "新着順" }, { value: "deadline", label: "締切順" }].map((opt) => (
                    <button key={opt.value} onClick={(e) => { e.stopPropagation(); setSortOrder(opt.value as typeof sortOrder); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm font-bold ${sortOrder === opt.value ? "bg-[#092040] text-white" : "text-[#092040]"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <p className="text-[#092040] font-bold mb-4 text-base">{filtered.length} 件の活動が見つかりました</p>

          {paginated.length === 0 ? (
            <div className="bg-[#F8F7F4] rounded-2xl p-10 text-center text-gray-400">条件に一致する活動がありません</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              {paginated.map((post) => (
                <ActivityCard key={post.id} post={post} onTagClick={(tag) => { setKeyword(tag); setPage(1); }} />
              ))}
            </div>
          )}

          {totalPages > 1 && (() => {
            const btnBase = "w-10 h-10 rounded-full font-bold transition-colors bg-[#FFFFF0] border-2 border-[#092040] text-[#092040] hover:bg-[#FCBC2A] hover:border-[#FCBC2A]";
            const btnActive = "w-10 h-10 rounded-full font-bold border-2 border-[#092040] bg-[#092040] text-white";
            const btnArrow = "w-10 h-10 rounded-full font-bold transition-colors bg-[#FFFFF0] border-2 border-[#092040] text-[#092040] hover:bg-[#FCBC2A] hover:border-[#FCBC2A] disabled:opacity-20 disabled:pointer-events-none";
            const left = Math.max(1, page - 2);
            const right = Math.min(totalPages, page + 2);
            const windowPages = Array.from({ length: right - left + 1 }, (_, i) => left + i);
            return (
              <div className="flex justify-center items-center gap-2 pb-6">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className={btnArrow}>‹</button>
                {left > 1 && (
                  <>
                    <button onClick={() => setPage(1)} className={btnBase}>1</button>
                    {left > 2 && <span className="text-[#092040] font-bold px-1">…</span>}
                  </>
                )}
                {windowPages.map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={page === p ? btnActive : btnBase}>{p}</button>
                ))}
                {right < totalPages && (
                  <>
                    {right < totalPages - 1 && <span className="text-[#092040] font-bold px-1">…</span>}
                    <button onClick={() => setPage(totalPages)} className={btnBase}>{totalPages}</button>
                  </>
                )}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className={btnArrow}>›</button>
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
  const pcSearchRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchRef = useRef<HTMLDivElement | null>(null);
  const [pcSearchVisible, setPcSearchVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setPcSearchRefCallback = (el: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (el) {
      pcSearchRef.current = el;
      const observer = new IntersectionObserver(
        ([entry]) => setPcSearchVisible(!entry.isIntersecting),
        { threshold: 0 }
      );
      observer.observe(el);
      observerRef.current = observer;
    }
  };

  return (
    <>
      <Navbar keyword={keyword} setKeyword={setKeyword} searchVisible={pcSearchVisible} />
      <Suspense fallback={<div className="min-h-screen bg-[#FFFFF0]" />}>
        <SearchInner posts={posts} keyword={keyword} setKeyword={setKeyword} mobileSearchRef={mobileSearchRef} setPcSearchRef={setPcSearchRefCallback} />
      </Suspense>
    </>
  );
}
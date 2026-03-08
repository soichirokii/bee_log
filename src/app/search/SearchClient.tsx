"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Post } from "@/types/notion";
import Link from "next/link";
import Image from "next/image";
import Footer from "../components/Footer";

const CATEGORIES = [
  "コンテスト・大会", "インターンシップ", "ボランティア", "留学・国際",
  "研究・論文", "起業・ビジネス", "奨学金", "科学・テクノロジー",
];

const GRADES = ["中学生", "高校生", "大学生", "ギャップイヤー生"];const FORMATS = ["オンライン", "対面", "ハイブリッド"];
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

function Navbar() {
  const pathname = usePathname();
  return (
    <>
      <nav className="hidden md:flex items-center px-16 py-4 bg-[#FFFFF0] border-b-2 border-[#092040] sticky top-0 z-50">
        <Link href="/" className="mr-10 transition-opacity duration-200 hover:opacity-70">
          <Image src="/Logo.svg" alt="BEE log" width={120} height={48} className="h-12 w-auto" />
        </Link>
        <Link href="/"
          className={`text-base font-bold px-6 py-2.5 rounded-full mr-3 transition-all duration-200 ${pathname === "/" ? "bg-[#FCBC2A] text-[#092040] hover:bg-[#092040] hover:text-white" : "text-[#092040] hover:bg-[#FCBC2A] hover:text-[#092040]"}`}>
          HOME
        </Link>
        <Link href="/search"
          className={`text-base font-bold px-6 py-2.5 rounded-full transition-all duration-200 ${pathname === "/search" ? "bg-[#FCBC2A] text-[#092040] hover:bg-[#092040] hover:text-white" : "text-[#092040] hover:bg-[#FCBC2A] hover:text-[#092040]"}`}>
          活動を探す
        </Link>
      </nav>
      <nav className="md:hidden flex items-center bg-[#FFFFF0] border-b-2 border-[#092040] px-[5vw] py-[3vw] sticky top-0 z-50">
        <div className="flex-1" />
        <Link href="/" className="flex justify-center">
          <Image src="/Logo.svg" alt="BEE log" width={120} height={48} className="h-[10vw] w-auto" />
        </Link>
        <div className="flex-1 flex justify-end">
          <Link href="/" className="bg-[#FCBC2A] text-[#092040] font-bold text-[3.5vw] px-[4vw] py-[2vw] rounded-full">HOME</Link>
        </div>
      </nav>
    </>
  );
}

function ActivityCard({ post }: { post: Post }) {
  const router = useRouter();
  const now = new Date();
  const daysLeft = post.deadline ? Math.ceil((new Date(post.deadline).getTime() - now.getTime()) / 86400000) : null;
  const categoryStyle = post.category ? CATEGORY_BG[post.category] ?? "bg-gray-100 text-gray-700" : "";
  const seasonTag = post.tags.find((t) => SEASON_TAGS.includes(t));
  const periodLabel = getPeriodLabel(post.period);

  return (
    <div onClick={() => router.push(`/posts/${post.id}`)} className="bg-[#F8F7F4] rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
      <div className="w-full aspect-video bg-gray-200 relative rounded-t-2xl overflow-hidden">
{post.imageUrl ? <Image src={post.imageUrl} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="w-full h-full bg-gray-200" />}        <div className="absolute top-2 left-2 flex gap-1 flex-wrap max-w-[70%]">
          {post.isFeatured && <span className="bg-white text-[#092040] text-xs font-bold px-2 py-1 rounded-full border border-gray-200">おすすめ</span>}
          {seasonTag && <span className="bg-[#F59E0B] text-white text-xs font-bold px-2 py-1 rounded-full">{seasonTag}</span>}
          {periodLabel && <span className="bg-[#092040] text-white text-xs font-bold px-2 py-1 rounded-full">{periodLabel}</span>}
        </div>
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {(post.fee === "無料" || post.fee === "0円" || post.fee === "0") && <span className="bg-[#4ADE80] text-white text-xs font-bold px-2 py-1 rounded-full">無料</span>}
          {daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 && <span className="bg-[#EF4444] text-white text-xs font-bold px-2 py-1 rounded-full animate-blink">締切間近</span>}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs mb-1 flex-wrap">
          {post.category && <span className={`px-2 py-0.5 rounded-full font-medium text-xs whitespace-nowrap ${categoryStyle}`}>{post.category}</span>}
          {post.organizer && <span className="text-gray-400">{post.organizer}</span>}
        </div>
        <h3 className="font-bold text-[#092040] text-base mb-2 line-clamp-2">{post.title}</h3>
        {post.summary && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.summary}</p>}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
{post.tags.slice(0, 3).map((tag) => (
  <Link key={tag}
    href={`/search?tag=${encodeURIComponent(tag)}`}
    onClick={(e) => e.stopPropagation()}
    className="text-xs text-gray-400 hover:text-[#092040] hover:underline">
    #{tag}
  </Link>
))}
          </div>
        )}
        <div className="flex items-end gap-2 text-xs border-t pt-2">
          {post.deadline && <div className="shrink-0"><div className="text-gray-400">締切日</div><div className="text-[#092040] font-bold">{new Date(post.deadline).toLocaleDateString("ja-JP")}</div></div>}
          {post.targetGrade.length > 0 && <div className="min-w-0 flex-1"><div className="text-gray-400">対象</div><div className="font-medium text-[#092040] truncate">{post.targetGrade.join("・")}</div></div>}
          {post.format && <div className="shrink-0"><div className="text-gray-400">形式</div><div className="font-medium text-[#092040]">{post.format}</div></div>}
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 12;

function SearchInner({ posts }: { posts: Post[] }) {
  const searchParams = useSearchParams();
const initialQ = searchParams.get("q") ?? searchParams.get("tag") ?? "";
const [keyword, setKeyword] = useState(initialQ);

useEffect(() => {
  const q = searchParams.get("q") ?? "";
  setKeyword(q);
  setPage(1);
  window.scrollTo({ top: 0, behavior: "smooth" });
}, [searchParams]);  
const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category") ? [searchParams.get("category")!] : []
  );
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
const [freeOnly, setFreeOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get("featured") === "true");const [sortOrder, setSortOrder] = useState<"newest" | "deadline">("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

const router2 = useRouter();
  useEffect(() => {
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (selectedCategories.length > 0) params.set("category", selectedCategories[0]);
    if (featuredOnly) params.set("featured", "true");
    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState(null, "", newUrl);
  }, [keyword, selectedCategories, featuredOnly]);

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
    setPage(1);
  };

  const activeFilterCount = selectedCategories.length + selectedGrades.length + selectedFormats.length + selectedPeriods.length + (freeOnly ? 1 : 0) + (featuredOnly ? 1 : 0);
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
    if (featuredOnly) result = result.filter((p) => p.isFeatured);    if (featuredOnly) result = result.filter((p) => p.isFeatured);    if (sortOrder === "deadline") {
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
      <div className="bg-[#FFFFF0] rounded-2xl p-5">
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
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-[#092040]">無料のみ</span>
        <button onClick={() => { setFreeOnly(!freeOnly); setPage(1); }}
          className={`w-12 h-6 rounded-full transition-colors relative ${freeOnly ? "bg-[#092040]" : "bg-[#092040]/30"}`}>
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${freeOnly ? "left-7" : "left-1"}`} />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-[#092040]">おすすめのみ</span>
        <button onClick={() => { setFeaturedOnly(!featuredOnly); setPage(1); }}
          className={`w-12 h-6 rounded-full transition-colors relative ${featuredOnly ? "bg-[#FCBC2A]" : "bg-[#092040]/30"}`}>
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${featuredOnly ? "left-7" : "left-1"}`} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFFF0]">
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

      <div className="flex gap-6 px-[5vw] md:px-6 py-[4vw] md:py-6 md:h-[calc(100vh-72px)] md:overflow-hidden">
        <aside className="w-56 shrink-0 overflow-y-auto hidden md:block">
          <FilterPanel />
        </aside>
        <main className="flex-1 md:overflow-y-auto">
          <div className="flex gap-2 mb-[3vw] md:mb-4 items-center">
  <div className="flex-1 bg-[#FFFFF0] border-2 border-[#092040] rounded-2xl px-4 py-3 flex items-center gap-3">


    <Image src="/icons/Magnifying Glass.svg" alt="" width={18} height={18} className="opacity-40 shrink-0" />
    <input type="search" placeholder="活動名、スキル、主催者などで検索..." value={keyword}
      onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
      className="flex-1 text-sm outline-none text-[#092040] placeholder-[#092040]/50 bg-transparent" />
  </div>
  <div className="relative hidden md:block">
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

<div className="md:hidden flex gap-2 mb-4">
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
      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl z-20 overflow-hidden border-2 border-[#092040]">
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

          <p className="text-[#092040] font-bold mb-[3vw] md:mb-4 text-[3.5vw] md:text-base">{filtered.length} 件の活動が見つかりました</p>

          {paginated.length === 0 ? (
            <div className="bg-[#FFFFF0] rounded-2xl p-10 text-center border-2 border-[#092040]/10">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-[#092040] font-black text-lg mb-2">活動が見つかりませんでした</p>
              <p className="text-gray-400 text-sm mb-6">検索条件を変えて、もう一度試してみてください。</p>
              <button onClick={() => { setKeyword(""); setSelectedCategories([]); setSelectedGrades([]); setSelectedFormats([]); setSelectedPeriods([]); setFreeOnly(false); setFeaturedOnly(false); setPage(1); }}
                className="bg-[#092040] text-white font-bold px-6 py-3 rounded-2xl text-sm hover:opacity-90 transition-opacity">
                絞り込みをリセット
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-[3vw] md:gap-4 mb-6">
              {paginated.map((post) => (
                <ActivityCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pb-6">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="w-10 h-10 rounded-full bg-white border-2 border-[#092040] text-[#092040] font-bold disabled:opacity-30 hover:bg-[#092040] hover:text-white transition-colors">‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-full font-bold transition-colors ${page === p ? "bg-[#092040] text-white" : "bg-white border-2 border-[#092040] text-[#092040] hover:bg-[#092040] hover:text-white"}`}>
                  {p}
                </button>
              ))}
              {totalPages > 5 && <span className="text-[#092040] font-bold">...</span>}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-10 h-10 rounded-full bg-white border-2 border-[#092040] text-[#092040] font-bold disabled:opacity-30 hover:bg-[#092040] hover:text-white transition-colors">›</button>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default function SearchClient({ posts }: { posts: Post[] }) {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        <SearchInner posts={posts} />
      </Suspense>
    </>
  );
}
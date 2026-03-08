"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { Post } from "@/types/notion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Footer from "./components/Footer";

const CATEGORIES = [
  "コンテスト・大会", "インターンシップ", "ボランティア", "留学・国際",
  "研究・論文", "起業・ビジネス", "奨学金", "科学・テクノロジー",
];

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

const SEASON_TAGS = ["夏休み", "冬休み", "春休み"];

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

function PCNavbar() {
  return (
    <nav className="hidden md:flex items-center px-16 py-4 bg-[#FFFFF0] border-b-2 border-[#092040] sticky top-0 z-50">
      <Link href="/" className="mr-10 transition-opacity duration-200 hover:opacity-70">
        <Image src="/Logo.svg" alt="BEE log" width={120} height={48} className="h-12 w-auto" />
      </Link>
      <Link href="/"
        className="text-base font-bold px-6 py-2.5 rounded-full mr-3 bg-[#FCBC2A] text-[#092040] transition-all duration-200 hover:bg-[#092040] hover:text-white">
        HOME
      </Link>
      <Link href="/search"
        className="text-base font-bold px-6 py-2.5 rounded-full text-[#092040] transition-all duration-200 hover:bg-[#FCBC2A] hover:text-[#092040]">
        活動を探す
      </Link>
      <div className="flex-1" />
    </nav>
  );
}

function MobileNavbar() {
  return (
    <nav className="md:hidden flex items-center bg-[#FFFFF0] border-b-2 border-[#092040] px-[5vw] py-[3vw] sticky top-0 z-50">
      <div className="flex-1" />
      <Link href="/" className="flex justify-center">
        <Image src="/Logo.svg" alt="BEE log" width={120} height={48} className="h-[10vw] w-auto" />
      </Link>
      <div className="flex-1 flex justify-end">
        <Link href="/search" className="bg-[#FCBC2A] text-[#092040] font-bold text-[3.5vw] px-[4vw] py-[2vw] rounded-full">探す</Link>
      </div>
    </nav>
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
<div onClick={() => router.push(`/posts/${post.id}`)} className="bg-[#F8F7F4] rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">      <div className="w-full aspect-video bg-gray-200 relative rounded-t-2xl overflow-hidden">
        {post.imageUrl ? <Image src={post.imageUrl} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="w-full h-full bg-gray-200" />}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap max-w-[70%]">
          {post.isFeatured && <span className="bg-white text-[#092040] text-xs font-bold px-2 py-1 rounded-full border border-gray-200">おすすめ</span>}
          {seasonTag && <span className="bg-[#F59E0B] text-white text-xs font-bold px-2 py-1 rounded-full">{seasonTag}</span>}
          {periodLabel && <span className="bg-[#092040] text-white text-xs font-bold px-2 py-1 rounded-full">{periodLabel}</span>}
        </div>
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {(post.fee === "無料" || post.fee === "0円" || post.fee === "0") && <span className="bg-[#4ADE80] text-white text-xs font-bold px-2 py-1 rounded-full">無料</span>}
{daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 && <span className="bg-[#EF4444] text-white text-xs font-bold px-2 py-1 rounded-full animate-blink">締切間近</span>}        </div>
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
              <Link key={tag} href={`/search?tag=${encodeURIComponent(tag)}`} onClick={(e) => e.stopPropagation()} className="text-xs text-gray-400 hover:text-[#092040] hover:underline">
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

function MobileSlider({ posts }: { posts: Post[] }) {
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const router = useRouter();
  const featured = posts.slice(0, 5);
  if (featured.length === 0) return null;

  const goTo = (next: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => { setIndex(next); setAnimating(false); }, 300);
  };
  const prev = () => goTo((index - 1 + featured.length) % featured.length);
  const next = () => goTo((index + 1) % featured.length);
  const current = featured[index];

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((index + 1) % featured.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [index, featured.length]);

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-[4vw]" onClick={() => router.push(`/posts/${current.id}`)}>
        <div className={`relative w-full aspect-video transition-opacity duration-300 ${animating ? "opacity-0" : "opacity-100"}`}>
          {current.imageUrl ? <Image src={current.imageUrl} alt={current.title} fill className="object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-[#FCBC2A] to-[#092040]" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute top-[2vw] left-[2vw] flex gap-[1.5vw]">
            {current.isFeatured && <span className="bg-white text-[#092040] text-[2.5vw] font-bold px-[2.5vw] py-[1vw] rounded-full">おすすめ</span>}
            {(current.fee === "無料" || current.fee === "0円" || current.fee === "0") && <span className="bg-[#4ADE80] text-white text-[2.5vw] font-bold px-[2.5vw] py-[1vw] rounded-full">無料</span>}
          </div>
          <div className="absolute bottom-[3vw] left-[3vw] right-[3vw]">
            <h3 className="text-white text-[4vw] font-black leading-tight drop-shadow line-clamp-2">{current.title}</h3>
            {current.organizer && <p className="text-white/70 text-[3vw] mt-[1vw]">{current.organizer}</p>}
          </div>
          {featured.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-[2vw] top-1/2 -translate-y-1/2 bg-black/30 text-white w-[8vw] h-[8vw] rounded-full flex items-center justify-center text-[4vw]">‹</button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-[2vw] top-1/2 -translate-y-1/2 bg-black/30 text-white w-[8vw] h-[8vw] rounded-full flex items-center justify-center text-[4vw]">›</button>
            </>
          )}
        </div>
      </div>
      <div className="flex justify-center gap-[2vw] mt-[3vw]">
        {featured.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} className={`rounded-full transition-all duration-300 ${i === index ? "bg-[#092040] w-[4vw] h-[2vw]" : "bg-[#092040]/30 w-[2vw] h-[2vw]"}`} />
        ))}
      </div>
    </div>
  );
}

function HeroSlider({ posts }: { posts: Post[] }) {
  const [index, setIndex] = useState(0);
  const [hoveredLeft, setHoveredLeft] = useState(false);
  const [hoveredRight, setHoveredRight] = useState(false);
  const router = useRouter();
  const featured = posts.filter((p) => p.isFeatured);
  if (featured.length === 0) return <div className="w-full h-full bg-gray-100" />;
  const current = featured[index];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % featured.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [featured.length]);

  return (
    <div className="relative w-full h-full cursor-pointer group"
      onClick={() => router.push(`/posts/${current.slug}`)}>
      {current.imageUrl
        ? <Image src={current.imageUrl} alt={current.title} fill className="object-cover transition-transform duration-700" />
        : <div className="w-full h-full bg-gray-100" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      {/* タイトル */}
      <div className="absolute bottom-8 left-8 right-8">
        <h3 className="text-white font-black text-2xl line-clamp-2 drop-shadow-lg">{current.title}</h3>
        {current.organizer && <p className="text-white/70 text-sm mt-1">{current.organizer}</p>}
      </div>

      {/* ドット */}
      {featured.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {featured.map((_, i) => (
            <button key={i} onClick={(e) => { e.stopPropagation(); setIndex(i); }}
              className={`rounded-full transition-all duration-300 ${i === index ? "bg-white w-5 h-2" : "bg-white/40 w-2 h-2"}`} />
          ))}
        </div>
      )}

      {/* 左ホバーゾーン */}
      {featured.length > 1 && (
        <>
          <div
            className="absolute left-0 top-0 w-1/4 h-full z-10"
            onMouseEnter={() => setHoveredLeft(true)}
            onMouseLeave={() => setHoveredLeft(false)}
            onClick={(e) => { e.stopPropagation(); setIndex((i) => (i - 1 + featured.length) % featured.length); }}
          >
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white text-2xl font-bold transition-all duration-300 ${hoveredLeft ? "opacity-100 scale-110" : "opacity-0 scale-90"}`}>
              ‹
            </div>
          </div>

          {/* 右ホバーゾーン */}
          <div
            className="absolute right-0 top-0 w-1/4 h-full z-10"
            onMouseEnter={() => setHoveredRight(true)}
            onMouseLeave={() => setHoveredRight(false)}
            onClick={(e) => { e.stopPropagation(); setIndex((i) => (i + 1) % featured.length); }}
          >
            <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white text-2xl font-bold transition-all duration-300 ${hoveredRight ? "opacity-100 scale-110" : "opacity-0 scale-90"}`}>
              ›
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TopPageInner({ posts }: { posts: Post[] }) {
  const [keyword, setKeyword] = useState("");
  const router = useRouter();
  const featuredPosts = useMemo(() => posts.filter((p) => p.isFeatured), [posts]);

  return (
    <div className="min-h-screen bg-[#FFFFF0]">
      {/* モバイル */}
      <div className="md:hidden px-[5vw] pb-[10vw]">
        <div className="pt-[6vw] pb-[4vw]">
          <h1 className="text-[#092040] text-[8vw] font-black leading-tight text-center w-full">
            Unlock Your<br />Potential
          </h1>
        </div>
        <div className="mb-[5vw]">
          <div className="flex flex-col gap-2">
            <div className="bg-[#FFFFF0] border-2 border-[#092040] rounded-2xl px-4 py-3 flex items-center gap-2">
              <Image src="/icons/Magnifying Glass.svg" alt="" width={18} height={18} className="opacity-40 shrink-0" />
              <input type="search" placeholder="活動名、主催者などで検索..." value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") router.push(`/search?q=${encodeURIComponent(keyword)}`); }}
                className="flex-1 text-sm outline-none text-[#092040] placeholder-[#092040]/50 bg-transparent" />
            </div>
            <button onClick={() => router.push(`/search?q=${encodeURIComponent(keyword)}`)}
              className="mx-auto block bg-[#092040] text-white font-bold text-sm px-8 py-2.5 rounded-2xl">検索</button>
          </div>
        </div>
        <div className="mb-[6vw]">
          <div className="flex items-center justify-between mb-[3vw]">
            <h2 className="text-[#092040] text-[5vw] font-black">おすすめの活動</h2>
            <Link href="/search" className="text-[#092040] text-[3vw] opacity-60">すべて見る →</Link>
          </div>
          <MobileSlider posts={featuredPosts} />
          <div className="flex flex-col gap-[4vw] mt-[4vw]">
            {posts.slice(0, 4).map((post) => (
              <ActivityCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>

      {/* PC */}
      <div className="hidden md:block">
        <div className="relative w-full h-[85vh] overflow-hidden">
          <HeroSlider posts={posts} />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center pointer-events-none">
        <h1 className="text-white text-6xl font-black text-center drop-shadow-lg">Unlock Your Potential</h1>
        <p className="text-white/80 text-xl mt-4 font-bold drop-shadow">10代のための探究メディア</p>
        <div className="mt-12 flex flex-col items-center gap-2">
          <span className="text-white/50 text-[10px] font-bold tracking-[0.4em] uppercase">Scroll</span>
          <div className="relative w-px h-16 bg-white/20 overflow-hidden rounded-full">
            <div className="absolute top-0 left-0 w-full bg-white/80 rounded-full" style={{ height: "40%", animation: "scrollDrop 1.8s ease-in-out infinite" }} />
          </div>
        </div>
      </div>
        </div>

        <div className="px-16 py-8 bg-[#FFFFF0] border-b border-gray-100">
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#FFFFF0] border-2 border-[#092040] rounded-2xl px-5 py-4 flex items-center gap-3 mb-4">
              <Image src="/icons/Magnifying Glass.svg" alt="" width={18} height={18} className="opacity-40 shrink-0" />
              <input type="search" placeholder="活動名、スキル、主催者などで検索..." value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") router.push(`/search?q=${encodeURIComponent(keyword)}`); }}
                className="flex-1 text-sm outline-none text-[#092040] placeholder-[#092040]/50 bg-transparent" />
              <button onClick={() => router.push(`/search?q=${encodeURIComponent(keyword)}`)}
                className="bg-[#092040] text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity">検索</button>
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="text-[#092040] font-bold text-sm">人気のタグ:</span>
              {(() => {
                const tagCount: Record<string, number> = {};
                posts.forEach((p) => p.tags.forEach((t) => { tagCount[t] = (tagCount[t] ?? 0) + 1; }));
                return Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tag]) => (
                  <Link key={tag} href={`/search?tag=${encodeURIComponent(tag)}`}
                    className="bg-[#FCBC2A]/30 text-[#092040] font-bold text-sm px-4 py-2 rounded-xl hover:bg-[#FCBC2A] transition-colors">{tag}</Link>
                ));
              })()}
            </div>
          </div>
        </div>

        <div className="bg-[#FFFFF0] py-6 border-b border-gray-100">
          <h2 className="text-[#092040] text-xl font-black px-16 mb-3">カテゴリから探す</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 pl-16">
            {CATEGORIES.map((cat) => (
              <Link key={cat} href={`/search?category=${encodeURIComponent(cat)}`}
                className={`font-bold px-6 py-3 rounded-2xl text-sm transition-all whitespace-nowrap shrink-0 hover:opacity-80 ${CATEGORY_BG[cat] ?? "bg-gray-100 text-gray-700"}`}>{cat}</Link>
            ))}
          </div>
        </div>

        <div className="px-16 pb-16 pt-8">
          {featuredPosts.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[#092040] text-2xl font-black">注目の活動</h2>
                <Link href="/search?featured=true" className="text-[#092040] text-sm hover:underline opacity-60">すべて見る →</Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {featuredPosts.map((post) => (
                  <div key={post.id} className="shrink-0 w-80">
                    <ActivityCard post={post} />
                  </div>
                ))}
              </div>
            </section>
          )}
          {CATEGORIES.map((cat) => {
            const filtered = posts.filter((p) => p.category === cat).slice(0, 3);
            if (filtered.length === 0) return null;
            return (
              <section key={cat} className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[#092040] text-2xl font-black">{cat}</h2>
                  <Link href={`/search?category=${encodeURIComponent(cat)}`} className="text-[#092040] text-sm hover:underline opacity-60">すべて見る →</Link>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {filtered.map((post) => (
                    <ActivityCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function TopPageClient({ posts }: { posts: Post[] }) {
  return (
    <div className="flex flex-col">
      <PCNavbar />
      <MobileNavbar />
      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        <TopPageInner posts={posts} />
      </Suspense>
    </div>
  );
}
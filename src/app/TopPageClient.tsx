"use client";

import { useState, useMemo, Suspense, useEffect, useRef } from "react";
import { Post } from "@/types/notion";
import Link from "next/link";
import Image from "next/image";
import FallbackImage from "@/components/FallbackImage";
import { useRouter } from "next/navigation";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { CATEGORIES, CATEGORY_TAG_CLASS, SEASON_TAGS } from "@/constants/categories";
import { daysUntilJst } from "@/lib/date";

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

function ActivityCard({ post }: { post: Post }) {
  const router = useRouter();
  const daysLeft = post.deadline ? daysUntilJst(post.deadline) : null;
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
          ? <FallbackImage src={`/api/notion-image?pageId=${post.id}`} alt={post.title} fill className="object-cover" />
          : <Image src="/noimage.svg" alt="No Image" fill className="object-cover" />}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap max-w-[70%]">
          {post.isFeatured && <span className="bg-white text-[#092040] text-xs font-bold px-2 py-1 rounded-full border border-gray-200">おすすめ</span>}
          {seasonTag && <span className="bg-[#F59E0B] text-white text-xs font-bold px-2 py-1 rounded-full">{seasonTag}</span>}
          {periodLabel && <span className="bg-[#092040] text-white text-xs font-bold px-2 py-1 rounded-full">{periodLabel}</span>}
        </div>
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {(post.fee === "無料" || post.fee === "0円" || post.fee === "0") && <span className="bg-[#4ADE80] text-white text-xs font-bold px-2 py-1 rounded-full">無料</span>}
          {daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 && (
              <span className="relative inline-flex">
                <span className="absolute inset-0 bg-[#EF4444] rounded-full animate-ping opacity-60" />
                <span className="relative bg-[#EF4444] text-white text-xs font-bold px-2 py-1 rounded-full">締切間近</span>
              </span>
            )}
        </div>
      </div>
      <div className="p-4 bg-[#FFFFF0]">
        <div className="flex items-center gap-2 text-xs mb-2 flex-wrap">
          {post.category && <span className={CATEGORY_TAG_CLASS}>{post.category}</span>}
          {post.organizer && <span className="text-gray-400">{post.organizer}</span>}
        </div>
        <h3 className="font-bold text-[#092040] text-xl line-clamp-2">{post.title}</h3>
      </div>
    </div>
  );
}

function MobileSlider({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const featured = posts.slice(0, 5);
  if (featured.length === 0) return null;

  const goTo = (next: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => { setIndex(next); setAnimating(false); }, 300);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((index + 1) % featured.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [index, featured.length]);

  const current = featured[index];

  return (
    <div className="relative">
      <div className="overflow-hidden" onClick={() => router.push(`/posts/${current.slug}`)}>
        <div className={`relative w-full aspect-video transition-opacity duration-300 ${animating ? "opacity-0" : "opacity-100"}`}>
          {current.imageUrl ? <FallbackImage src={`/api/notion-image?pageId=${current.id}`} alt={current.title} fill className="object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-[#FCBC2A] to-[#092040]" />}
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
              <button onClick={(e) => { e.stopPropagation(); goTo((index - 1 + featured.length) % featured.length); }} className="absolute left-[2vw] top-1/2 -translate-y-1/2 bg-black/30 text-white w-[8vw] h-[8vw] rounded-full flex items-center justify-center text-[4vw]">‹</button>
              <button onClick={(e) => { e.stopPropagation(); goTo((index + 1) % featured.length); }} className="absolute right-[2vw] top-1/2 -translate-y-1/2 bg-black/30 text-white w-[8vw] h-[8vw] rounded-full flex items-center justify-center text-[4vw]">›</button>
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
  const router = useRouter();
  const featured = posts.filter((p) => p.isFeatured);
  if (featured.length === 0) return <div className="w-full aspect-video bg-gray-100" />;
  const current = featured[index];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % featured.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [featured.length]);

  return (
    <div className="relative w-full aspect-video overflow-hidden cursor-pointer"
      onClick={() => router.push(`/posts/${current.slug}`)}>
      {current.imageUrl ? <FallbackImage src={`/api/notion-image?pageId=${current.id}`} alt={current.title} fill className="object-cover" /> : <div className="w-full h-full bg-gray-100" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-white font-black text-lg line-clamp-2">{current.title}</h3>
      </div>
      {featured.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); setIndex((i) => (i - 1 + featured.length) % featured.length); }} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 text-white text-2xl w-10 h-10 rounded-full flex items-center justify-center">‹</button>
          <button onClick={(e) => { e.stopPropagation(); setIndex((i) => (i + 1) % featured.length); }} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 text-white text-2xl w-10 h-10 rounded-full flex items-center justify-center">›</button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {featured.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setIndex(i); }} className={`w-2 h-2 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/40"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ScrollHint({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const stoppedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const smoothScroll = (from: number, to: number, duration: number): Promise<void> => {
      return new Promise((resolve) => {
        const start = performance.now();
        const step = (now: number) => {
          if (stoppedRef.current) { resolve(); return; }
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
          el.scrollLeft = from + (to - from) * ease;
          if (progress < 1) {
            rafRef.current = requestAnimationFrame(step);
          } else {
            rafRef.current = null;
            resolve();
          }
        };
        rafRef.current = requestAnimationFrame(step);
      });
    };

    const handleScroll = () => { if (rafRef.current === null) stoppedRef.current = true; };
    el.addEventListener("scroll", handleScroll, { passive: true });

    const animate = async () => {
      if (stoppedRef.current) return;
      await smoothScroll(0, 80, 800);
      if (stoppedRef.current) return;
      await new Promise(r => setTimeout(r, 300));
      if (stoppedRef.current) return;
      await smoothScroll(80, 0, 800);
      if (stoppedRef.current) return;
      rafRef.current = null;
      setTimeout(animate, 1000);
    };

    const first = setTimeout(() => { rafRef.current = null; animate(); }, 1000);
    return () => {
      clearTimeout(first);
      stoppedRef.current = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      el.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div ref={ref} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {children}
    </div>
  );
}

function TopPageInner({ posts, keyword, setKeyword, popularTags }: {
  posts: Post[];
  keyword: string;
  setKeyword: (v: string) => void;
  popularTags: string[];
}) {
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
          <div className="flex items-center bg-[#FFFFF0] border-[3px] border-[#092040] focus-within:border-[#FCBC2A] rounded-2xl pl-5 pr-2 py-2 gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#092040" strokeWidth="2" strokeLinecap="round" className="opacity-40 shrink-0">
              <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="search" placeholder="活動名、スキル、主催者などで検索..." value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") router.push(`/search?q=${encodeURIComponent(keyword)}`); }}
              className="flex-1 min-w-0 border-none text-sm outline-none text-[#092040] placeholder-[#092040]/50 bg-transparent" />
            <button onClick={() => router.push(`/search?q=${encodeURIComponent(keyword)}`)}
              className="bg-[#FCBC2A] text-[#092040] font-bold text-sm px-5 py-2 rounded-[10px] border-2 border-[#092040] shrink-0">検索</button>
          </div>
        </div>
        <div className="mb-[6vw]">
          <div className="flex items-center justify-between mb-[3vw]">
            <h2 className="text-[#092040] text-[5vw] font-black">おすすめの活動</h2>
            <Link href="/search" className="group inline-flex items-center gap-[2vw]">
              <span className="text-[#092040] text-[3vw] font-extrabold underline underline-offset-4">VIEW MORE</span>
              <span className="flex items-center justify-center w-[7vw] h-[7vw] rounded-full bg-[#FCBC2A] text-[#092040] text-[3.5vw] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-active:translate-x-1 group-active:scale-110 motion-reduce:transition-none motion-reduce:transform-none">→</span>
            </Link>
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
        <div className="bg-[#FFFFF0] px-16 pt-12 pb-10 border-b border-gray-100">
          <h1 className="text-[#092040] text-5xl font-black text-center mb-8">Unlock Your Potential</h1>
          <div className="max-w-3xl mx-auto">
            <HeroSlider posts={posts} />
          </div>
        </div>

        <div className="px-16 py-8 bg-[#FFFFF0] border-b border-gray-100">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center bg-[#FFFFF0] border-[3px] border-[#092040] focus-within:border-[#FCBC2A] rounded-2xl pl-5 pr-2 py-2 gap-3 mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#092040" strokeWidth="2" strokeLinecap="round" className="opacity-40 shrink-0">
                <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="search" placeholder="活動名、スキル、主催者などで検索..." value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") router.push(`/search?q=${encodeURIComponent(keyword)}`); }}
                className="flex-1 min-w-0 border-none text-sm outline-none text-[#092040] placeholder-[#092040]/40 bg-transparent" />
              <button onClick={() => router.push(`/search?q=${encodeURIComponent(keyword)}`)}
                className="bg-[#FCBC2A] text-[#092040] font-bold text-sm px-5 py-2 rounded-[10px] border-2 border-[#092040] shrink-0">検索</button>
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="text-[#092040] font-bold text-sm">人気のタグ:</span>
              {popularTags.map((tag) => (
                <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}
                  className="bg-[#FCBC2A]/30 text-[#092040] font-bold text-sm px-4 py-2 hover:bg-[#FCBC2A] transition-colors">{tag}</Link>
              ))}
            </div>
          </div>
        </div>

        <div className="px-16 pb-16 pt-8">
          {featuredPosts.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[#092040] text-2xl font-black">おすすめ</h2>
                <Link href="/search" className="group inline-flex items-center gap-3">
                  <span className="text-[#092040] text-sm font-extrabold underline underline-offset-4">VIEW MORE</span>
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FCBC2A] text-[#092040] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-1 group-hover:scale-110 motion-reduce:transition-none motion-reduce:transform-none">→</span>
                </Link>
              </div>
              <ScrollHint>
                {featuredPosts.map((post) => (
                  <div key={post.id} className="shrink-0" style={{ width: "calc(33.333% - 11px)" }}>
                    <ActivityCard post={post} />
                  </div>
                ))}
              </ScrollHint>
            </section>
          )}
          {CATEGORIES.map((cat) => {
            const filtered = posts.filter((p) => p.category === cat);
            if (filtered.length === 0) return null;
            return (
              <section key={cat} className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[#092040] text-2xl font-black">{cat}</h2>
                  <Link href={`/search?category=${encodeURIComponent(cat)}`} className="group inline-flex items-center gap-3">
                    <span className="text-[#092040] text-sm font-extrabold underline underline-offset-4">VIEW MORE</span>
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FCBC2A] text-[#092040] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-1 group-hover:scale-110 motion-reduce:transition-none motion-reduce:transform-none">→</span>
                  </Link>
                </div>
                <ScrollHint>
                  {filtered.map((post) => (
                    <div key={post.id} className="shrink-0" style={{ width: "calc(33.333% - 11px)" }}>
                      <ActivityCard post={post} />
                    </div>
                  ))}
                </ScrollHint>
              </section>
            );
          })}
        </div>
      </div>

      <section className="flex justify-center py-12 md:py-16 px-[5vw] md:px-0">
        <Link
          href="/search"
          className="group inline-flex items-center gap-2 bg-[#FCBC2A] text-[#092040] font-bold text-base md:text-lg px-8 py-3.5 rounded-full shadow-[0_4px_0_#092040] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:scale-[1.04] hover:shadow-[0_6px_0_#092040] active:translate-y-px active:scale-[0.97] active:shadow-[0_2px_0_#092040] motion-reduce:transition-none"
        >
          すべての活動を見る
          <span className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-1 motion-reduce:transition-none">→</span>
        </Link>
      </section>

      <Footer />
    </div>
  );
}

export default function TopPageClient({ posts, popularTags }: { posts: Post[]; popularTags: string[] }) {
  const [keyword, setKeyword] = useState("");

  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="min-h-screen bg-[#FFFFF0]" />}>
        <TopPageInner posts={posts} keyword={keyword} setKeyword={setKeyword} popularTags={popularTags} />
      </Suspense>
    </>
  );
}
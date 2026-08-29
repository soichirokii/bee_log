"use client";

import { useState, useMemo, Suspense, useEffect, useRef } from "react";
import { Post } from "@/types/notion";
import Link from "next/link";
import FallbackImage from "@/components/FallbackImage";
import { useRouter } from "next/navigation";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ActivityCard from "./components/ActivityCard";
import { CATEGORIES, categoryToEnglishLabel } from "@/constants/categories";
import { isFree } from "@/lib/fee";
import { coverImageSrc } from "@/lib/cloudinary-url";

function MobileSlider({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const featured = posts.slice(0, 5);

  const goTo = (next: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => { setIndex(next); setAnimating(false); }, 300);
  };

  useEffect(() => {
    if (featured.length === 0) return;
    const timer = setInterval(() => {
      goTo((index + 1) % featured.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [index, featured.length]);

  if (featured.length === 0) return null;
  const current = featured[index];

  return (
    <div className="relative">
      <div className="overflow-hidden" onClick={() => router.push(`/posts/${current.slug}`)}>
        <div className={`relative w-full aspect-video transition-opacity duration-300 ${animating ? "opacity-0" : "opacity-100"}`}>
          {current.imageUrl ? <FallbackImage src={coverImageSrc(current.imageUrl, current.id)} alt={current.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-[#FCBC2A] to-[#092040]" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute top-[2vw] left-[2vw] flex gap-[1.5vw]">
            {current.isFeatured && <span className="bg-white text-[#092040] text-[2.5vw] font-bold px-[2.5vw] py-[1vw] rounded-full">おすすめ</span>}
            {isFree(current.fee) && <span className="bg-[#4ADE80] text-white text-[2.5vw] font-bold px-[2.5vw] py-[1vw] rounded-full">無料</span>}
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

  useEffect(() => {
    if (featured.length === 0) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % featured.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (featured.length === 0) return <div className="w-full aspect-video bg-gray-100" />;
  const current = featured[index];
  const categoryLabel = categoryToEnglishLabel(current.category);

  return (
    <div className="group relative w-full aspect-video overflow-hidden cursor-pointer"
      onClick={() => router.push(`/posts/${current.slug}`)}>
      {current.imageUrl ? <FallbackImage src={coverImageSrc(current.imageUrl, current.id)} alt={current.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /> : <div className="w-full h-full bg-gray-100" />}
      {/* テキスト可読性のためのボトムグラデ（写真は極力そのまま、下だけ軽く暗く。紺のかぶせは廃止） */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

      {/* スライドインジケーター（左上）：honey=アクティブ / cream35%=非アクティブ */}
      {featured.length > 1 && (
        <div className="absolute top-4 left-4 z-20 flex gap-1.5">
          {featured.map((_, i) => (
            <button key={i} onClick={(e) => { e.stopPropagation(); setIndex(i); }}
              aria-label={`${i + 1}枚目を表示`}
              className={`h-[3px] w-5 rounded-full transition-colors ${i === index ? "bg-[#FCBC2A]" : "bg-[#FFFFF0]/35"}`} />
          ))}
        </div>
      )}

      {/* テキスト情報（左下）：カテゴリ英字 / タイトル / CTA */}
      <div className="absolute left-4 bottom-4 right-16 z-20 flex flex-col items-start gap-2">
        {categoryLabel && (
          <span className="text-[#FCBC2A] text-xs font-bold uppercase tracking-[0.2em]">{categoryLabel}</span>
        )}
        <h3 className="text-[#FFFFF0] text-2xl font-medium leading-tight line-clamp-2">{current.title}</h3>
        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#FCBC2A] text-[#092040] font-bold text-sm px-4 py-2">
          詳細を見る
          <span aria-hidden="true">→</span>
        </span>
      </div>

      {/* スクロール誘導：縦書きSCROLL＋縦ライン、honeyの線分が上から下へ流れ落ちる（右下・重なりなし） */}
      <div className="pointer-events-none absolute right-4 bottom-4 z-20 flex flex-col items-center gap-1.5">
        <span className="text-[#FFFFF0]/80 text-[10px] font-bold tracking-[0.2em] [writing-mode:vertical-rl]">SCROLL</span>
        <span className="relative h-9 w-px overflow-hidden bg-[#FFFFF0]/25">
          <span className="animate-scroll-line absolute left-0 top-[-36px] h-3 w-px bg-[#FCBC2A]" />
        </span>
      </div>

      {/* 矢印（右/左・ホバー時表示）：直径44pxの円、cream90%背景、navy矢印、軽い影で写真上でも浮かせる */}
      {featured.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); setIndex((i) => (i - 1 + featured.length) % featured.length); }}
            aria-label="前のスライド"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-[#FFFFF0]/90 text-[#092040] shadow-[0_4px_12px_rgba(9,32,64,0.15)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 6 9 12 15 18" /></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); setIndex((i) => (i + 1) % featured.length); }}
            aria-label="次のスライド"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-[#FFFFF0]/90 text-[#092040] shadow-[0_4px_12px_rgba(9,32,64,0.15)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18" /></svg>
          </button>
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
    <div ref={ref} className="flex gap-4 overflow-x-auto pt-1 pb-4 px-1 -mx-1 scrollbar-hide">
      {children}
    </div>
  );
}

// ステッカー風「VIEW MORE」ボタン。白フチ+Navy輪郭+ハードシャドウで貼ったシール感を出す（傾きなし・水平）。
function StickerViewMore({ href, mobile = false }: { href: string; mobile?: boolean }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-1 rounded-full bg-[#FCBC2A] text-[#092040] font-black px-4 py-1.5 border-[3px] border-white shadow-[0_0_0_2px_#092040,3px_4px_0_rgba(9,32,64,0.9)] transition-transform duration-200 ease-out motion-reduce:transition-none ${
        mobile ? "text-xs active:scale-95" : "text-sm hover:-translate-y-0.5"
      }`}
    >
      VIEW MORE
      <span className={`inline-block transition-transform duration-200 motion-reduce:transition-none ${mobile ? "" : "group-hover:translate-x-0.5"}`}>→</span>
    </Link>
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
  // 記事ありカテゴリのみ抽出（ステッカーの回転を可視セクション順で互い違いにするため）
  const categorySections = useMemo(
    () =>
      CATEGORIES.map((cat) => ({ cat, filtered: posts.filter((p) => p.category === cat.name) }))
        .filter((s) => s.filtered.length > 0),
    [posts]
  );

  return (
    <div className="min-h-screen bg-[#FFFFF0]">

      {/* モバイル */}
      <div className="md:hidden px-[5vw] pb-[10vw]">
        <div className="pt-[6vw] pb-[4vw]">
          <h1 className="text-[#092040] text-[8vw] font-black leading-tight text-center w-full">
            Unlock Your<br />Potential
          </h1>
        </div>
        <div id="search-box" className="mb-[5vw]">
          <div className="flex items-center bg-[#FFFFF0] border-[3px] border-[#092040] rounded-2xl pl-5 pr-2 py-2 gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#092040" strokeWidth="2" strokeLinecap="round" className="opacity-40 shrink-0">
              <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="search" placeholder="活動名、スキル、主催者などで検索..." value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") router.push(`/search?q=${encodeURIComponent(keyword)}`); }}
                aria-label="活動を検索"
                className="flex-1 min-w-0 border-none text-sm text-[#092040] placeholder-[#092040]/50 bg-transparent" />
            <button onClick={() => router.push(`/search?q=${encodeURIComponent(keyword)}`)}
              className="bg-[#FCBC2A] text-[#092040] font-bold text-sm px-5 py-2 rounded-[10px] border-2 border-[#092040] shrink-0">検索</button>
          </div>
        </div>
        <div className="mb-[6vw]">
          <div className="flex items-center justify-between mb-[3vw]">
            <h2 className="text-[#092040] text-[5vw] font-black">おすすめの活動</h2>
            <StickerViewMore href="/search" mobile />
          </div>
          <MobileSlider posts={featuredPosts} />
          <div className="flex flex-col gap-[4vw] mt-[4vw]">
            {posts.slice(0, 4).map((post) => (
              <ActivityCard key={post.id} post={post} imagePriority={post === posts[0]} />
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
            <div className="flex items-center bg-[#FFFFF0] border-[3px] border-[#092040] rounded-2xl pl-5 pr-2 py-2 gap-3 mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#092040" strokeWidth="2" strokeLinecap="round" className="opacity-40 shrink-0">
                <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="search" placeholder="活動名、スキル、主催者などで検索..." value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") router.push(`/search?q=${encodeURIComponent(keyword)}`); }}
                aria-label="活動を検索"
                className="flex-1 min-w-0 border-none text-sm text-[#092040] placeholder-[#092040]/40 bg-transparent" />
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
                <StickerViewMore href="/search" />
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
          {categorySections.map(({ cat, filtered }) => (
            <section key={cat.slug} className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <Link href={`/search?category=${encodeURIComponent(cat.name)}`} className="text-[#092040] text-2xl font-black hover:opacity-70 transition-opacity">{cat.name}</Link>
                <StickerViewMore href={`/search?category=${encodeURIComponent(cat.name)}`} />
              </div>
              <ScrollHint>
                {filtered.map((post) => (
                  <div key={post.id} className="shrink-0" style={{ width: "calc(33.333% - 11px)" }}>
                    <ActivityCard post={post} />
                  </div>
                ))}
              </ScrollHint>
            </section>
          ))}
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

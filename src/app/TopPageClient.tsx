"use client";

import { useState, useMemo } from "react";
import { Post } from "@/types/notion";
import Link from "next/link";
import ActivityModal from "./components/ActivityModal";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "コンテスト・大会",
  "インターンシップ",
  "ボランティア",
  "留学・国際",
  "研究・論文",
  "起業・ビジネス",
  "奨学金",
  "科学・理系",
  "宿泊イベント・キャンプ",
];

const CATEGORY_BG: Record<string, string> = {
  "コンテスト・大会": "bg-orange-100 text-orange-700",
  "インターンシップ": "bg-lime-100 text-lime-700",
  "ボランティア": "bg-blue-100 text-blue-700",
  "留学・国際": "bg-red-100 text-red-700",
  "研究・論文": "bg-purple-100 text-purple-700",
  "起業・ビジネス": "bg-blue-100 text-blue-700",
  "奨学金": "bg-green-100 text-green-700",
  "科学・理系": "bg-pink-100 text-pink-700",
  "宿泊イベント・キャンプ": "bg-sky-100 text-sky-700",
};

const SEASON_TAGS = ["夏休み", "冬休み", "春休み"];

function getPeriodLabel(period: string): "長期" | "中期" | "短期" | null {
  if (!period) return null;
  const text = period.replace(/\s/g, "");
  const monthMatch = text.match(/(\d+)ヶ?月/);
  if (monthMatch) {
    const days = parseInt(monthMatch[1]) * 30;
    return days >= 15 ? "長期" : days >= 7 ? "中期" : "短期";
  }
  const weekMatch = text.match(/(\d+)週間?/);
  if (weekMatch) {
    const days = parseInt(weekMatch[1]) * 7;
    return days >= 15 ? "長期" : days >= 7 ? "中期" : "短期";
  }
  const dayMatch = text.match(/(\d+)日/);
  if (dayMatch) {
    const days = parseInt(dayMatch[1]);
    return days >= 15 ? "長期" : days >= 7 ? "中期" : "短期";
  }
  return null;
}

function MobileSlider({ posts, onCardClick }: { posts: Post[]; onCardClick: (post: Post) => void }) {
  const [index, setIndex] = useState(0);
  const featured = posts.slice(0, 5);
  if (featured.length === 0) return null;

  const prev = () => setIndex((i) => (i - 1 + featured.length) % featured.length);
  const next = () => setIndex((i) => (i + 1) % featured.length);
  const current = featured[index];

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-[4vw]" onClick={() => onCardClick(current)}>
        <div className="relative w-full aspect-video">
          {current.imageUrl ? (
            <img src={current.imageUrl} alt={current.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#FCBC2A] to-[#092040]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute top-[2vw] left-[2vw] flex gap-[1.5vw]">
            {current.isFeatured && (
              <span className="bg-white text-[#092040] text-[2.5vw] font-bold px-[2.5vw] py-[1vw] rounded-full">おすすめ</span>
            )}
            {(current.fee === "無料" || current.fee === "0円" || current.fee === "0") && (
              <span className="bg-[#4ADE80] text-white text-[2.5vw] font-bold px-[2.5vw] py-[1vw] rounded-full">無料</span>
            )}
          </div>
          <div className="absolute bottom-[3vw] left-[3vw] right-[3vw]">
            <h3 className="text-white text-[4vw] font-black leading-tight drop-shadow line-clamp-2">{current.title}</h3>
            {current.organizer && <p className="text-white/70 text-[3vw] mt-[1vw]">{current.organizer}</p>}
          </div>
          {featured.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-[2vw] top-1/2 -translate-y-1/2 bg-black/30 text-white w-[8vw] h-[8vw] rounded-full flex items-center justify-center text-[4vw]">‹</button>
              <button onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-[2vw] top-1/2 -translate-y-1/2 bg-black/30 text-white w-[8vw] h-[8vw] rounded-full flex items-center justify-center text-[4vw]">›</button>
            </>
          )}
        </div>
      </div>
      <div className="flex justify-center gap-[2vw] mt-[3vw]">
        {featured.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)}
            className={`rounded-full transition-all duration-300 ${i === index ? "bg-[#092040] w-[4vw] h-[2vw]" : "bg-[#092040]/30 w-[2vw] h-[2vw]"}`} />
        ))}
      </div>
    </div>
  );
}

function PCNavbar() {
  return (
    <nav className="hidden md:flex items-center px-6 py-4 bg-[#FCBC2A]">
      <Link href="/" className="mr-10">
        <img src="/logo.png" alt="BEE log" className="h-16 w-auto" />
      </Link>
      <Link href="/" className="text-base font-bold px-6 py-2.5 rounded-full mr-3 bg-white text-[#092040]">HOME</Link>
      <Link href="/search" className="text-base font-bold px-6 py-2.5 rounded-full text-[#092040] hover:opacity-70 transition-colors">活動を探す</Link>
    </nav>
  );
}

function MobileNavbar() {
  return (
    <nav className="md:hidden flex items-center bg-[#FCBC2A] px-[5vw] py-[3vw]">
      <div className="flex-1 flex justify-start" />
      <Link href="/" className="flex justify-center">
        <img src="/logo.png" alt="BEE log" className="h-[10vw] w-auto" />
      </Link>
      <div className="flex-1 flex justify-end">
        <Link href="/search" className="bg-[#092040] text-white font-bold text-[3.5vw] px-[4vw] py-[2vw] rounded-full">探す</Link>
      </div>
    </nav>
  );
}

function ActivityCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const now = new Date();
  const daysLeft = post.deadline
    ? Math.ceil((new Date(post.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const categoryStyle = post.category ? CATEGORY_BG[post.category] ?? "bg-gray-100 text-gray-700" : "";
  const seasonTag = post.tags.find((t) => SEASON_TAGS.includes(t));
  const periodLabel = getPeriodLabel(post.period);

  return (
    <div onClick={onClick} className="bg-white rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 cursor-pointer">
      <div className="w-full aspect-video bg-gray-200 relative rounded-t-2xl overflow-hidden">
        {post.imageUrl ? (
          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
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
              <Link key={tag} href={`/search?tag=${encodeURIComponent(tag)}`} onClick={(e) => e.stopPropagation()} className="text-xs text-gray-400 hover:text-[#092040] hover:underline">#{tag}</Link>
            ))}
          </div>
        )}
        <div className="flex items-end justify-between text-xs border-t pt-2">
          {post.deadline && (
            <div>
              <div className="text-gray-400">締切日</div>
              <div className="text-[#092040] font-bold">{new Date(post.deadline).toLocaleDateString("ja-JP")}</div>
            </div>
          )}
          {post.targetGrade.length > 0 && (
            <div className="text-right">
              <div className="text-gray-400">対象</div>
              <div className="font-medium text-[#092040]">{post.targetGrade.join("・")}</div>
            </div>
          )}
          {post.format && (
            <div className="text-right">
              <div className="text-gray-400">形式</div>
              <div className="font-medium text-[#092040]">{post.format}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HeroSlider({ posts }: { posts: Post[] }) {
  const [index, setIndex] = useState(0);
  const featured = posts.filter((p) => p.isFeatured);
  if (featured.length === 0) return (
    <div className="w-full aspect-video bg-white/30 rounded-2xl flex items-center justify-center text-[#092040]/40">No Featured</div>
  );
  const current = featured[index];
  const prev = () => setIndex((i) => (i - 1 + featured.length) % featured.length);
  const next = () => setIndex((i) => (i + 1) % featured.length);
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
      {current.imageUrl ? (
        <img src={current.imageUrl} alt={current.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-white/30" />
      )}
      <div className="absolute bottom-0 right-0 bg-black/60 text-white text-sm px-4 py-2 max-w-[60%] truncate">{current.title}</div>
      {featured.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 text-white text-2xl w-10 h-10 rounded-full flex items-center justify-center">‹</button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 text-white text-2xl w-10 h-10 rounded-full flex items-center justify-center">›</button>
        </>
      )}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {featured.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} className={`w-2 h-2 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}

function CategorySection({ category, posts, onCardClick }: { category: string; posts: Post[]; onCardClick: (post: Post) => void }) {
  const filtered = posts.filter((p) => p.category === category).slice(0, 3);
  if (filtered.length === 0) return null;
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#092040] text-2xl font-black">{category}</h2>
        <a href={`/search?category=${encodeURIComponent(category)}`} className="text-[#092040] text-sm hover:underline opacity-60">すべて見る →</a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((post) => (
          <ActivityCard key={post.id} post={post} onClick={() => onCardClick(post)} />
        ))}
      </div>
    </section>
  );
}

export default function TopPageClient({ posts }: { posts: Post[] }) {
  const [keyword, setKeyword] = useState("");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const router = useRouter();
  const featuredPosts = useMemo(() => posts.filter((p) => p.isFeatured), [posts]);

  return (
    <div className="min-h-screen bg-[#FCBC2A]">
      {selectedPost && <ActivityModal post={selectedPost} onClose={() => setSelectedPost(null)} />}

      <PCNavbar />
      <MobileNavbar />

      {/* ── モバイル用 ── */}
      <div className="md:hidden px-[5vw] pb-[10vw]">
        {/* キャッチコピー */}
        <div className="pt-[6vw] pb-[4vw]">
          <h1 className="text-[#092040] text-[8vw] font-black leading-tight">
            Unlock Your<br />Potential
          </h1>
        </div>

        {/* 検索バー */}
        <div className="mb-[5vw]">
          <div className="bg-white rounded-[4vw] px-[4vw] py-[4vw] flex items-center gap-[3vw] shadow-lg">
            <span className="text-gray-400 text-[5vw]">🔍</span>
            <input
              type="search"
              placeholder="活動名、主催者などで検索..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") router.push(`/search?q=${encodeURIComponent(keyword)}`); }}
              className="flex-1 text-[3.5vw] outline-none text-[#092040] placeholder-gray-400"
            />
            <button
              onClick={() => router.push(`/search?q=${encodeURIComponent(keyword)}`)}
              className="bg-[#092040] text-[#FCBC2A] font-bold text-[3.5vw] px-[4vw] py-[2vw] rounded-[3vw]"
            >
              検索
            </button>
          </div>
        </div>

        {/* おすすめの活動 */}
        <div className="mb-[6vw]">
          <div className="flex items-center justify-between mb-[3vw]">
            <h2 className="text-[#092040] text-[5vw] font-black">おすすめの活動</h2>
            <Link href="/search" className="text-[#092040] text-[3vw] opacity-60">すべて見る →</Link>
          </div>
          <MobileSlider posts={featuredPosts} onCardClick={setSelectedPost} />
          <div className="flex flex-col gap-[4vw] mt-[4vw]">
            {featuredPosts.slice(0, 3).map((post) => (
              <ActivityCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
            ))}
          </div>
        </div>
      </div>

      {/* ── PC用 ── */}
      <div className="hidden md:block">
        <div className="px-6 pt-8 pb-6">
          <h1 className="text-[#092040] text-4xl font-black text-center mb-6">Unlock Your Potential</h1>
          <div className="max-w-3xl mx-auto">
            <HeroSlider posts={posts} />
          </div>
        </div>

        <div className="px-6 mb-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl px-5 py-4 flex items-center gap-3 shadow-lg mb-4">
              <span className="text-gray-400 text-lg">🔍</span>
              <input
                type="search"
                placeholder="活動名、スキル、主催者などで検索..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") router.push(`/search?q=${encodeURIComponent(keyword)}`); }}
                className="flex-1 text-sm outline-none text-[#092040] placeholder-gray-400"
              />
              <button
                onClick={() => router.push(`/search?q=${encodeURIComponent(keyword)}`)}
                className="bg-[#092040] text-[#FCBC2A] font-bold px-6 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity"
              >
                検索
              </button>
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="text-[#092040] font-bold text-sm whitespace-nowrap">人気のタグ:</span>
              {(() => {
                const tagCount: Record<string, number> = {};
                posts.forEach((p) => p.tags.forEach((t) => { tagCount[t] = (tagCount[t] ?? 0) + 1; }));
                return Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tag]) => (
                  <Link key={tag} href={`/search?tag=${encodeURIComponent(tag)}`}
                    className="bg-[#FCBC2A]/40 text-[#092040] font-bold text-sm px-4 py-2 rounded-xl hover:bg-white transition-colors">
                    {tag}
                  </Link>
                ));
              })()}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-[#092040] text-xl font-black px-6 mb-3">カテゴリから探す</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide pl-6">
            {CATEGORIES.map((cat) => (
              <Link key={cat} href={`/search?category=${encodeURIComponent(cat)}`}
                className="bg-white text-[#092040] font-bold px-6 py-3 rounded-2xl text-sm hover:shadow-lg transition-all whitespace-nowrap shrink-0">
                {cat}
              </Link>
            ))}
          </div>
        </div>

        <div className="px-6 pb-16">
          {featuredPosts.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[#092040] text-2xl font-black">注目の活動</h2>
                <Link href="/search" className="text-[#092040] text-sm hover:underline opacity-60">すべて見る →</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredPosts.slice(0, 3).map((post) => (
                  <ActivityCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
                ))}
              </div>
            </section>
          )}
          {CATEGORIES.map((cat) => (
            <CategorySection key={cat} category={cat} posts={posts} onCardClick={setSelectedPost} />
          ))}
        </div>
      </div>

      {/* フッター */}
      <footer className="bg-[#FCBC2A] py-10 px-6 border-t border-[#092040]/10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-10">
          <div className="w-48 shrink-0">
            <Link href="/"><img src="/logo.png" alt="BEE log" className="h-16 w-auto" /></Link>
          </div>
          <div className="flex-1">
            <h3 className="text-[#092040] font-bold mb-4">プラットフォーム</h3>
            <ul><li><Link href="/search" className="text-[#092040] text-sm hover:underline">活動を探す</Link></li></ul>
          </div>
          <div className="flex-1">
            <h3 className="text-[#092040] font-bold mb-4">サポート</h3>
            <ul className="flex flex-col gap-3">
              <li><a href="#" className="text-[#092040] text-sm hover:underline">お問い合わせ</a></li>
              <li><a href="#" className="text-[#092040] text-sm hover:underline">プライバシーポリシー</a></li>
              <li><a href="#" className="text-[#092040] text-sm hover:underline">利用規約</a></li>
            </ul>
          </div>
          <div className="flex-1">
            <h3 className="text-[#092040] font-bold mb-4">つながる</h3>
            <div className="flex gap-4">
              <a href="#" className="text-[#092040] hover:opacity-70">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="text-[#092040] hover:opacity-70">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
"use client";

import { useState, useMemo } from "react";
import { Post } from "@/types/notion";
import Link from "next/link";
import ActivityModal from "./components/ActivityModal";

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

const CATEGORY_COLORS: Record<string, string> = {
  "コンテスト・大会": "bg-yellow-400",
  "インターンシップ": "bg-green-400",
  "ボランティア": "bg-blue-400",
  "留学・国際": "bg-pink-400",
  "研究・論文": "bg-purple-400",
  "起業・ビジネス": "bg-orange-400",
  "奨学金": "bg-emerald-400",
  "科学・理系": "bg-red-300",
  "宿泊イベント・キャンプ": "bg-sky-300",
};

// ── ナビゲーション ────────────────────────────
function Navbar() {
  return (
    <nav className="flex items-center px-8 py-4 bg-[#FCBC2A]">
      <Link href="/" className="mr-10">
        <img src="/logo.png" alt="BEE log" className="h-10 w-auto" />
      </Link>
      <Link href="/" className="bg-white text-[#092040] text-sm font-bold px-5 py-2 rounded-full mr-4">
        HOME
      </Link>
      <Link href="/search" className="text-[#092040] text-sm font-medium hover:opacity-70">
        活動を探す
      </Link>
    </nav>
  );
}

// ── スライダー ────────────────────────────────
function HeroSlider({ posts }: { posts: Post[] }) {
  const [index, setIndex] = useState(0);
  const featured = posts.filter((p) => p.isFeatured);

  if (featured.length === 0) return (
    <div className="w-full aspect-video bg-white/30 rounded-2xl flex items-center justify-center text-[#092040]/40">
      No Featured
    </div>
  );

  const current = featured[index];
  const prev = () => setIndex((i) => (i - 1 + featured.length) % featured.length);
  const next = () => setIndex((i) => (i + 1) % featured.length);

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
      {current.imageUrl ? (
        <img src={current.imageUrl} alt={current.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-white/30 flex items-center justify-center">
          <span className="text-[#092040]/40">No Image</span>
        </div>
      )}
      <div className="absolute bottom-0 right-0 bg-black/60 text-white text-sm px-4 py-2 max-w-[60%] truncate">
        {current.title}
      </div>
      {featured.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 text-white text-2xl w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/50">
            ‹
          </button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 text-white text-2xl w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/50">
            ›
          </button>
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

// ── 活動カード ────────────────────────────────
function ActivityCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const now = new Date();
  const daysLeft = post.deadline
    ? Math.ceil((new Date(post.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div onClick={onClick} className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
      <div className="w-full aspect-video bg-gray-200 relative">
        {post.imageUrl ? (
          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          {post.isFeatured && (
            <span className="bg-[#FCBC2A] text-[#092040] text-xs font-bold px-2 py-1 rounded-full">おすすめ</span>
          )}
        </div>
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {(post.fee === "無料" || post.fee === "0円" || post.fee === "0") && (
            <span className="bg-[#4ADE80] text-white text-xs font-bold px-2 py-1 rounded-full">無料</span>
          )}
          {daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 && (
            <span className="bg-[#EF4444] text-white text-xs font-bold px-2 py-1 rounded-full">あと{daysLeft}日</span>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs mb-1">
          {post.category && (
            <span className="bg-[#FCBC2A]/30 text-[#092040] px-2 py-0.5 rounded-full font-medium">{post.category}</span>
          )}
          {post.organizer && <span className="text-gray-400">{post.organizer}</span>}
        </div>
        <h3 className="font-bold text-[#092040] text-base mb-2 line-clamp-2">{post.title}</h3>
        {post.summary && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.summary}</p>}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs text-gray-400">#{tag}</span>
            ))}
          </div>
        )}
        <div className="flex items-end justify-between text-xs border-t pt-2">
          {post.deadline && (
            <div>
              <div className="text-gray-400">締切日</div>
              <div className="text-[#EF4444] font-bold">{new Date(post.deadline).toLocaleDateString("ja-JP")}</div>
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

// ── カテゴリセクション ────────────────────────
function CategorySection({ category, posts, onCardClick }: {
  category: string;
  posts: Post[];
  onCardClick: (post: Post) => void;
}) {
  const filtered = posts.filter((p) => p.category === category).slice(0, 3);
  if (filtered.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#092040] text-xl font-bold">{category}</h2>
        <a href={`/search?category=${encodeURIComponent(category)}`} className="text-[#092040] text-sm hover:underline opacity-60">
          すべて見る →
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((post) => (
          <ActivityCard key={post.id} post={post} onClick={() => onCardClick(post)} />
        ))}
      </div>
    </section>
  );
}

// ── メイン ────────────────────────────────────
export default function TopPageClient({ posts }: { posts: Post[] }) {
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const featuredPosts = useMemo(() => posts.filter((p) => p.isFeatured), [posts]);

  return (
    <div className="min-h-screen bg-[#FCBC2A]">
      {/* モーダル */}
      {selectedPost && (
        <ActivityModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}

      <Navbar />

      {/* ヒーロー */}
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-[#092040] text-4xl font-black text-center mb-6">
          Unlock Your Potential
        </h1>
        <div className="max-w-3xl mx-auto">
          <HeroSlider posts={posts} />
        </div>
      </div>

      {/* 検索バー */}
      <div className="px-8 mb-6">
        <div className="max-w-3xl mx-auto flex gap-2">
          <div className="flex-1 bg-white rounded-full px-5 py-3 flex items-center gap-2">
            <span className="text-gray-400">🔍</span>
            <input
              type="search"
              placeholder="活動、主催者、キーワードで検索..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-1 text-sm outline-none"
            />
          </div>
          <Link
            href={`/search?q=${encodeURIComponent(keyword)}`}
            className="bg-[#092040] text-white font-bold px-6 py-3 rounded-full text-sm hover:opacity-90 transition-opacity"
          >
            検索
          </Link>
        </div>
      </div>

      {/* カテゴリボタン */}
      <div className="px-8 mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[#092040] font-bold">カテゴリから探す</span>
          <button onClick={() => setSelectedCategory("")} className="text-[#092040] text-sm hover:underline opacity-60">
            すべて見る →
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((cat) => (
            <Link
                key={cat}
                href={`/search?category=${encodeURIComponent(cat)}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border-2 bg-white text-[#092040] border-white hover:border-[#092040]`}
            >
                <span className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[cat]}`} />
                {cat}
            </Link>
        ))}
        </div>
      </div>

      {/* 本文エリア */}
      <div className="px-8 pb-16">
        {selectedCategory ? (
          <CategorySection category={selectedCategory} posts={posts} onCardClick={setSelectedPost} />
        ) : (
          <>
            {featuredPosts.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[#092040] text-xl font-bold">注目の活動</h2>
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
          </>
        )}
      </div>

      {/* フッター */}
      <footer className="bg-[#092040] py-10 text-center">
        <div className="text-[#FCBC2A] text-2xl font-black mb-3">BEE log</div>
        <p className="text-white/60 text-sm mb-6">
          有意義な課外活動とコミュニティへの入口を通じて、学生の情熱を見つけ、成長する芽を支援します。
        </p>
        <div className="flex justify-center gap-8 text-white/40 text-sm">
          <span>social</span>
          <span>email</span>
          <span>share</span>
        </div>
        <p className="text-white/20 text-xs mt-6">© 2024 BEE log ALL RIGHTS RESERVED</p>
      </footer>
    </div>
  );
}
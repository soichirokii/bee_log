"use client";

import { useState, useMemo } from "react";
import { Post } from "@/types/notion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ActivityModal from "../components/ActivityModal";

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

const GRADES = ["中学生", "高校生", "大学生"];
const FORMATS = ["オンライン", "対面", "ハイブリッド"];

function Navbar() {
  return (
    <nav className="flex items-center px-8 py-4 bg-[#FCBC2A]">
      <Link href="/" className="mr-10">
        <img src="/logo.png" alt="BEE log" className="h-10 w-auto" />
      </Link>
      <Link href="/" className="text-[#092040] text-sm font-medium mr-4 hover:opacity-70">
        HOME
      </Link>
      <Link
        href="/search"
        className="bg-white text-[#092040] text-sm font-bold px-5 py-2 rounded-full"
      >
        活動を探す
      </Link>
    </nav>
  );
}

function ActivityCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const now = new Date();
  const daysLeft = post.deadline
    ? Math.ceil((new Date(post.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
    >
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
        {post.summary && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.summary}</p>
        )}
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
              <div className="text-[#EF4444] font-bold">
                {new Date(post.deadline).toLocaleDateString("ja-JP")}
              </div>
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

const PAGE_SIZE = 12;

export default function SearchClient({ posts }: { posts: Post[] }) {
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category") ? [searchParams.get("category")!] : []
  );
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [freeOnly, setFreeOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "deadline">("newest");
  const [page, setPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
    setPage(1);
  };

  const filtered = useMemo(() => {
    let result = posts;
    if (keyword.trim()) {
      const kw = keyword.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(kw) ||
          p.summary.toLowerCase().includes(kw) ||
          p.organizer.toLowerCase().includes(kw) ||
          p.tags.some((t) => t.toLowerCase().includes(kw))
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    if (selectedGrades.length > 0) {
      result = result.filter((p) => p.targetGrade.some((g) => selectedGrades.includes(g)));
    }

    if (selectedFormats.length > 0) {
      result = result.filter((p) => selectedFormats.includes(p.format));
    }

    if (freeOnly) {
      result = result.filter((p) => p.fee === "無料" || p.fee === "0円" || p.fee === "0");
    }

    if (sortOrder === "deadline") {
      result = [...result].sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    }

    return result;
  }, [posts, keyword, selectedCategories, selectedGrades, selectedFormats, freeOnly, sortOrder]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#FCBC2A]">
      {/* モーダル */}
      {selectedPost && (
        <ActivityModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}

      <Navbar />

      <div className="flex gap-6 px-6 py-6">
        {/* サイドバー */}
        <aside className="w-56 shrink-0">
          <div className="bg-white rounded-2xl p-5 sticky top-6">
            <h2 className="font-bold text-[#092040] text-lg mb-4">絞り込み検索</h2>

            {/* カテゴリ */}
            <div className="mb-5">
              <h3 className="text-sm font-bold text-[#092040] mb-2">カテゴリ</h3>
              {CATEGORIES.map((cat) => (
                <label key={cat} className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleItem(selectedCategories, setSelectedCategories, cat)}
                    className="accent-[#FCBC2A] w-4 h-4"
                  />
                  <span className="text-sm text-[#092040]">{cat}</span>
                </label>
              ))}
            </div>

            {/* 対象学年 */}
            <div className="mb-5">
              <h3 className="text-sm font-bold text-[#092040] mb-2">対象学年</h3>
              <div className="flex flex-wrap gap-2">
                {GRADES.map((grade) => (
                  <button
                    key={grade}
                    onClick={() => { toggleItem(selectedGrades, setSelectedGrades, grade); }}
                    className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors
                      ${selectedGrades.includes(grade)
                        ? "bg-[#FCBC2A] border-[#FCBC2A] text-[#092040]"
                        : "border-gray-300 text-gray-500 hover:border-[#FCBC2A]"
                      }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* 形式 */}
            <div className="mb-5">
              <h3 className="text-sm font-bold text-[#092040] mb-2">形式</h3>
              {FORMATS.map((fmt) => (
                <label key={fmt} className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    checked={selectedFormats.includes(fmt)}
                    onChange={() => setSelectedFormats(selectedFormats.includes(fmt) ? [] : [fmt])}
                    className="accent-[#FCBC2A] w-4 h-4"
                  />
                  <span className="text-sm text-[#092040]">{fmt}</span>
                </label>
              ))}
            </div>

            {/* 無料のみ */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#092040]">無料のみ</span>
              <button
                onClick={() => { setFreeOnly(!freeOnly); setPage(1); }}
                className={`w-12 h-6 rounded-full transition-colors relative ${freeOnly ? "bg-[#FCBC2A]" : "bg-gray-300"}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${freeOnly ? "left-7" : "left-1"}`} />
              </button>
            </div>
          </div>
        </aside>

        {/* メインエリア */}
        <main className="flex-1">
          <div className="flex gap-2 mb-4">
            <div className="flex-1 bg-white rounded-full px-5 py-3 flex items-center gap-2">
              <span className="text-gray-400">🔍</span>
              <input
                type="search"
                placeholder="活動、主催者、キーワードで検索..."
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
                className="flex-1 text-sm outline-none"
              />
            </div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
              className="bg-white rounded-full px-4 py-3 text-sm text-[#092040] outline-none cursor-pointer"
            >
              <option value="newest">並び替え：新着順</option>
              <option value="deadline">並び替え：締切順</option>
            </select>
          </div>

          <p className="text-[#092040] font-bold mb-4">
            {filtered.length} 件の活動が見つかりました
          </p>

          {paginated.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center text-gray-400">
              条件に一致する活動がありません
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              {paginated.map((post) => (
                <ActivityCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 rounded-full bg-white text-[#092040] font-bold disabled:opacity-30 hover:bg-[#092040] hover:text-white transition-colors"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-full font-bold transition-colors
                      ${page === p
                        ? "bg-[#092040] text-white"
                        : "bg-white text-[#092040] hover:bg-[#092040] hover:text-white"
                      }`}
                  >
                    {p}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="text-[#092040] font-bold">...</span>}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-10 h-10 rounded-full bg-white text-[#092040] font-bold disabled:opacity-30 hover:bg-[#092040] hover:text-white transition-colors"
              >
                ›
              </button>
            </div>
          )}
        </main>
      </div>

      <footer className="bg-[#092040] py-10 text-center mt-10">
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
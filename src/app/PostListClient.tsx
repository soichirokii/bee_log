"use client";

import { useState, useMemo } from "react";
import { Post } from "@/types/notion";
import Link from "next/link";

type Props = { posts: Post[] };

// ── 注目スライダー ────────────────────────────
function FeaturedSlider({ posts }: { posts: Post[] }) {
  const [index, setIndex] = useState(0);

  if (posts.length === 0) return null;

  const current = posts[index];
  const prev = () => setIndex((i) => (i - 1 + posts.length) % posts.length);
  const next = () => setIndex((i) => (i + 1) % posts.length);

  return (
    <div style={{ position: "relative", marginBottom: "2rem" }}>
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#eee", overflow: "hidden" }}>
        {current.imageUrl ? (
          <img
            src={current.imageUrl}
            alt={current.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
            No Image
          </div>
        )}
        <div style={{
          position: "absolute", bottom: 0, right: 0,
          background: "rgba(0,0,0,0.6)", color: "#fff",
          padding: "0.4rem 0.8rem", maxWidth: "70%"
        }}>
          <Link href={`/posts/${current.id}`} style={{ color: "#fff", textDecoration: "none" }}>
            {current.title}
          </Link>
        </div>
      </div>

      {posts.length > 1 && (
        <>
          <button onClick={prev} style={{ position: "absolute", top: "50%", left: "0.5rem", transform: "translateY(-50%)", fontSize: "1.5rem", background: "rgba(0,0,0,0.4)", color: "#fff", border: "none", cursor: "pointer", padding: "0.3rem 0.6rem" }}>
            ‹
          </button>
          <button onClick={next} style={{ position: "absolute", top: "50%", right: "0.5rem", transform: "translateY(-50%)", fontSize: "1.5rem", background: "rgba(0,0,0,0.4)", color: "#fff", border: "none", cursor: "pointer", padding: "0.3rem 0.6rem" }}>
            ›
          </button>
        </>
      )}

      <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
        {posts.map((_, i) => (
          <span key={i} onClick={() => setIndex(i)} style={{ cursor: "pointer", margin: "0 3px", fontSize: i === index ? "1rem" : "0.7rem", color: i === index ? "#000" : "#aaa" }}>
            ●
          </span>
        ))}
      </div>
    </div>
  );
}

// ── メインコンポーネント ──────────────────────
export default function PostListClient({ posts }: Props) {
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");
  const [deadlineFilter, setDeadlineFilter] = useState<"all" | "week" | "month">("all");
  const [activeTab, setActiveTab] = useState<"all" | "featured" | "deadline_soon">("all");

  const featuredPosts = useMemo(() => posts.filter((p) => p.isFeatured), [posts]);
  const categories = useMemo(() => [...new Set(posts.map((p) => p.category).filter(Boolean))], [posts]);
  const grades = useMemo(() => [...new Set(posts.flatMap((p) => p.targetGrade))], [posts]);
  const formats = useMemo(() => [...new Set(posts.map((p) => p.format).filter(Boolean))], [posts]);

  const now = new Date();
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const filtered = useMemo(() => {
    let result = posts;

    if (activeTab === "featured") {
      result = result.filter((p) => p.isFeatured);
    } else if (activeTab === "deadline_soon") {
      result = result.filter((p) => {
        if (!p.deadline) return false;
        const d = new Date(p.deadline);
        return d >= now && d <= oneWeekLater;
      });
    }

    if (keyword.trim()) {
      const kw = keyword.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(kw) ||
          p.summary.toLowerCase().includes(kw) ||
          p.tags.some((t) => t.toLowerCase().includes(kw))
      );
    }

    if (selectedCategory) result = result.filter((p) => p.category === selectedCategory);
    if (selectedGrade) result = result.filter((p) => p.targetGrade.includes(selectedGrade));
    if (selectedFormat) result = result.filter((p) => p.format === selectedFormat);

    if (deadlineFilter === "week") {
      result = result.filter((p) => {
        if (!p.deadline) return false;
        const d = new Date(p.deadline);
        return d >= now && d <= oneWeekLater;
      });
    } else if (deadlineFilter === "month") {
      result = result.filter((p) => {
        if (!p.deadline) return false;
        const d = new Date(p.deadline);
        return d >= now && d <= oneMonthLater;
      });
    }

    return result;
  }, [posts, keyword, selectedCategory, selectedGrade, selectedFormat, deadlineFilter, activeTab]);

  const resetFilters = () => {
    setKeyword("");
    setSelectedCategory("");
    setSelectedGrade("");
    setSelectedFormat("");
    setDeadlineFilter("all");
    setActiveTab("all");
  };

  return (
    <div>
      {/* 注目スライダー */}
      <FeaturedSlider posts={featuredPosts} />

      <h1>記事一覧</h1>

      {/* タブ（今週の注目を削除） */}
      <div>
        {(["all", "featured", "deadline_soon"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} aria-pressed={activeTab === tab}>
            {tab === "all" && "すべて"}
            {tab === "featured" && "⭐ おすすめ"}
            {tab === "deadline_soon" && "🔥 締切間近（1週間以内）"}
          </button>
        ))}
      </div>

      {/* キーワード検索 */}
      <input
        type="search"
        placeholder="キーワードで検索（タイトル・概要・タグ）"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

    {/* カテゴリボタン */}
<div>
  {[
    "コンテスト・大会",
    "インターンシップ",
    "ボランティア",
    "留学・国際",
    "研究・論文",
    "起業・ビジネス",
    "奨学金",
    "科学・テクノロジー",
  ].map((cat) => (
    <button
      key={cat}
      onClick={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
      aria-pressed={selectedCategory === cat}
    >
      {cat}
    </button>
  ))}
</div>

      {/* 絞り込み */}
      <div>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">カテゴリ：すべて</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}>
          <option value="">対象学年：すべて</option>
          {grades.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={selectedFormat} onChange={(e) => setSelectedFormat(e.target.value)}>
          <option value="">形式：すべて</option>
          {formats.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <select value={deadlineFilter} onChange={(e) => setDeadlineFilter(e.target.value as typeof deadlineFilter)}>
          <option value="all">締切：すべて</option>
          <option value="week">1週間以内</option>
          <option value="month">1ヶ月以内</option>
        </select>
        <button onClick={resetFilters}>リセット</button>
      </div>

      <p>{filtered.length}件</p>

      {filtered.length === 0 ? (
        <p>条件に一致する記事がありません。</p>
      ) : (
        <ul>
          {filtered.map((post) => (
            <li key={post.id}>
              {/* サムネイル */}
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  style={{ width: "100%", maxWidth: "300px", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
                />
              )}

              <Link href={`/posts/${post.id}`}>
                <h2>
                  {post.isFeatured && <span>⭐ </span>}
                  {post.title}
                </h2>
              </Link>

              {post.deadline && (
                <time dateTime={post.deadline}>
                  締切：{new Date(post.deadline).toLocaleDateString("ja-JP")}
                </time>
              )}
              {post.organizer && <p>主催者：{post.organizer}</p>}
              {post.category && <p>カテゴリ：{post.category}</p>}
              {post.region && <p>地域：{post.region}</p>}
              {post.fee && <p>参加費：{post.fee}</p>}
              {post.targetGrade.length > 0 && <p>対象学年：{post.targetGrade.join("、")}</p>}
              {post.tags.length > 0 && <p>タグ：{post.tags.join("、")}</p>}
              {post.summary && <p>{post.summary}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
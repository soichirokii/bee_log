"use client";

import { useState, useMemo } from "react";
import { Post } from "@/types/notion";
import Link from "next/link";

type Props = { posts: Post[] };

export default function PostListClient({ posts }: Props) {
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");
  const [deadlineFilter, setDeadlineFilter] = useState<"all" | "week" | "month">("all");
  const [activeTab, setActiveTab] = useState<"all" | "featured" | "deadline_soon" | "weekly">("all");

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
    } else if (activeTab === "weekly") {
      result = result.filter((p) => p.isFeatured);
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
      <h1>記事一覧</h1>

      {/* 発見タブ */}
      <div>
        {(["all", "featured", "deadline_soon", "weekly"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} aria-pressed={activeTab === tab}>
            {tab === "all" && "すべて"}
            {tab === "featured" && "⭐ おすすめ"}
            {tab === "deadline_soon" && "🔥 締切間近"}
            {tab === "weekly" && "👀 今週の注目"}
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

      {/* 件数 */}
      <p>{filtered.length}件</p>

      {/* 一覧 */}
      {filtered.length === 0 ? (
        <p>条件に一致する記事がありません。</p>
      ) : (
        <ul>
          {filtered.map((post) => (
            <li key={post.id}>
              <Link href={`/posts/${post.id}`}>
                <h2>{post.title}</h2>
              </Link>

              {post.isFeatured && <span>⭐ 注目</span>}

              {post.deadline && (
                <time dateTime={post.deadline}>
                  締切：{new Date(post.deadline).toLocaleDateString("ja-JP")}
                </time>
              )}

              {post.organizer && <p>主催者：{post.organizer}</p>}
              {post.category && <p>カテゴリ：{post.category}</p>}
              {post.region && <p>地域：{post.region}</p>}
              {post.fee && <p>参加費：{post.fee}</p>}

              {post.targetGrade.length > 0 && (
                <p>対象学年：{post.targetGrade.join("、")}</p>
              )}

              {post.tags.length > 0 && (
                <p>タグ：{post.tags.join("、")}</p>
              )}

              {post.summary && <p>{post.summary}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
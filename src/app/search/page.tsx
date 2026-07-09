import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/notion";
import { getCategoryByName } from "@/constants/categories";
import { Post } from "@/types/notion";
import SearchClient from "./SearchClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const sp = await props.searchParams;
  // 単一カテゴリで絞り込んだ検索結果は、対応するカテゴリ静的ページへ正規化（重複コンテンツ対策）
  const categoryParam = typeof sp.category === "string" ? sp.category : undefined;
  const matched = categoryParam ? getCategoryByName(categoryParam) : undefined;
  return {
    title: "活動を探す",
    description:
      "コンテスト、インターン、留学、イベントなど、10代向けの課外活動をカテゴリや締切から検索できます。",
    alternates: {
      canonical: matched ? `/category/${matched.slug}` : "/search",
    },
  };
}

export default async function SearchPage() {
  let posts: Post[] = [];
  try {
    posts = await getPublishedPosts();
  } catch (e) {
    console.error(e);
  }
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <SearchClient posts={posts} />
    </Suspense>
  );
}
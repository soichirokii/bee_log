import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/notion";
import { Post } from "@/types/notion";
import SearchClient from "./SearchClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "活動を探す",
  description:
    "コンテスト、インターン、留学、イベントなど、10代向けの課外活動をカテゴリや締切から検索できます。",
  alternates: {
    canonical: "/search",
  },
};

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
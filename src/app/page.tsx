import { Suspense } from "react";
import { getPublishedPosts } from "@/lib/notion";
import TopPageClient from "./TopPageClient";

export default async function Home() {
  const posts = await getPublishedPosts();

  return (
    <main>
      <h1 className="sr-only">
        BEE log | 10代のための探究・課外活動メディア
      </h1>

      <p className="sr-only">
        BEE logは、10代向けにコンテスト、インターン、留学、探究活動、イベントなどの挑戦機会を紹介するメディアです。
      </p>

      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        <TopPageClient posts={posts} />
      </Suspense>
    </main>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { getPublishedPosts, getPopularTags } from "@/lib/notion";
import TopPageClient from "./TopPageClient";

// ISR: 60秒ごとに再生成しCDNからHTMLを配信（データ側のfetchキャッシュも60秒で、実質の更新頻度は従来と同じ）
export const revalidate = 60;

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const [posts, popularTags] = await Promise.all([
    getPublishedPosts(),
    getPopularTags(),
  ]);

  return (
    <main>
      <h1 className="sr-only">
        BEE log | 10代のための探究・課外活動メディア
      </h1>

      <p className="sr-only">
        BEE logは、10代向けにコンテスト、インターン、留学、探究活動、イベントなどの挑戦機会を紹介するメディアです。
      </p>

      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        <TopPageClient posts={posts} popularTags={popularTags} />
      </Suspense>
    </main>
  );
}

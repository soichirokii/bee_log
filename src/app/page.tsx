import { Suspense } from "react";
import { getPublishedPosts } from "@/lib/notion";
import TopPageClient from "./TopPageClient";

export default async function Home() {
  const posts = await getPublishedPosts();
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <TopPageClient posts={posts} />
    </Suspense>
  );
}
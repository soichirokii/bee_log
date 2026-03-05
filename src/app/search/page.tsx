import { getPublishedPosts } from "@/lib/notion";
import { Post } from "@/types/notion";
import SearchClient from "./SearchClient";
import { Suspense } from "react";

export const revalidate = 60;

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
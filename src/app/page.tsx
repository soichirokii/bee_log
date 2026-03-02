import { getPublishedPosts } from "@/lib/notion";
import { Post } from "@/types/notion";
import PostListClient from "./PostListClient";

export const revalidate = 60;

export default async function PostListPage() {
  let posts: Post[] = [];

  try {
    posts = await getPublishedPosts();
  } catch (e) {
    console.error(e);
    return <div>データの取得に失敗しました。時間をおいて再度お試しください。</div>;
  }

  return <PostListClient posts={posts} />;
}
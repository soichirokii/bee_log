import { getPublishedPosts } from "@/lib/notion";
import { Post } from "@/types/notion";
import SearchClient from "./SearchClient";

export const revalidate = 60;

export default async function SearchPage() {
  let posts: Post[] = [];
  try {
    posts = await getPublishedPosts();
  } catch (e) {
    console.error(e);
  }
  return <SearchClient posts={posts} />;
}
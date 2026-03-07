import { getPublishedPosts } from "@/lib/notion";
import TopPageClient from "./TopPageClient";

export default async function Home() {
  const posts = await getPublishedPosts();
  return <TopPageClient posts={posts} />;
}
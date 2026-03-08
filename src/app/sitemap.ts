import { getPublishedPosts } from "@/lib/notion";

const BASE_URL = "https://www.beelog-jp.com";

export default async function sitemap() {
  const posts = await getPublishedPosts();

  const postUrls = posts.map((post) => ({
    url: `${BASE_URL}/posts/${post.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    ...postUrls,
  ];
}
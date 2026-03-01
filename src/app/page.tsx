import { getPublishedPosts } from "@/lib/notion";
import { Post } from "@/types/notion";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "記事一覧" };

// ページ全体を ISR（revalidate は lib/notion.ts の fetch 側で制御）
export const revalidate = 60;

export default async function PostListPage() {
  const posts: Post[] = await getPublishedPosts();

  return (
    <div>
      <h1>記事一覧</h1>

      {posts.length === 0 && <p>記事がありません。</p>}

      <ul>
        {posts.map((post) => (
  <li key={post.id}>
    <Link href={`/posts/${post.id}`}>
      <h2>{post.title}</h2>
    </Link>

    {post.deadline && (
      <time dateTime={post.deadline}>
        {new Date(post.deadline).toLocaleDateString("ja-JP")}
      </time>
    )}

    {post.organizer && <p>主催者：{post.organizer}</p>}
    {post.category && <p>カテゴリ：{post.category}</p>}
    {post.region && <p>地域：{post.region}</p>}
    {post.fee && <p>参加費：{post.fee}</p>}

    {post.targetGrade.length > 0 && (
      <p>対象学年：{post.targetGrade.join("、")}</p>
    )}

    {post.tags.length > 0 && (
      <p>タグ：{post.tags.join("、")}</p>
    )}

    {post.summary && <p>{post.summary}</p>}

    {post.isFeatured && <span>★ 注目</span>}
  </li>
))}
      </ul>
    </div>
  );
}
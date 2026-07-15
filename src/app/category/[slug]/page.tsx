import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPosts } from "@/lib/notion";
import { Post } from "@/types/notion";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ActivityCard from "@/app/components/ActivityCard";
import { CATEGORIES, slugToCategory, CATEGORY_TAG_CLASS } from "@/constants/categories";
import { BASE_URL } from "@/constants/site";

export const revalidate = 1800;

// JSON-LD を <script> に埋め込む際、< をエスケープして </script> ブレイクアウトを防ぐ
function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const category = slugToCategory(slug);
  if (!category) return { title: "Not Found" };
  const description = `10代・中高生向けの「${category.name}」の課外活動一覧。募集中のプログラムを締切が近い順に掲載しています。`;
  return {
    title: `${category.name}の課外活動一覧`,
    description,
    alternates: { canonical: `${BASE_URL}/category/${slug}` },
    openGraph: {
      type: "website",
      url: `${BASE_URL}/category/${slug}`,
      title: `${category.name}の課外活動一覧 | BEE log`,
      description,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = slugToCategory(slug);
  if (!category) notFound();

  let posts: Post[] = [];
  try {
    posts = await getPublishedPosts();
  } catch {
    posts = [];
  }
  const categoryPosts = posts.filter((p) => p.category === category.name);
  const otherCategories = CATEGORIES.filter((c) => c.slug !== slug);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: category.name },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.name}の課外活動一覧`,
    itemListElement: categoryPosts.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.title,
      url: `${BASE_URL}/posts/${p.slug}`,
    })),
  };

  return (
    <div className="min-h-screen bg-[#FFFFF0]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListJsonLd) }} />

      <Navbar />

      {/* パンくずリスト */}
      <nav aria-label="パンくずリスト" className="px-[5vw] md:px-16 pt-4 pb-1">
        <ol className="flex items-center gap-1.5 text-xs text-[#092040]/60 flex-wrap">
          <li>
            <Link href="/" className="hover:text-[#092040] transition-colors font-medium">ホーム</Link>
          </li>
          <li aria-hidden="true" className="select-none">›</li>
          <li aria-current="page" className="text-[#092040] font-bold">{category.name}</li>
        </ol>
      </nav>

      <main className="px-[5vw] md:px-16 py-8">
        <h1 className="text-[#092040] text-2xl md:text-3xl font-black mb-2 flex items-center gap-3">
          <span className="w-1.5 h-8 bg-[#FCBC2A] inline-block" />
          {category.name}の課外活動
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          募集中の「{category.name}」を締切が近い順に{categoryPosts.length}件掲載しています。
        </p>

        {categoryPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-12">
            {categoryPosts.map((post) => (
              <ActivityCard key={post.id} post={post} deadlineStyle="count" />
            ))}
          </div>
        ) : (
          <div className="bg-[#FFFFEE] rounded-2xl p-10 text-center mb-12">
            <p className="font-bold text-[#092040] mb-2">募集中の活動は現在ありません🐝</p>
            <p className="text-sm text-gray-400 mb-6">新しい活動は随時追加されます</p>
            <Link href="/search"
              className="inline-block bg-[#092040] text-white rounded-xl px-6 py-2 font-bold text-sm hover:opacity-80 transition-opacity">
              すべての活動を探す
            </Link>
          </div>
        )}

        {/* 内部リンク：他カテゴリへの導線 */}
        <section>
          <h2 className="text-[#092040] font-black text-lg mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#FCBC2A] inline-block" />他のカテゴリから探す
          </h2>
          <div className="flex flex-wrap gap-2">
            {otherCategories.map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}`}
                className={`${CATEGORY_TAG_CLASS} transition-colors hover:bg-[#FCBC2A]`}>
                {c.name}
              </Link>
            ))}
            <Link href="/search"
              className="bg-[#092040] text-white rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap hover:bg-[#FCBC2A] hover:text-[#092040] transition-colors">
              条件を指定して検索 →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

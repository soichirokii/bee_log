import { getPublishedPostsForCategory } from "@/lib/notion";
import { Post } from "@/types/notion";
import {
  CATEGORIES,
  getCategoryBySlug,
  CATEGORY_TAG_CLASS,
  SEASON_TAGS,
} from "@/constants/categories";
import { BASE_URL } from "@/constants/site";
import { daysUntilJst } from "@/lib/date";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import FallbackImage from "@/components/FallbackImage";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 3600;
// カテゴリは固定10件。generateStaticParams 外の slug は自動的に404にする
export const dynamicParams = false;

// JSON-LD を <script> に埋め込む際、< をエスケープして </script> ブレイクアウトを防ぐ
function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

// 活動期間ラベル（TopPage/Searchのカードと同じ判定）
function getPeriodLabel(period: string): "長期" | "中期" | "短期" | null {
  if (!period) return null;
  const text = period.replace(/\s/g, "");
  const monthMatch = text.match(/(\d+)ヶ?月/);
  if (monthMatch) { const d = parseInt(monthMatch[1]) * 30; return d >= 15 ? "長期" : d >= 7 ? "中期" : "短期"; }
  const weekMatch = text.match(/(\d+)週間?/);
  if (weekMatch) { const d = parseInt(weekMatch[1]) * 7; return d >= 15 ? "長期" : d >= 7 ? "中期" : "短期"; }
  const dayMatch = text.match(/(\d+)日/);
  if (dayMatch) { const d = parseInt(dayMatch[1]); return d >= 15 ? "長期" : d >= 7 ? "中期" : "短期"; }
  return null;
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "Not Found" };
  const title = `高校生向け${category.name}一覧`;
  const url = `${BASE_URL}/category/${slug}`;
  return {
    title, // layout の template により「… | BEE log」が付与される
    description: category.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${title} | BEE log`,
      description: category.description,
    },
  };
}

/* ── カテゴリページ用カード（サーバーコンポーネント／検索ページのカードとデザイン統一）── */
function ActivityCard({ post }: { post: Post }) {
  const daysLeft = post.deadline ? daysUntilJst(post.deadline) : null;
  const seasonTag = post.tags.find((t) => SEASON_TAGS.includes(t));
  const periodLabel = getPeriodLabel(post.period);

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group relative bg-[#FFFFF0] transition-all duration-300 overflow-hidden block"
    >
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-70 transition-opacity duration-300 z-10 pointer-events-none" />
      <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <span className="text-white text-lg font-bold tracking-widest">VIEW MORE</span>
      </div>
      <div className="w-full aspect-video bg-gray-200 relative overflow-hidden">
        {post.imageUrl
          ? <FallbackImage src={`/api/notion-image?pageId=${post.id}`} alt={post.title} fill className="object-cover" />
          : <Image src="/noimage.svg" alt="No Image" fill className="object-cover" />}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap max-w-[70%]">
          {post.isFeatured && <span className="bg-white text-[#092040] text-xs font-bold px-2 py-1 rounded-full border border-gray-200">おすすめ</span>}
          {seasonTag && <span className="bg-[#F59E0B] text-white text-xs font-bold px-2 py-1 rounded-full">{seasonTag}</span>}
          {periodLabel && <span className="bg-[#092040] text-white text-xs font-bold px-2 py-1 rounded-full">{periodLabel}</span>}
        </div>
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {(post.fee === "無料" || post.fee === "0円" || post.fee === "0") && <span className="bg-[#4ADE80] text-white text-xs font-bold px-2 py-1 rounded-full">無料</span>}
          {daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 && (
            <span className="relative inline-flex">
              <span className="absolute inset-0 bg-[#EF4444] rounded-full animate-ping opacity-60" />
              <span className="relative bg-[#EF4444] text-white text-xs font-bold px-2 py-1 rounded-full">締切間近</span>
            </span>
          )}
        </div>
      </div>
      <div className="p-4 bg-[#FFFFF0]">
        <div className="flex items-center gap-2 text-xs mb-2 flex-wrap">
          {post.category && <span className={CATEGORY_TAG_CLASS}>{post.category}</span>}
          {post.organizer && <span className="text-gray-400">{post.organizer}</span>}
        </div>
        <h3 className="font-bold text-[#092040] text-xl line-clamp-2">{post.title}</h3>
        {post.deadline && daysLeft !== null && (
          <p className={`text-xs mt-1.5 font-bold ${daysLeft < 0 ? "text-gray-400" : daysLeft <= 7 ? "text-[#EF4444]" : "text-gray-400"}`}>
            {daysLeft < 0 ? "締切済み" : daysLeft === 0 ? "本日締切" : `あと${daysLeft}日`}
          </p>
        )}
      </div>
    </Link>
  );
}

export default async function CategoryPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  let posts: Post[] = [];
  try {
    const all = await getPublishedPostsForCategory();
    posts = all.filter((p) => p.category === category.name);
  } catch {
    posts = [];
  }

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
    name: `高校生向け${category.name}一覧`,
    itemListElement: posts.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE_URL}/posts/${p.slug}`,
      name: p.title,
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

      {/* 見出し + 説明 */}
      <header className="px-[5vw] md:px-16 pt-6 pb-8">
        <h1 className="text-[#092040] text-2xl md:text-4xl font-black leading-tight flex items-center gap-3">
          <span className="w-1.5 h-8 md:h-10 bg-[#FCBC2A] inline-block" />
          高校生向け{category.name}の一覧
        </h1>
        <p className="text-gray-600 leading-relaxed mt-4 max-w-3xl">{category.description}</p>
      </header>

      {/* 記事グリッド or 0件 */}
      <section className="px-[5vw] md:px-16 pb-12">
        {posts.length > 0 ? (
          <>
            <p className="text-[#092040] font-bold mb-4 text-base">{posts.length} 件の活動</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {posts.map((post) => (
                <ActivityCard key={post.id} post={post} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-[#092040] font-bold text-lg mb-2">現在募集中の活動はありません</p>
            <p className="text-gray-500 text-sm mb-8">他のカテゴリから探してみよう</p>
            <div className="flex flex-wrap justify-center gap-2">
              {otherCategories.map((c) => (
                <Link key={c.slug} href={`/category/${c.slug}`} className={`${CATEGORY_TAG_CLASS} transition-colors hover:bg-[#FCBC2A]`}>
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 他のカテゴリ */}
      {posts.length > 0 && (
        <section className="px-[5vw] md:px-16 py-8 border-t border-gray-100">
          <h2 className="font-bold text-xl text-[#092040] mb-4">他のカテゴリ</h2>
          <div className="flex flex-wrap gap-2">
            {otherCategories.map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}`} className={`${CATEGORY_TAG_CLASS} transition-colors hover:bg-[#FCBC2A]`}>
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

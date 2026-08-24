import { getPostWithContentBySlug, getPostBySlug, getAllPublishedSlugs, getPublishedPosts } from "@/lib/notion";
import { Post, PostWithContent, NotionBlock, RichText } from "@/types/notion";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import FallbackImage from "@/components/FallbackImage";
import Link from "next/link";
import ShareButton from "@/app/components/ShareButton";
import MobileApplyButton from "@/app/components/MobileApplyButton";
import ApplyButton from "@/app/components/ApplyButton";
import TrackPageView from "@/app/components/TrackPageView";
import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
import ActivityCard from "@/app/components/ActivityCard";
import { CATEGORY_TAG_CLASS } from "@/constants/categories";
import { BASE_URL } from "@/constants/site";
import { daysUntilJst } from "@/lib/date";
import { toCloudinaryUrl, coverImageSrc, CARD_TRANSFORM } from "@/lib/cloudinary-url";

export const revalidate = 1800;

// OGP用（1200x630・f_jpgでTwitterのWebP非対応環境に対応）の変換。本文/JSON-LDは共通のCARD_TRANSFORM
const OGP_TRANSFORM = "c_fill,g_auto,w_1200,h_630,f_jpg,q_auto";

// JSON-LD を <script> に埋め込む際、< をエスケープして </script> ブレイクアウトを防ぐ
function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllPublishedSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  try {
    const post = await getPostBySlug(slug);
    if (!post) return { title: "Not Found" };
    // カバー画像がCloudinary（永続URL）なら記事別OGP、それ以外は固定画像にフォールバック
    const ogImage =
      post.imageUrl?.includes("res.cloudinary.com")
        ? toCloudinaryUrl(post.imageUrl, OGP_TRANSFORM)
        : `${BASE_URL}/ogp.png`;
    return {
      title: post.title,
      description: post.summary,
      alternates: {
        canonical: `${BASE_URL}/posts/${slug}`,
      },
      openGraph: {
        type: "article",
        url: `${BASE_URL}/posts/${slug}`,
        title: post.title,
        description: post.summary,
        images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.summary,
        images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
      },
    };
  } catch {
    return { title: "Error" };
  }
}

function RichTextRenderer({ items }: { items: RichText[] }) {
  return (
    <>
      {items.map((rt, i) => {
        let node: React.ReactNode = rt.plain_text;
        if (rt.annotations.code) node = <code key={i} className="bg-gray-100 px-1 rounded text-sm font-mono">{node}</code>;
        if (rt.annotations.bold) node = <strong key={i} className="font-bold">{node}</strong>;
        if (rt.annotations.italic) node = <em key={i}>{node}</em>;
        if (rt.annotations.strikethrough) node = <s key={i}>{node}</s>;
        if (rt.annotations.underline) node = <u key={i}>{node}</u>;
        if (rt.href) node = <a key={i} href={rt.href} target="_blank" rel="noopener noreferrer" className="text-[#092040] underline hover:opacity-70">{node}</a>;
        return <span key={i}>{node}</span>;
      })}
    </>
  );
}

function BlockRenderer({ block }: { block: NotionBlock }) {
  switch (block.type) {
    case "heading_1":
      return <h1 className="text-2xl font-black text-[#092040] mt-8 mb-4"><RichTextRenderer items={block.richText} /></h1>;
    case "heading_2":
      return <h2 className="text-xl font-black text-[#092040] mt-6 mb-3 flex items-center gap-2"><span className="w-1 h-6 bg-[#FCBC2A] inline-block" /><RichTextRenderer items={block.richText} /></h2>;
    case "heading_3":
      return <h3 className="text-lg font-bold text-[#092040] mt-4 mb-2"><RichTextRenderer items={block.richText} /></h3>;
    case "paragraph":
      return (
        <p className="text-gray-700 leading-relaxed mb-4">
          {block.richText.length > 0 ? <RichTextRenderer items={block.richText} /> : <br />}
        </p>
      );
    case "bulleted_list_item":
      return <li className="text-gray-700 leading-relaxed ml-4"><RichTextRenderer items={block.richText} /></li>;
    case "numbered_list_item":
      return <li className="text-gray-700 leading-relaxed ml-4"><RichTextRenderer items={block.richText} /></li>;
    case "code":
      return (
        <pre className="bg-gray-900 text-green-400 p-4 overflow-x-auto mb-4 text-sm">
          <code><RichTextRenderer items={block.richText} /></code>
        </pre>
      );
    case "quote":
      return (
        <blockquote className="border-l-4 border-[#FCBC2A] pl-4 my-4 text-gray-600 italic">
          <RichTextRenderer items={block.richText} />
        </blockquote>
      );
    case "divider":
      return <hr className="border-gray-200 my-8" />;
    case "image":
      return block.imageUrl ? (
        <figure className="my-6">
          <div className="relative w-full aspect-video overflow-hidden">
            <FallbackImage src={`/api/notion-image?blockId=${block.id}`} alt={block.caption?.[0]?.plain_text ?? ""} fill className="object-cover" />
          </div>
          {block.caption && block.caption.length > 0 && (
            <figcaption className="text-center text-sm text-gray-400 mt-2">
              <RichTextRenderer items={block.caption} />
            </figcaption>
          )}
        </figure>
      ) : null;
    default:
      return null;
  }
}

function BlocksRenderer({ blocks }: { blocks: NotionBlock[] }) {
  const result: React.ReactNode[] = [];
  let i = 0;
  while (i < blocks.length) {
    const block = blocks[i];
    if (block.type === "bulleted_list_item") {
      const items: NotionBlock[] = [];
      while (i < blocks.length && blocks[i].type === "bulleted_list_item") { items.push(blocks[i]); i++; }
      result.push(<ul key={`ul-${block.id}`} className="list-disc mb-4 space-y-1">{items.map((b) => <BlockRenderer key={b.id} block={b} />)}</ul>);
      continue;
    }
    if (block.type === "numbered_list_item") {
      const items: NotionBlock[] = [];
      while (i < blocks.length && blocks[i].type === "numbered_list_item") { items.push(blocks[i]); i++; }
      result.push(<ol key={`ol-${block.id}`} className="list-decimal mb-4 space-y-1">{items.map((b) => <BlockRenderer key={b.id} block={b} />)}</ol>);
      continue;
    }
    result.push(<BlockRenderer key={block.id} block={block} />);
    i++;
  }
  return <>{result}</>;
}

/* ── 関連活動スコアリング ── */
function getRelatedPosts(allPosts: Post[], current: PostWithContent, count = 3): Post[] {
  return allPosts
    .filter((p) => p.id !== current.id)
    .map((p) => {
      let score = 0;
      if (p.category && p.category === current.category) score += 10;
      current.tags.forEach((tag) => { if (p.tags.includes(tag)) score += 1; });
      return { post: p, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ post }) => post);
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([
    getPostWithContentBySlug(slug),
    getPublishedPosts(),
  ]);
  if (!post) notFound();
  const relatedPosts = getRelatedPosts(allPosts, post);

  const daysLeft = post.deadline ? daysUntilJst(post.deadline) : null;

  const postUrl = `${BASE_URL}/posts/${post.slug}`;
  // カテゴリ絞り込みは検索ページで行う
  const categoryHref = `/search?category=${encodeURIComponent(post.category)}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary,
    image: post.imageUrl?.includes("res.cloudinary.com")
      ? toCloudinaryUrl(post.imageUrl, CARD_TRANSFORM)
      : `${BASE_URL}/ogp.png`,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: post.organizer || "BEE log" },
    publisher: { "@type": "Organization", name: "BEE log", url: BASE_URL },
    url: postUrl,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: BASE_URL },
      ...(post.category
        ? [{ "@type": "ListItem", position: 2, name: post.category, item: `${BASE_URL}${categoryHref}` }]
        : []),
      { "@type": "ListItem", position: post.category ? 3 : 2, name: post.title },
    ],
  };

  return (
    <div className="min-h-screen bg-[#FFFFF0]">
      <TrackPageView activityId={post.id} slug={post.slug} category={post.category} tags={post.tags} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />

      <Navbar />
      {/* パンくずリスト */}
      <nav aria-label="パンくずリスト" className="px-[5vw] md:px-16 pt-4 pb-1">
        <ol className="flex items-center gap-1.5 text-xs text-[#092040]/60 flex-wrap">
          <li>
            <Link href="/" className="hover:text-[#092040] transition-colors font-medium">ホーム</Link>
          </li>
          {post.category && (
            <>
              <li aria-hidden="true" className="select-none">›</li>
              <li>
                <Link
                  href={categoryHref}
                  className="hover:text-[#092040] transition-colors font-medium"
                >
                  {post.category}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true" className="select-none">›</li>
          <li aria-current="page" className="text-[#092040] font-bold truncate max-w-[180px] md:max-w-xs">
            {post.title}
          </li>
        </ol>
      </nav>

      {/* ヘッダー画像 */}
      <div className="px-[5vw] md:px-16 pt-8">
        <div className="relative w-full h-48 md:h-80 bg-gray-200 overflow-hidden">
          {post.imageUrl ? (
            <FallbackImage src={coverImageSrc(post.imageUrl, post.id)} alt={post.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#FCBC2A] to-[#092040]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            {post.category && (
              <Link href={categoryHref} className={`${CATEGORY_TAG_CLASS} mb-3 inline-block hover:bg-[#FCBC2A] transition-colors`}>
                {post.category}
              </Link>
            )}
            <h1 className="text-white text-2xl md:text-4xl font-black leading-tight drop-shadow">{post.title}</h1>
            {post.organizer && <p className="text-white/70 text-sm mt-2">{post.organizer}</p>}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="px-[5vw] md:px-16 py-8">
        <div className="flex flex-col md:flex-row gap-8">

          {/* 左：本文 */}
          <div className="flex-1 p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {post.deadline && (
                <div className="p-3 border-b border-gray-200">
                  <div className="text-xs text-gray-400 mb-1">応募締切</div>
                  <div className={`text-sm font-bold flex items-center gap-1.5 ${daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 ? "text-[#EF4444]" : "text-[#092040]"}`}>
                    <Image src="/icons/Calendar.svg" alt="" width={16} height={16} />
                    {new Date(post.deadline).toLocaleDateString("ja-JP")}
                  </div>
                </div>
              )}
              {post.period && (
                <div className="p-3 border-b border-gray-200">
                  <div className="text-xs text-gray-400 mb-1">活動期間</div>
                  <div className="text-sm font-bold text-[#092040] flex items-center gap-1.5">
                    <Image src="/icons/Clock.svg" alt="" width={16} height={16} />
                    {post.period}
                  </div>
                </div>
              )}
              {post.targetGrade.length > 0 && (
                <div className="p-3 border-b border-gray-200">
                  <div className="text-xs text-gray-400 mb-1">対象学年</div>
                  <div className="text-sm font-bold text-[#092040] flex items-center gap-1.5">
                    <Image src="/icons/Graduation Cap.svg" alt="" width={16} height={16} />
                    {post.targetGrade.join("・")}
                  </div>
                </div>
              )}
              {post.format && (
                <div className="p-3 border-b border-gray-200">
                  <div className="text-xs text-gray-400 mb-1">形式</div>
                  <div className="text-sm font-bold text-[#092040] flex items-center gap-1.5">
                    <Image src="/icons/PC.svg" alt="" width={16} height={16} />
                    {post.format}
                  </div>
                </div>
              )}
              {post.region && (
                <div className="p-3 border-b border-gray-200">
                  <div className="text-xs text-gray-400 mb-1">地域</div>
                  <div className="text-sm font-bold text-[#092040] flex items-center gap-1.5">
                    <Image src="/icons/Pin.svg" alt="" width={16} height={16} />
                    {post.region}
                  </div>
                </div>
              )}
              {post.fee && (
                <div className="p-3 border-b border-gray-200">
                  <div className="text-xs text-gray-400 mb-1">参加費</div>
                  <div className="text-sm font-bold text-[#092040] flex items-center gap-1.5">
                    <Image src="/icons/Dollar Bag.svg" alt="" width={16} height={16} />
                    {post.fee}
                  </div>
                </div>
              )}
            </div>

            {post.summary && (
              <div className="mb-8">
                <h2 className="text-[#092040] font-black text-lg mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#FCBC2A] inline-block" />概要
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{post.summary}</p>
              </div>
            )}

            {post.tags.length > 0 && (
              <div className="mb-8">
                <h2 className="text-[#092040] font-black text-lg mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#FCBC2A] inline-block" />タグ
                </h2>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}
                      className="bg-[#FCBC2A]/20 text-[#092040] text-xs font-bold px-3 py-1 hover:bg-[#FCBC2A] transition-colors">
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {post.blocks.length > 0 && (
              <div className="border-t pt-8">
                <h2 className="text-[#092040] font-black text-lg mb-6 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#FCBC2A] inline-block" />詳細
                </h2>
                <BlocksRenderer blocks={post.blocks} />
              </div>
            )}
          </div>

          {/* 右：応募サイドバー */}
          <div className="md:w-64 shrink-0">
            <div className="bg-[#FFFFF0] p-6 sticky top-24">
              {post.applyUrl ? (
                <ApplyButton id="apply-button-sidebar" applyUrl={post.applyUrl} activityId={post.id} slug={post.slug}
                  className="block w-full bg-[#092040] text-white font-bold text-center py-4 rounded-xl transition-all duration-200 hover:bg-[#FCBC2A] hover:text-[#092040] hover:scale-[1.02] active:scale-95 mb-3" />
              ) : (
                <div className="w-full bg-gray-100 text-gray-400 font-bold text-center py-4 mb-3">
                  応募URLなし
                </div>
              )}
              <p className="text-xs text-gray-400 text-center mb-6">※ 外部サイトへ移動します</p>

              {daysLeft !== null && (
                <div className="p-4 text-center mb-4">
                  {daysLeft < 0 ? (
                    <>
                      <div className="text-xs text-gray-400 mb-1">締切</div>
                      <div className="text-sm font-black text-gray-400">締切済み</div>
                    </>
                  ) : (
                    <>
                      <div className="text-xs text-gray-400 mb-1">締切まで</div>
                      <div className={`text-3xl font-black ${daysLeft <= 7 ? "text-[#EF4444]" : "text-[#092040]"}`}>
                        {daysLeft}<span className="text-sm font-bold ml-1">日</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              <Link href="/search"
                className="block w-full border-2 border-[#092040] text-[#092040] font-bold text-center py-3 hover:bg-[#092040] hover:text-white transition-colors text-sm mb-3">
                ← 活動一覧に戻る
              </Link>

              <ShareButton slug={slug} title={post.title} />
            </div>
          </div>

        </div>
      </div>

      {/* 関連する活動 */}
      {relatedPosts.length > 0 && (
        <section className="px-[5vw] md:px-16 py-8 border-t border-gray-100">
          <h2 className="font-bold text-xl text-[#092040] mb-6">関連する活動</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedPosts.map((p) => (
              <ActivityCard key={p.id} post={p} deadlineStyle="date" />
            ))}
          </div>
        </section>
      )}

      <MobileApplyButton applyUrl={post.applyUrl} daysLeft={daysLeft} activityId={post.id} slug={post.slug} />
      <div className="md:hidden h-24" />
      <Footer />
    </div>
  );
}

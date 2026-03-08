import { getPostWithContent, getAllPublishedSlugs } from "@/lib/notion";
import { NotionBlock, RichText } from "@/types/notion";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ShareButton from "@/app/components/ShareButton";

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  try {
    const post = await getPostWithContent(slug);
    if (!post) return { title: "Not Found" };

    const ogImage = post.imageUrl ?? "https://www.beelog-jp.com/ogp.png";

    return {
      title: post.title,
      description: post.summary,
      openGraph: {
        type: "article",
        url: `https://www.beelog-jp.com/posts/${slug}`,
        title: post.title,
        description: post.summary,
        images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.summary,
        images: [ogImage],
      },
    };
  } catch {
    return { title: "Error" };
  }
}

const CATEGORY_BG: Record<string, string> = {
  "コンテスト・大会": "bg-orange-100 text-orange-700",
  "インターンシップ": "bg-lime-100 text-lime-700",
  "ボランティア": "bg-blue-100 text-blue-700",
  "留学・国際": "bg-red-100 text-red-700",
  "研究・論文": "bg-purple-100 text-purple-700",
  "起業・ビジネス": "bg-blue-100 text-blue-700",
  "奨学金": "bg-green-100 text-green-700",
  "科学・テクノロジー": "bg-pink-100 text-pink-700",
};

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
      return <h2 className="text-xl font-black text-[#092040] mt-6 mb-3 flex items-center gap-2"><span className="w-1 h-6 bg-[#FCBC2A] rounded-full inline-block" /><RichTextRenderer items={block.richText} /></h2>;
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
        <pre className="bg-gray-900 text-green-400 p-4 rounded-2xl overflow-x-auto mb-4 text-sm">
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
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
            <Image src={block.imageUrl} alt={block.caption?.[0]?.plain_text ?? ""} fill className="object-cover" />
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

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostWithContent(slug);
  if (!post) notFound();

  const now = new Date();
  const daysLeft = post.deadline
    ? Math.ceil((new Date(post.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const categoryStyle = post.category ? CATEGORY_BG[post.category] ?? "bg-gray-100 text-gray-700" : "";

  return (
    <div className="min-h-screen bg-[#FFFFF0]">

      {/* PC Navbar */}
      <nav className="hidden md:flex items-center px-16 py-4 bg-[#FFFFF0] border-b-2 border-[#092040] sticky top-0 z-50">
        <Link href="/" className="mr-10 transition-opacity duration-200 hover:opacity-70">
          <Image src="/Logo.svg" alt="BEE log" width={120} height={48} className="h-12 w-auto" />
        </Link>
        <Link href="/"
          className="text-base font-bold px-6 py-2.5 rounded-full mr-3 text-[#092040] transition-all duration-200 hover:bg-[#FCBC2A] hover:text-[#092040]">
          HOME
        </Link>
        <Link href="/search"
          className="text-base font-bold px-6 py-2.5 rounded-full bg-[#FCBC2A] text-[#092040] transition-all duration-200 hover:bg-[#092040] hover:text-white">
          活動を探す
        </Link>
      </nav>

      {/* Mobile Navbar */}
      <nav className="md:hidden flex items-center bg-[#FFFFF0] border-b-2 border-[#092040] px-[5vw] py-[3vw] sticky top-0 z-50">
        <div className="flex-1" />
        <Link href="/" className="flex justify-center">
          <Image src="/Logo.svg" alt="BEE log" width={120} height={48} className="h-[10vw] w-auto" />
        </Link>
        <div className="flex-1 flex justify-end">
          <Link href="/search" className="bg-[#FCBC2A] text-[#092040] font-bold text-[3.5vw] px-[4vw] py-[2vw] rounded-full">探す</Link>
        </div>
      </nav>

      {/* ヘッダー画像 */}
      <div className="relative w-full h-48 md:h-80 bg-gray-200">
        {post.imageUrl ? (
          <Image src={post.imageUrl} alt={post.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#FCBC2A] to-[#092040]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          {post.category && (
            <span className={`text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block ${categoryStyle}`}>
              {post.category}
            </span>
          )}
          <h1 className="text-white text-2xl md:text-4xl font-black leading-tight drop-shadow">{post.title}</h1>
          {post.organizer && <p className="text-white/70 text-sm mt-2">{post.organizer}</p>}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="px-[5vw] md:px-16 py-8">
        <div className="flex flex-col md:flex-row gap-8">

          {/* 左：本文 */}
          <div className="flex-1 bg-[#FFFFF0] rounded-3xl p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {post.deadline && (
                <div className={`rounded-2xl p-3 ${daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 ? "bg-red-50 border border-red-200" : "bg-gray-50"}`}>
                  <div className="text-xs text-gray-400 mb-1">応募締切</div>
                  <div className={`text-sm font-bold flex items-center gap-1.5 ${daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 ? "text-[#EF4444]" : "text-[#092040]"}`}>
                    <Image src="/icons/Calendar.svg" alt="" width={16} height={16} />
                    {new Date(post.deadline).toLocaleDateString("ja-JP")}
                  </div>
                </div>
              )}
              {post.period && (
                <div className="rounded-2xl p-3 bg-gray-50">
                  <div className="text-xs text-gray-400 mb-1">活動期間</div>
                  <div className="text-sm font-bold text-[#092040] flex items-center gap-1.5">
                    <Image src="/icons/Clock.svg" alt="" width={16} height={16} />
                    {post.period}
                  </div>
                </div>
              )}
              {post.targetGrade.length > 0 && (
                <div className="rounded-2xl p-3 bg-gray-50">
                  <div className="text-xs text-gray-400 mb-1">対象学年</div>
                  <div className="text-sm font-bold text-[#092040] flex items-center gap-1.5">
                    <Image src="/icons/Graduation Cap.svg" alt="" width={16} height={16} />
                    {post.targetGrade.join("・")}
                  </div>
                </div>
              )}
              {post.format && (
                <div className="rounded-2xl p-3 bg-gray-50">
                  <div className="text-xs text-gray-400 mb-1">形式</div>
                  <div className="text-sm font-bold text-[#092040] flex items-center gap-1.5">
                    <Image src="/icons/PC.svg" alt="" width={16} height={16} />
                    {post.format}
                  </div>
                </div>
              )}
              {post.region && (
                <div className="rounded-2xl p-3 bg-gray-50">
                  <div className="text-xs text-gray-400 mb-1">地域</div>
                  <div className="text-sm font-bold text-[#092040] flex items-center gap-1.5">
                    <Image src="/icons/Pin.svg" alt="" width={16} height={16} />
                    {post.region}
                  </div>
                </div>
              )}
              {post.fee && (
                <div className="rounded-2xl p-3 bg-gray-50">
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
                  <span className="w-1 h-5 bg-[#FCBC2A] rounded-full inline-block" />概要
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{post.summary}</p>
              </div>
            )}

            {post.tags.length > 0 && (
              <div className="mb-8">
                <h2 className="text-[#092040] font-black text-lg mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#FCBC2A] rounded-full inline-block" />タグ
                </h2>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}
                      className="bg-[#FCBC2A]/20 text-[#092040] text-xs font-bold px-3 py-1 rounded-full hover:bg-[#FCBC2A] transition-colors">
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {post.blocks.length > 0 && (
              <div className="border-t pt-8">
                <h2 className="text-[#092040] font-black text-lg mb-6 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#FCBC2A] rounded-full inline-block" />詳細
                </h2>
                <BlocksRenderer blocks={post.blocks} />
              </div>
            )}
          </div>

          {/* 右：応募サイドバー */}
          <div className="md:w-64 shrink-0">
            <div className="bg-[#FFFFF0] rounded-3xl p-6 sticky top-24">              {post.applyUrl ? (
                <a href={post.applyUrl} target="_blank" rel="noopener noreferrer"
                  className="block w-full bg-[#092040] text-white font-bold text-center py-4 rounded-2xl hover:opacity-90 transition-opacity mb-3">
                  応募する →
                </a>
              ) : (
                <div className="w-full bg-gray-100 text-gray-400 font-bold text-center py-4 rounded-2xl mb-3">
                  応募URLなし
                </div>
              )}
              <p className="text-xs text-gray-400 text-center mb-6">※ 外部サイトへ移動します</p>

              {daysLeft !== null && daysLeft >= 0 && (
                <div className={`rounded-2xl p-4 text-center mb-4 ${daysLeft <= 7 ? "bg-red-50" : "bg-gray-50"}`}>
                  <div className="text-xs text-gray-400 mb-1">締切まで</div>
                  <div className={`text-3xl font-black ${daysLeft <= 7 ? "text-[#EF4444]" : "text-[#092040]"}`}>
                    {daysLeft}<span className="text-sm font-bold ml-1">日</span>
                  </div>
                </div>
              )}

              <Link href="/search"
                className="block w-full border-2 border-[#092040] text-[#092040] font-bold text-center py-3 rounded-2xl hover:bg-[#092040] hover:text-white transition-colors text-sm mb-3">
                ← 活動一覧に戻る
              </Link>

              <ShareButton slug={slug} title={post.title} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
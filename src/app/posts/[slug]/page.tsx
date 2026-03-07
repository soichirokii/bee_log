import { getPostWithContent, getAllPublishedSlugs } from "@/lib/notion";
import { NotionBlock, RichText } from "@/types/notion";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

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
    return { title: post.title, description: post.summary };
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
  "科学・理系": "bg-pink-100 text-pink-700",
  "宿泊イベント・キャンプ": "bg-sky-100 text-sky-700",
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
    <div className="min-h-screen bg-[#FCBC2A]">
      {/* Navbar */}
      <nav className="flex items-center bg-[#FCBC2A] px-[5vw] py-[3vw] md:px-6 md:py-4 sticky top-0 z-50">
        <div className="flex-1" />
        <Link href="/">
          <Image src="/logo.png" alt="BEE log" width={120} height={64} className="h-[10vw] md:h-16 w-auto" />
        </Link>
        <div className="flex-1 flex justify-end">
          <Link href="/search" className="bg-[#092040] text-white font-bold text-[3.5vw] md:text-sm px-[4vw] md:px-6 py-[2vw] md:py-2.5 rounded-full">
            活動を探す
          </Link>
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
          {post.organizer && <p className="text-white/70 text-sm mt-2">🏢 {post.organizer}</p>}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">

          {/* 左：本文 */}
          <div className="flex-1 bg-white rounded-3xl p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {post.deadline && (
                <div className={`rounded-2xl p-3 ${daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 ? "bg-red-50 border border-red-200" : "bg-gray-50"}`}>
                  <div className="text-xs text-gray-400 mb-1">応募締切</div>
                  <div className={`text-sm font-bold ${daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 ? "text-[#EF4444]" : "text-[#092040]"}`}>
                    📅 {new Date(post.deadline).toLocaleDateString("ja-JP")}
                  </div>
                </div>
              )}
              {post.period && (
                <div className="rounded-2xl p-3 bg-gray-50">
                  <div className="text-xs text-gray-400 mb-1">活動期間</div>
                  <div className="text-sm font-bold text-[#092040]">⏱️ {post.period}</div>
                </div>
              )}
              {post.targetGrade.length > 0 && (
                <div className="rounded-2xl p-3 bg-gray-50">
                  <div className="text-xs text-gray-400 mb-1">対象学年</div>
                  <div className="text-sm font-bold text-[#092040]">🎓 {post.targetGrade.join("・")}</div>
                </div>
              )}
              {post.format && (
                <div className="rounded-2xl p-3 bg-gray-50">
                  <div className="text-xs text-gray-400 mb-1">形式</div>
                  <div className="text-sm font-bold text-[#092040]">💻 {post.format}</div>
                </div>
              )}
              {post.region && (
                <div className="rounded-2xl p-3 bg-gray-50">
                  <div className="text-xs text-gray-400 mb-1">地域</div>
                  <div className="text-sm font-bold text-[#092040]">📍 {post.region}</div>
                </div>
              )}
              {post.fee && (
                <div className="rounded-2xl p-3 bg-gray-50">
                  <div className="text-xs text-gray-400 mb-1">参加費</div>
                  <div className="text-sm font-bold text-[#092040]">💰 {post.fee}</div>
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
                    <Link key={tag} href={`/search?tag=${encodeURIComponent(tag)}`}
                      className="bg-[#FCBC2A]/20 text-[#092040] text-xs font-bold px-3 py-1 rounded-full hover:bg-[#FCBC2A]/40 transition-colors">
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
            <div className="bg-white rounded-3xl p-6 sticky top-24">
              {post.applyUrl ? (
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
                className="block w-full border-2 border-[#092040] text-[#092040] font-bold text-center py-3 rounded-2xl hover:bg-[#092040] hover:text-white transition-colors text-sm">
                ← 活動一覧に戻る
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* フッター */}
      <footer className="bg-[#FCBC2A] py-10 px-6 border-t border-[#092040]/10 mt-16">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-10">
          <div className="w-48 shrink-0">
            <Link href="/"><Image src="/logo.png" alt="BEE log" width={120} height={64} className="h-16 w-auto" /></Link>
          </div>
          <div className="flex-1">
            <h3 className="text-[#092040] font-bold mb-4">プラットフォーム</h3>
            <ul><li><Link href="/search" className="text-[#092040] text-sm hover:underline">活動を探す</Link></li></ul>
          </div>
          <div className="flex-1">
            <h3 className="text-[#092040] font-bold mb-4">サポート</h3>
            <ul className="flex flex-col gap-3">
              <li><a href="#" className="text-[#092040] text-sm hover:underline">お問い合わせ</a></li>
              <li><a href="#" className="text-[#092040] text-sm hover:underline">プライバシーポリシー</a></li>
              <li><a href="#" className="text-[#092040] text-sm hover:underline">利用規約</a></li>
            </ul>
          </div>
          <div className="flex-1">
            <h3 className="text-[#092040] font-bold mb-4">つながる</h3>
            <div className="flex gap-4">
              <a href="#" className="text-[#092040] hover:opacity-70">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="text-[#092040] hover:opacity-70">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
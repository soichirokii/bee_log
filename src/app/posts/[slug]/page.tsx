import { getPostWithContent, getAllPublishedSlugs } from "@/lib/notion";
import { NotionBlock, RichText } from "@/types/notion";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// ────────────────────────────────────────────
// 静的パス生成
// ────────────────────────────────────────────
export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

// ── メタデータ ────────────────────────────────
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  try {
    const post = await getPostWithContent(slug);
    if (!post) return { title: "Not Found" };
    return {
      title: post.title,
      description: post.summary,  // ✅ description → summary
    };
  } catch {
    return { title: "Error" };
  }
}

// ────────────────────────────────────────────
// RichTextレンダラー
// ────────────────────────────────────────────
function RichTextRenderer({ items }: { items: RichText[] }) {
  return (
    <>
      {items.map((rt, i) => {
        let node: React.ReactNode = rt.plain_text;

        if (rt.annotations.code) node = <code key={i}>{node}</code>;
        if (rt.annotations.bold) node = <strong key={i}>{node}</strong>;
        if (rt.annotations.italic) node = <em key={i}>{node}</em>;
        if (rt.annotations.strikethrough) node = <s key={i}>{node}</s>;
        if (rt.annotations.underline) node = <u key={i}>{node}</u>;
        if (rt.href) node = <a key={i} href={rt.href} target="_blank" rel="noopener noreferrer">{node}</a>;

        return <span key={i}>{node}</span>;
      })}
    </>
  );
}

// ────────────────────────────────────────────
// ブロックレンダラー
// ────────────────────────────────────────────
function BlockRenderer({ block }: { block: NotionBlock }) {
  switch (block.type) {
    case "heading_1":
      return <h1><RichTextRenderer items={block.richText} /></h1>;
    case "heading_2":
      return <h2><RichTextRenderer items={block.richText} /></h2>;
    case "heading_3":
      return <h3><RichTextRenderer items={block.richText} /></h3>;
    case "paragraph":
      return (
        <p>
          {block.richText.length > 0 ? (
            <RichTextRenderer items={block.richText} />
          ) : (
            <br />
          )}
        </p>
      );
    case "bulleted_list_item":
      return <li><RichTextRenderer items={block.richText} /></li>;
    case "numbered_list_item":
      return <li><RichTextRenderer items={block.richText} /></li>;
    case "code":
      return (
        <pre>
          <code data-language={block.language}>
            <RichTextRenderer items={block.richText} />
          </code>
        </pre>
      );
    case "quote":
      return (
        <blockquote>
          <RichTextRenderer items={block.richText} />
        </blockquote>
      );
    case "divider":
      return <hr />;
    case "image":
      return block.imageUrl ? (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.imageUrl} alt={block.caption?.[0]?.plain_text ?? ""} />
          {block.caption && block.caption.length > 0 && (
            <figcaption>
              <RichTextRenderer items={block.caption} />
            </figcaption>
          )}
        </figure>
      ) : null;
    default:
      return null;
  }
}

// ────────────────────────────────────────────
// ブロックリストレンダラー（ul/ol をまとめる）
// ────────────────────────────────────────────
function BlocksRenderer({ blocks }: { blocks: NotionBlock[] }) {
  const result: React.ReactNode[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    if (block.type === "bulleted_list_item") {
      const items: NotionBlock[] = [];
      while (i < blocks.length && blocks[i].type === "bulleted_list_item") {
        items.push(blocks[i]);
        i++;
      }
      result.push(
        <ul key={`ul-${block.id}`}>
          {items.map((b) => <BlockRenderer key={b.id} block={b} />)}
        </ul>
      );
      continue;
    }

    if (block.type === "numbered_list_item") {
      const items: NotionBlock[] = [];
      while (i < blocks.length && blocks[i].type === "numbered_list_item") {
        items.push(blocks[i]);
        i++;
      }
      result.push(
        <ol key={`ol-${block.id}`}>
          {items.map((b) => <BlockRenderer key={b.id} block={b} />)}
        </ol>
      );
      continue;
    }

    result.push(<BlockRenderer key={block.id} block={block} />);
    i++;
  }

  return <>{result}</>;
}

// ────────────────────────────────────────────
// ページコンポーネント
// ────────────────────────────────────────────
export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostWithContent(slug);

  if (!post) notFound();

  return (
    <article>
      <h1>{post.title}</h1>

      <dl>
        {post.organizer && (
          <>
            <dt>主催者</dt>
            <dd>{post.organizer}</dd>
          </>
        )}
        {post.category && (
          <>
            <dt>カテゴリ</dt>
            <dd>{post.category}</dd>
          </>
        )}
        {post.deadline && (
          <>
            <dt>応募締切</dt>
            <dd>
              <time dateTime={post.deadline}>
                {new Date(post.deadline).toLocaleDateString("ja-JP")}
              </time>
            </dd>
          </>
        )}
        {post.period && (
          <>
            <dt>活動期間</dt>
            <dd>{post.period}</dd>
          </>
        )}
        {post.targetGrade.length > 0 && (
          <>
            <dt>対象学年</dt>
            <dd>{post.targetGrade.join("、")}</dd>
          </>
        )}
        {post.format && (
          <>
            <dt>形式</dt>
            <dd>{post.format}</dd>
          </>
        )}
        {post.region && (
          <>
            <dt>地域</dt>
            <dd>{post.region}</dd>
          </>
        )}
        {post.fee && (
          <>
            <dt>参加費</dt>
            <dd>{post.fee}</dd>
          </>
        )}
        {post.tags.length > 0 && (
          <>
            <dt>タグ</dt>
            <dd>{post.tags.join("、")}</dd>
          </>
        )}
        {post.applyUrl && (
          <>
            <dt>応募URL</dt>
            <dd>
              <a href={post.applyUrl} target="_blank" rel="noopener noreferrer">
                {post.applyUrl}
              </a>
            </dd>
          </>
        )}
      </dl>

      {post.summary && (
        <>
          <h2>概要</h2>
          <p>{post.summary}</p>
        </>
      )}

      <hr />

      <BlocksRenderer blocks={post.blocks} />
    </article>
  );
}
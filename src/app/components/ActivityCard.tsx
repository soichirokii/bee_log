"use client";

import Link from "next/link";
import Image from "next/image";
import FallbackImage from "@/components/FallbackImage";
import { Post } from "@/types/notion";
import { CATEGORY_TAG_CLASS, SEASON_TAGS } from "@/constants/categories";
import { daysUntilJst } from "@/lib/date";
import { getPeriodLabel } from "@/lib/period";
import { isFree } from "@/lib/fee";
import { coverImageSrc } from "@/lib/cloudinary-url";
import { track } from "@/lib/track";

// 締切表示の出し分け:
//   "none"  … 表示しない（トップページ）
//   "count" … 「あと〇日 / 本日締切 / 締切済み」（検索結果）
//   "date"  … 「締切: 2026/7/14」（関連活動）
type DeadlineStyle = "none" | "count" | "date";

// 全ページ共通の活動カード。
// 【影が切れないための構造】
//   - 外側ラッパー(Link)には overflow-hidden を付けない。box-shadow と浮き上がりtransformはここに効かせる。
//   - overflow-hidden は画像を包む内側のdivのみ。角丸も上2つ(12px 12px 0 0)だけそこで付ける。
export default function ActivityCard({
  post,
  deadlineStyle = "none",
}: {
  post: Post;
  deadlineStyle?: DeadlineStyle;
}) {
  const daysLeft = post.deadline ? daysUntilJst(post.deadline) : null;
  const seasonTag = post.tags.find((t) => SEASON_TAGS.includes(t));
  const periodLabel = getPeriodLabel(post.period);
  const free = isFree(post.fee);

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="activity-card group relative block bg-[#FFFFF0]"
      style={{ fontFamily: "'toppan-bunkyu-midashi-gothic', sans-serif" }}
      onClick={() => track("card_click", {
        activity_id: post.id,
        slug: post.slug,
        metadata: { category: post.category, tags: post.tags },
      })}
    >
      {/* 画像コンテナ：overflow-hidden はここだけ（角丸なし・常に直角） */}
      <div className="relative w-full aspect-video overflow-hidden bg-gray-200">
        {post.imageUrl ? (
          <FallbackImage
            src={coverImageSrc(post.imageUrl, post.id)}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <Image
            src="/noimage.svg"
            alt="No Image"
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        )}

        {/* 右上起点の円形リビール＋VIEW MORE。clip-pathは .card-reveal / .activity-card:hover で定義 */}
        <div className="card-reveal z-10">
          <span className="text-[#FFFFF0] text-[13px] font-semibold tracking-[0.2em]">VIEW MORE</span>
        </div>

        {/* 左上バッジ */}
        <div className="absolute top-2 left-2 z-20 flex gap-1 flex-wrap max-w-[70%]">
          {post.isFeatured && <span className="bg-white text-[#092040] text-xs font-bold px-2 py-1 rounded-full border border-gray-200">おすすめ</span>}
          {seasonTag && <span className="bg-[#F59E0B] text-white text-xs font-bold px-2 py-1 rounded-full">{seasonTag}</span>}
          {periodLabel && <span className="bg-[#092040] text-white text-xs font-bold px-2 py-1 rounded-full">{periodLabel}</span>}
        </div>

        {/* 右上バッジ */}
        <div className="absolute top-2 right-2 z-20 flex flex-col gap-1 items-end">
          {free && <span className="bg-[#4ADE80] text-white text-xs font-bold px-2 py-1 rounded-full">無料</span>}
          {daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 && (
            <span className="relative inline-flex">
              <span className="absolute inset-0 bg-[#EF4444] rounded-full animate-ping opacity-60" />
              <span className="relative bg-[#EF4444] text-white text-xs font-bold px-2 py-1 rounded-full">締切間近</span>
            </span>
          )}
        </div>
      </div>

      {/* 本文 */}
      <div className="p-4 bg-[#FFFFF0]">
        <div className="flex items-center gap-2 text-xs mb-2 flex-wrap">
          {post.category && <span className={CATEGORY_TAG_CLASS}>{post.category}</span>}
          {post.organizer && <span className="text-gray-400">{post.organizer}</span>}
        </div>
        <h3 className="text-[#092040] text-xl font-bold line-clamp-2">{post.title}</h3>
        {deadlineStyle === "count" && post.deadline && daysLeft !== null && (
          <p className={`text-xs mt-1.5 font-bold ${daysLeft < 0 ? "text-gray-400" : daysLeft <= 7 ? "text-[#EF4444]" : "text-gray-400"}`}>
            {daysLeft < 0 ? "締切済み" : daysLeft === 0 ? "本日締切" : `あと${daysLeft}日`}
          </p>
        )}
        {deadlineStyle === "date" && post.deadline && (
          <p className={`text-xs mt-2 ${daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 ? "text-[#EF4444] font-bold" : "text-gray-400"}`}>
            締切: {new Date(post.deadline).toLocaleDateString("ja-JP")}
          </p>
        )}
      </div>
    </Link>
  );
}

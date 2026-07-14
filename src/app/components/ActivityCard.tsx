"use client";

import Link from "next/link";
import Image from "next/image";
import FallbackImage from "@/components/FallbackImage";
import { Post } from "@/types/notion";
import { CATEGORY_TAG_CLASS, SEASON_TAGS } from "@/constants/categories";
import { daysUntilJst } from "@/lib/date";
import { getPeriodLabel } from "@/lib/period";

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
  const isFree = post.fee === "無料" || post.fee === "0円" || post.fee === "0";

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="activity-card group relative block bg-[#FFFFF0] shadow-[0_2px_8px_rgba(9,32,64,0.07)] hover:-translate-y-1 hover:rounded-2xl hover:shadow-[0_14px_28px_-8px_rgba(9,32,64,0.28)] motion-reduce:hover:translate-y-0"
      style={{ fontFamily: "'toppan-bunkyu-midashi-gothic', sans-serif" }}
    >
      {/* 画像コンテナ：overflow-hidden はここだけ。通常は直角、hoverで上2つが角丸に */}
      <div className="activity-card-inner relative w-full aspect-video overflow-hidden bg-gray-200 group-hover:rounded-t-2xl">
        {post.imageUrl ? (
          <FallbackImage
            src={`/api/notion-image?pageId=${post.id}`}
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

        {/* ピルの可読性を上げるボトムグラデ（hoverで表示） */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* 左上バッジ */}
        <div className="absolute top-2 left-2 z-20 flex gap-1 flex-wrap max-w-[70%]">
          {post.isFeatured && <span className="bg-white text-[#092040] text-xs font-bold px-2 py-1 rounded-full border border-gray-200">おすすめ</span>}
          {seasonTag && <span className="bg-[#F59E0B] text-white text-xs font-bold px-2 py-1 rounded-full">{seasonTag}</span>}
          {periodLabel && <span className="bg-[#092040] text-white text-xs font-bold px-2 py-1 rounded-full">{periodLabel}</span>}
        </div>

        {/* 右上バッジ */}
        <div className="absolute top-2 right-2 z-20 flex flex-col gap-1 items-end">
          {isFree && <span className="bg-[#4ADE80] text-white text-xs font-bold px-2 py-1 rounded-full">無料</span>}
          {daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 && (
            <span className="relative inline-flex">
              <span className="absolute inset-0 bg-[#EF4444] rounded-full animate-ping opacity-60" />
              <span className="relative bg-[#EF4444] text-white text-xs font-bold px-2 py-1 rounded-full">締切間近</span>
            </span>
          )}
        </div>

        {/* 「もっと見る →」ピル：通常は画像の下に隠れ、hoverでスライドイン */}
        <span className="absolute right-2 bottom-[-28px] z-30 inline-flex items-center gap-1 rounded-full bg-[#FCBC2A] text-[#092040] text-xs font-bold px-3 py-1.5 shadow-[0_2px_6px_rgba(9,32,64,0.25)] transition-[bottom] duration-300 ease-out group-hover:bottom-2 motion-reduce:transition-none motion-reduce:group-hover:bottom-2">
          もっと見る
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none">→</span>
        </span>
      </div>

      {/* 本文 */}
      <div className="activity-card-inner p-4 bg-[#FFFFF0] group-hover:rounded-b-2xl">
        <div className="flex items-center gap-2 text-xs mb-2 flex-wrap">
          {post.category && <span className={CATEGORY_TAG_CLASS}>{post.category}</span>}
          {post.organizer && <span className="text-gray-400">{post.organizer}</span>}
        </div>
        {/* タイトルは inline 要素にして、hover時に文字幅ぶんだけ下線を出す
            （block要素に下線を付けると全幅に伸びてしまうため） */}
        <h3 className="text-[#092040] text-xl line-clamp-2">
          <span className="inline font-bold border-b-[1.5px] border-transparent transition-colors duration-300 group-hover:border-[#FCBC2A]">
            {post.title}
          </span>
        </h3>
        {deadlineStyle === "count" && post.deadline && daysLeft !== null && (
          <p className={`text-xs mt-1.5 font-bold ${daysLeft < 0 ? "text-gray-400" : daysLeft === 0 ? "text-[#EF4444]" : daysLeft <= 7 ? "text-[#EF4444]" : "text-gray-400"}`}>
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

"use client";

import { useEffect } from "react";
import { Post } from "@/types/notion";

type Props = {
  post: Post;
  onClose: () => void;
};

export default function ActivityModal({ post, onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-2xl font-light z-10"
        >
          ×
        </button>

        <div className="flex flex-col md:flex-row">
          {/* 左：メイン情報 */}
          <div className="flex-1 p-8">
            {/* カテゴリ・主催者 */}
            <div className="flex items-center gap-3 mb-3">
              {post.category && (
                <span className="bg-[#FCBC2A] text-[#092040] text-xs font-bold px-3 py-1 rounded-full">
                  {post.category}
                </span>
              )}
              {post.organizer && (
                <span className="text-gray-400 text-sm">{post.organizer}</span>
              )}
            </div>

            {/* タイトル */}
            <h1 className="text-[#092040] text-3xl font-black mb-6">{post.title}</h1>

            {/* 基本情報グリッド */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {post.deadline && (
                <div>
                  <div className="text-xs text-gray-400 mb-1">応募締切</div>
                  <div className="text-sm font-medium text-[#092040]">
                    📅 {new Date(post.deadline).toLocaleDateString("ja-JP")}
                  </div>
                </div>
              )}
              {post.period && (
                <div>
                  <div className="text-xs text-gray-400 mb-1">活動期間</div>
                  <div className="text-sm font-medium text-[#092040]">
                    📅 {post.period}
                  </div>
                </div>
              )}
              {post.targetGrade.length > 0 && (
                <div>
                  <div className="text-xs text-gray-400 mb-1">対象学年</div>
                  <div className="text-sm font-medium text-[#092040]">
                    🎓 {post.targetGrade.join("・")}
                  </div>
                </div>
              )}
              {post.format && (
                <div>
                  <div className="text-xs text-gray-400 mb-1">形式</div>
                  <div className="text-sm font-medium text-[#092040]">
                    💻 {post.format}
                  </div>
                </div>
              )}
              {post.region && (
                <div>
                  <div className="text-xs text-gray-400 mb-1">地域</div>
                  <div className="text-sm font-medium text-[#092040]">
                    📍 {post.region}
                  </div>
                </div>
              )}
              {post.fee && (
                <div>
                  <div className="text-xs text-gray-400 mb-1">参加費</div>
                  <div className="text-sm font-medium text-[#092040]">
                    💰 {post.fee}
                  </div>
                </div>
              )}
            </div>

            {/* 概要 */}
            {post.summary && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-0.5 bg-[#FCBC2A]" />
                  <h2 className="text-[#092040] font-bold text-lg">プログラム詳細</h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{post.summary}</p>
              </div>
            )}

            {/* タグ */}
            {post.tags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-0.5 bg-[#FCBC2A]" />
                  <h2 className="text-[#092040] font-bold text-lg">タグ</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右：応募サイドバー */}
          <div className="w-full md:w-64 bg-gray-50 rounded-b-3xl md:rounded-r-3xl md:rounded-bl-none p-6 shrink-0">
            <h2 className="text-[#092040] font-bold text-sm mb-3">募集概要</h2>

            {post.summary && (
              <div className="bg-white rounded-xl p-4 text-xs text-gray-600 leading-relaxed mb-4">
                {post.summary.slice(0, 100)}
                {post.summary.length > 100 ? "…" : ""}
              </div>
            )}

            {post.applyUrl && (
              
                href={post.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[#092040] text-white text-sm font-bold text-center py-4 rounded-xl hover:opacity-90 transition-opacity mb-2"
              >
                外部サイトで応募する →
              </a>
            )}

            <p className="text-xs text-gray-400 text-center mb-6">
              ※ 応募には外部サイトのアカウントが必要な場合があります
            </p>

            {post.organizer && (
              <div>
                <div className="text-xs text-gray-400 mb-2">運営元情報</div>
                <div className="bg-white rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-xs">
                    🏢
                  </div>
                  <div className="text-xs font-bold text-[#092040]">{post.organizer}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
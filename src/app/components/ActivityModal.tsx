"use client";

import { useEffect, useState } from "react";
import { Post } from "@/types/notion";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Props = {
  post: Post;
  onClose: () => void;
};

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

export default function ActivityModal({ post, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleTagClick = (tag: string) => {
  onClose();
  router.push(`/search?q=${encodeURIComponent(tag)}`);
};

  const now = new Date();
  const daysLeft = post.deadline
    ? Math.ceil((new Date(post.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const categoryStyle = post.category ? CATEGORY_BG[post.category] ?? "bg-gray-100 text-gray-700" : "";

  const infoItems = [
    post.deadline ? { icon: "/icons/Calendar.svg", label: "応募締切", value: new Date(post.deadline).toLocaleDateString("ja-JP"), highlight: daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 } : null,
    post.period ? { icon: "/icons/Clock.svg", label: "活動期間", value: post.period, highlight: false } : null,
    post.targetGrade.length > 0 ? { icon: "/icons/Graduation Cap.svg", label: "対象学年", value: post.targetGrade.join("・"), highlight: false } : null,
    post.format ? { icon: "/icons/PC.svg", label: "形式", value: post.format, highlight: false } : null,
    post.region ? { icon: "/icons/Pin.svg", label: "地域", value: post.region, highlight: false } : null,
    post.fee ? { icon: "/icons/Dollar Bag.svg", label: "参加費", value: post.fee, highlight: false } : null,
  ].filter(Boolean) as { icon: string; label: string; value: string; highlight: boolean }[];

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-end md:items-center justify-center transition-all duration-300 ${visible ? "bg-black/60" : "bg-black/0"}`}
      onClick={handleClose}
    >
      <div
        className={`bg-white w-full md:max-w-3xl md:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-hidden flex flex-col transition-all duration-300 ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー画像 */}
        <div className="relative w-full h-48 md:h-64 bg-gray-200 shrink-0">
          {post.imageUrl ? (
            <Image src={post.imageUrl} alt={post.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#FCBC2A] to-[#092040]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors text-lg"
          >×</button>

          <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
            {post.isFeatured && <span className="bg-white text-[#092040] text-xs font-bold px-3 py-1 rounded-full">おすすめ</span>}
            {(post.fee === "無料" || post.fee === "0円" || post.fee === "0") && <span className="bg-[#4ADE80] text-white text-xs font-bold px-3 py-1 rounded-full">無料</span>}
            {daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 && <span className="bg-[#EF4444] text-white text-xs font-bold px-3 py-1 rounded-full">締切間近</span>}
          </div>

          <div className="absolute bottom-4 left-5 right-5">
            {post.category && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block ${categoryStyle}`}>{post.category}</span>
            )}
            <h1 className="text-white text-xl md:text-2xl font-black leading-tight drop-shadow">{post.title}</h1>
          </div>
        </div>

        {/* ボディ */}
        <div className="overflow-y-auto flex-1">
          <div className="flex flex-col md:flex-row">
            {/* 左：メイン */}
            <div className="flex-1 p-6">
              {post.organizer && (
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-sm font-bold text-[#092040]">{post.organizer}</span>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {infoItems.map((item) => (
                  <div key={item.label}
                    className={`rounded-2xl p-3 border ${item.highlight ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-100"}`}>
                    <div className="text-xs text-gray-400 mb-1">{item.label}</div>
                    <div className={`text-sm font-bold flex items-center gap-1.5 ${item.highlight ? "text-[#EF4444]" : "text-[#092040]"}`}>
                      <Image src={item.icon} alt="" width={16} height={16} />
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {post.summary && (
                <div className="mb-6">
                  <h2 className="text-[#092040] font-black text-base mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-[#FCBC2A] rounded-full inline-block" />
                    プログラム詳細
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{post.summary}</p>
                </div>
              )}

              {post.tags.length > 0 && (
                <div>
                  <h2 className="text-[#092040] font-black text-base mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-[#FCBC2A] rounded-full inline-block" />
                    タグ
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
  <button key={tag} onClick={() => handleTagClick(tag)}
    className="bg-[#FCBC2A]/20 text-[#092040] text-xs font-bold px-3 py-1 rounded-full hover:bg-[#FCBC2A] transition-colors cursor-pointer">
    #{tag}
  </button>
))}
                  </div>
                </div>
              )}
            </div>

            {/* 右：応募 */}
            <div className="md:w-60 shrink-0 p-6 md:border-l border-t md:border-t-0 border-gray-100">
              {post.applyUrl ? (
                <a href={post.applyUrl} target="_blank" rel="noopener noreferrer"
                  className="block w-full bg-[#092040] text-white text-sm font-bold text-center py-4 rounded-2xl hover:opacity-90 transition-opacity mb-3">
                  応募する →
                </a>
              ) : (
                <div className="w-full bg-gray-100 text-gray-400 text-sm font-bold text-center py-4 rounded-2xl mb-3">
                  応募URLなし
                </div>
              )}
              <p className="text-xs text-gray-400 text-center mb-6">※ 外部サイトへ移動します</p>

              {daysLeft !== null && daysLeft >= 0 && (
                <div className={`rounded-2xl p-4 text-center mb-4 border ${daysLeft <= 7 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-100"}`}>
                  <div className="text-xs text-gray-400 mb-1">締切まで</div>
                  <div className={`text-3xl font-black ${daysLeft <= 7 ? "text-[#EF4444]" : "text-[#092040]"}`}>
                    {daysLeft}<span className="text-sm font-bold ml-1">日</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
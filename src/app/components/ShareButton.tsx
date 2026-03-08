"use client";
import { useState } from "react";

export default function ShareButton({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `https://beelog-eight.vercel.app/posts/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleShare}
      className="w-full mt-3 bg-[#FCBC2A] text-[#092040] font-bold py-4 rounded-2xl flex flex-row items-center justify-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap">
      <span>{copied ? "コピーしました！" : "この活動をシェアする"}</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
      </svg>
    </button>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  applyUrl: string;
  daysLeft: number | null;
};

export default function MobileApplyButton({ applyUrl, daysLeft }: Props) {
  const [hidden, setHidden] = useState(false);
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // サイドバーの応募ボタンを監視
    const target = document.getElementById("apply-button-sidebar");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHidden(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FFFFF0]/90 backdrop-blur-sm border-t border-gray-200 px-5 py-4 transition-all duration-300 ${hidden ? "opacity-0 pointer-events-none translate-y-4" : "opacity-100 translate-y-0"}`}>
      <div className="flex gap-3 items-center">
        {daysLeft !== null && daysLeft >= 0 && (
          <div className={`shrink-0 rounded-xl px-3 py-2 text-center ${daysLeft <= 7 ? "bg-red-50" : "bg-gray-100"}`}>
            <div className="text-[10px] text-gray-400">締切まで</div>
            <div className={`text-lg font-black leading-none ${daysLeft <= 7 ? "text-[#EF4444]" : "text-[#092040]"}`}>
              {daysLeft}<span className="text-xs font-bold">日</span>
            </div>
          </div>
        )}
        {applyUrl ? (
          <a href={applyUrl} target="_blank" rel="noopener noreferrer"
            className="flex-1 bg-[#092040] text-white font-bold text-center py-4 rounded-2xl transition-all duration-200 hover:bg-[#FCBC2A] hover:text-[#092040] active:scale-95">
            応募する →
          </a>
        ) : (
          <div className="flex-1 bg-gray-100 text-gray-400 font-bold text-center py-4 rounded-2xl">
            応募URLなし
          </div>
        )}
      </div>
    </div>
  );
}
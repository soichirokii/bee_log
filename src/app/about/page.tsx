"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const SECTIONS = [
  { id: "hero" },
  { id: "question" },
  { id: "answer" },
  { id: "name" },
  { id: "how" },
  { id: "cta" },
];

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const touchStartY = useRef(0);

  const goTo = (index: number) => {
    if (animating || index < 0 || index >= SECTIONS.length) return;
    setAnimating(true);
    setCurrent(index);
    setTimeout(() => setAnimating(false), 900);
  };

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) goTo(current + 1);
      else goTo(current - 1);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") goTo(current + 1);
      if (e.key === "ArrowUp") goTo(current - 1);
    };
    const onTouchStart = (e: TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      const diff = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 40) diff > 0 ? goTo(current + 1) : goTo(current - 1);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [current, animating]);

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden">

      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center px-8 md:px-16 py-4">
        <Link href="/" className="mr-10 transition-opacity duration-200 hover:opacity-70">
          <Image src="/Logo.svg" alt="BEE log" width={100} height={40} className="h-10 w-auto" />
        </Link>
        <Link href="/" className={`text-sm font-bold px-5 py-2 rounded-full mr-2 transition-all duration-200 ${current === 0 ? "text-white hover:bg-white/20" : current >= 4 ? "text-[#092040] hover:bg-[#092040]/10" : "text-white hover:bg-white/20"}`}>HOME</Link>
        <Link href="/search" className={`text-sm font-bold px-5 py-2 rounded-full transition-all duration-200 ${current === 0 ? "text-white hover:bg-white/20" : current >= 4 ? "text-[#092040] hover:bg-[#092040]/10" : "text-white hover:bg-white/20"}`}>活動を探す</Link>
      </nav>

      {/* ドットナビ */}
      <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {SECTIONS.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${i === current
              ? (current >= 4 ? "bg-[#092040] w-2 h-6" : "bg-white w-2 h-6")
              : (current >= 4 ? "bg-[#092040]/30 w-2 h-2" : "bg-white/40 w-2 h-2")}`} />
        ))}
      </div>

      {/* セクション群 */}
      <div
        className="w-full transition-transform duration-[900ms] ease-[cubic-bezier(0.77,0,0.18,1)]"
        style={{ transform: `translateY(-${current * 100}vh)`, height: `${SECTIONS.length * 100}vh` }}>

        {/* 0: Hero */}
        <div className="w-full h-screen bg-[#092040] flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-white/[0.04] font-black leading-none" style={{ fontSize: "22vw" }}>BEE</span>
          </div>
          <div className={`relative z-10 text-center transition-all duration-700 delay-200 ${current === 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <p className="text-[#FCBC2A] font-bold tracking-[0.4em] text-xs mb-8 uppercase">About BEE log</p>
            <h1 className="text-white font-black leading-none mb-6" style={{ fontSize: "clamp(3rem, 10vw, 8rem)" }}>
              キミの<span className="text-[#FCBC2A]">「知りたい」</span>が、<br />世界を広げる。
            </h1>
            <p className="text-white/40 text-sm mt-10 tracking-widest">scroll ↓</p>
          </div>
        </div>

        {/* 1: 問い */}
        <div className="w-full h-screen bg-[#0a0a0a] flex items-center px-[8vw] md:px-24 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-[#FCBC2A]/10 to-transparent" />
          <div className={`max-w-2xl transition-all duration-700 delay-300 ${current === 1 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}>
            <p className="text-[#FCBC2A]/60 font-bold tracking-widest text-xs mb-8 uppercase">The Question</p>
            <h2 className="text-white font-black leading-tight" style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}>
              「なにかチャレンジ<br />してみたいけど、<br />
              <span className="text-white/30">何があるか<br />分からない。」</span>
            </h2>
            <p className="text-white/40 text-lg mt-8">そう感じたことはありませんか？</p>
          </div>
        </div>

        {/* 2: 答え */}
        <div className="w-full h-screen bg-[#092040] flex items-center px-[8vw] md:px-24 relative overflow-hidden">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-32 bg-[#FCBC2A]" />
          <div className={`max-w-3xl transition-all duration-700 delay-300 ${current === 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
            <p className="text-[#FCBC2A] font-bold tracking-widest text-xs mb-8 uppercase">The Answer</p>
            <h2 className="text-white font-black leading-tight mb-8" style={{ fontSize: "clamp(1.8rem, 4vw, 3.5rem)" }}>
              BEE logは、<br />
              10代の「探究」を<br />
              <span className="text-[#FCBC2A]">応援するメディア</span>です。
            </h2>
            <p className="text-white/50 text-lg leading-relaxed max-w-xl">
              コンテスト、インターン、留学、研究……<br />
              10代がわくわくできる情報が、ここに詰まっています。
            </p>
          </div>
        </div>

        {/* 3: 名前の由来 */}
        <div className="w-full h-screen bg-[#0a0a0a] flex items-center px-[8vw] md:px-24 relative overflow-hidden">
          <div className="absolute right-[8vw] md:right-24 top-1/2 -translate-y-1/2 text-[#FCBC2A]/10 font-black select-none pointer-events-none" style={{ fontSize: "18vw" }}>🐝</div>
          <div className={`max-w-2xl relative z-10 transition-all duration-700 delay-300 ${current === 3 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}>
            <p className="text-[#FCBC2A]/60 font-bold tracking-widest text-xs mb-8 uppercase">Name Origin</p>
            <h2 className="text-white font-black leading-tight mb-8" style={{ fontSize: "clamp(2rem, 4.5vw, 4rem)" }}>
              ミツバチのように、<br />
              <span className="text-[#FCBC2A]">価値を運ぶ</span><br />
              存在へ。
            </h2>
            <p className="text-white/50 text-base leading-relaxed">
              花から花へと蜜を運び、生態系を豊かにするミツバチのように——<br />
              10代が情報を糧に、新しい価値を咲かせてほしい。<br />
              そんな願いを込めました。
            </p>
          </div>
        </div>

        {/* 4: 使い方 */}
        <div className="w-full h-screen bg-[#FFFFF0] flex items-center px-[8vw] md:px-24 relative overflow-hidden">
          <div className={`w-full transition-all duration-700 delay-200 ${current === 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
            <p className="text-[#FCBC2A] font-bold tracking-widest text-xs mb-6 uppercase">How to use</p>
            <h2 className="text-[#092040] font-black text-4xl mb-12">使い方は、シンプル。</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
              {[
                { step: "01", title: "探す", desc: "カテゴリ・学年・形式で絞り込み" },
                { step: "02", title: "確認する", desc: "締切・対象・参加費をチェック" },
                { step: "03", title: "飛び込む", desc: "応募ボタンから公式サイトへ" },
              ].map(({ step, title, desc }, i) => (
                <div key={step}
                  className={`border-t-2 border-[#092040] pt-6 transition-all duration-500 ${current === 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: `${300 + i * 150}ms` }}>
                  <div className="text-[#FCBC2A] font-black text-5xl mb-3">{step}</div>
                  <h3 className="text-[#092040] font-black text-2xl mb-2">{title}</h3>
                  <p className="text-gray-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5: CTA */}
        <div className="w-full h-screen bg-[#FCBC2A] flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-[#092040]/[0.05] font-black leading-none" style={{ fontSize: "20vw" }}>GO</span>
          </div>
          <div className={`relative z-10 text-center transition-all duration-700 delay-200 ${current === 5 ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
            <h2 className="text-[#092040] font-black leading-tight mb-8" style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}>
              さあ、<br />探究を始めよう。
            </h2>
            <p className="text-[#092040]/50 text-lg mb-12">キミにぴったりの活動が、きっと見つかる。</p>
            <Link href="/search"
              className="inline-block bg-[#092040] text-white font-bold px-12 py-5 rounded-2xl text-xl hover:opacity-80 transition-opacity">
              活動を探す →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
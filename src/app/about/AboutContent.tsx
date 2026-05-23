"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Footer from "../components/Footer";
import { initAboutAnimations } from "./aboutAnimations";

const NAV_LINKS = [
  { href: "/", label: "HOME" },
  { href: "/search", label: "探す" },
  { href: "/about", label: "About" },
];

export default function AboutContent() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const cleanup = initAboutAnimations();
    return cleanup;
  }, []);

  return (
    <>
      <main className="about-page">
        {/* ── Hero ── */}
        <section className="panel hero-panel">

          {/* ── Desktop header ── */}
          <nav className="about-header">
            <Link href="/" className="about-header-logo">
              <Image
                src="/Logo.svg"
                alt="BEE log"
                width={120}
                height={48}
                className="h-10 w-auto"
              />
            </Link>
            <div className="about-header-links">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`about-header-link${pathname === href ? " active" : ""}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>

          {/* ── Mobile header ── */}
          <nav className="about-header-mobile">
            {/* Left spacer */}
            <span className="about-header-mobile-spacer" />

            {/* Center logo */}
            <Link href="/" className="about-header-mobile-logo">
              <Image
                src="/Logo.svg"
                alt="BEE log"
                width={100}
                height={40}
                className="h-8 w-auto"
              />
            </Link>

            {/* Right: hamburger */}
            <button
              className={`about-hamburger${menuOpen ? " is-open" : ""}`}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
              aria-expanded={menuOpen}
            >
              <span className="about-hamburger-line" />
              <span className="about-hamburger-line" />
              <span className="about-hamburger-line" />
            </button>
          </nav>

          {/* ── Mobile dropdown menu ── */}
          {menuOpen && (
            <div className="about-mobile-menu" role="menu">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  role="menuitem"
                  className={`about-mobile-menu-link${pathname === href ? " active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Hero content */}
          <div className="hero-inner" data-reveal>
            <Image
              className="hero-logo"
              src="/Logo.svg"
              alt="BEElog"
              width={588}
              height={251}
              priority
            />
            <p className="hero-subtitle">10代のための探究メディア</p>
          </div>
        </section>

        {/* ── Intro ── */}
        <section className="panel grid-panel intro-panel">
          <div
            className="intro-decoration intro-decoration-bulb"
            aria-hidden="true"
          >
            💡
          </div>
          <div
            className="intro-decoration intro-decoration-chat"
            aria-hidden="true"
          >
            💬
          </div>
          <div
            className="intro-decoration intro-decoration-bee"
            aria-hidden="true"
          >
            🐝
          </div>

          <div className="intro-copy" data-reveal>
            <h1>
              <span className="intro-line intro-line-top">
                何かを始めたいけれど、
              </span>
              <span className="intro-line">
                きっかけが見つからない中高生へ
              </span>
            </h1>
          </div>

          <div className="brand-ribbon">
            <Image
              className="brand-ribbon-logo"
              src="/Logo.svg"
              alt="BEElog"
              width={129}
              height={55}
            />
            <span className="brand-ribbon-divider" aria-hidden="true" />
            <span className="brand-ribbon-text">10代のための探究メディア</span>
          </div>
        </section>

        {/* ── Map ── */}
        <section className="panel map-panel">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="map-image" src="/about-map.png" alt="世界地図" />
          <p className="map-caption" data-reveal>
            キミの「知りたい」が、世界を広げる地図になる。
          </p>
        </section>

        {/* ── Chat ── */}
        <section className="panel chat-panel">
          <div className="chat-header">
            <span className="chat-back" aria-hidden="true">‹</span>
            <div className="chat-brand">
              <span className="chat-brand-badge">
                <Image src="/Logo.svg" alt="BEE log" width={75} height={32} />
              </span>
              <div className="chat-brand-row">
                <span className="chat-brand-name">BEE log</span>
                <span className="chat-brand-arrow" aria-hidden="true">›</span>
              </div>
            </div>
          </div>

          <div className="chat-thread">
            <p className="chat-meta">
              iMessage
              <br />
              Today 9:41 AM
            </p>
            <div className="chat-bubble bubble-yellow bubble-center bubble-large bubble-primary chat-sequence-primary">
              こう感じたことはありませんか？
            </div>
            <div className="chat-bubble bubble-blue bubble-left bubble-one chat-sequence">
              なにかチャレンジしてみたいけど、
              <br />
              何があるかわからない
            </div>
            <div className="chat-bubble bubble-gray bubble-right bubble-mid bubble-two chat-sequence">
              新しいことにチャレンジしたい
            </div>
            <div className="chat-bubble bubble-gray bubble-left bubble-small bubble-three chat-sequence">
              学校外で友だちを増やしたい
            </div>
            <div className="chat-bubble bubble-blue bubble-right bubble-small bubble-four chat-sequence">
              将来を考えたい
            </div>
          </div>
        </section>

        {/* ── Info ── */}
        <section className="panel grid-panel info-panel">
          <div className="info-heading" data-reveal>
            <Image
              className="info-logo"
              src="/Logo.svg"
              alt="BEElog"
              width={292}
              height={125}
            />
            <h2>
              は、10代の「探究」
              <br />
              を応援するメディアです。
            </h2>
          </div>

          <div className="info-body" data-reveal>
            <p className="info-lead">
              <span className="lead-cluster">
                <span className="lead-strong underline">身近な疑問</span>
                <span className="info-emoji info-emoji-left" aria-hidden="true">
                  ❓
                </span>
              </span>
              <span className="lead-rest">から、</span>
              <br />
              <span className="lead-rest">
                社会を変えるビジネスアイデアを競う
              </span>
              <span className="marker marker-cluster">
                コンテスト
                <span className="info-emoji info-emoji-top" aria-hidden="true">
                  💡
                </span>
              </span>
              <span className="lead-rest">、</span>
              <br />
              <span className="lead-rest">海を越えた</span>
              <span className="marker-wide marker-wide-cluster">
                海外プログラム
                <span className="info-emoji info-emoji-right" aria-hidden="true">
                  ✈️
                </span>
              </span>
              <span className="lead-rest">の情報まで。</span>
            </p>

            <p className="info-summary">
              ここには、
              <span className="summary-highlight summary-cluster">
                <span className="info-emoji info-emoji-bottom" aria-hidden="true">
                  🤩
                </span>
                10代がわくわくするような情報
                <span className="info-emoji info-emoji-sparkle" aria-hidden="true">
                  ✨
                </span>
              </span>
              が詰まっています。
            </p>
          </div>
        </section>

        {/* ── Story ── */}
        <section className="panel grid-panel story-panel">
          <div className="brand-ribbon">
            <Image
              className="brand-ribbon-logo"
              src="/Logo.svg"
              alt="BEElog"
              width={129}
              height={55}
            />
            <span className="brand-ribbon-divider" aria-hidden="true" />
            <span className="brand-ribbon-text">10代のための探究メディア</span>
          </div>

          <Image
            className="story-logo"
            src="/Logo.svg"
            alt="BEElog"
            width={292}
            height={125}
            data-reveal=""
          />

          <div className="story-decoration story-decoration-flower" aria-hidden="true">
            💐
          </div>
          <div className="story-decoration story-decoration-bee" aria-hidden="true">
            🐝
          </div>
          <div className="story-decoration story-decoration-tulip" aria-hidden="true">
            🌷
          </div>

          <div className="story-copy" data-reveal>
            <p className="story-text story-text-small">
              <span className="story-underline">
                「BEE log」という名前には、
              </span>
            </p>
            <p className="story-text story-text-medium">
              <span className="story-underline story-underline-wide">
                ミツバチが花から花へと蜜と花粉を運び、生態系を豊かにするように、
              </span>
            </p>
            <p className="story-text story-text-large">
              <span className="story-emphasis">
                <span>10代が情報を糧に</span>
                <br className="story-emphasis-break" />
                <span>新しい価値を咲かせてほしい</span>
              </span>
              <br />
              <span className="story-text-append">という願いを込めました。</span>
            </p>
          </div>

          <p className="story-closing" data-reveal>
            <span className="story-closing-line">
              キミが夢中になれる何かを見つけるための、一番近い場所
            </span>
            <span className="story-closing-line">それがBEE logです。</span>
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}

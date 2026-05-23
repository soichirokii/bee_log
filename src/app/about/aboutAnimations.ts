/**
 * About page GSAP animations (npm package — no CDN dependency)
 * NOTE: registerPlugin is called inside initAboutAnimations to avoid SSR issues.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ── Fit intro lines to container width on mobile ──────────────────────────
function fitIntroLines(introLines: Element[]) {
  if (!introLines.length) return;

  introLines.forEach((line) => {
    (line as HTMLElement).style.fontSize = "";
  });

  if (window.innerWidth > 900) return;

  const parent = introLines[0]?.parentElement;
  if (!parent) return;

  const available = Math.max(0, parent.clientWidth - 8);
  if (!available) return;

  const measureSize = 100;
  introLines.forEach((line) => {
    (line as HTMLElement).style.fontSize = `${measureSize}px`;
  });

  const maxWidth = Math.max(...introLines.map((l) => (l as HTMLElement).scrollWidth));
  if (!maxWidth) return;

  const targetSize = Math.max(18, Math.min(72, Math.floor((available / maxWidth) * measureSize)));
  introLines.forEach((line) => {
    (line as HTMLElement).style.fontSize = `${targetSize}px`;
  });
}

// ── Adjust info-summary emoji layout on 3-line mobile ────────────────────
function fitInfoSummaryEmojis(infoSummary: Element | null) {
  if (!infoSummary) return;
  infoSummary.classList.remove("info-summary-three-lines");
  if (window.innerWidth > 900) return;

  const lineHeight = parseFloat(window.getComputedStyle(infoSummary).lineHeight);
  if (!lineHeight) return;

  const lines = Math.round(infoSummary.getBoundingClientRect().height / lineHeight);
  if (lines >= 3) infoSummary.classList.add("info-summary-three-lines");
}

// ── Main init ─────────────────────────────────────────────────────────────
export function initAboutAnimations(): () => void {
  // Register here (inside function) so it only runs client-side via useEffect
  gsap.registerPlugin(ScrollTrigger);

  const revealItems = gsap.utils.toArray<Element>("[data-reveal]");
  const introLines = gsap.utils.toArray<Element>(".intro-line");
  const introCopy = document.querySelector(".intro-copy");
  const infoSummary = document.querySelector(".info-summary");

  // Scroll-reveal animations
  revealItems.forEach((element, index) => {
    if (element.closest(".info-panel") || element.closest(".story-panel")) {
      gsap.set(element, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      element,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power2.out",
        delay: index === 0 ? 0.15 : 0,
        scrollTrigger: {
          trigger: element,
          start: "top 84%",
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true,
        },
      }
    );
  });

  // Map parallax
  gsap.to(".map-image", {
    scale: 1.08,
    ease: "none",
    scrollTrigger: {
      trigger: ".map-panel",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });

  // Floating emoji decorations
  gsap.utils.toArray<Element>(".intro-decoration, .info-emoji, .story-decoration").forEach((element, index) => {
    if (element.closest(".story-panel")) return;

    gsap.to(element, {
      yPercent: index % 2 === 0 ? -10 : 8,
      xPercent: index % 3 === 0 ? 4 : -3,
      ease: "none",
      scrollTrigger: {
        trigger: element.closest(".panel"),
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });

  // Chat bubble sequence
  const chatPrimary = document.querySelector(".chat-sequence-primary");
  const chatSequence = gsap.utils.toArray<Element>(".chat-sequence");
  const chatPanel = document.querySelector(".chat-panel");

  if (chatPrimary && chatPanel) {
    gsap.set([chatPrimary, ...chatSequence], { opacity: 0, y: 56, scale: 0.62 });

    const chatTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: chatPanel,
        start: "top 88%",
        toggleActions: "play none none reverse",
        invalidateOnRefresh: true,
      },
    });

    chatTimeline
      .to(chatPrimary, { opacity: 1, y: 0, scale: 1.18, duration: 0.28, ease: "power3.out" })
      .to(chatPrimary, { scale: 1, duration: 0.22, ease: "back.out(4.8)" }, ">");

    chatSequence.forEach((bubble, index) => {
      chatTimeline
        .to(bubble, { opacity: 1, y: 0, scale: 1.16, duration: 0.16, ease: "power3.out" }, index === 0 ? "+=0.1" : "+=0.02")
        .to(bubble, { scale: 1, duration: 0.18, ease: "back.out(4.8)" }, "<");
    });
  }

  // Responsive helpers
  const _fitLines = () => fitIntroLines(introLines);
  const _fitEmojis = () => fitInfoSummaryEmojis(infoSummary);

  _fitLines();
  _fitEmojis();
  window.addEventListener("resize", _fitLines);
  window.addEventListener("resize", _fitEmojis);
  window.addEventListener("load", _fitLines);
  window.addEventListener("load", _fitEmojis);

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => { _fitLines(); _fitEmojis(); });
  }

  let introObserver: ResizeObserver | undefined;
  let summaryObserver: ResizeObserver | undefined;
  if ("ResizeObserver" in window) {
    if (introCopy) {
      introObserver = new ResizeObserver(_fitLines);
      introObserver.observe(introCopy);
    }
    if (infoSummary) {
      summaryObserver = new ResizeObserver(_fitEmojis);
      summaryObserver.observe(infoSummary);
    }
  }

  ScrollTrigger.refresh();

  // Return cleanup function
  return () => {
    window.removeEventListener("resize", _fitLines);
    window.removeEventListener("resize", _fitEmojis);
    window.removeEventListener("load", _fitLines);
    window.removeEventListener("load", _fitEmojis);
    introObserver?.disconnect();
    summaryObserver?.disconnect();
    ScrollTrigger.getAll().forEach((t) => t.kill());
  };
}

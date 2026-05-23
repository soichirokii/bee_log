gsap.registerPlugin(ScrollTrigger);

const revealItems = gsap.utils.toArray("[data-reveal]");
const introLines = gsap.utils.toArray(".intro-line");
const introCopy = document.querySelector(".intro-copy");
const infoSummary = document.querySelector(".info-summary");

function fitIntroLines() {
  if (!introLines.length) return;

  if (window.innerWidth > 900) {
    introLines.forEach((line) => {
      line.style.fontSize = "";
    });
    return;
  }

  introLines.forEach((line) => {
    line.style.fontSize = "";
  });

  const parent = introLines[0]?.parentElement;
  if (!parent) return;

  const available = Math.max(0, parent.clientWidth - 8);
  if (!available) return;

  const measureSize = 100;

  introLines.forEach((line) => {
    line.style.fontSize = `${measureSize}px`;
  });

  const maxWidth = Math.max(...introLines.map((line) => line.scrollWidth));
  if (!maxWidth) return;

  const fittedSize = Math.floor((available / maxWidth) * measureSize);
  const targetSize = Math.max(18, Math.min(72, fittedSize));

  introLines.forEach((line) => {
    line.style.fontSize = `${targetSize}px`;
  });
}

function fitInfoSummaryEmojis() {
  if (!infoSummary) return;

  infoSummary.classList.remove("info-summary-three-lines");

  if (window.innerWidth > 900) {
    return;
  }

  const lineHeight = parseFloat(window.getComputedStyle(infoSummary).lineHeight);
  if (!lineHeight) return;

  const lines = Math.round(infoSummary.getBoundingClientRect().height / lineHeight);
  if (lines >= 3) {
    infoSummary.classList.add("info-summary-three-lines");
  }
}

revealItems.forEach((element, index) => {
  if (element.closest(".info-panel") || element.closest(".story-panel")) {
    gsap.set(element, { opacity: 1, y: 0 });
    return;
  }

  gsap.fromTo(
    element,
    {
      opacity: 0,
      y: 32,
    },
    {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: "power2.out",
    delay: index === 0 ? 0.15 : 0,
      immediateRender: false,
      scrollTrigger: {
        trigger: element,
        start: "top 84%",
        toggleActions: "play none none reverse",
        invalidateOnRefresh: true,
      },
    }
  );
});

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

gsap.utils.toArray(".intro-decoration, .info-emoji, .story-decoration").forEach((element, index) => {
  if (element.closest(".story-panel")) {
    return;
  }

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

const chatPrimary = document.querySelector(".chat-sequence-primary");
const chatSequence = gsap.utils.toArray(".chat-sequence");
const chatPanel = document.querySelector(".chat-panel");

if (chatPrimary && chatPanel) {
  gsap.set([chatPrimary, ...chatSequence], {
    opacity: 0,
    y: 56,
    scale: 0.62,
  });

  const chatTimeline = gsap.timeline({
    defaults: {
      immediateRender: false,
    },
    scrollTrigger: {
      trigger: chatPanel,
      start: "top 88%",
      toggleActions: "play none none reverse",
      invalidateOnRefresh: true,
    },
  });

  chatTimeline
    .to(chatPrimary, {
      opacity: 1,
      y: 0,
      scale: 1.18,
      duration: 0.28,
      ease: "power3.out",
    })
    .to(
      chatPrimary,
      {
        scale: 1,
        duration: 0.22,
        ease: "back.out(4.8)",
      },
      ">"
    );

  chatSequence.forEach((bubble, index) => {
    chatTimeline.to(
      bubble,
      {
        opacity: 1,
        y: 0,
        scale: 1.16,
        duration: 0.16,
        ease: "power3.out",
      },
      index === 0 ? "+=0.1" : "+=0.02"
    );

    chatTimeline.to(
      bubble,
      {
        scale: 1,
        duration: 0.18,
        ease: "back.out(4.8)",
      },
      "<"
    );
  });
}

fitIntroLines();
fitInfoSummaryEmojis();
window.addEventListener("resize", fitIntroLines);
window.addEventListener("resize", fitInfoSummaryEmojis);
window.addEventListener("load", fitIntroLines);
window.addEventListener("load", fitInfoSummaryEmojis);

if (document.fonts?.ready) {
  document.fonts.ready.then(() => {
    fitIntroLines();
    fitInfoSummaryEmojis();
  });
}

if (introCopy && "ResizeObserver" in window) {
  const introObserver = new ResizeObserver(() => {
    fitIntroLines();
  });
  introObserver.observe(introCopy);
}

if (infoSummary && "ResizeObserver" in window) {
  const summaryObserver = new ResizeObserver(() => {
    fitInfoSummaryEmojis();
  });
  summaryObserver.observe(infoSummary);
}

ScrollTrigger.refresh();

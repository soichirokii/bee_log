"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  direction?: "left" | "up";
  delay?: number;
};

export default function FadeInSection({ children, direction = "up", delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  const from = direction === "left" ? "translate-x-[-30px]" : "translate-y-6";

  return (
    <div
      ref={ref}
      style={{ transition: "opacity 0.7s ease, transform 0.7s ease", transitionDelay: `${delay}ms` }}
      className={`${visible ? "opacity-100 translate-x-0 translate-y-0" : `opacity-0 ${from}`}`}
    >
      {children}
    </div>
  );
}
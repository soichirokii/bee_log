import type { Metadata } from "next";
import "./about.css";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "About",
  description:
    "BEE logは、10代のための探究・課外活動メディアです。BEE logが届けたい価値や、名前に込めた想いを紹介します。",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return <AboutContent />;
}

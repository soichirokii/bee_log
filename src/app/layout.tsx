import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "My Blog", template: "%s | My Blog" },
  description: "Notion powered blog",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <header>
          <a href="/">My Blog</a>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
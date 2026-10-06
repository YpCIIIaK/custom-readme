import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Readme Studio — Visual GitHub README Builder",
  description: "Design, preview, and export a custom GitHub README without fighting Markdown.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}

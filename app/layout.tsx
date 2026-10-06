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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600;700&family=Instrument+Serif&display=swap" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

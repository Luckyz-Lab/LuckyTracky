import type { Metadata } from "next";
import { Fredoka, Sarabun } from "next/font/google";
import "./globals.css";

const display = Fredoka({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Sarabun({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LuckyTracky — Track spending with your cat 🍀",
  description: "Track income and expenses with your cat Lucky by your side.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}

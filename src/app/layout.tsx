import type { Metadata } from "next";
import { Inter, Noto_Sans_Thai, Outfit } from "next/font/google";
import "./globals.css";

const display = Outfit({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const thai = Noto_Sans_Thai({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai"],
  variable: "--font-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LuckyTracky AI - Finance for Happy Cats",
  description: "Track income and expenses with your cat Lucky by your side.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${display.variable} ${body.variable} ${thai.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}

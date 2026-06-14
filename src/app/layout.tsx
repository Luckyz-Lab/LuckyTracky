import type { Metadata } from "next";
import { Itim, IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";

const display = Itim({
  weight: "400",
  subsets: ["thai", "latin"],
  variable: "--font-display",
  display: "swap",
});

const body = IBM_Plex_Sans_Thai({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LuckyTracky — จดเงินกับน้องแมว 🍀",
  description: "จดรายรับรายจ่ายแบบใจฟู มีน้องแมวเป็นเพื่อนคอยช่วยดูแลเงินของคุณ",
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

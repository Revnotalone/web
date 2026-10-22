import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const font = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: { default: "TOKO AIPI", template: "%s | TOKO AIPI" },
  description: "Sepatu, sandal, tas, kaos kaki, dan sabuk. Bayar lewat COD, transfer, atau QRIS.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${font.variable} font-sans`}>{children}</body>
    </html>
  );
}

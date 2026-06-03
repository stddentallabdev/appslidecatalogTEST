import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "S.T.D. Dental Lab | Premium Orthodontic Video Catalog",
  description: "Welcome to S.T.D. Dental Lab Limited Partnership. Scan the catalog QR Code to watch our premium orthodontic retainer showcase video instantly with zero loading times.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased light`}
    >
      <body className="min-h-full bg-purple-50 text-slate-800 flex flex-col overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}

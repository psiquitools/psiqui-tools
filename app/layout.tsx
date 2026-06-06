import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "psiqui.tools",
  description: "Herramientas para residentes de psiquiatría",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-3.5 md:px-12">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800">
                <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" aria-hidden="true">
                  <circle cx="24" cy="24" r="3.5" stroke="white" strokeWidth="1.5"/>
                  <circle cx="14" cy="16" r="2.5" stroke="white" strokeWidth="1.5"/>
                  <circle cx="34" cy="16" r="2.5" stroke="white" strokeWidth="1.5"/>
                  <circle cx="14" cy="32" r="2.5" stroke="white" strokeWidth="1.5"/>
                  <circle cx="34" cy="32" r="2.5" stroke="white" strokeWidth="1.5"/>
                  <line x1="21" y1="22.5" x2="16.5" y2="18" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                  <line x1="27" y1="22.5" x2="31.5" y2="18" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                  <line x1="21" y1="25.5" x2="16.5" y2="30" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                  <line x1="27" y1="25.5" x2="31.5" y2="30" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-sm tracking-wide text-slate-500">
                psiqui<span className="font-semibold text-slate-800">.tools</span>
              </span>
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}

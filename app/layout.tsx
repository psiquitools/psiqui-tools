import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
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
                <Image
                  src="/logo1.png"
                  alt="psiqui.tools"
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                />
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

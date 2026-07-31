"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function NavHeader() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/prueba2" || pathname === "/prueba") return null;

  const isHome = pathname === "/" || pathname === "/prueba";

  const backHref = (() => {
    if (isHome) return null;
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length >= 2) {
      const parent = "/" + segments.slice(0, -1).join("/");
      return parent === "/tools" ? "/" : parent;
    }
    return "/";
  })();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-3.5 md:px-12">
        {backHref && (
          <>
            <Link
              href={backHref}
              className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver
            </Link>
            <div className="w-px h-5 bg-slate-200" />
          </>
        )}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/psiqui-logo.svg"
            alt="psiqui.tools"
            width={32}
            height={32}
            className="rounded-lg"
            unoptimized
          />
          <span className="text-sm tracking-wide font-light text-slate-700">
            psiqui<span className="font-semibold text-slate-800">.tools</span>
          </span>
        </Link>
      </div>
    </header>
  );
}

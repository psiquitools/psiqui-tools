"use client";

import Link from "next/link";
import Image from "next/image";

interface TopBarProps {
    titulo: string;
}

export default function TopBar({ titulo }: TopBarProps) {
    return (
        <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

                {/* Logo + Home */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="bg-slate-800 p-2 rounded-md">
                        <Image
                            src="/logo1.png"
                            alt="psiqui.tools"
                            width={24}
                            height={24}
                            className="object-contain"
                            priority
                        />
                    </div>
                    <span className="text-sm font-medium text-slate-800 group-hover:text-slate-900">
                        psiqui.tools
                    </span>
                </Link>

                {/* Nombre herramienta */}
                <span className="text-sm text-slate-600">
                    {titulo}
                </span>

            </div>
        </div>
    );
}
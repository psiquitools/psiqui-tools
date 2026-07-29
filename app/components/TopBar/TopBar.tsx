"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";

interface TopBarProps {
    titulo: string;
    backHref?: string;
}

export default function TopBar({ backHref }: TopBarProps) {
    return (
        <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

                {/* Izquierda: botón retroceso + logo */}
                <div className="flex items-center">
                    {backHref && (
                        <>
                            <Link href={backHref} className="text-slate-400 hover:text-slate-700 transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </Link>
                            <span className="border-l border-slate-200 h-5 mx-2" />
                        </>
                    )}
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
                </div>

            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import {
    BookOpen,
    Smile,
    Zap,
    BrainCircuit,
    CheckCircle,
    Users,
    Wine,
    Moon,
    FileText,
    Search,
    ExternalLink,
    ArrowLeft,
} from "lucide-react";
import Link from "next/link";

/* ===================== TIPOS ===================== */

type Resource = {
    title: string;
    type: "Paciente" | "Familiar";
    url: string;
    description?: string;
};

type Category = {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    resources: Resource[];
};

/* ===================== DATOS ===================== */

const CATEGORIES: Category[] = [
    {
        id: "animo",
        title: "Depresión y Trastornos del Ánimo",
        description: "Depresión mayor, trastorno bipolar y distimia.",
        icon: Smile,
        resources: [
            {
                title: "Entendiendo la Depresión",
                type: "Paciente",
                url: "/pdfs/depresion/depresion.pdf",
                description: "Guía básica sobre síntomas y tratamiento.",
            },
            {
                title: "Plan de seguridad - suicidio",
                type: "Paciente",
                url: "/pdfs/depresion/plan-seguridad-crisis.pdf",
                description: "Plan de seguridad en crisis",
            },
        ],
    },
    {
        id: "ansiedad",
        title: "Trastornos de Ansiedad",
        description: "Ansiedad generalizada, crisis de pánico y fobias.",
        icon: Zap,
        resources: [
            {
                title: "Manejo de Crisis de Pánico",
                type: "Paciente",
                url: "/pdfs/ansiedad/ansiedad.pdf",
                description: "Técnicas de respiración y grounding.",
            },
        ],
    },
    {
        id: "psicosis",
        title: "Esquizofrenia y Psicosis",
        description: "Información para pacientes y familiares.",
        icon: BrainCircuit,
        resources: [
            {
                title: "¿Qué es la psicosis?",
                type: "Paciente",
                url: "/pdfs/psicosis/psicosis.pdf",
            },
            {
                title: "Entendiendo la esquizofrenia",
                type: "Paciente",
                url: "/pdfs/psicosis/esquizofrenia.pdf",
            },
        ],
    },
    {
        id: "toc",
        title: "Trastorno Obsesivo Compulsivo",
        description: "TOC y trastornos relacionados.",
        icon: CheckCircle,
        resources: [
            {
                title: "Entendiendo el TOC",
                type: "Paciente",
                url: "/pdfs/toc/toc.pdf",
            },
        ],
    },
    {
        id: "personalidad",
        title: "Trastornos de la Personalidad",
        description: "Especial foco en TLP.",
        icon: Users,
        resources: [
            {
                title: "Entendiendo el TLP",
                type: "Paciente",
                url: "/pdfs/tlp/tlp.pdf",
            },
        ],
    },
    {
        id: "adicciones",
        title: "Adicciones y Patología Dual",
        description: "Consumo de sustancias y recaídas.",
        icon: Wine,
        resources: [
            {
                title: "Prevención de recaídas",
                type: "Paciente",
                url: "/pdfs/adicciones/prevencion-recaidas.pdf",
            },
        ],
    },
    {
        id: "sueno",
        title: "Sueño e Higiene del Sueño",
        description: "Insomnio y hábitos saludables.",
        icon: Moon,
        resources: [
            {
                title: 'Pautas de Higiene del Sueño',
                type: 'Paciente',
                url: '/pdfs/sueno/higiene-sueno.pdf',
                description: 'Recomendaciones prácticas para mejorar el sueño.'
            },
        ],
    },
];

/* ===================== COMPONENTE ===================== */

export default function RecursosPsicoeducacionPage() {
    const [search, setSearch] = useState("");

    const filtered = CATEGORIES.map((cat) => {
        if (!search.trim()) return cat;

        const matchesCategory =
            cat.title.toLowerCase().includes(search.toLowerCase()) ||
            cat.description.toLowerCase().includes(search.toLowerCase());

        const resources = cat.resources.filter(
            (r) =>
                r.title.toLowerCase().includes(search.toLowerCase()) ||
                (r.description &&
                    r.description.toLowerCase().includes(search.toLowerCase()))
        );

        if (matchesCategory) return cat;
        if (resources.length > 0) return { ...cat, resources };

        return null;
    }).filter(Boolean) as Category[];

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Barra superior */}
            <div className="sticky top-0 z-40 bg-white border-b">
                <div className="max-w-6xl mx-auto px-4 py-3">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver a psiqui.tools
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-4 md:p-8 pb-24">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold text-slate-900 flex items-center gap-3">
                        <BookOpen className="w-7 h-7 text-slate-700" />
                        Recursos de Psicoeducación
                    </h1>
                    <p className="text-slate-600 mt-2">
                        Material educativo para pacientes y familiares, listo para imprimir.
                    </p>
                </div>

                {/* Buscador */}
                <div className="relative mb-10 max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500"
                        placeholder="Buscar por tema o título…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Contenido */}
                <div className="space-y-10">
                    {filtered.length === 0 && (
                        <div className="bg-white border border-dashed border-slate-300 rounded-lg p-10 text-center text-slate-500">
                            No se encontraron recursos.
                        </div>
                    )}

                    {filtered.map((category) => {
                        const Icon = category.icon;
                        return (
                            <div key={category.id}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-slate-200 rounded-lg">
                                        <Icon className="w-5 h-5 text-slate-700" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900">
                                            {category.title}
                                        </h2>
                                        <p className="text-sm text-slate-600">
                                            {category.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {category.resources.map((res, i) => (
                                        <div
                                            key={i}
                                            className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span
                                                    className={`text-xs font-semibold px-2 py-1 rounded ${res.type === "Paciente"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-emerald-100 text-emerald-800"
                                                        }`}
                                                >
                                                    {res.type}
                                                </span>
                                                <FileText className="w-4 h-4 text-slate-400" />
                                            </div>

                                            <h3 className="text-sm font-semibold text-slate-900 mb-1">
                                                {res.title}
                                            </h3>

                                            {res.description && (
                                                <p className="text-xs text-slate-600 mb-3">
                                                    {res.description}
                                                </p>
                                            )}

                                            <a
                                                href={res.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-sm text-slate-700 hover:text-slate-900"
                                            >
                                                Ver documento
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Pill, TrendingDown, ClipboardList, Repeat2, Droplets, Syringe } from "lucide-react";

type Categoria = "General" | "Antidepresivos" | "Antipsicóticos" | "Benzodiacepinas";

interface Herramienta {
    id: string;
    title: string;
    description: string;
    icon: typeof Pill;
    href: string;
    categoria: Categoria;
}

const HERRAMIENTAS: Herramienta[] = [
    {
        id: "generador-pauta",
        title: "Generador de Pauta",
        description: "Genera la pauta farmacológica para el plan de manejo del paciente, lista para copiar en el informe clínico.",
        icon: ClipboardList,
        href: "/tools/generador-pauta",
        categoria: "General",
    },
    {
        id: "formulaciones-liquidas",
        title: "Formulaciones líquidas",
        description: "Conversión mg · mL · gotas para soluciones orales: haloperidol, clonazepam, risperidona, aripiprazol, quetiapina y más.",
        icon: Droplets,
        href: "/tools/calculadoras-clinicas/formulaciones-liquidas",
        categoria: "General",
    },
    {
        id: "cambio-antidepresivo",
        title: "Cambio de antidepresivo",
        description: "Consulta rápida y tabla completa de cambio entre antidepresivos según la Tabla 3.7 del Maudsley Prescribing Guidelines.",
        icon: Repeat2,
        href: "/tools/calculadoras-clinicas/cambio-antidepresivo",
        categoria: "Antidepresivos",
    },
    {
        id: "depot-lai",
        title: "Antipsicóticos de depósito (LAI)",
        description: "Protocolos de inicio, equivalencias oral-LAI y cadena de conversión entre productos de paliperidona, aripiprazol, olanzapina y primera generación.",
        icon: Syringe,
        href: "/tools/calculadoras-clinicas/depot-lai",
        categoria: "Antipsicóticos",
    },
    {
        id: "equivalencias-bzd",
        title: "Equivalencias de benzodiacepinas",
        description: "Conversión entre benzodiacepinas usando diazepam 10 mg como referencia. Incluye fármacos Z y presentaciones disponibles en España.",
        icon: Pill,
        href: "/tools/calculadoras-clinicas/equivalencias-bzd",
        categoria: "Benzodiacepinas",
    },
    {
        id: "discontinuacion-bzd",
        title: "Plan de discontinuación de benzodiacepinas",
        description: "Genera un plan de retirada gradual con enfoque hiperbólico según el fármaco, la dosis, el tiempo de uso y la velocidad de reducción.",
        icon: TrendingDown,
        href: "/tools/calculadoras-clinicas/discontinuacion-bzd",
        categoria: "Benzodiacepinas",
    },
];

const CATEGORIAS: (Categoria | "Todas")[] = ["Todas", "General", "Antidepresivos", "Antipsicóticos", "Benzodiacepinas"];

export default function CalculadorasPage() {
    const [categoriaActiva, setCategoriaActiva] = useState<Categoria | "Todas">("Todas");

    const visibles = categoriaActiva === "Todas"
        ? HERRAMIENTAS
        : HERRAMIENTAS.filter(h => h.categoria === categoriaActiva);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-6">

                <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                    <ArrowLeft className="w-4 h-4" />
                    Volver a psiqui.tools
                </Link>

                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Herramientas Farmacológicas</h1>
                    <p className="text-sm text-slate-600 mt-1">Conversiones, cálculos y pautas de uso frecuente en psiquiatría</p>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap gap-2">
                    {CATEGORIAS.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoriaActiva(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                categoriaActiva === cat
                                    ? "bg-slate-800 text-white"
                                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {visibles.map(calc => {
                        const Icon = calc.icon;
                        return (
                            <Link
                                key={calc.id}
                                href={calc.href}
                                className="group bg-white border-2 border-slate-200 rounded-lg p-6 hover:border-slate-400 hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="bg-slate-100 p-3 rounded-lg group-hover:bg-slate-800 transition-colors">
                                        <Icon className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors" />
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-slate-800 transition-all" />
                                </div>
                                <div className="mb-1 flex items-center gap-2">
                                    <h3 className="text-lg font-semibold text-slate-800">{calc.title}</h3>
                                </div>
                                <p className="text-[11px] text-slate-400 mb-1.5">{calc.categoria}</p>
                                <p className="text-sm text-slate-600 leading-relaxed">{calc.description}</p>
                            </Link>
                        );
                    })}
                </div>

                <p className="text-xs text-slate-400 text-center pt-4">
                    Herramienta de apoyo clínico • No sustituye el criterio médico profesional
                </p>

            </div>
        </div>
    );
}

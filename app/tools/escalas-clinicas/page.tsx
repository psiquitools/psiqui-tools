"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, ArrowLeft, AlertCircle } from "lucide-react";

interface Escala {
    id: string;
    title: string;
    description: string;
    href: string;
    tag: "Autoadministrada" | "Clínico";
    area: string;
}

const ESCALAS: Escala[] = [
    { id: "phq-9",   title: "PHQ-9",    area: "Depresión",           tag: "Autoadministrada", href: "/tools/escalas-clinicas/phq-9",   description: "Cribado y severidad de depresión. Incluye ítem de riesgo suicida." },
    { id: "madrs",   title: "MADRS",    area: "Depresión",           tag: "Clínico",           href: "/tools/escalas-clinicas/madrs",   description: "Escala de Depresión de Montgomery-Åsberg. 10 ítems, evaluación clínica 0–6." },
    { id: "gad-7",   title: "GAD-7",    area: "Ansiedad",            tag: "Autoadministrada", href: "/tools/escalas-clinicas/gad-7",   description: "Escala de trastorno de ansiedad generalizada. Cribado y seguimiento clínico." },
    { id: "ham-a",   title: "HAM-A",    area: "Ansiedad",            tag: "Clínico",           href: "/tools/escalas-clinicas/ham-a",   description: "Escala de Ansiedad de Hamilton. 14 ítems con subescalas psíquica y somática." },
    { id: "panss",   title: "PANSS",    area: "Psicosis",            tag: "Clínico",           href: "/tools/escalas-clinicas/panss",   description: "Escala de Síndromes Positivo y Negativo. 30 ítems para evaluación dimensional de psicosis." },
    { id: "ymrs",    title: "YMRS",     area: "Trastorno bipolar",   tag: "Clínico",           href: "/tools/escalas-clinicas/ymrs",    description: "Escala de Young para la Evaluación de la Manía. 11 ítems, validada en español." },
    { id: "ybocs",   title: "Y-BOCS",   area: "TOC",                 tag: "Clínico",           href: "/tools/escalas-clinicas/ybocs",   description: "Escala Yale-Brown de Obsesiones y Compulsiones. Subescalas de obsesiones y compulsiones." },
    { id: "isi",     title: "ISI",      area: "Sueño",               tag: "Autoadministrada", href: "/tools/escalas-clinicas/isi",     description: "Índice de Gravedad del Insomnio. 7 ítems para cribado y seguimiento del insomnio." },
    { id: "audit",   title: "AUDIT",    area: "Alcohol y sustancias", tag: "Autoadministrada", href: "/tools/escalas-clinicas/audit",   description: "Test de Identificación de Trastornos por Uso de Alcohol. 10 ítems validados por la OMS." },
    { id: "ciwa-ar", title: "CIWA-Ar",  area: "Alcohol y sustancias", tag: "Clínico",           href: "/tools/escalas-clinicas/ciwa-ar", description: "Evaluación del síndrome de abstinencia alcohólica. Orienta la gravedad y el manejo." },
];

const AREAS = ["Todas", ...Array.from(new Set(ESCALAS.map(e => e.area)))];

export default function EscalasClinicasPage() {
    const [areaActiva, setAreaActiva] = useState("Todas");

    const visibles = areaActiva === "Todas" ? ESCALAS : ESCALAS.filter(e => e.area === areaActiva);

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">

                <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                    <ArrowLeft className="w-4 h-4" />
                    Volver a psiqui.tools
                </Link>

                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-3 rounded-lg">
                        <Activity className="w-6 h-6 text-slate-700" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Escalas Clínicas</h1>
                        <p className="text-sm text-slate-600">Herramientas de evaluación validadas en español</p>
                    </div>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-800">
                            Las escalas se calculan íntegramente en el navegador. No se almacena ni transmite información clínica.
                        </p>
                    </div>
                </div>

                {/* Barra de filtros */}
                <div className="flex flex-wrap gap-2">
                    {AREAS.map(area => (
                        <button
                            key={area}
                            onClick={() => setAreaActiva(area)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                areaActiva === area
                                    ? "bg-slate-800 text-white"
                                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900"
                            }`}
                        >
                            {area}
                        </button>
                    ))}
                </div>

                {/* Grilla de tarjetas */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {visibles.map(escala => (
                        <Link
                            key={escala.id}
                            href={escala.href}
                            className="group bg-white border-2 border-slate-200 rounded-xl p-5 hover:border-slate-400 hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
                        >
                            <div className="flex items-start justify-between mb-1">
                                <h3 className="text-lg font-semibold text-slate-800">{escala.title}</h3>
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                                    escala.tag === "Clínico"
                                        ? "bg-slate-100 text-slate-600"
                                        : "bg-blue-50 text-blue-600"
                                }`}>
                                    {escala.tag}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mb-1.5">{escala.area}</p>
                            <p className="text-sm text-slate-600 leading-relaxed">{escala.description}</p>
                        </Link>
                    ))}
                </div>

                <p className="text-xs text-slate-400 text-center pt-2 pb-4">
                    Herramienta de apoyo clínico · No sustituye el criterio médico profesional
                </p>
            </div>
        </div>
    );
}

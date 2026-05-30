"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Activity, RotateCcw, Copy, Check, ArrowLeft } from "lucide-react";

/* ─── datos ─────────────────────────────────────────────── */

const OPTS_GRAVEDAD = [
    { value: 0, label: "Ninguna" },
    { value: 1, label: "Leve" },
    { value: 2, label: "Moderada" },
    { value: 3, label: "Grave" },
    { value: 4, label: "Muy grave" },
];

const OPTS_SATISFACCION = [
    { value: 0, label: "Muy satisfecho/a" },
    { value: 1, label: "Satisfecho/a" },
    { value: 2, label: "Moderadamente satisfecho/a" },
    { value: 3, label: "Insatisfecho/a" },
    { value: 4, label: "Muy insatisfecho/a" },
];

const OPTS_INTERFERENCIA = [
    { value: 0, label: "Nada" },
    { value: 1, label: "Un poco" },
    { value: 2, label: "Bastante" },
    { value: 3, label: "Mucho" },
    { value: 4, label: "Muchísimo" },
];

const ITEMS = [
    { id: "i1", label: "1. Dificultad para conciliar el sueño", opts: OPTS_GRAVEDAD },
    { id: "i2", label: "2. Dificultad para mantener el sueño (despertares nocturnos)", opts: OPTS_GRAVEDAD },
    { id: "i3", label: "3. Problema de despertar demasiado temprano", opts: OPTS_GRAVEDAD },
    {
        id: "i4",
        label: "4. Satisfacción con tu patrón de sueño actual",
        opts: OPTS_SATISFACCION,
    },
    {
        id: "i5",
        label: "5. ¿En qué medida tu problema de sueño interfiere con tu funcionamiento diario? (p. ej., fatiga, concentración, humor, rendimiento)",
        opts: OPTS_INTERFERENCIA,
    },
    {
        id: "i6",
        label: "6. ¿Qué tan visible para los demás crees que es el deterioro en tu calidad de vida debido al problema de sueño?",
        opts: OPTS_INTERFERENCIA,
    },
    {
        id: "i7",
        label: "7. ¿Qué tan preocupado/a o angustiado/a estás por tu problema de sueño actual?",
        opts: OPTS_INTERFERENCIA,
    },
];

/* ─── interpretación ─────────────────────────────────────── */

const scoreStyle = (score: number) => {
    if (score <= 7)  return { bg: "bg-green-50",  border: "border-green-300",  text: "text-green-700",  label: "Sin insomnio clínicamente significativo", action: "Seguimiento habitual." };
    if (score <= 14) return { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700", label: "Insomnio subumbral (leve)",               action: "Higiene del sueño y psicoeducación." };
    if (score <= 21) return { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", label: "Insomnio clínico moderado",               action: "Terapia cognitivo-conductual para el insomnio (TCC-I)." };
    return               { bg: "bg-red-50",    border: "border-red-300",    text: "text-red-700",    label: "Insomnio clínico grave",                 action: "Evaluación especializada; valorar TCC-I ± farmacoterapia." };
};

/* ─── componente ─────────────────────────────────────────── */

export default function IsiPage() {
    const [scores, setScores] = useState<Record<string, number>>({});
    const [copied, setCopied] = useState(false);

    const total = useMemo(() => Object.values(scores).reduce((a, b) => a + b, 0), [scores]);
    const answered = Object.keys(scores).length;
    const style = scoreStyle(total);

    const set   = (id: string, v: number) => setScores(p => ({ ...p, [id]: v }));
    const reset = () => { setScores({}); setCopied(false); };

    const copyResult = () => {
        const text = [
            "ISI — Índice de Gravedad del Insomnio",
            `Puntaje total: ${total}/28`,
            `Resultado: ${style.label}`,
            "",
            ...ITEMS.map(item => {
                const v = scores[item.id];
                const label = v !== undefined ? item.opts.find(o => o.value === v)?.label ?? v : "-";
                return `${item.label}: ${label} (${v ?? "-"})`;
            }),
        ].join("\n");
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6">
            <div className="max-w-3xl mx-auto space-y-6">

                <Link href="/tools/escalas-clinicas" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Escalas Clínicas
                </Link>

                <div className="flex items-center gap-3">
                    <Activity className="w-7 h-7 text-slate-700" />
                    <div>
                        <h1 className="text-2xl font-semibold">ISI</h1>
                        <p className="text-sm text-slate-600">Índice de Gravedad del Insomnio</p>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                    <strong>Instrucciones:</strong> Responde en función de tu patrón de sueño durante las <strong>últimas 2 semanas</strong>.
                </div>

                {ITEMS.map(item => (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-slate-800 mb-3">{item.label}</p>
                        <div className="flex flex-col gap-1.5">
                            {item.opts.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => set(item.id, opt.value)}
                                    className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors
                                        ${scores[item.id] === opt.value
                                            ? "bg-slate-800 text-white border-slate-800"
                                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"}`}
                                >
                                    <span className="font-semibold mr-2">{opt.value}</span>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <div className={`rounded-xl border-2 ${style.bg} ${style.border} p-5`}>
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Puntaje Total</p>
                            <p className={`text-4xl font-bold ${style.text}`}>{total}<span className="text-base opacity-60"> / 28</span></p>
                            {answered < 7 && <p className="text-xs text-slate-400 mt-1">{answered}/7 ítems respondidos</p>}
                        </div>
                        <div className="text-right">
                            <p className={`text-base font-semibold ${style.text}`}>{style.label}</p>
                            <p className="text-sm text-slate-600 mt-0.5 max-w-[200px]">{style.action}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button onClick={copyResult} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 text-sm">
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            Copiar resultado
                        </button>
                        <button onClick={reset} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-100 text-sm">
                            <RotateCcw className="w-4 h-4" />
                            Limpiar
                        </button>
                    </div>
                </div>

                <p className="text-center text-xs text-slate-400 pb-4">
                    Herramienta de apoyo clínico · No sustituye el criterio médico profesional
                </p>
            </div>
        </div>
    );
}

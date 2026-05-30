"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Activity, RotateCcw, Copy, Check, ArrowLeft } from "lucide-react";

/* ─── datos ─────────────────────────────────────────────── */

const ITEMS = [
    {
        id: "o1", label: "1. Tiempo ocupado por las obsesiones",
        sub: "¿Cuánto tiempo ocupan las obsesiones?",
        opts: [
            { value: 0, label: "Sin síntomas" },
            { value: 1, label: "Leve — menos de 1 hora al día" },
            { value: 2, label: "Moderado — 1 a 3 horas al día" },
            { value: 3, label: "Grave — más de 3 y hasta 8 horas al día" },
            { value: 4, label: "Extremo — más de 8 horas al día" },
        ],
    },
    {
        id: "o2", label: "2. Interferencia por las obsesiones",
        sub: "¿En qué medida interfieren las obsesiones con el funcionamiento social, laboral o académico?",
        opts: [
            { value: 0, label: "Sin interferencia" },
            { value: 1, label: "Leve — interferencia mínima" },
            { value: 2, label: "Moderada — interferencia definida pero manejable" },
            { value: 3, label: "Grave — deterioro funcional marcado" },
            { value: 4, label: "Extrema — incapacitante" },
        ],
    },
    {
        id: "o3", label: "3. Malestar asociado a las obsesiones",
        sub: "¿Cuánto malestar causan las obsesiones?",
        opts: [
            { value: 0, label: "Sin malestar" },
            { value: 1, label: "Leve — poco frecuente y no muy perturbador" },
            { value: 2, label: "Moderado — frecuente y perturbador, pero manejable" },
            { value: 3, label: "Grave — muy frecuente e intenso" },
            { value: 4, label: "Extremo — perturbación casi continua e incapacitante" },
        ],
    },
    {
        id: "o4", label: "4. Resistencia a las obsesiones",
        sub: "¿Cuánto esfuerzo hace para resistir las obsesiones?",
        opts: [
            { value: 0, label: "Siempre resiste (o síntomas mínimos)" },
            { value: 1, label: "Resiste en la mayoría de los casos" },
            { value: 2, label: "Hace algún esfuerzo por resistir" },
            { value: 3, label: "Cede en la mayoría de los casos" },
            { value: 4, label: "Se rinde por completo a todas las obsesiones" },
        ],
    },
    {
        id: "o5", label: "5. Control sobre las obsesiones",
        sub: "¿Cuánto control tiene sobre sus pensamientos obsesivos?",
        opts: [
            { value: 0, label: "Control completo" },
            { value: 1, label: "Control fuerte — habitualmente puede detenerlos" },
            { value: 2, label: "Control moderado — a veces puede detenerlos con esfuerzo" },
            { value: 3, label: "Control escaso — raramente logra detenerlos" },
            { value: 4, label: "Sin control — apenas puede posponer brevemente las obsesiones" },
        ],
    },
    {
        id: "c1", label: "6. Tiempo ocupado por las compulsiones",
        sub: "¿Cuánto tiempo dedica a las compulsiones?",
        opts: [
            { value: 0, label: "Sin síntomas" },
            { value: 1, label: "Leve — menos de 1 hora al día" },
            { value: 2, label: "Moderado — 1 a 3 horas al día" },
            { value: 3, label: "Grave — más de 3 y hasta 8 horas al día" },
            { value: 4, label: "Extremo — más de 8 horas al día" },
        ],
    },
    {
        id: "c2", label: "7. Interferencia por las compulsiones",
        sub: "¿En qué medida interfieren las compulsiones con el funcionamiento social, laboral o académico?",
        opts: [
            { value: 0, label: "Sin interferencia" },
            { value: 1, label: "Leve — interferencia mínima" },
            { value: 2, label: "Moderada — interferencia definida pero manejable" },
            { value: 3, label: "Grave — deterioro funcional marcado" },
            { value: 4, label: "Extrema — incapacitante" },
        ],
    },
    {
        id: "c3", label: "8. Malestar si se interrumpen las compulsiones",
        sub: "¿Cuánta angustia experimenta si se ven impedidas las compulsiones?",
        opts: [
            { value: 0, label: "Sin malestar" },
            { value: 1, label: "Leve — poco frecuente y no muy perturbador" },
            { value: 2, label: "Moderado — frecuente y perturbador, pero manejable" },
            { value: 3, label: "Grave — muy frecuente e intenso" },
            { value: 4, label: "Extremo — perturbación casi continua e incapacitante" },
        ],
    },
    {
        id: "c4", label: "9. Resistencia a las compulsiones",
        sub: "¿Cuánto esfuerzo hace para resistir las compulsiones?",
        opts: [
            { value: 0, label: "Siempre resiste (o síntomas mínimos)" },
            { value: 1, label: "Resiste en la mayoría de los casos" },
            { value: 2, label: "Hace algún esfuerzo por resistir" },
            { value: 3, label: "Cede en la mayoría de los casos" },
            { value: 4, label: "Se rinde por completo a todas las compulsiones" },
        ],
    },
    {
        id: "c5", label: "10. Control sobre las compulsiones",
        sub: "¿Cuánto control tiene sobre las compulsiones?",
        opts: [
            { value: 0, label: "Control completo" },
            { value: 1, label: "Control fuerte — habitualmente puede detenerlas" },
            { value: 2, label: "Control moderado — a veces puede detenerlas con esfuerzo" },
            { value: 3, label: "Control escaso — raramente logra detenerlas" },
            { value: 4, label: "Sin control — apenas puede posponer brevemente las compulsiones" },
        ],
    },
];

const OBS_IDS = ["o1","o2","o3","o4","o5"];
const COMP_IDS = ["c1","c2","c3","c4","c5"];

/* ─── interpretación ─────────────────────────────────────── */

const scoreStyle = (score: number) => {
    if (score <= 7)  return { bg: "bg-green-50",  border: "border-green-300",  text: "text-green-700",  label: "Subclínico",   action: "Sin intervención específica indicada." };
    if (score <= 15) return { bg: "bg-blue-50",   border: "border-blue-300",   text: "text-blue-700",   label: "Leve",         action: "Psicoeducación; valorar TCC con EPR." };
    if (score <= 23) return { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700", label: "Moderado",     action: "TCC con exposición y prevención de respuesta (EPR); valorar ISRS." };
    if (score <= 31) return { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", label: "Grave",        action: "Tratamiento combinado (TCC + ISRS); seguimiento estrecho." };
    return               { bg: "bg-red-50",    border: "border-red-300",    text: "text-red-700",    label: "Extremo",      action: "Intervención intensiva; valorar derivación especializada." };
};

/* ─── componente ─────────────────────────────────────────── */

export default function YbocsPage() {
    const [scores, setScores] = useState<Record<string, number>>({});
    const [copied, setCopied] = useState(false);

    const scoreObs  = useMemo(() => OBS_IDS.reduce((a, id)  => a + (scores[id] ?? 0), 0), [scores]);
    const scoreComp = useMemo(() => COMP_IDS.reduce((a, id) => a + (scores[id] ?? 0), 0), [scores]);
    const total     = useMemo(() => scoreObs + scoreComp, [scoreObs, scoreComp]);

    const answered = Object.keys(scores).length;
    const style = scoreStyle(total);

    const set   = (id: string, v: number) => setScores(p => ({ ...p, [id]: v }));
    const reset = () => { setScores({}); setCopied(false); };

    const copyResult = () => {
        const text = [
            "Y-BOCS — Escala Yale-Brown de Obsesiones y Compulsiones",
            `Subescala Obsesiones:   ${scoreObs}/20`,
            `Subescala Compulsiones: ${scoreComp}/20`,
            `Puntaje Total:          ${total}/40 — ${style.label}`,
            "",
            ...ITEMS.map(item => `${item.label}: ${scores[item.id] ?? "-"}`),
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
                        <h1 className="text-2xl font-semibold">Y-BOCS</h1>
                        <p className="text-sm text-slate-600">Escala Yale-Brown de Obsesiones y Compulsiones</p>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                    <strong>Instrucciones:</strong> Escala administrada por el clínico. Evalúa la gravedad de los síntomas durante la <strong>última semana</strong>. Los ítems 4, 5, 9 y 10 (resistencia y control) están invertidos: puntuaciones más bajas indican mejor resistencia/control.
                </div>

                {/* Sticky resumen */}
                <div className="sticky top-16 z-30 bg-white border border-slate-200 rounded-xl shadow-sm px-4 py-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Obsesiones</div>
                            <div className="text-xl font-bold text-slate-800">{scoreObs || "—"}<span className="text-xs text-slate-400">/20</span></div>
                        </div>
                        <div>
                            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Compulsiones</div>
                            <div className="text-xl font-bold text-slate-800">{scoreComp || "—"}<span className="text-xs text-slate-400">/20</span></div>
                        </div>
                        <div className={`rounded-lg px-2 py-1 ${style.bg}`}>
                            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Total</div>
                            <div className={`text-xl font-bold ${style.text}`}>{total || "—"}<span className="text-xs opacity-60">/40</span></div>
                            <div className={`text-xs font-medium ${style.text}`}>{style.label}</div>
                        </div>
                    </div>
                </div>

                {/* Sección obsesiones */}
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 px-1">Subescala de Obsesiones</h2>
                {ITEMS.slice(0, 5).map(item => (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-slate-800 mb-0.5">{item.label}</p>
                        <p className="text-xs text-slate-500 italic mb-3">{item.sub}</p>
                        <div className="space-y-1">
                            {item.opts.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => set(item.id, opt.value)}
                                    className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors
                                        ${scores[item.id] === opt.value
                                            ? "bg-slate-800 text-white border-slate-800"
                                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"}`}
                                >
                                    <span className="font-bold mr-2">{opt.value}</span>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Sección compulsiones */}
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 px-1">Subescala de Compulsiones</h2>
                {ITEMS.slice(5).map(item => (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-slate-800 mb-0.5">{item.label}</p>
                        <p className="text-xs text-slate-500 italic mb-3">{item.sub}</p>
                        <div className="space-y-1">
                            {item.opts.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => set(item.id, opt.value)}
                                    className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors
                                        ${scores[item.id] === opt.value
                                            ? "bg-slate-800 text-white border-slate-800"
                                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"}`}
                                >
                                    <span className="font-bold mr-2">{opt.value}</span>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Resultado */}
                <div className={`rounded-xl border-2 ${style.bg} ${style.border} p-5`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Puntaje Total</p>
                            <p className={`text-4xl font-bold ${style.text}`}>{total || "—"}<span className="text-base opacity-60"> / 40</span></p>
                            {answered < 10 && <p className="text-xs text-slate-400 mt-1">{answered}/10 ítems puntuados</p>}
                        </div>
                        <div className="text-right">
                            <p className={`text-lg font-semibold ${style.text}`}>{style.label}</p>
                            <p className="text-sm text-slate-600 mt-0.5 max-w-[200px]">{style.action}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center text-sm mb-4">
                        <div className="bg-white/60 rounded-lg p-2">
                            <div className="text-slate-500 text-xs mb-0.5">Obsesiones</div>
                            <div className="font-bold">{scoreObs || "—"}<span className="text-xs text-slate-400">/20</span></div>
                        </div>
                        <div className="bg-white/60 rounded-lg p-2">
                            <div className="text-slate-500 text-xs mb-0.5">Compulsiones</div>
                            <div className="font-bold">{scoreComp || "—"}<span className="text-xs text-slate-400">/20</span></div>
                        </div>
                    </div>

                    <div className="flex gap-2">
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

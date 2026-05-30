"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Activity, RotateCcw, Copy, Check, ArrowLeft, AlertTriangle } from "lucide-react";

/* ─── datos ─────────────────────────────────────────────── */

const Q_FRECUENCIA = [
    { value: 0, label: "Nunca" },
    { value: 1, label: "Una vez al mes o menos" },
    { value: 2, label: "De 2 a 4 veces al mes" },
    { value: 3, label: "De 2 a 3 veces a la semana" },
    { value: 4, label: "4 o más veces a la semana" },
];

const Q_CANTIDAD = [
    { value: 0, label: "1 o 2" },
    { value: 1, label: "3 o 4" },
    { value: 2, label: "5 o 6" },
    { value: 3, label: "7, 8 o 9" },
    { value: 4, label: "10 o más" },
];

const Q_FRECUENCIA_ULTIMO_ANO = [
    { value: 0, label: "Nunca" },
    { value: 1, label: "Menos de una vez al mes" },
    { value: 2, label: "Mensualmente" },
    { value: 3, label: "Semanalmente" },
    { value: 4, label: "A diario o casi a diario" },
];

const Q_SINO = [
    { value: 0, label: "No" },
    { value: 2, label: "Sí, pero no en el último año" },
    { value: 4, label: "Sí, en el último año" },
];

const ITEMS = [
    { id: "q1",  text: "¿Con qué frecuencia consumes alguna bebida alcohólica?", opts: Q_FRECUENCIA },
    { id: "q2",  text: "¿Cuántas bebidas alcohólicas consumes normalmente los días que bebes?", opts: Q_CANTIDAD },
    { id: "q3",  text: "¿Con qué frecuencia tomas 6 o más bebidas alcohólicas en un solo día?", opts: Q_FRECUENCIA_ULTIMO_ANO },
    { id: "q4",  text: "¿Con qué frecuencia, en el último año, has sido incapaz de parar de beber una vez que habías empezado?", opts: Q_FRECUENCIA_ULTIMO_ANO },
    { id: "q5",  text: "¿Con qué frecuencia, en el último año, no pudiste cumplir con tus obligaciones porque habías bebido?", opts: Q_FRECUENCIA_ULTIMO_ANO },
    { id: "q6",  text: "¿Con qué frecuencia, en el último año, has necesitado beber en ayunas para recuperarte después de haber bebido mucho el día anterior?", opts: Q_FRECUENCIA_ULTIMO_ANO },
    { id: "q7",  text: "¿Con qué frecuencia, en el último año, has tenido remordimientos o sentimientos de culpa después de haber bebido?", opts: Q_FRECUENCIA_ULTIMO_ANO },
    { id: "q8",  text: "¿Con qué frecuencia, en el último año, no has podido recordar lo que sucedió la noche anterior porque habías estado bebiendo?", opts: Q_FRECUENCIA_ULTIMO_ANO },
    { id: "q9",  text: "¿Tú o alguna otra persona habéis resultado heridos porque habías bebido?", opts: Q_SINO },
    { id: "q10", text: "¿Algún familiar, amigo, médico u otro profesional sanitario ha mostrado preocupación por tu consumo de bebidas alcohólicas o te ha sugerido que dejes de beber?", opts: Q_SINO },
];

/* ─── interpretación ─────────────────────────────────────── */

const scoreStyle = (score: number) => {
    if (score <= 7)  return { bg: "bg-green-50",  border: "border-green-300",  text: "text-green-700",  label: "Consumo de bajo riesgo",     action: "Sin intervención indicada; refuerzo positivo." };
    if (score <= 15) return { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700", label: "Consumo de riesgo",            action: "Intervención breve y consejo para reducir el consumo." };
    if (score <= 19) return { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", label: "Consumo perjudicial",          action: "Intervención breve y seguimiento estrecho." };
    return               { bg: "bg-red-50",    border: "border-red-300",    text: "text-red-700",    label: "Alta probabilidad de dependencia", action: "Derivación a tratamiento especializado." };
};

/* ─── componente ─────────────────────────────────────────── */

export default function AuditPage() {
    const [scores, setScores] = useState<Record<string, number>>({});
    const [copied, setCopied] = useState(false);

    const total = useMemo(() => Object.values(scores).reduce((a, b) => a + b, 0), [scores]);
    const answered = Object.keys(scores).length;
    const style = scoreStyle(total);

    const set   = (id: string, v: number) => setScores(p => ({ ...p, [id]: v }));
    const reset = () => { setScores({}); setCopied(false); };

    const copyResult = () => {
        const text = [
            "AUDIT",
            `Puntaje total: ${total}/40`,
            `Resultado: ${style.label}`,
            `Recomendación: ${style.action}`,
            "",
            ...ITEMS.map((item, i) => {
                const v = scores[item.id];
                const label = v !== undefined ? item.opts.find(o => o.value === v)?.label ?? v : "-";
                return `${i + 1}. ${item.text}\n   Respuesta: ${label} (${v ?? "-"})`;
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
                        <h1 className="text-2xl font-semibold">AUDIT</h1>
                        <p className="text-sm text-slate-600">Test de Identificación de Trastornos por Uso de Alcohol</p>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                    <strong>Instrucciones:</strong> Selecciona la respuesta que mejor describa tu consumo de alcohol durante el último año. Una "bebida" equivale a una caña/copa de vino/copa de licor.
                </div>

                {ITEMS.map((item, index) => (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-slate-800 mb-3">{index + 1}. {item.text}</p>
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

                {/* Alerta si preguntas 9 o 10 positivas */}
                {((scores.q9 ?? 0) > 0 || (scores.q10 ?? 0) > 0) && (
                    <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-900">
                            <strong>Nota clínica:</strong> La respuesta positiva a las preguntas 9 o 10 indica consecuencias físicas o preocupación de terceros — evaluar con mayor profundidad independientemente del puntaje total.
                        </p>
                    </div>
                )}

                <div className={`rounded-xl border-2 ${style.bg} ${style.border} p-5`}>
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Puntaje Total</p>
                            <p className={`text-4xl font-bold ${style.text}`}>{total}<span className="text-base opacity-60"> / 40</span></p>
                            {answered < 10 && <p className="text-xs text-slate-400 mt-1">{answered}/10 preguntas respondidas</p>}
                        </div>
                        <div className="text-right">
                            <p className={`text-lg font-semibold ${style.text}`}>{style.label}</p>
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

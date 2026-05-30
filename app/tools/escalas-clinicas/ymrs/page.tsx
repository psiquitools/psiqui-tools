"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Activity, RotateCcw, Copy, Check, ArrowLeft } from "lucide-react";

/* ─── datos ─────────────────────────────────────────────── */

const ITEMS = [
    {
        id: "y1", label: "1. Estado de ánimo elevado",
        opts: [
            { value: 0, label: "Ausente" },
            { value: 1, label: "Levemente elevado o cuestionable" },
            { value: 2, label: "Subjetivamente elevado; optimista, seguro de sí mismo; apropiado al contenido" },
            { value: 3, label: "Elevado; humor inadecuado al contenido; jocoso" },
            { value: 4, label: "Euforia; risas inapropiadas; canto" },
        ],
    },
    {
        id: "y2", label: "2. Aumento de la actividad motora / energía",
        opts: [
            { value: 0, label: "Ausente" },
            { value: 1, label: "Subjetivamente aumentada" },
            { value: 2, label: "Enérgico; gesticula con más viveza" },
            { value: 3, label: "Energía excesiva; hiperactivo en algunos momentos; inquietud (puede calmarse)" },
            { value: 4, label: "Agitación o hiperactividad motora constante; no puede calmarse" },
        ],
    },
    {
        id: "y3", label: "3. Interés sexual",
        opts: [
            { value: 0, label: "Normal; no aumentado" },
            { value: 1, label: "Levemente o posiblemente aumentado" },
            { value: 2, label: "Subjetivamente aumentado al interrogarlo" },
            { value: 3, label: "Contenido sexual espontáneo; habla sobre sexo; hipersexualidad moderada" },
            { value: 4, label: "Preocupación abierta por el sexo" },
        ],
    },
    {
        id: "y4", label: "4. Sueño",
        opts: [
            { value: 0, label: "No refiere disminución del sueño" },
            { value: 1, label: "Duerme hasta 1 hora menos de lo habitual" },
            { value: 2, label: "Duerme más de 1 hora menos de lo habitual" },
            { value: 3, label: "Refiere disminución de la necesidad de sueño" },
            { value: 4, label: "Niega necesitar sueño" },
        ],
    },
    {
        id: "y5", label: "5. Irritabilidad ★",
        nota: "Ítem con escala 0–8 (puntuaciones pares)",
        opts: [
            { value: 0, label: "Ausente" },
            { value: 2, label: "Subjetivamente aumentada" },
            { value: 4, label: "Irritable en algunos momentos durante la entrevista; episodios recientes de ira en planta" },
            { value: 6, label: "Frecuentemente irritable; brusco y conciso durante la entrevista" },
            { value: 8, label: "Hostil, no cooperador; entrevista imposible" },
        ],
    },
    {
        id: "y6", label: "6. Habla — velocidad y cantidad ★",
        nota: "Ítem con escala 0–8 (puntuaciones pares)",
        opts: [
            { value: 0, label: "Sin aumento" },
            { value: 2, label: "Siente que habla más de lo habitual" },
            { value: 4, label: "Aumento moderado en velocidad y/o cantidad; verboso" },
            { value: 6, label: "Discurso muy acelerado; difícil de interrumpir; habla continua" },
            { value: 8, label: "Fuga de ideas; habla imperceptible; imposible interrumpir" },
        ],
    },
    {
        id: "y7", label: "7. Trastorno del lenguaje / pensamiento",
        opts: [
            { value: 0, label: "Ausente" },
            { value: 1, label: "Circunstancial; leve distractibilidad; pensamiento acelerado" },
            { value: 2, label: "Distraíble; pierde el hilo; cambia de tema frecuentemente" },
            { value: 3, label: "Fuga de ideas; tangencialidad; difícil de seguir; rimas; ecolalia" },
            { value: 4, label: "Incoherente; comunicación imposible" },
        ],
    },
    {
        id: "y8", label: "8. Contenido del pensamiento ★",
        nota: "Ítem con escala 0–8 (puntuaciones pares)",
        opts: [
            { value: 0, label: "Normal" },
            { value: 2, label: "Planes discutibles; nuevos intereses" },
            { value: 4, label: "Proyectos especiales; hiperreligioso" },
            { value: 6, label: "Ideas grandiosas o paranoides; ideas de referencia" },
            { value: 8, label: "Delirios; alucinaciones" },
        ],
    },
    {
        id: "y9", label: "9. Conducta agresiva / perturbadora ★",
        nota: "Ítem con escala 0–8 (puntuaciones pares)",
        opts: [
            { value: 0, label: "Ausente; cooperador" },
            { value: 2, label: "Sarcasmo; en voz alta; cauteloso" },
            { value: 4, label: "Exigente; amenazas en planta" },
            { value: 6, label: "Amenaza al entrevistador; grita; entrevista difícil" },
            { value: 8, label: "Asalto físico; destructivo; imposible entrevistar" },
        ],
    },
    {
        id: "y10", label: "10. Apariencia",
        opts: [
            { value: 0, label: "Adecuada; sin aumento de arreglo personal" },
            { value: 1, label: "Ligeramente descuidado" },
            { value: 2, label: "Mal arreglado; moderadamente despeinado; vestimenta extravagante" },
            { value: 3, label: "Muy desaliñado; maquillaje exagerado; ropa estrafalaria" },
            { value: 4, label: "Desnudo; maquillaje grotesco; ropa muy estrafalaria" },
        ],
    },
    {
        id: "y11", label: "11. Conciencia de enfermedad (insight)",
        opts: [
            { value: 0, label: "Reconoce estar enfermo; acepta la necesidad de tratamiento" },
            { value: 1, label: "Reconoce posible cambio, pero niega estar enfermo" },
            { value: 2, label: "Admite cambio de conducta, pero niega estar enfermo" },
            { value: 3, label: "Admite posible cambio de conducta, pero niega estar enfermo" },
            { value: 4, label: "Niega cualquier cambio de comportamiento" },
        ],
    },
];

/* ─── interpretación ─────────────────────────────────────── */

const scoreStyle = (score: number) => {
    if (score <= 12) return { bg: "bg-green-50",  border: "border-green-300",  text: "text-green-700",  label: "Eutimia / remisión",      action: "Seguimiento habitual." };
    if (score <= 19) return { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700", label: "Hipomanía",                action: "Monitorización estrecha; valorar ajuste de tratamiento." };
    if (score <= 25) return { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", label: "Manía leve–moderada",      action: "Ajuste de tratamiento; seguimiento frecuente." };
    if (score <= 37) return { bg: "bg-red-50",    border: "border-red-300",    text: "text-red-700",    label: "Manía moderada",           action: "Tratamiento activo; valorar hospitalización." };
    return               { bg: "bg-red-100",   border: "border-red-400",    text: "text-red-800",    label: "Manía grave",              action: "Hospitalización urgente." };
};

/* ─── componente ─────────────────────────────────────────── */

export default function YmrsPage() {
    const [scores, setScores] = useState<Record<string, number>>({});
    const [copied, setCopied] = useState(false);

    const total = useMemo(() => Object.values(scores).reduce((a, b) => a + b, 0), [scores]);
    const answered = Object.keys(scores).length;
    const style = scoreStyle(total);

    const set   = (id: string, v: number) => setScores(p => ({ ...p, [id]: v }));
    const reset = () => { setScores({}); setCopied(false); };

    const copyResult = () => {
        const text = [
            "YMRS — Escala de Young para la Evaluación de la Manía",
            `Puntaje total: ${total}/60`,
            `Resultado: ${style.label}`,
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
                        <h1 className="text-2xl font-semibold">YMRS</h1>
                        <p className="text-sm text-slate-600">Escala de Young para la Evaluación de la Manía</p>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                    <strong>Instrucciones:</strong> Escala administrada por el clínico. Los ítems marcados con <strong>★</strong> tienen escala 0–8 (solo puntuaciones pares). El resto van de 0 a 4.
                </div>

                {ITEMS.map(item => (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-slate-800 mb-0.5">{item.label}</p>
                        {"nota" in item && item.nota && (
                            <p className="text-xs text-amber-600 mb-3 italic">{item.nota}</p>
                        )}
                        <div className="space-y-1 mt-2">
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

                <div className={`rounded-xl border-2 ${style.bg} ${style.border} p-5`}>
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Puntaje Total</p>
                            <p className={`text-4xl font-bold ${style.text}`}>{total}<span className="text-base opacity-60"> / 60</span></p>
                            {answered < 11 && <p className="text-xs text-slate-400 mt-1">{answered}/11 ítems puntuados</p>}
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

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Activity, RotateCcw, Copy, Check, ArrowLeft } from "lucide-react";

/* ─── datos ─────────────────────────────────────────────── */

interface PanssItem { id: string; label: string; }

const POSITIVA: PanssItem[] = [
    { id: "P1", label: "P1 · Delirios" },
    { id: "P2", label: "P2 · Desorganización conceptual" },
    { id: "P3", label: "P3 · Alucinaciones" },
    { id: "P4", label: "P4 · Agitación" },
    { id: "P5", label: "P5 · Grandiosidad" },
    { id: "P6", label: "P6 · Suspicacia / persecución" },
    { id: "P7", label: "P7 · Hostilidad" },
];

const NEGATIVA: PanssItem[] = [
    { id: "N1", label: "N1 · Aplanamiento afectivo" },
    { id: "N2", label: "N2 · Retraimiento emocional" },
    { id: "N3", label: "N3 · Contacto pobre" },
    { id: "N4", label: "N4 · Retraimiento social pasivo/apático" },
    { id: "N5", label: "N5 · Dificultad en el pensamiento abstracto" },
    { id: "N6", label: "N6 · Falta de espontaneidad en la conversación" },
    { id: "N7", label: "N7 · Pensamiento estereotipado" },
];

const GENERAL: PanssItem[] = [
    { id: "G1",  label: "G1 · Preocupaciones somáticas" },
    { id: "G2",  label: "G2 · Ansiedad" },
    { id: "G3",  label: "G3 · Sentimientos de culpa" },
    { id: "G4",  label: "G4 · Tensión motora" },
    { id: "G5",  label: "G5 · Manierismos y posturas" },
    { id: "G6",  label: "G6 · Depresión" },
    { id: "G7",  label: "G7 · Retardo motor" },
    { id: "G8",  label: "G8 · Falta de cooperación" },
    { id: "G9",  label: "G9 · Contenido del pensamiento inusual" },
    { id: "G10", label: "G10 · Desorientación" },
    { id: "G11", label: "G11 · Atención deficiente" },
    { id: "G12", label: "G12 · Ausencia de juicio e introspección" },
    { id: "G13", label: "G13 · Trastornos de la volición" },
    { id: "G14", label: "G14 · Control deficiente de los impulsos" },
    { id: "G15", label: "G15 · Preocupación" },
    { id: "G16", label: "G16 · Evitación social activa" },
];

const OPCIONES = [
    { value: 1, label: "Ausente" },
    { value: 2, label: "Mínimo" },
    { value: 3, label: "Leve" },
    { value: 4, label: "Moderado" },
    { value: 5, label: "Mod-severo" },
    { value: 6, label: "Severo" },
    { value: 7, label: "Extremo" },
];

/* ─── interpretación ─────────────────────────────────────── */

const subStyle = (score: number, min: number, max: number) => {
    if (score === 0) return { text: "text-slate-400", label: "—" };
    const pct = (score - min) / (max - min);
    if (pct < 0.20) return { text: "text-green-700",  label: "Mínimo" };
    if (pct < 0.45) return { text: "text-blue-700",   label: "Leve" };
    if (pct < 0.65) return { text: "text-amber-700",  label: "Moderado" };
    if (pct < 0.85) return { text: "text-orange-700", label: "Severo" };
    return               { text: "text-red-700",    label: "Extremo" };
};

const totalStyle = (score: number) => {
    if (score === 0) return { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-400", label: "Sin puntuar", action: "Completa todos los ítems para obtener la interpretación." };
    if (score < 59)  return { bg: "bg-green-50",  border: "border-green-300",  text: "text-green-700",  label: "Leve",       action: "Seguimiento clínico habitual." };
    if (score < 96)  return { bg: "bg-blue-50",   border: "border-blue-300",   text: "text-blue-700",   label: "Moderado",   action: "Valorar ajuste de tratamiento." };
    if (score < 151) return { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", label: "Severo",     action: "Revisión urgente del plan terapéutico." };
    return                  { bg: "bg-red-50",    border: "border-red-300",    text: "text-red-700",    label: "Muy severo", action: "Intervención intensiva." };
};

/* ─── componente ─────────────────────────────────────────── */

export default function PanssPage() {
    const [scores, setScores] = useState<Record<string, number>>({});
    const [copied, setCopied] = useState(false);

    const scoreP = useMemo(() => POSITIVA.reduce((a, i) => a + (scores[i.id] ?? 0), 0), [scores]);
    const scoreN = useMemo(() => NEGATIVA.reduce((a, i) => a + (scores[i.id] ?? 0), 0), [scores]);
    const scoreG = useMemo(() => GENERAL.reduce((a, i)  => a + (scores[i.id] ?? 0), 0), [scores]);
    const total  = useMemo(() => scoreP + scoreN + scoreG, [scoreP, scoreN, scoreG]);

    const set   = (id: string, v: number) => setScores(p => ({ ...p, [id]: v }));
    const reset = () => { setScores({}); setCopied(false); };

    const copyResult = () => {
        const fmt = (items: PanssItem[]) =>
            items.map(i => `  ${i.label}: ${scores[i.id] ?? "-"}`).join("\n");
        const text = [
            "PANSS",
            `Subescala Positiva:       ${scoreP || "-"}/49`,
            `Subescala Negativa:       ${scoreN || "-"}/49`,
            `Psicopatología General:   ${scoreG || "-"}/112`,
            `Puntaje Total:            ${total || "-"}/210${total ? ` — ${totalStyle(total).label}` : ""}`,
            "",
            "Subescala Positiva:",
            fmt(POSITIVA),
            "",
            "Subescala Negativa:",
            fmt(NEGATIVA),
            "",
            "Psicopatología General:",
            fmt(GENERAL),
        ].join("\n");
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const style = totalStyle(total);

    const renderSection = (titulo: string, items: PanssItem[], color: string) => (
        <div className="space-y-3">
            <h2 className={`text-sm font-semibold uppercase tracking-wide px-1 ${color}`}>{titulo}</h2>
            {items.map(item => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-800 mb-3">{item.label}</p>
                    <div className="grid grid-cols-7 gap-1">
                        {OPCIONES.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => set(item.id, opt.value)}
                                className={`flex flex-col items-center gap-0.5 rounded-lg border py-2 transition-colors
                                    ${scores[item.id] === opt.value
                                        ? "bg-slate-800 text-white border-slate-800"
                                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"}`}
                            >
                                <span className="text-sm font-bold">{opt.value}</span>
                                <span className="text-[9px] leading-tight text-center hidden sm:block">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Volver */}
                <Link href="/tools/escalas-clinicas" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Escalas Clínicas
                </Link>

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Activity className="w-7 h-7 text-slate-700" />
                    <div>
                        <h1 className="text-2xl font-semibold">PANSS</h1>
                        <p className="text-sm text-slate-600">Escala de Síndromes Positivo y Negativo</p>
                    </div>
                </div>

                {/* Instrucciones */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                    <strong>Instrucciones:</strong> Puntúa cada ítem del <strong>1</strong> (ausente) al <strong>7</strong> (extremo) basándote en la entrevista clínica y la observación de los últimos 7 días.
                </div>

                {/* Barra de puntajes sticky */}
                <div className="sticky top-16 z-30 bg-white border border-slate-200 rounded-xl shadow-sm px-4 py-3">
                    <div className="grid grid-cols-4 gap-2 text-center">
                        {[
                            { label: "Positiva", score: scoreP, max: 49,  min: 7  },
                            { label: "Negativa", score: scoreN, max: 49,  min: 7  },
                            { label: "General",  score: scoreG, max: 112, min: 16 },
                        ].map(s => {
                            const st = subStyle(s.score, s.min, s.max);
                            return (
                                <div key={s.label}>
                                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5">{s.label}</div>
                                    <div className="text-xl font-bold text-slate-800">
                                        {s.score || "—"}<span className="text-xs text-slate-400">/{s.max}</span>
                                    </div>
                                    <div className={`text-xs font-medium ${st.text}`}>{st.label}</div>
                                </div>
                            );
                        })}
                        <div className={`rounded-lg px-2 py-1 ${style.bg}`}>
                            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Total</div>
                            <div className={`text-xl font-bold ${style.text}`}>
                                {total || "—"}<span className="text-xs opacity-60">/210</span>
                            </div>
                            <div className={`text-xs font-medium ${style.text}`}>{style.label}</div>
                        </div>
                    </div>
                </div>

                {/* Secciones */}
                {renderSection("Subescala Positiva", POSITIVA, "text-red-700")}
                {renderSection("Subescala Negativa", NEGATIVA, "text-blue-700")}
                {renderSection("Psicopatología General", GENERAL, "text-slate-700")}

                {/* Resultado */}
                <div className={`rounded-xl border-2 ${style.bg} ${style.border} p-5`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Puntaje Total</p>
                            <p className={`text-4xl font-bold ${style.text}`}>
                                {total || "—"}<span className="text-base opacity-60"> / 210</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className={`text-lg font-semibold ${style.text}`}>{style.label}</p>
                            <p className="text-sm text-slate-600 mt-0.5 max-w-[180px]">{style.action}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center text-sm mb-4">
                        <div className="bg-white/60 rounded-lg p-2">
                            <div className="text-slate-500 text-xs mb-0.5">Positiva</div>
                            <div className="font-bold">{scoreP || "—"}<span className="text-xs text-slate-400">/49</span></div>
                        </div>
                        <div className="bg-white/60 rounded-lg p-2">
                            <div className="text-slate-500 text-xs mb-0.5">Negativa</div>
                            <div className="font-bold">{scoreN || "—"}<span className="text-xs text-slate-400">/49</span></div>
                        </div>
                        <div className="bg-white/60 rounded-lg p-2">
                            <div className="text-slate-500 text-xs mb-0.5">General</div>
                            <div className="font-bold">{scoreG || "—"}<span className="text-xs text-slate-400">/112</span></div>
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

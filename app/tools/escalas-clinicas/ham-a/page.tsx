"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Activity, RotateCcw, Copy, Check, ArrowLeft } from "lucide-react";

/* ─── datos ─────────────────────────────────────────────── */

const OPTS = [
    { value: 0, label: "Ausente" },
    { value: 1, label: "Leve" },
    { value: 2, label: "Moderado" },
    { value: 3, label: "Grave" },
    { value: 4, label: "Muy grave / incapacitante" },
];

const ITEMS = [
    {
        id: "h1", label: "1. Humor ansioso",
        sub: "Preocupaciones, anticipación de lo peor, aprensión, irritabilidad",
    },
    {
        id: "h2", label: "2. Tensión",
        sub: "Sensación de tensión, fatigabilidad, imposibilidad de relajarse, llanto fácil, temblor, inquietud",
    },
    {
        id: "h3", label: "3. Miedos",
        sub: "A la oscuridad, a desconocidos, a quedarse solo, a animales, al tráfico, a las multitudes",
    },
    {
        id: "h4", label: "4. Insomnio",
        sub: "Dificultad para dormirse, sueño interrumpido, sueño no reparador, malos sueños, terrores nocturnos",
    },
    {
        id: "h5", label: "5. Funciones intelectuales (cognitivas)",
        sub: "Dificultad de concentración, memoria deficiente",
    },
    {
        id: "h6", label: "6. Estado de ánimo depresivo",
        sub: "Pérdida de interés, anhedonia, depresión, variación diurna del ánimo",
    },
    {
        id: "h7", label: "7. Síntomas somáticos musculares",
        sub: "Dolores musculares, rigidez, sacudidas, espasmos, rechinar de dientes, voz temblorosa",
    },
    {
        id: "h8", label: "8. Síntomas somáticos sensoriales",
        sub: "Tinnitus, visión borrosa, oleadas de calor o frío, sensación de debilidad, hormigueo",
    },
    {
        id: "h9", label: "9. Síntomas cardiovasculares",
        sub: "Taquicardia, palpitaciones, dolor precordial, pulsación vascular, sensación de desmayo",
    },
    {
        id: "h10", label: "10. Síntomas respiratorios",
        sub: "Opresión torácica, sensación de ahogo, suspiros, disnea",
    },
    {
        id: "h11", label: "11. Síntomas gastrointestinales",
        sub: "Dificultad para tragar, flatulencia, dolor abdominal, ardor, náuseas, vómitos, diarrea, estreñimiento",
    },
    {
        id: "h12", label: "12. Síntomas genitourinarios",
        sub: "Polaquiuria, urgencia urinaria, amenorrea, frigidez, eyaculación precoz, impotencia",
    },
    {
        id: "h13", label: "13. Síntomas del sistema nervioso autónomo",
        sub: "Boca seca, rubor, palidez, sudoración, vértigos, cefalea tensional, piloerección",
    },
    {
        id: "h14", label: "14. Conducta en la entrevista (observación)",
        sub: "Inquietud, impaciencia, temblor, ceño fruncido, cara tensa, suspiros, palidez, deglución frecuente",
    },
];

/* ─── interpretación ─────────────────────────────────────── */

const scoreStyle = (score: number) => {
    if (score <= 17) return { bg: "bg-green-50",  border: "border-green-300",  text: "text-green-700",  label: "Ansiedad leve",            action: "Psicoeducación; técnicas de relajación." };
    if (score <= 24) return { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700", label: "Ansiedad moderada",         action: "Valorar psicoterapia y/o farmacoterapia." };
    if (score <= 30) return { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", label: "Ansiedad moderada–grave",   action: "Tratamiento activo; seguimiento estrecho." };
    return               { bg: "bg-red-50",    border: "border-red-300",    text: "text-red-700",    label: "Ansiedad grave",            action: "Intervención urgente; valorar derivación especializada." };
};

/* ─── componente ─────────────────────────────────────────── */

export default function HamAPage() {
    const [scores, setScores] = useState<Record<string, number>>({});
    const [copied, setCopied] = useState(false);

    const total = useMemo(() => Object.values(scores).reduce((a, b) => a + b, 0), [scores]);

    const scorePsiq = useMemo(() =>
        ["h1","h2","h3","h4","h5","h6","h14"].reduce((a, id) => a + (scores[id] ?? 0), 0), [scores]);
    const scoreSom = useMemo(() =>
        ["h7","h8","h9","h10","h11","h12","h13"].reduce((a, id) => a + (scores[id] ?? 0), 0), [scores]);

    const answered = Object.keys(scores).length;
    const style = scoreStyle(total);

    const set   = (id: string, v: number) => setScores(p => ({ ...p, [id]: v }));
    const reset = () => { setScores({}); setCopied(false); };

    const copyResult = () => {
        const text = [
            "HAM-A — Escala de Ansiedad de Hamilton",
            `Puntaje total: ${total}/56`,
            `Subescala psíquica (ítems 1–6, 14): ${scorePsiq}/28`,
            `Subescala somática (ítems 7–13): ${scoreSom}/28`,
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
                        <h1 className="text-2xl font-semibold">HAM-A</h1>
                        <p className="text-sm text-slate-600">Escala de Ansiedad de Hamilton</p>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                    <strong>Instrucciones:</strong> Escala administrada por el clínico. Puntúa cada ítem del <strong>0</strong> (ausente) al <strong>4</strong> (muy grave/incapacitante) considerando todos los síntomas descritos en la última semana.
                </div>

                {ITEMS.map(item => (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-slate-800 mb-0.5">{item.label}</p>
                        <p className="text-xs text-slate-500 mb-3 italic">{item.sub}</p>
                        <div className="flex flex-col gap-1.5">
                            {OPTS.map(opt => (
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
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Puntaje Total</p>
                            <p className={`text-4xl font-bold ${style.text}`}>{total}<span className="text-base opacity-60"> / 56</span></p>
                            {answered < 14 && <p className="text-xs text-slate-400 mt-1">{answered}/14 ítems puntuados</p>}
                        </div>
                        <div className="text-right">
                            <p className={`text-lg font-semibold ${style.text}`}>{style.label}</p>
                            <p className="text-sm text-slate-600 mt-0.5 max-w-[200px]">{style.action}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center text-sm mb-4">
                        <div className="bg-white/60 rounded-lg p-2">
                            <div className="text-slate-500 text-xs mb-0.5">Subescala psíquica</div>
                            <div className="font-bold">{scorePsiq}<span className="text-xs text-slate-400">/28</span></div>
                        </div>
                        <div className="bg-white/60 rounded-lg p-2">
                            <div className="text-slate-500 text-xs mb-0.5">Subescala somática</div>
                            <div className="font-bold">{scoreSom}<span className="text-xs text-slate-400">/28</span></div>
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

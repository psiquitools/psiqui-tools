"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Activity, RotateCcw, Copy, Check, ArrowLeft, AlertTriangle } from "lucide-react";

/* ─── datos ─────────────────────────────────────────────── */

const ITEMS = [
    {
        id: "m1", label: "1. Tristeza aparente",
        nota: "Observada por el clínico — no la tristeza subjetiva.",
        opts: [
            { value: 0, label: "Sin tristeza aparente" },
            { value: 1, label: "..." },
            { value: 2, label: "Parece decaído, pero se anima fácilmente" },
            { value: 3, label: "..." },
            { value: 4, label: "Parece triste e infeliz la mayor parte del tiempo" },
            { value: 5, label: "..." },
            { value: 6, label: "Parece desdichado todo el tiempo; extremadamente abatido" },
        ],
    },
    {
        id: "m2", label: "2. Tristeza referida",
        nota: "Reportada subjetivamente por el paciente.",
        opts: [
            { value: 0, label: "Tristeza ocasional, acorde a las circunstancias" },
            { value: 1, label: "..." },
            { value: 2, label: "Tristeza o abatimiento, pero se repone fácilmente" },
            { value: 3, label: "..." },
            { value: 4, label: "Sentimientos penetrantes de tristeza o abatimiento; el estado de ánimo se ve influido por eventos externos" },
            { value: 5, label: "..." },
            { value: 6, label: "Tristeza, desesperación o miseria continuas e invariables" },
        ],
    },
    {
        id: "m3", label: "3. Tensión interna",
        nota: "Sentimientos de malestar vago, irritabilidad, agitación o angustia psíquica.",
        opts: [
            { value: 0, label: "Tranquilo; solo tensión interna fugaz" },
            { value: 1, label: "..." },
            { value: 2, label: "Sentimientos ocasionales de irritabilidad o malestar mal definido" },
            { value: 3, label: "..." },
            { value: 4, label: "Tensión interna continua o pánico intermitente que el paciente controla con dificultad" },
            { value: 5, label: "..." },
            { value: 6, label: "Terror o angustia persistente; pánico dominante" },
        ],
    },
    {
        id: "m4", label: "4. Sueño reducido",
        nota: "Experiencia subjetiva de duración o profundidad de sueño reducidas.",
        opts: [
            { value: 0, label: "Duerme habitualmente" },
            { value: 1, label: "..." },
            { value: 2, label: "Leve dificultad para dormirse o sueño algo reducido, ligero o discontinuo" },
            { value: 3, label: "..." },
            { value: 4, label: "Sueño reducido o interrumpido al menos 2 horas respecto a lo habitual" },
            { value: 5, label: "..." },
            { value: 6, label: "Menos de 2–3 horas de sueño" },
        ],
    },
    {
        id: "m5", label: "5. Apetito reducido",
        nota: "Sensación de pérdida de apetito comparada con el habitual.",
        opts: [
            { value: 0, label: "Apetito normal o aumentado" },
            { value: 1, label: "..." },
            { value: 2, label: "Apetito algo reducido" },
            { value: 3, label: "..." },
            { value: 4, label: "Sin apetito; los alimentos no tienen sabor" },
            { value: 5, label: "..." },
            { value: 6, label: "Solo come cuando se le incita; necesita persuasión" },
        ],
    },
    {
        id: "m6", label: "6. Dificultades de concentración",
        nota: "Dificultad para fijar la atención o para pensar con claridad.",
        opts: [
            { value: 0, label: "Sin dificultad de concentración" },
            { value: 1, label: "..." },
            { value: 2, label: "Dificultades ocasionales para centrar el pensamiento" },
            { value: 3, label: "..." },
            { value: 4, label: "Dificultades de concentración que reducen la capacidad de leer o conversar" },
            { value: 5, label: "..." },
            { value: 6, label: "Incapaz de leer o sostener una conversación con gran dificultad" },
        ],
    },
    {
        id: "m7", label: "7. Lentitud (anergia)",
        nota: "Dificultad para iniciar actividades; enlentecimiento del pensamiento y de la motricidad.",
        opts: [
            { value: 0, label: "Apenas dificultad para comenzar actividades; sin lentitud" },
            { value: 1, label: "..." },
            { value: 2, label: "Dificultad para comenzar actividades" },
            { value: 3, label: "..." },
            { value: 4, label: "Dificultad para iniciar actividades rutinarias simples, que lleva a cabo con esfuerzo" },
            { value: 5, label: "..." },
            { value: 6, label: "Apatía total; incapacidad de actividad espontánea" },
        ],
    },
    {
        id: "m8", label: "8. Incapacidad para sentir",
        nota: "Experiencia subjetiva de interés reducido por el entorno o las actividades.",
        opts: [
            { value: 0, label: "Interés normal en su entorno y en otras personas" },
            { value: 1, label: "..." },
            { value: 2, label: "Capacidad reducida para disfrutar de sus intereses habituales" },
            { value: 3, label: "..." },
            { value: 4, label: "Pérdida del interés por su entorno; pérdida de sentimientos hacia amigos y familiares" },
            { value: 5, label: "..." },
            { value: 6, label: "Experiencia de estar emocionalmente paralizado; ausencia total de respuesta emocional" },
        ],
    },
    {
        id: "m9", label: "9. Pensamientos pesimistas",
        nota: "Ideas de culpa, inferioridad, autodesprecio, remordimiento o ruina.",
        opts: [
            { value: 0, label: "Sin pensamientos pesimistas" },
            { value: 1, label: "..." },
            { value: 2, label: "Ideas fluctuantes de fracaso, autodesprecio o autoculpabilización" },
            { value: 3, label: "..." },
            { value: 4, label: "Autoacusaciones persistentes o ideas de culpa definitivas pero razonables; pesimismo sobre el futuro" },
            { value: 5, label: "..." },
            { value: 6, label: "Delirios de ruina, remordimiento o pecado imperdonable; autoacusaciones absurdas e inquebrantables" },
        ],
    },
    {
        id: "m10", label: "10. Pensamientos suicidas",
        nota: "Sentimiento de que la vida no merece la pena, deseo de muerte o ideación suicida.",
        opts: [
            { value: 0, label: "Disfruta de la vida o la acepta" },
            { value: 1, label: "..." },
            { value: 2, label: "Fatigado de vivir; pensamientos de suicidio solo fugaces" },
            { value: 3, label: "..." },
            { value: 4, label: "Seria intención de suicidio; planes elaborados" },
            { value: 5, label: "..." },
            { value: 6, label: "Intención suicida evidente; planes definitivos o intento reciente" },
        ],
    },
];

/* ─── interpretación ─────────────────────────────────────── */

const scoreStyle = (score: number) => {
    if (score <= 6)  return { bg: "bg-green-50",  border: "border-green-300",  text: "text-green-700",  label: "Sin depresión",       action: "Seguimiento clínico habitual." };
    if (score <= 19) return { bg: "bg-blue-50",   border: "border-blue-300",   text: "text-blue-700",   label: "Depresión leve",       action: "Considerar psicoterapia y/o seguimiento estrecho." };
    if (score <= 34) return { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", label: "Depresión moderada",   action: "Tratamiento activo; valorar farmacoterapia." };
    return               { bg: "bg-red-50",    border: "border-red-300",    text: "text-red-700",    label: "Depresión grave",      action: "Intervención urgente; valorar hospitalización." };
};

/* ─── componente ─────────────────────────────────────────── */

export default function MadrsPage() {
    const [scores, setScores] = useState<Record<string, number>>({});
    const [copied, setCopied] = useState(false);

    const total = useMemo(() => Object.values(scores).reduce((a, b) => a + b, 0), [scores]);
    const answered = Object.keys(scores).length;
    const style = scoreStyle(total);

    const set   = (id: string, v: number) => setScores(p => ({ ...p, [id]: v }));
    const reset = () => { setScores({}); setCopied(false); };

    const copyResult = () => {
        const text = [
            "MADRS",
            `Puntaje total: ${total}/60`,
            `Resultado: ${style.label}`,
            "",
            ...ITEMS.map(item => {
                const v = scores[item.id];
                return `${item.label}: ${v ?? "-"}`;
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
                        <h1 className="text-2xl font-semibold">MADRS</h1>
                        <p className="text-sm text-slate-600">Escala de Depresión de Montgomery-Åsberg</p>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                    <strong>Instrucciones:</strong> Escala administrada por el clínico. Puntúa del <strong>0 al 6</strong> cada ítem basándote en la evaluación clínica. Las anclas pares (0, 2, 4, 6) son las descripciones principales; los valores impares (1, 3, 5) corresponden a niveles intermedios.
                </div>

                {ITEMS.map(item => (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-slate-800 mb-0.5">{item.label}</p>
                        {item.nota && <p className="text-xs text-slate-500 mb-3 italic">{item.nota}</p>}
                        <div className="space-y-1">
                            {item.opts.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => set(item.id, opt.value)}
                                    className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors
                                        ${scores[item.id] === opt.value
                                            ? "bg-slate-800 text-white border-slate-800"
                                            : opt.label === "..."
                                                ? "bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-400 italic"
                                                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"}`}
                                >
                                    <span className="font-bold mr-2 not-italic text-inherit">{opt.value}</span>
                                    {opt.label === "..." ? "Intermedio" : opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Alerta ítem 10 */}
                {(scores.m10 ?? 0) >= 4 && (
                    <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-900">
                            <strong>Riesgo suicida elevado:</strong> Puntuación ≥4 en ítem 10 — evaluación inmediata del riesgo e intervención clínica urgente.
                        </p>
                    </div>
                )}

                <div className={`rounded-xl border-2 ${style.bg} ${style.border} p-5`}>
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Puntaje Total</p>
                            <p className={`text-4xl font-bold ${style.text}`}>{total}<span className="text-base opacity-60"> / 60</span></p>
                            {answered < 10 && <p className="text-xs text-slate-400 mt-1">{answered}/10 ítems puntuados</p>}
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

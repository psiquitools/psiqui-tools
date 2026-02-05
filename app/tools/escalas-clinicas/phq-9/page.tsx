"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
    Activity,
    RotateCcw,
    Copy,
    Check,
    AlertCircle,
    ArrowLeft,
} from "lucide-react";

/* ===================== TIPOS Y DATOS ===================== */

type PhqItem = {
    id: string;
    question: string;
};

const PHQ_ITEMS: PhqItem[] = [
    { id: "interest", question: "Poco interés o placer en hacer cosas" },
    { id: "depressed", question: "Se ha sentido decaído, deprimido o sin esperanzas" },
    { id: "sleep", question: "Dificultad para dormir o ha dormido demasiado" },
    { id: "energy", question: "Cansancio o falta de energía" },
    { id: "appetite", question: "Poco apetito o ha comido en exceso" },
    { id: "failure", question: "Sensación de fracaso o decepción consigo mismo" },
    { id: "concentration", question: "Dificultad para concentrarse" },
    {
        id: "psychomotor",
        question: "Lentitud o inquietud observable por otros",
    },
    {
        id: "suicide",
        question: "Pensamientos de que estaría mejor muerto o de hacerse daño",
    },
];

const OPTIONS = [
    { value: 0, label: "Nunca" },
    { value: 1, label: "Varios días" },
    { value: 2, label: "Más de la mitad de los días" },
    { value: 3, label: "Casi todos los días" },
];

/* ===================== ESTILOS SEGÚN PUNTAJE ===================== */

const scoreStyle = (score: number) => {
    if (score <= 4)
        return {
            bg: "bg-green-50",
            text: "text-green-700",
            border: "border-green-300",
            label: "Mínima o ninguna",
            action: "Seguimiento clínico habitual.",
        };
    if (score <= 9)
        return {
            bg: "bg-blue-50",
            text: "text-blue-700",
            border: "border-blue-300",
            label: "Leve",
            action: "Valorar apoyo psicoeducativo y seguimiento.",
        };
    if (score <= 14)
        return {
            bg: "bg-yellow-50",
            text: "text-yellow-700",
            border: "border-yellow-300",
            label: "Moderada",
            action: "Considerar tratamiento psicológico y/o farmacológico.",
        };
    if (score <= 19)
        return {
            bg: "bg-orange-50",
            text: "text-orange-700",
            border: "border-orange-300",
            label: "Moderadamente severa",
            action: "Tratamiento activo y seguimiento estrecho.",
        };
    return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-300",
        label: "Severa",
        action: "Intervención clínica inmediata y valoración especializada.",
    };
};

/* ===================== COMPONENTE ===================== */

export default function Phq9Page() {
    const [scores, setScores] = useState<Record<string, number>>({});
    const [copied, setCopied] = useState(false);

    const totalScore = useMemo(
        () => Object.values(scores).reduce((a, b) => a + b, 0),
        [scores]
    );

    const style = scoreStyle(totalScore);

    const handleSelect = (id: string, value: number) => {
        setScores((prev) => ({ ...prev, [id]: value }));
    };

    const reset = () => {
        setScores({});
        setCopied(false);
    };

    const copyResult = () => {
        const text =
            `PHQ-9\n` +
            `Puntaje total: ${totalScore}\n` +
            `Severidad: ${style.label}\n` +
            `Recomendación: ${style.action}\n\n` +
            PHQ_ITEMS.map((i) => `${i.question}: ${scores[i.id] ?? "-"}`).join("\n");

        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Volver */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a psiqui.tools
                </Link>

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Activity className="w-7 h-7 text-slate-700" />
                    <div>
                        <h1 className="text-2xl font-semibold">Cuestionario PHQ-9</h1>
                        <p className="text-sm text-slate-600">
                            Cribado y seguimiento de depresión
                        </p>
                    </div>
                </div>

                {/* Instrucciones */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                        <strong>Instrucciones:</strong><br />
                        Durante las <strong>últimas 2 semanas</strong>, ¿con qué frecuencia le
                        han molestado los siguientes problemas?
                    </p>
                </div>

                {/* Ítems */}
                {PHQ_ITEMS.map((item, index) => (
                    <div
                        key={item.id}
                        className="bg-white border border-slate-200 rounded-lg p-4"
                    >
                        <h3 className="font-medium mb-3">
                            {index + 1}. {item.question}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => handleSelect(item.id, opt.value)}
                                    className={`text-left px-3 py-2 rounded border transition-colors ${scores[item.id] === opt.value
                                            ? "bg-slate-800 text-white border-slate-800"
                                            : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                                        }`}
                                >
                                    <span className="font-semibold mr-2">{opt.value}</span>
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* Alerta suicidio */}
                        {item.id === "suicide" && scores[item.id] !== undefined && scores[item.id] > 0 && (
                            <div className="mt-4 bg-amber-50 border border-amber-300 rounded-lg p-3 flex gap-2">
                                <AlertCircle className="w-5 h-5 text-amber-700 mt-0.5" />
                                <p className="text-sm text-amber-900">
                                    <strong>Atención clínica:</strong><br />
                                    Respuesta positiva requiere evaluación inmediata del riesgo
                                    suicida (ideación activa/pasiva, planificación, medios,
                                    factores protectores).
                                </p>
                            </div>
                        )}
                    </div>
                ))}

                {/* Resultado */}
                <div className={`rounded-lg p-4 border-2 ${style.bg} ${style.border}`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Puntaje total</span>
                        <span className={`text-4xl font-bold ${style.text}`}>
                            {totalScore}
                        </span>
                    </div>

                    <p className="text-sm font-medium mb-1">
                        Severidad: <span className={style.text}>{style.label}</span>
                    </p>

                    <p className="text-sm mb-4">{style.action}</p>

                    <div className="flex gap-2">
                        <button
                            onClick={copyResult}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            Copiar
                        </button>

                        <button
                            onClick={reset}
                            className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-slate-100"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Limpiar
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
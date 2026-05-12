"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
    Brain,
    RotateCcw,
    Copy,
    Check,
    AlertCircle,
    ArrowLeft,
} from "lucide-react";

type GadItem = {
    id: string;
    question: string;
};

const GAD_ITEMS: GadItem[] = [
    { id: "nervous", question: "Sentirse nervioso/a, ansioso/a o muy alterado/a" },
    { id: "control", question: "No poder dejar de preocuparse o no poder controlar la preocupación" },
    { id: "worrying", question: "Preocuparse demasiado por diferentes cosas" },
    { id: "relaxing", question: "Dificultad para relajarse" },
    { id: "restless", question: "Estar tan inquieto/a que es difícil permanecer sentado/a tranquilo/a" },
    { id: "irritable", question: "Molestarse o ponerse irritable fácilmente" },
    { id: "afraid", question: "Sentir miedo, como si algo terrible fuera a ocurrir" },
];

const OPTIONS = [
    { value: 0, label: "Ningún día" },
    { value: 1, label: "Varios días" },
    { value: 2, label: "Más de la mitad de los días" },
    { value: 3, label: "Casi todos los días" },
];

export default function Gad7Page() {
    const [scores, setScores] = useState<Record<string, number>>({});
    const [copied, setCopied] = useState(false);

    const answeredCount = Object.keys(scores).length;
    const totalItems = GAD_ITEMS.length;
    const isComplete = answeredCount === totalItems;

    const totalScore = useMemo(
        () => Object.values(scores).reduce((a, b) => a + b, 0),
        [scores]
    );

    const interpretation = useMemo(() => {
        if (!isComplete) return null;
        if (totalScore <= 4)
            return { text: "Mínima – sin intervención requerida", color: "text-green-700 bg-green-50 border-green-200" };
        if (totalScore <= 9)
            return { text: "Leve – monitorización y psicoeducación", color: "text-yellow-700 bg-yellow-50 border-yellow-200" };
        if (totalScore <= 14)
            return { text: "Moderada – valorar intervención terapéutica", color: "text-orange-700 bg-orange-50 border-orange-200" };
        return { text: "Severa – intervención terapéutica indicada", color: "text-red-700 bg-red-50 border-red-200" };
    }, [totalScore, isComplete]);

    const handleSelect = (id: string, value: number) => {
        setScores((prev) => ({ ...prev, [id]: value }));
    };

    const reset = () => {
        setScores({});
        setCopied(false);
    };

    const copyResult = () => {
        const lines = [
            "GAD-7 — Escala de Trastorno de Ansiedad Generalizada",
            `Puntaje total: ${totalScore}/21`,
            `Interpretación: ${interpretation?.text ?? "Incompleta"}`,
            "",
            ...GAD_ITEMS.map(
                (i) => `${i.question}: ${scores[i.id] ?? "-"}`
            ),
        ];
        navigator.clipboard.writeText(lines.join("\n"));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Volver */}
                <Link
                    href="/tools/escalas-clinicas"
                    className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Escalas Clínicas
                </Link>

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Brain className="w-7 h-7 text-slate-700" />
                    <div>
                        <h1 className="text-2xl font-semibold">GAD-7</h1>
                        <p className="text-sm text-slate-600">
                            Escala de Trastorno de Ansiedad Generalizada
                        </p>
                    </div>
                </div>

                {/* Instrucción */}
                <div className="bg-white border border-slate-200 rounded-lg p-4 text-sm text-slate-600 italic">
                    Durante las <span className="font-semibold not-italic text-slate-800">últimas 2 semanas</span>, ¿con qué frecuencia le han molestado los siguientes problemas?
                </div>

                {/* Progreso */}
                <div className="text-sm text-slate-500">
                    {answeredCount} de {totalItems} ítems completados
                </div>

                {/* Items */}
                <div className="space-y-3">
                    {GAD_ITEMS.map((item, index) => {
                        const selected = scores[item.id];
                        const answered = selected !== undefined;

                        return (
                            <div
                                key={item.id}
                                className={`bg-white border rounded-lg p-4 transition-colors ${answered ? "border-slate-300" : "border-slate-200"
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <p className="text-sm font-medium text-slate-800 pr-4">
                                        <span className="text-slate-400 mr-2">{index + 1}.</span>
                                        {item.question}
                                    </p>
                                    {answered && (
                                        <span className="shrink-0 text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                                            {selected}
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleSelect(item.id, opt.value)}
                                            className={`text-left px-3 py-2 rounded border text-sm transition-colors ${selected === opt.value
                                                    ? "bg-slate-800 text-white border-slate-800"
                                                    : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                                                }`}
                                        >
                                            <span className="font-semibold mr-2">{opt.value}</span>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Resultado */}
                <div className={`bg-white border-2 rounded-lg p-4 ${isComplete ? "border-slate-400" : "border-slate-200"
                    }`}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">Puntaje total</span>
                        <span className="text-3xl font-bold">
                            {totalScore}
                            <span className="text-lg text-slate-400 font-normal">/21</span>
                        </span>
                    </div>

                    <p className="text-xs text-slate-500 mb-3">
                        {isComplete
                            ? "Escala completada"
                            : `${answeredCount} de ${totalItems} ítems completados`}
                    </p>

                    {interpretation && (
                        <div className={`text-sm font-medium px-3 py-2 rounded border mb-4 ${interpretation.color}`}>
                            {interpretation.text}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={copyResult}
                            disabled={!isComplete}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
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

                {/* Umbrales de referencia */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-700 mb-2">Umbrales de interpretación</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        {[
                            { range: "0–4", label: "Mínima", color: "bg-green-50 text-green-700 border-green-200" },
                            { range: "5–9", label: "Leve", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
                            { range: "10–14", label: "Moderada", color: "bg-orange-50 text-orange-700 border-orange-200" },
                            { range: "15–21", label: "Severa", color: "bg-red-50 text-red-700 border-red-200" },
                        ].map((t) => (
                            <div key={t.range} className={`px-3 py-2 rounded border text-center ${t.color}`}>
                                <div className="font-semibold">{t.range}</div>
                                <div>{t.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Nota */}
                <div className="flex items-start gap-2 text-xs text-slate-600">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    Escala de apoyo clínico. No sustituye el juicio médico profesional.
                </div>

            </div>
        </div>
    );
}
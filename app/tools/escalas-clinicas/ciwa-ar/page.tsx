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

type CiwaItem = {
    id: string;
    question: string;
    options: { value: number; label: string }[];
};

const CIWA_ITEMS: CiwaItem[] = [
    {
        id: "nausea",
        question: "Náuseas y vómitos",
        options: [
            { value: 0, label: "Sin náuseas ni vómitos" },
            { value: 1, label: "Náuseas leves, sin vómitos" },
            { value: 4, label: "Náuseas intermitentes con arcadas secas" },
            { value: 7, label: "Náuseas constantes y vómitos frecuentes" },
        ],
    },
    {
        id: "tremor",
        question: "Temblor",
        options: [
            { value: 0, label: "Sin temblor" },
            { value: 1, label: "No visible, se palpa en dedos" },
            { value: 4, label: "Moderado con brazos extendidos" },
            { value: 7, label: "Severo incluso sin extender brazos" },
        ],
    },
    {
        id: "sweats",
        question: "Sudoración paroxística",
        options: [
            { value: 0, label: "Sin sudoración" },
            { value: 1, label: "Palmas ligeramente húmedas" },
            { value: 4, label: "Sudor visible en frente" },
            { value: 7, label: "Empapado" },
        ],
    },
    {
        id: "anxiety",
        question: "Ansiedad",
        options: [
            { value: 0, label: "Tranquilo" },
            { value: 1, label: "Levemente ansioso" },
            { value: 4, label: "Ansiedad moderada" },
            { value: 7, label: "Pánico intenso" },
        ],
    },
    {
        id: "agitation",
        question: "Agitación",
        options: [
            { value: 0, label: "Actividad normal" },
            { value: 1, label: "Algo inquieto" },
            { value: 4, label: "Inquieto e impaciente" },
            { value: 7, label: "Deambulación constante" },
        ],
    },
    {
        id: "tactile",
        question: "Alteraciones táctiles",
        options: [
            { value: 0, label: "Ninguna" },
            { value: 2, label: "Hormigueo leve" },
            { value: 4, label: "Alucinaciones táctiles moderadas" },
            { value: 7, label: "Alucinaciones táctiles continuas" },
        ],
    },
    {
        id: "auditory",
        question: "Alteraciones auditivas",
        options: [
            { value: 0, label: "Ninguna" },
            { value: 2, label: "Ruidos leves" },
            { value: 4, label: "Alucinaciones auditivas moderadas" },
            { value: 7, label: "Alucinaciones auditivas continuas" },
        ],
    },
    {
        id: "visual",
        question: "Alteraciones visuales",
        options: [
            { value: 0, label: "Ninguna" },
            { value: 2, label: "Sensibilidad leve a la luz" },
            { value: 4, label: "Alucinaciones visuales moderadas" },
            { value: 7, label: "Alucinaciones visuales continuas" },
        ],
    },
    {
        id: "headache",
        question: "Cefalea",
        options: [
            { value: 0, label: "No presente" },
            { value: 2, label: "Leve" },
            { value: 4, label: "Moderada" },
            { value: 7, label: "Extremadamente severa" },
        ],
    },
    {
        id: "orientation",
        question: "Orientación y sensorio",
        options: [
            { value: 0, label: "Orientado" },
            { value: 1, label: "Duda en fecha" },
            { value: 2, label: "Desorientación leve" },
            { value: 4, label: "Desorientado en persona o lugar" },
        ],
    },
];

export default function CiwaArPage() {
    const [scores, setScores] = useState<Record<string, number>>({});
    const [copied, setCopied] = useState(false);

    const totalScore = useMemo(
        () => Object.values(scores).reduce((a, b) => a + b, 0),
        [scores]
    );

    const interpretation = useMemo(() => {
        if (totalScore < 10) return "Leve – observación clínica";
        if (totalScore < 20) return "Moderada – considerar benzodiacepinas";
        return "Severa – alto riesgo, tratamiento urgente";
    }, [totalScore]);

    const handleSelect = (id: string, value: number) => {
        setScores((prev) => ({ ...prev, [id]: value }));
    };

    const reset = () => {
        setScores({});
        setCopied(false);
    };

    const copyResult = () => {
        const text =
            `CIWA-Ar\n` +
            `Puntaje total: ${totalScore}\n` +
            `Interpretación: ${interpretation}\n\n` +
            CIWA_ITEMS.map(
                (i) => `${i.question}: ${scores[i.id] ?? "-"}`
            ).join("\n");

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
                        <h1 className="text-2xl font-semibold">Escala CIWA-Ar</h1>
                        <p className="text-sm text-slate-600">
                            Evaluación de abstinencia alcohólica
                        </p>
                    </div>
                </div>

                {/* Items */}
                {CIWA_ITEMS.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white border border-slate-200 rounded-lg p-4"
                    >
                        <h3 className="font-medium mb-3">{item.question}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {item.options.map((opt) => (
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
                    </div>
                ))}

                {/* Resultado */}
                <div className="bg-white border-2 border-slate-300 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Puntaje total</span>
                        <span className="text-3xl font-bold">{totalScore}</span>
                    </div>

                    <p className="text-sm text-slate-700 mb-4">
                        {interpretation}
                    </p>

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

                {/* Nota */}
                <div className="flex items-start gap-2 text-xs text-slate-600">
                    <AlertCircle className="w-4 h-4 mt-0.5" />
                    Escala de apoyo clínico. No sustituye el juicio médico profesional.
                </div>

            </div>
        </div>
    );
}
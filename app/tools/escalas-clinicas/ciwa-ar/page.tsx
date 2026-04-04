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

type Option = {
    value: number;
    label: string;
    isAnchor: boolean;
};

type CiwaItem = {
    id: string;
    question: string;
    instruction?: string;
    options: Option[];
    twoColumns?: boolean;
};

function anchorOnly(
    anchors: Record<number, string>,
    max: number
): Option[] {
    return Array.from({ length: max + 1 }, (_, v) => ({
        value: v,
        label: anchors[v] ?? "",
        isAnchor: v in anchors,
    }));
}

const CIWA_ITEMS: CiwaItem[] = [
    {
        id: "nausea",
        question: "Náuseas y vómitos",
        instruction: "Preguntar: ¿Se siente enfermo del estómago? ¿Ha vomitado?",
        twoColumns: false,
        options: anchorOnly({
            0: "Sin náuseas ni vómitos",
            1: "Náuseas leves, sin vómitos",
            4: "Náuseas intermitentes con arcadas, sin vómitos",
            7: "Náuseas constantes, arcadas frecuentes y vómitos",
        }, 7),
    },
    {
        id: "tremor",
        question: "Temblor",
        instruction: "Pedir al paciente que extienda los brazos y separe los dedos. Observación.",
        twoColumns: false,
        options: anchorOnly({
            0: "Sin temblor",
            1: "No visible, pero puede sentirse al tocar las yemas de los dedos",
            4: "Moderado, con los brazos extendidos",
            7: "Severo aun con los brazos no extendidos",
        }, 7),
    },
    {
        id: "sweats",
        question: "Sudoración paroxística",
        instruction: "Observación.",
        twoColumns: false,
        options: anchorOnly({
            0: "Sudoración no visible",
            1: "Sudoración apenas perceptible, palmas húmedas",
            4: "Gotas de sudor en la frente",
            7: "Empapado de sudor",
        }, 7),
    },
    {
        id: "anxiety",
        question: "Ansiedad",
        instruction: "Preguntar: ¿Se siente nervioso? Observación.",
        twoColumns: false,
        options: anchorOnly({
            0: "Sin ansiedad",
            1: "Ansiedad leve",
            4: "Ansiedad moderada o en vigilancia, así se infiere la ansiedad",
            7: "Equivalente a estado de pánico agudo, como se ve en el delirium severo o en reacciones esquizofrénicas agudas",
        }, 7),
    },
    {
        id: "agitation",
        question: "Agitación",
        instruction: "Observación.",
        twoColumns: false,
        options: anchorOnly({
            0: "Actividad normal",
            1: "Actividad levemente mayor de lo normal",
            4: "Moderadamente inquieto",
            7: "Se mueve sin cesar",
        }, 7),
    },
    {
        id: "tactile",
        question: "Alteraciones táctiles",
        instruction: "Preguntar: ¿Siente algo extraño en su piel? Observación.",
        twoColumns: true,
        options: anchorOnly({
            0: "Ninguna",
            1: "Prurito, pinchazos o ardor muy leves",
            2: "Prurito, pinchazos o ardor leves",
            3: "Prurito, pinchazos o ardor moderados",
            4: "Alucinaciones táctiles moderadas",
            5: "Alucinaciones táctiles intensas",
            6: "Alucinaciones táctiles muy intensas",
            7: "Alucinaciones táctiles continuas",
        }, 7),
    },
    {
        id: "auditory",
        question: "Alteraciones auditivas",
        instruction: "Preguntar: ¿Está escuchando algo que lo alarma? Observación.",
        twoColumns: true,
        options: anchorOnly({
            0: "Ninguna",
            1: "Sonidos muy levemente intensos o que asustan levemente",
            2: "Sonidos levemente intensos o que asustan",
            3: "Sonidos moderadamente intensos o que asustan",
            4: "Alucinaciones auditivas moderadas",
            5: "Alucinaciones auditivas intensas",
            6: "Alucinaciones auditivas muy intensas",
            7: "Alucinaciones auditivas continuas",
        }, 7),
    },
    {
        id: "visual",
        question: "Alteraciones visuales",
        instruction: "Preguntar: ¿Está viendo algo que le inquieta? Observación.",
        twoColumns: true,
        options: anchorOnly({
            0: "Ninguna",
            1: "Sensibilidad a la luz muy leve",
            2: "Sensibilidad a la luz leve",
            3: "Sensibilidad a la luz moderada",
            4: "Alucinaciones visuales moderadas",
            5: "Alucinaciones visuales intensas",
            6: "Alucinaciones visuales muy intensas",
            7: "Alucinaciones visuales continuas",
        }, 7),
    },
    {
        id: "headache",
        question: "Cefalea o sensación de plenitud cefálica",
        instruction: "No evaluar mareos. Preguntar: ¿Tiene dolor de cabeza o sensación de presión?",
        twoColumns: true,
        options: anchorOnly({
            0: "No presente",
            1: "Muy leve",
            2: "Leve",
            3: "Moderada",
            4: "Moderadamente grave",
            5: "Grave",
            6: "Muy grave",
            7: "Extremadamente grave",
        }, 7),
    },
    {
        id: "orientation",
        question: "Orientación y sensorio",
        instruction: "Preguntar: ¿Qué día es hoy? ¿Dónde está? ¿Quién soy yo? Observación.",
        twoColumns: false,
        options: anchorOnly({
            0: "Orientado, puede hacer series correctamente",
            1: "No puede hacer sumas en serie o no está seguro de la fecha",
            2: "Desorientado en fecha en no más de 2 días de calendario",
            3: "Desorientado en fecha en más de 2 días de calendario",
            4: "Desorientado en lugar y/o persona",
        }, 4),
    },
];

export default function CiwaArPage() {
    const [scores, setScores] = useState<Record<string, number>>({});
    const [copied, setCopied] = useState(false);

    const answeredCount = Object.keys(scores).length;
    const totalItems = CIWA_ITEMS.length;
    const isComplete = answeredCount === totalItems;

    const totalScore = useMemo(
        () => Object.values(scores).reduce((a, b) => a + b, 0),
        [scores]
    );

    const interpretation = useMemo(() => {
        if (!isComplete) return null;
        if (totalScore < 8)
            return { text: "Leve – sin tratamiento sintomático", color: "text-green-700 bg-green-50 border-green-200" };
        if (totalScore < 16)
            return { text: "Moderada – valorar tratamiento con benzodiacepinas", color: "text-yellow-700 bg-yellow-50 border-yellow-200" };
        return { text: "Severa – alto riesgo, tratamiento urgente", color: "text-red-700 bg-red-50 border-red-200" };
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
            "CIWA-Ar — Evaluación de abstinencia alcohólica",
            `Puntaje total: ${totalScore}/67`,
            `Interpretación: ${interpretation?.text ?? "Incompleta"}`,
            "",
            ...CIWA_ITEMS.map(
                (i) => `${i.question}: ${scores[i.id] ?? "-"}`
            ),
        ];
        navigator.clipboard.writeText(lines.join("\n"));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6">
            <div className="max-w-6xl mx-auto space-y-6">

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
                    <Activity className="w-7 h-7 text-slate-700" />
                    <div>
                        <h1 className="text-2xl font-semibold">Escala CIWA-Ar</h1>
                        <p className="text-sm text-slate-600">
                            Evaluación de abstinencia alcohólica
                        </p>
                    </div>
                </div>

                {/* Progreso */}
                <div className="text-sm text-slate-500">
                    {answeredCount} de {totalItems} ítems completados
                </div>

                {/* Items en dos columnas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {CIWA_ITEMS.map((item) => {
                        const selected = scores[item.id];
                        const answered = selected !== undefined;

                        return (
                            <div
                                key={item.id}
                                className={`bg-white border rounded-lg p-4 transition-colors ${answered ? "border-slate-300" : "border-slate-200"
                                    }`}
                            >
                                {/* Título e instrucción */}
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-medium">{item.question}</h3>
                                    {answered && (
                                        <span className="ml-3 shrink-0 text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                                            {selected}
                                        </span>
                                    )}
                                </div>
                                {item.instruction && (
                                    <p className="text-xs text-slate-500 mb-3 italic">
                                        {item.instruction}
                                    </p>
                                )}

                                {/* Opciones */}
                                <div className={
                                    item.twoColumns
                                        ? "grid grid-cols-2 gap-1"
                                        : "flex flex-col gap-1"
                                }>
                                    {item.options.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleSelect(item.id, opt.value)}
                                            className={`text-left px-3 py-2 rounded border text-sm transition-colors flex items-center gap-3 ${selected === opt.value
                                                    ? "bg-slate-800 text-white border-slate-800"
                                                    : opt.isAnchor
                                                        ? "bg-slate-50 hover:bg-slate-100 border-slate-200"
                                                        : "bg-white hover:bg-slate-50 border-dashed border-slate-200 text-slate-400"
                                                }`}
                                        >
                                            <span className={`font-semibold shrink-0 w-4 text-center ${selected === opt.value
                                                    ? "text-white"
                                                    : opt.isAnchor
                                                        ? "text-slate-700"
                                                        : "text-slate-400"
                                                }`}>
                                                {opt.value}
                                            </span>
                                            {opt.isAnchor && (
                                                <span>{opt.label}</span>
                                            )}
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
                            <span className="text-lg text-slate-400 font-normal">/67</span>
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

                {/* Nota */}
                <div className="flex items-start gap-2 text-xs text-slate-600">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    Escala de apoyo clínico. No sustituye el juicio médico profesional.
                </div>

            </div>
        </div>
    );
}
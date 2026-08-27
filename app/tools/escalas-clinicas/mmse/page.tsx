"use client";

import { useState, useMemo } from "react";
import { Brain, RotateCcw, Copy, Check } from "lucide-react";

type Item = { id: string; label: string };
type Section = { id: string; title: string; note?: string; items: Item[] };

const SECTIONS: Section[] = [
    {
        id: "ot",
        title: "Orientación temporal",
        note: "¿En qué año estamos? ¿En qué estación? ¿En qué mes? ¿Qué día de la semana es hoy? ¿Qué fecha es hoy?",
        items: [
            { id: "ot1", label: "Año" },
            { id: "ot2", label: "Estación del año" },
            { id: "ot3", label: "Mes" },
            { id: "ot4", label: "Día de la semana" },
            { id: "ot5", label: "Fecha del mes" },
        ],
    },
    {
        id: "oe",
        title: "Orientación espacial",
        note: "¿En qué país estamos? ¿En qué comunidad autónoma? ¿En qué ciudad? ¿En qué edificio o lugar? ¿En qué planta?",
        items: [
            { id: "oe1", label: "País" },
            { id: "oe2", label: "Comunidad autónoma / región" },
            { id: "oe3", label: "Ciudad" },
            { id: "oe4", label: "Edificio o lugar" },
            { id: "oe5", label: "Planta o calle" },
        ],
    },
    {
        id: "reg",
        title: "Registro",
        note: 'Diga claramente: "pelota, bandera, árbol". Pida al paciente que las repita. Anote cuántas palabras repite correctamente en el primer intento (puede repetirlas hasta 6 veces hasta que las aprenda).',
        items: [
            { id: "reg1", label: "Pelota" },
            { id: "reg2", label: "Bandera" },
            { id: "reg3", label: "Árbol" },
        ],
    },
    {
        id: "at",
        title: "Atención y cálculo",
        note: "Reste de 7 en 7 empezando desde 100: 93, 86, 79, 72, 65. Cada respuesta correcta puntúa independientemente. Alternativa: deletrear MUNDO al revés (O-D-N-U-M).",
        items: [
            { id: "at1", label: "100 − 7 = 93" },
            { id: "at2", label: "93 − 7 = 86" },
            { id: "at3", label: "86 − 7 = 79" },
            { id: "at4", label: "79 − 7 = 72" },
            { id: "at5", label: "72 − 7 = 65" },
        ],
    },
    {
        id: "rec",
        title: "Recuerdo diferido",
        note: "Pida al paciente que recuerde las 3 palabras que mencionó anteriormente.",
        items: [
            { id: "rec1", label: "Pelota" },
            { id: "rec2", label: "Bandera" },
            { id: "rec3", label: "Árbol" },
        ],
    },
    {
        id: "den",
        title: "Denominación",
        note: "Mostrar un lápiz y un reloj: ¿qué es esto?",
        items: [
            { id: "den1", label: "Lápiz" },
            { id: "den2", label: "Reloj" },
        ],
    },
    {
        id: "rep",
        title: "Repetición",
        note: '"Repita exactamente lo que yo diga: Ni sí, ni no, ni pero."',
        items: [{ id: "rep1", label: "Repetición correcta" }],
    },
    {
        id: "comp",
        title: "Comprensión de órdenes",
        note: 'Entregue una hoja en blanco y diga: "Tome el papel con su mano derecha, dóblelo por la mitad y colóquelo en el suelo."',
        items: [
            { id: "comp1", label: "Toma el papel con la mano derecha" },
            { id: "comp2", label: "Lo dobla por la mitad" },
            { id: "comp3", label: "Lo coloca en el suelo" },
        ],
    },
    {
        id: "lec",
        title: "Lectura",
        note: 'Mostrar una tarjeta con la instrucción escrita en mayúsculas: "CIERRE LOS OJOS". El paciente debe leerla en silencio y ejecutar la acción.',
        items: [{ id: "lec1", label: "Cierra los ojos al leer la instrucción" }],
    },
    {
        id: "esc",
        title: "Escritura",
        note: "Pida que escriba una oración espontánea con sentido (no se le dicta). Debe tener sujeto, verbo y sentido completo.",
        items: [{ id: "esc1", label: "Escribe una oración correcta con sentido" }],
    },
    {
        id: "cop",
        title: "Copia",
        note: "Mostrar el dibujo de dos pentágonos entrelazados. El paciente debe copiarlo. Ambos pentágonos deben tener 5 ángulos y estar entrelazados.",
        items: [{ id: "cop1", label: "Copia correcta de los pentágonos entrelazados" }],
    },
];

const ALL_ITEMS = SECTIONS.flatMap(s => s.items);

function scoreStyle(score: number) {
    if (score >= 27) return { bg: "bg-green-50", text: "text-green-700", border: "border-green-300", label: "Sin deterioro cognitivo significativo" };
    if (score >= 24) return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-300", label: "Posible deterioro leve (zona límite)" };
    if (score >= 18) return { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-300", label: "Deterioro cognitivo leve" };
    if (score >= 10) return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-300", label: "Deterioro cognitivo moderado" };
    return { bg: "bg-red-50", text: "text-red-700", border: "border-red-300", label: "Deterioro cognitivo grave" };
}

export default function MmsePage() {
    const [scores, setScores] = useState<Record<string, number>>({});
    const [copied, setCopied] = useState(false);

    const setItem = (id: string, val: number) => {
        setScores(prev => {
            if (prev[id] === val) {
                const next = { ...prev };
                delete next[id];
                return next;
            }
            return { ...prev, [id]: val };
        });
    };

    const total = useMemo(() => Object.values(scores).reduce((a, b) => a + b, 0), [scores]);
    const answered = Object.keys(scores).length;
    const style = scoreStyle(total);

    const reset = () => { setScores({}); setCopied(false); };

    const copyResult = () => {
        const lines = [
            "MMSE (Mini-Mental State Examination)",
            `Puntaje total: ${total}/30`,
            `Interpretación: ${style.label}`,
            `Ítems respondidos: ${answered}/30`,
            "",
            ...SECTIONS.map(s => {
                const pts = s.items.reduce((acc, i) => acc + (scores[i.id] ?? 0), 0);
                return `${s.title}: ${pts}/${s.items.length}`;
            }),
        ];
        navigator.clipboard.writeText(lines.join("\n"));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6">
            <div className="max-w-3xl mx-auto space-y-5">

                <div className="flex items-center gap-3">
                    <Brain className="w-7 h-7 text-slate-700" />
                    <div>
                        <h1 className="text-2xl font-semibold">MMSE</h1>
                        <p className="text-sm text-slate-600">Mini-Mental State Examination — Folstein et al., 1975</p>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                    <strong>Herramienta de registro clínico.</strong> Administre la prueba directamente al paciente y marque cada ítem según la respuesta obtenida. La puntuación se calcula en tiempo real.
                </div>

                {/* Barra progreso */}
                <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-4">
                    <span className="text-sm text-slate-500 shrink-0">{answered}/{ALL_ITEMS.length} ítems</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-slate-700 rounded-full transition-all duration-300"
                            style={{ width: `${(answered / ALL_ITEMS.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-xl font-bold text-slate-800 shrink-0">{total}<span className="text-sm font-normal text-slate-400">/30</span></span>
                </div>

                {/* Secciones */}
                {SECTIONS.map(section => {
                    const sectionScore = section.items.reduce((acc, i) => acc + (scores[i.id] ?? 0), 0);
                    return (
                        <div key={section.id} className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-slate-800">{section.title}</h3>
                                <span className="text-sm font-mono text-slate-400">{sectionScore}/{section.items.length}</span>
                            </div>
                            {section.note && (
                                <p className="text-xs text-slate-500 italic mb-3">{section.note}</p>
                            )}
                            <div className="space-y-2">
                                {section.items.map(item => (
                                    <div key={item.id} className="flex items-center gap-2">
                                        <span className="text-sm text-slate-700 flex-1">{item.label}</span>
                                        <div className="flex gap-1 shrink-0">
                                            <button
                                                onClick={() => setItem(item.id, 1)}
                                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                                    scores[item.id] === 1
                                                        ? "bg-emerald-600 text-white"
                                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                }`}
                                            >
                                                ✓ 1
                                            </button>
                                            <button
                                                onClick={() => setItem(item.id, 0)}
                                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                                    scores[item.id] === 0
                                                        ? "bg-red-500 text-white"
                                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                }`}
                                            >
                                                ✗ 0
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Resultado */}
                <div className={`rounded-lg p-5 border-2 ${style.bg} ${style.border}`}>
                    <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-slate-800">Puntaje total</span>
                        <span className={`text-4xl font-bold ${style.text}`}>{total}<span className="text-lg font-normal text-slate-400">/30</span></span>
                    </div>
                    <p className={`text-sm font-semibold mb-4 ${style.text}`}>{style.label}</p>

                    <div className="bg-white bg-opacity-70 rounded-lg p-3 mb-4 text-xs">
                        <table className="w-full">
                            <thead>
                                <tr className="text-slate-400 border-b border-slate-100">
                                    <th className="text-left font-medium pb-1.5">Puntuación</th>
                                    <th className="text-left font-medium pb-1.5">Interpretación</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-600">
                                {[
                                    ["27–30", "Sin deterioro significativo"],
                                    ["24–26", "Posible deterioro leve (zona límite)"],
                                    ["18–23", "Deterioro cognitivo leve"],
                                    ["10–17", "Deterioro cognitivo moderado"],
                                    ["0–9",   "Deterioro cognitivo grave"],
                                ].map(([pts, label]) => (
                                    <tr key={pts} className="border-b border-slate-50 last:border-0">
                                        <td className="py-1 pr-4 font-mono">{pts}</td>
                                        <td className="py-1">{label}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={copyResult} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 text-sm">
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            Copiar resumen
                        </button>
                        <button onClick={reset} className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded hover:bg-white text-sm text-slate-600">
                            <RotateCcw className="w-4 h-4" />
                            Limpiar
                        </button>
                    </div>
                </div>

                <p className="text-xs text-slate-400 text-center pb-4">
                    El MMSE debe interpretarse en contexto clínico. La edad, el nivel educativo y el idioma pueden influir en la puntuación.
                </p>
            </div>
        </div>
    );
}

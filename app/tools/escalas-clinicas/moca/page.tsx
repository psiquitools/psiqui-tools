"use client";

import { useState, useMemo } from "react";
import { Brain, RotateCcw, Copy, Check } from "lucide-react";

/* ============================================================
   ESTRUCTURA DE ÍTEMS
   Todos los ítems son binarios (0/1) excepto la serie de 7s
   (5 sub-ítems → 0–3 pts según tabla de conversión).
   La sección de Registro no suma puntos directamente.
============================================================ */

type Item = { id: string; label: string };

// Ítems binarios regulares agrupados por dominio
const DOMINIOS: { id: string; title: string; note?: string; max: number; items: Item[] }[] = [
    {
        id: "vis",
        title: "Visuoespacial / Ejecutivo",
        max: 5,
        note: "Alternancia (Trail B): unir alternando números y letras 1-A-2-B-3-C-4-D-5-E. Cubo: copiar figura en 3D. Reloj: dibujar esfera, números y manecillas marcando las 11:10.",
        items: [
            { id: "vis_trail", label: "Alternancia correcta (Trail B)" },
            { id: "vis_cubo",  label: "Copia del cubo en 3D" },
            { id: "vis_rel_c", label: "Reloj: contorno (esfera)" },
            { id: "vis_rel_n", label: "Reloj: números correctos" },
            { id: "vis_rel_m", label: "Reloj: manecillas en hora correcta" },
        ],
    },
    {
        id: "den",
        title: "Denominación",
        max: 3,
        note: "Mostrar imágenes de animales y pedir que los nombre. (Usar el formulario oficial del MoCA.)",
        items: [
            { id: "den_1", label: "León" },
            { id: "den_2", label: "Rinoceronte" },
            { id: "den_3", label: "Camello / dromedario" },
        ],
    },
    {
        id: "aten_dig",
        title: "Atención — Dígitos y vigilancia",
        max: 3,
        note: "Dígitos directos: 2-1-8-5-4 (1 pt). Dígitos inversos: 7-4-2 (1 pt). Vigilancia: leer una secuencia de letras y el paciente golpea la mesa cada vez que escuche la letra A (0-1 errores = 1 pt).",
        items: [
            { id: "at_dir", label: "Dígitos directos: 2-1-8-5-4" },
            { id: "at_inv", label: "Dígitos inversos: 7-4-2" },
            { id: "at_vig", label: "Vigilancia (tapping con letra A): ≤1 error" },
        ],
    },
    {
        id: "len",
        title: "Lenguaje",
        max: 3,
        note: 'Repetición de frases: (1) "El gato siempre se esconde bajo el sofá cuando hay perros en la sala." (2) "No sé si fue Juan o Carlos quien necesitó ayuda hoy." Fluencia verbal letra F: ≥11 palabras en 1 minuto.',
        items: [
            { id: "len_f1", label: "Repetición frase 1" },
            { id: "len_f2", label: "Repetición frase 2" },
            { id: "len_fl", label: "Fluencia letra F (≥11 palabras en 1 min)" },
        ],
    },
    {
        id: "abs",
        title: "Abstracción",
        max: 2,
        note: '¿En qué se parecen? (1) "tren y bicicleta" (respuesta esperada: medios de transporte). (2) "reloj y regla" (instrumentos de medición).',
        items: [
            { id: "abs_1", label: "Tren – bicicleta" },
            { id: "abs_2", label: "Reloj – regla" },
        ],
    },
    {
        id: "rec",
        title: "Recuerdo diferido",
        max: 5,
        note: "Pedir que recuerde las 5 palabras registradas al inicio (sin pistas). Solo puntúan las recordadas espontáneamente.",
        items: [
            { id: "rec_1", label: "Cara" },
            { id: "rec_2", label: "Seda" },
            { id: "rec_3", label: "Iglesia" },
            { id: "rec_4", label: "Clavel" },
            { id: "rec_5", label: "Rojo" },
        ],
    },
    {
        id: "ori",
        title: "Orientación",
        max: 6,
        note: "¿Qué día es hoy? ¿En qué mes? ¿En qué año? ¿Qué día de la semana? ¿En qué lugar estamos? ¿En qué ciudad?",
        items: [
            { id: "ori_dia",  label: "Fecha del mes" },
            { id: "ori_mes",  label: "Mes" },
            { id: "ori_anio", label: "Año" },
            { id: "ori_dsem", label: "Día de la semana" },
            { id: "ori_lug",  label: "Lugar o edificio" },
            { id: "ori_ciu",  label: "Ciudad" },
        ],
    },
];

// Serie de 7s (atención): 5 sub-ítems → conversión a 0-3 pts
const SERIE7S_ITEMS: Item[] = [
    { id: "s7_1", label: "100 − 7 = 93" },
    { id: "s7_2", label: "93 − 7 = 86" },
    { id: "s7_3", label: "86 − 7 = 79" },
    { id: "s7_4", label: "79 − 7 = 72" },
    { id: "s7_5", label: "72 − 7 = 65" },
];

function serie7Score(correctas: number): number {
    if (correctas >= 4) return 3;
    if (correctas >= 2) return 2;
    if (correctas === 1) return 1;
    return 0;
}

function scoreStyle(score: number) {
    if (score >= 26) return { bg: "bg-green-50", text: "text-green-700", border: "border-green-300", label: "Sin deterioro cognitivo significativo" };
    if (score >= 18) return { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-300", label: "Deterioro cognitivo leve" };
    if (score >= 10) return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-300", label: "Deterioro cognitivo moderado" };
    return { bg: "bg-red-50", text: "text-red-700", border: "border-red-300", label: "Deterioro cognitivo grave" };
}

export default function MocaPage() {
    const [scores, setScores] = useState<Record<string, number>>({});
    const [educacion, setEducacion] = useState(false); // ≤12 años escolaridad
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

    const { baseTotal, serie7Correctas, serie7Pts } = useMemo(() => {
        const dominioTotal = DOMINIOS.flatMap(d => d.items).reduce((acc, i) => acc + (scores[i.id] ?? 0), 0);
        const s7c = SERIE7S_ITEMS.reduce((acc, i) => acc + (scores[i.id] ?? 0), 0);
        const s7p = serie7Score(s7c);
        return { baseTotal: dominioTotal + s7p, serie7Correctas: s7c, serie7Pts: s7p };
    }, [scores]);

    const total = Math.min(30, baseTotal + (educacion ? 1 : 0));

    const allBinaryItems = [...DOMINIOS.flatMap(d => d.items), ...SERIE7S_ITEMS];
    const answered = allBinaryItems.filter(i => scores[i.id] !== undefined).length;
    const style = scoreStyle(total);

    const reset = () => { setScores({}); setEducacion(false); setCopied(false); };

    const copyResult = () => {
        const lines = [
            "MoCA (Montreal Cognitive Assessment)",
            `Puntaje base: ${baseTotal}/30`,
            educacion ? `Ajuste educativo (+1): ${total}/30` : `Puntaje total: ${total}/30`,
            `Interpretación: ${style.label}`,
            "",
            ...DOMINIOS.map(d => {
                const pts = d.items.reduce((acc, i) => acc + (scores[i.id] ?? 0), 0);
                return `${d.title}: ${pts}/${d.max}`;
            }),
            `Atención — Serie de 7s: ${serie7Pts}/3 (${serie7Correctas}/5 correctas)`,
        ];
        navigator.clipboard.writeText(lines.join("\n"));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const renderItems = (items: Item[]) => (
        <div className="space-y-2">
            {items.map(item => (
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
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6">
            <div className="max-w-3xl mx-auto space-y-5">

                <div className="flex items-center gap-3">
                    <Brain className="w-7 h-7 text-slate-700" />
                    <div>
                        <h1 className="text-2xl font-semibold">MoCA</h1>
                        <p className="text-sm text-slate-600">Montreal Cognitive Assessment — Nasreddine et al., 2005</p>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900 space-y-2">
                    <p><strong>Herramienta de registro clínico.</strong> Administre la prueba con el formulario oficial del MoCA (mocatest.org) y registre aquí los resultados por dominio.</p>
                    <p className="text-xs">Antes de comenzar: registre las 5 palabras de memoria — <strong>cara, seda, iglesia, clavel, rojo</strong> — para recordar al final.</p>
                </div>

                {/* Barra progreso */}
                <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-4">
                    <span className="text-sm text-slate-500 shrink-0">{answered}/{allBinaryItems.length} ítems</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-slate-700 rounded-full transition-all duration-300"
                            style={{ width: `${(answered / allBinaryItems.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-xl font-bold text-slate-800 shrink-0">{total}<span className="text-sm font-normal text-slate-400">/30</span></span>
                </div>

                {/* Dominios regulares — excepto atención que se divide */}
                {DOMINIOS.slice(0, 2).map(dominio => {
                    const pts = dominio.items.reduce((acc, i) => acc + (scores[i.id] ?? 0), 0);
                    return (
                        <div key={dominio.id} className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-slate-800">{dominio.title}</h3>
                                <span className="text-sm font-mono text-slate-400">{pts}/{dominio.max}</span>
                            </div>
                            {dominio.note && <p className="text-xs text-slate-500 italic mb-3">{dominio.note}</p>}
                            {renderItems(dominio.items)}
                        </div>
                    );
                })}

                {/* Registro (0 pts) */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-slate-800">Registro de memoria</h3>
                        <span className="text-sm font-mono text-slate-400">0 pts</span>
                    </div>
                    <p className="text-xs text-slate-500 italic mb-3">
                        Leer las 5 palabras a 1 por segundo y pedir que las repita. Repetir hasta 2 veces. <strong>No puntúa directamente</strong> — el recuerdo se evalúa al final.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {["Cara", "Seda", "Iglesia", "Clavel", "Rojo"].map(w => (
                            <span key={w} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700 font-medium">{w}</span>
                        ))}
                    </div>
                </div>

                {/* Atención dígitos + vigilancia */}
                {(() => {
                    const d = DOMINIOS[2];
                    const pts = d.items.reduce((acc, i) => acc + (scores[i.id] ?? 0), 0);
                    return (
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-slate-800">{d.title}</h3>
                                <span className="text-sm font-mono text-slate-400">{pts}/{d.max}</span>
                            </div>
                            {d.note && <p className="text-xs text-slate-500 italic mb-3">{d.note}</p>}
                            {renderItems(d.items)}
                        </div>
                    );
                })()}

                {/* Serie de 7s (scoring especial) */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-slate-800">Atención — Serie de 7s</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">{serie7Correctas}/5 correctas</span>
                            <span className="text-sm font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                {serie7Pts}/3 pts
                            </span>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 italic mb-3">
                        Restar 7 desde 100 cinco veces: 93, 86, 79, 72, 65.
                        Conversión: 4–5 correctas = 3 pts · 2–3 = 2 pts · 1 = 1 pt · 0 = 0 pts.
                    </p>
                    {renderItems(SERIE7S_ITEMS)}
                    <div className="mt-3 grid grid-cols-4 gap-1.5 text-xs text-center">
                        {[["0", "0 pts"], ["1", "1 pt"], ["2–3", "2 pts"], ["4–5", "3 pts"]].map(([rango, pts]) => (
                            <div key={rango} className={`rounded p-1.5 border ${
                                (rango === "4–5" && serie7Correctas >= 4) ||
                                (rango === "2–3" && serie7Correctas >= 2 && serie7Correctas < 4) ||
                                (rango === "1" && serie7Correctas === 1) ||
                                (rango === "0" && serie7Correctas === 0)
                                    ? "bg-slate-700 text-white border-slate-700"
                                    : "bg-slate-50 text-slate-500 border-slate-200"
                            }`}>
                                <div className="font-mono font-bold">{rango}</div>
                                <div>{pts}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resto de dominios */}
                {DOMINIOS.slice(3).map(dominio => {
                    const pts = dominio.items.reduce((acc, i) => acc + (scores[i.id] ?? 0), 0);
                    return (
                        <div key={dominio.id} className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-slate-800">{dominio.title}</h3>
                                <span className="text-sm font-mono text-slate-400">{pts}/{dominio.max}</span>
                            </div>
                            {dominio.note && <p className="text-xs text-slate-500 italic mb-3">{dominio.note}</p>}
                            {renderItems(dominio.items)}
                        </div>
                    );
                })}

                {/* Ajuste educativo */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={educacion}
                            onChange={e => setEducacion(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 accent-slate-700"
                        />
                        <div>
                            <span className="text-sm font-semibold text-slate-800">Ajuste por escolaridad (+1 punto)</span>
                            <p className="text-xs text-slate-500 mt-0.5">Aplicar si el paciente tiene 12 o menos años de educación formal. El total máximo sigue siendo 30.</p>
                        </div>
                    </label>
                </div>

                {/* Resultado */}
                <div className={`rounded-lg p-5 border-2 ${style.bg} ${style.border}`}>
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <span className="font-semibold text-slate-800">Puntaje total</span>
                            {educacion && (
                                <p className="text-xs text-slate-500 mt-0.5">Base {baseTotal} + 1 ajuste educativo</p>
                            )}
                        </div>
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
                                    ["≥26", "Sin deterioro significativo"],
                                    ["18–25", "Deterioro cognitivo leve"],
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
                    El MoCA debe interpretarse en contexto clínico. Para uso educativo o de investigación, consultar mocatest.org.
                </p>
            </div>
        </div>
    );
}

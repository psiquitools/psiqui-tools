"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
    TrendingDown,
    RotateCcw,
    Copy,
    Check,
    AlertCircle,
    ArrowLeft,
    FileText,
} from "lucide-react";

// ─── TIPOS ───────────────────────────────────────────────────────────────────

type Benzo = {
    id: string;
    nombre: string;
    marcaEspana: string;
    eq5mgDiazepam: number;
};

type Velocidad = "lenta" | "moderada" | "rapida";

type Paso = {
    paso: number;
    semana: number;
    dosis: number;
    eqDiazepam: number;
    reduccionPorc: number;
};

// ─── DATOS ───────────────────────────────────────────────────────────────────

const BENZOS: Benzo[] = [
    { id: "diazepam", nombre: "Diazepam", marcaEspana: "Valium®", eq5mgDiazepam: 5 },
    { id: "lorazepam", nombre: "Lorazepam", marcaEspana: "Orfidal®", eq5mgDiazepam: 0.5 },
    { id: "alprazolam", nombre: "Alprazolam", marcaEspana: "Trankimazin®", eq5mgDiazepam: 0.25 },
    { id: "clordiazepoxido", nombre: "Clordiazepóxido", marcaEspana: "Huberplex®", eq5mgDiazepam: 12.5 },
    { id: "clorazepato", nombre: "Clorazepato dipotásico", marcaEspana: "Tranxilium®", eq5mgDiazepam: 15 },
    { id: "clobazam", nombre: "Clobazam", marcaEspana: "Noiafren®", eq5mgDiazepam: 10 },
    { id: "clonazepam", nombre: "Clonazepam", marcaEspana: "Rivotril®", eq5mgDiazepam: 0.25 },
    { id: "nitrazepam", nombre: "Nitrazepam", marcaEspana: "Mogadon®", eq5mgDiazepam: 5 },
    { id: "flunitrazepam", nombre: "Flunitrazepam", marcaEspana: "Rohypnol®", eq5mgDiazepam: 1 },
    { id: "oxazepam", nombre: "Oxazepam", marcaEspana: "Adumbran®", eq5mgDiazepam: 10 },
    { id: "lormetazepam", nombre: "Lormetazepam", marcaEspana: "Noctamid®", eq5mgDiazepam: 0.5 },
    { id: "temazepam", nombre: "Temazepam", marcaEspana: "Normison®", eq5mgDiazepam: 10 },
    { id: "zopiclona", nombre: "Zopiclona", marcaEspana: "Zimovane®", eq5mgDiazepam: 7.5 },
    { id: "zolpidem", nombre: "Zolpidem", marcaEspana: "Stilnox®", eq5mgDiazepam: 10 },
];

const VELOCIDAD_CONFIG: Record<Velocidad, {
    label: string;
    descripcion: string;
    porcentajePorPaso: number;
    semanasPorPaso: number;
    color: string;
}> = {
    lenta: {
        label: "Lenta",
        descripcion: "5% cada 4 semanas — recomendada para uso crónico > 1 año",
        porcentajePorPaso: 5,
        semanasPorPaso: 4,
        color: "text-green-700 bg-green-50 border-green-200",
    },
    moderada: {
        label: "Moderada",
        descripcion: "10% cada 4 semanas — para uso de 3-12 meses",
        porcentajePorPaso: 10,
        semanasPorPaso: 4,
        color: "text-yellow-700 bg-yellow-50 border-yellow-200",
    },
    rapida: {
        label: "Rápida",
        descripcion: "10% cada 2 semanas — para uso < 3 meses o bajo riesgo",
        porcentajePorPaso: 10,
        semanasPorPaso: 2,
        color: "text-orange-700 bg-orange-50 border-orange-200",
    },
};

// ─── CÁLCULO HIPERBÓLICO ──────────────────────────────────────────────────────
// Cada paso reduce un % de la dosis ACTUAL (no de la inicial)
// Esto produce la curva hiperbólica: pasos cada vez más pequeños en mg absolutos

function calcularPlan(
    dosisInicial: number,
    velocidad: Velocidad,
    eqDiazepamFactor: number // mg del fármaco por cada 5mg de diazepam
): Paso[] {
    const config = VELOCIDAD_CONFIG[velocidad];
    const factor = config.porcentajePorPaso / 100;
    const pasos: Paso[] = [];

    // Convertir dosis inicial a equivalente diazepam
    const eqDiazepamInicial = (dosisInicial / eqDiazepamFactor) * 5;

    let dosisActual = dosisInicial;
    let eqDiazepamActual = eqDiazepamInicial;
    let semana = 0;
    let numeroPaso = 0;

    // Umbral de parada: < 2% de la dosis inicial en eq diazepam, o < 0.5mg eq diazepam
    const umbralParada = Math.min(eqDiazepamInicial * 0.02, 0.5);

    // Límite de pasos para evitar loops infinitos
    const maxPasos = 60;

    while (eqDiazepamActual > umbralParada && numeroPaso < maxPasos) {
        // Añadir el paso actual (dosis que tomará el paciente en este periodo)
        pasos.push({
            paso: numeroPaso + 1,
            semana,
            dosis: Math.round(dosisActual * 1000) / 1000,
            eqDiazepam: Math.round(eqDiazepamActual * 100) / 100,
            reduccionPorc: numeroPaso === 0 ? 0 : config.porcentajePorPaso,
        });

        // Calcular reducción para el siguiente paso (% de la dosis actual)
        const reduccion = dosisActual * factor;
        dosisActual = dosisActual - reduccion;
        eqDiazepamActual = (dosisActual / eqDiazepamFactor) * 5;
        semana += config.semanasPorPaso;
        numeroPaso++;
    }

    // Añadir paso final: 0
    pasos.push({
        paso: numeroPaso + 1,
        semana,
        dosis: 0,
        eqDiazepam: 0,
        reduccionPorc: config.porcentajePorPaso,
    });

    return pasos;
}

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export default function DiscontinuacionBZDPage() {
    const [farmacoId, setFarmacoId] = useState<string>("lorazepam");
    const [dosis, setDosis] = useState<string>("");
    const [velocidad, setVelocidad] = useState<Velocidad>("moderada");
    const [copiedTable, setCopiedTable] = useState(false);
    const [copiedText, setCopiedText] = useState(false);

    const farmaco = BENZOS.find((b) => b.id === farmacoId)!;
    const dosisNum = parseFloat(dosis);
    const dosisValida = !isNaN(dosisNum) && dosisNum > 0;

    const plan = useMemo(() => {
        if (!dosisValida) return null;
        return calcularPlan(dosisNum, velocidad, farmaco.eq5mgDiazepam);
    }, [dosisNum, velocidad, farmaco, dosisValida]);

    const eqDiazepamInicial = useMemo(() => {
        if (!dosisValida) return null;
        return Math.round((dosisNum / farmaco.eq5mgDiazepam) * 5 * 100) / 100;
    }, [dosisNum, farmaco, dosisValida]);

    const duracionTotal = useMemo(() => {
        if (!plan) return null;
        const ultimaSemana = plan[plan.length - 1].semana;
        const meses = Math.round((ultimaSemana / 4) * 10) / 10;
        return { semanas: ultimaSemana, meses };
    }, [plan]);

    const generarTextoInforme = () => {
        if (!plan || !duracionTotal) return "";
        const config = VELOCIDAD_CONFIG[velocidad];
        const lines: string[] = [
            `PLAN DE DISCONTINUACIÓN DE ${farmaco.nombre.toUpperCase()} (${farmaco.marcaEspana})`,
            `Enfoque hiperbólico — Maudsley Deprescribing Guidelines (Horowitz & Taylor, 2024)`,
            "",
            `Dosis actual: ${dosisNum} mg/día de ${farmaco.nombre} (equivalente a ${eqDiazepamInicial} mg de diazepam)`,
            `Velocidad de reducción: ${config.label} — ${config.porcentajePorPaso}% de la dosis actual cada ${config.semanasPorPaso} semanas`,
            `Duración estimada del plan: ${duracionTotal.semanas} semanas (${duracionTotal.meses} meses)`,
            "",
            "PASOS DEL PLAN:",
            "",
        ];

        plan.forEach((p) => {
            if (p.dosis === 0) {
                lines.push(`Paso ${p.paso} (Semana ${p.semana}): Suspensión — 0 mg`);
            } else if (p.paso === 1) {
                lines.push(`Paso ${p.paso} (Semana ${p.semana}): ${p.dosis} mg/día de ${farmaco.nombre} — dosis inicial`);
            } else {
                lines.push(`Paso ${p.paso} (Semana ${p.semana}): ${p.dosis} mg/día de ${farmaco.nombre} (reducción del ${p.reduccionPorc}%)`);
            }
        });

        lines.push("");
        lines.push("NOTAS:");
        lines.push("• Las dosis son aproximadas. Ajustar según tolerancia individual.");
        lines.push("• Si aparecen síntomas de abstinencia, mantener la dosis actual hasta su resolución.");
        lines.push("• La reducción puede ralentizarse o pausarse en cualquier momento según respuesta clínica.");
        lines.push("• Para dosis muy pequeñas puede ser necesaria formulación líquida o compuesta.");
        lines.push(`• Fuente: Maudsley Deprescribing Guidelines (Horowitz & Taylor, 2024).`);

        return lines.join("\n");
    };

    const copyTable = () => {
        if (!plan) return;
        const lines = [
            `Plan de discontinuación — ${farmaco.nombre} ${dosisNum} mg/día`,
            `Velocidad: ${VELOCIDAD_CONFIG[velocidad].label}`,
            "",
            "Paso\tSemana\tDosis (mg)\tEq. Diazepam (mg)",
            ...plan.map((p) =>
                `${p.paso}\t${p.semana}\t${p.dosis}\t${p.eqDiazepam}`
            ),
        ];
        navigator.clipboard.writeText(lines.join("\n"));
        setCopiedTable(true);
        setTimeout(() => setCopiedTable(false), 2000);
    };

    const copyTexto = () => {
        navigator.clipboard.writeText(generarTextoInforme());
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Volver */}
                <Link
                    href="/tools/calculadoras-clinicas"
                    className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Calculadoras Clínicas
                </Link>

                {/* Header */}
                <div className="flex items-center gap-3">
                    <TrendingDown className="w-7 h-7 text-slate-700" />
                    <div>
                        <h1 className="text-2xl font-semibold">Plan de discontinuación de benzodiacepinas</h1>
                        <p className="text-sm text-slate-600">
                            Reducción hiperbólica — Maudsley Deprescribing Guidelines
                        </p>
                    </div>
                </div>

                {/* Configuración */}
                <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">

                    {/* Fármaco */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Fármaco actual</label>
                        <select
                            value={farmacoId}
                            onChange={(e) => { setFarmacoId(e.target.value); setDosis(""); }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
                        >
                            {BENZOS.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.nombre} ({b.marcaEspana})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Dosis */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">
                            Dosis actual (mg/día)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.25"
                            value={dosis}
                            onChange={(e) => setDosis(e.target.value)}
                            placeholder="Ej: 1"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                        {dosisValida && eqDiazepamInicial !== null && (
                            <p className="text-xs text-slate-500">
                                Equivalente a <span className="font-semibold">{eqDiazepamInicial} mg de diazepam</span>
                            </p>
                        )}
                    </div>

                    {/* Velocidad */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Velocidad de reducción</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {(["lenta", "moderada", "rapida"] as Velocidad[]).map((v) => {
                                const config = VELOCIDAD_CONFIG[v];
                                const selected = velocidad === v;
                                return (
                                    <button
                                        key={v}
                                        onClick={() => setVelocidad(v)}
                                        className={`text-left p-3 rounded-lg border text-sm transition-colors ${selected
                                            ? "bg-slate-800 text-white border-slate-800"
                                            : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                                            }`}
                                    >
                                        <div className="font-semibold mb-1">{config.label}</div>
                                        <div className={`text-xs ${selected ? "text-slate-300" : "text-slate-500"}`}>
                                            {config.descripcion}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Resultado */}
                {dosisValida && plan && duracionTotal && (
                    <>
                        {/* Resumen */}
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Dosis inicial</p>
                                    <p className="text-lg font-bold">{dosisNum} mg</p>
                                    <p className="text-xs text-slate-400">{farmaco.nombre}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Eq. diazepam</p>
                                    <p className="text-lg font-bold">{eqDiazepamInicial} mg</p>
                                    <p className="text-xs text-slate-400">diazepam</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Total pasos</p>
                                    <p className="text-lg font-bold">{plan.length}</p>
                                    <p className="text-xs text-slate-400">incluyendo suspensión</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Duración estimada</p>
                                    <p className="text-lg font-bold">{duracionTotal.meses} meses</p>
                                    <p className="text-xs text-slate-400">{duracionTotal.semanas} semanas</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabla de pasos */}
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-medium text-slate-700">Plan paso a paso</h3>
                                <button
                                    onClick={copyTable}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors"
                                >
                                    {copiedTable ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    Copiar tabla
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left py-2 pr-4 text-xs text-slate-500 font-medium">Paso</th>
                                            <th className="text-left py-2 pr-4 text-xs text-slate-500 font-medium">Semana</th>
                                            <th className="text-right py-2 pr-4 text-xs text-slate-500 font-medium">
                                                {farmaco.nombre} (mg/día)
                                            </th>
                                            <th className="text-right py-2 pr-4 text-xs text-slate-500 font-medium">
                                                Eq. diazepam (mg)
                                            </th>
                                            <th className="text-right py-2 text-xs text-slate-500 font-medium">Reducción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {plan.map((p) => (
                                            <tr
                                                key={p.paso}
                                                className={`border-b border-slate-100 ${p.dosis === 0
                                                    ? "bg-red-50"
                                                    : p.paso === 1
                                                        ? "bg-slate-50"
                                                        : ""
                                                    }`}
                                            >
                                                <td className="py-2 pr-4 text-slate-600 font-mono text-xs">{p.paso}</td>
                                                <td className="py-2 pr-4 text-slate-600">S{p.semana}</td>
                                                <td className="py-2 pr-4 text-right font-semibold text-slate-800 font-mono">
                                                    {p.dosis === 0 ? (
                                                        <span className="text-red-600">Suspender</span>
                                                    ) : (
                                                        p.dosis
                                                    )}
                                                </td>
                                                <td className="py-2 pr-4 text-right text-slate-500 font-mono text-xs">
                                                    {p.eqDiazepam === 0 ? "—" : p.eqDiazepam}
                                                </td>
                                                <td className="py-2 text-right text-xs">
                                                    {p.paso === 1 ? (
                                                        <span className="text-slate-400">inicio</span>
                                                    ) : p.dosis === 0 ? (
                                                        <span className="text-red-500">suspensión</span>
                                                    ) : (
                                                        <span className="text-slate-500">−{p.reduccionPorc}%</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Texto para informe */}
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-500" />
                                    <h3 className="text-sm font-medium text-slate-700">Texto para informe clínico</h3>
                                </div>
                                <button
                                    onClick={copyTexto}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-800 text-white hover:bg-slate-700 rounded transition-colors"
                                >
                                    {copiedText ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    Copiar texto
                                </button>
                            </div>
                            <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono bg-slate-50 rounded p-3 leading-relaxed max-h-64 overflow-y-auto">
                                {generarTextoInforme()}
                            </pre>
                        </div>
                    </>
                )}

                {/* Nota */}
                <div className="flex items-start gap-2 text-xs text-slate-600">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                        Las dosis son <strong>aproximadas</strong>. El plan debe ajustarse individualmente según tolerancia y síntomas.
                        Si aparece síndrome de abstinencia, mantener la dosis actual hasta resolución antes de continuar.
                        Para dosis muy pequeñas puede ser necesaria formulación líquida. Fuente: Maudsley Deprescribing Guidelines (Horowitz & Taylor, 2024).
                    </span>
                </div>

            </div>
        </div>
    );
}
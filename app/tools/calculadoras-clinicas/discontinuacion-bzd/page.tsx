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

type TiempoUso = "corto" | "medio" | "prolongado" | "cronico";
type Velocidad = "rapida" | "moderada" | "lenta";

type Paso = {
    paso: number;
    semana: number;
    eqDiazepam: number;
    dosisOriginal: number;
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

// Duración total en semanas según tiempo de uso y velocidad
const DURACION_SEMANAS: Record<TiempoUso, Record<Velocidad, number>> = {
    corto: { rapida: 1, moderada: 1, lenta: 2 },
    medio: { rapida: 4, moderada: 5, lenta: 6 },
    prolongado: { rapida: 6, moderada: 8, lenta: 10 },
    cronico: { rapida: 10, moderada: 12, lenta: 14 },
};

const TIEMPO_USO_CONFIG: Record<TiempoUso, {
    label: string;
    descripcion: string;
}> = {
    corto: { label: "Corto (< 4 semanas)", descripcion: "Contexto de ingreso o uso puntual" },
    medio: { label: "Medio (1-6 meses)", descripcion: "Reducción en pocas semanas" },
    prolongado: { label: "Prolongado (6-12 meses)", descripcion: "Reducción gradual en 2-3 meses" },
    cronico: { label: "Crónico (> 1 año)", descripcion: "Reducción lenta, máximo 3 meses" },
};

const VELOCIDAD_LABEL: Record<Velocidad, string> = {
    rapida: "Rápida",
    moderada: "Moderada",
    lenta: "Lenta",
};

// ─── ALGORITMO ───────────────────────────────────────────────────────────────
// Calcula el número de pasos óptimo para ajustarse a la duración objetivo,
// luego divide la dosis en pasos hiperbólicos (reducciones progresivamente
// más pequeñas) que encajan en ese tiempo.

function calcularPlan(
    eqDiazepamInicial: number,
    tiempoUso: TiempoUso,
    velocidad: Velocidad,
    farmaco: Benzo,
    dosisOriginalInicial: number
): Paso[] {
    const duracionTotal = DURACION_SEMANAS[tiempoUso][velocidad];

    // Número de pasos de reducción (sin contar inicio ni suspensión final)
    // Mínimo 2 pasos, máximo ajustado para no tener intervalos < 1 semana
    const numPasosReduccion = Math.max(2, Math.min(8, duracionTotal));

    // Intervalo entre pasos en semanas (redondeado a entero)
    const semanasPorPaso = Math.max(1, Math.round(duracionTotal / numPasosReduccion));

    // Generar secuencia hiperbólica de dosis en eq. diazepam
    // La reducción de cada paso es proporcional a la dosis actual (hiperbólico)
    // Usamos una secuencia geométrica: cada paso es (1 - factor) del anterior
    // factor = 1 - (dosisMin/dosisInicial)^(1/numPasos)
    const dosisMinEq = 0.5; // mínimo práctico en eq. diazepam
    const factor = 1 - Math.pow(dosisMinEq / eqDiazepamInicial, 1 / numPasosReduccion);

    const pasos: Paso[] = [];

    // Paso 0 — dosis inicial
    pasos.push({
        paso: 1,
        semana: 0,
        eqDiazepam: Math.round(eqDiazepamInicial * 100) / 100,
        dosisOriginal: dosisOriginalInicial,
    });

    let eqActual = eqDiazepamInicial;

    for (let i = 1; i <= numPasosReduccion; i++) {
        eqActual = eqActual * (1 - factor);
        // Redondear a 0.25 más cercano para que sea farmacéuticamente manejable
        eqActual = Math.max(dosisMinEq, Math.round(eqActual / 0.25) * 0.25);

        const dosisOriginal = Math.round(
            (eqActual / 5) * farmaco.eq5mgDiazepam * 100
        ) / 100;

        pasos.push({
            paso: pasos.length + 1,
            semana: i * semanasPorPaso,
            eqDiazepam: Math.round(eqActual * 100) / 100,
            dosisOriginal,
        });
    }

    // Paso final — suspensión
    pasos.push({
        paso: pasos.length + 1,
        semana: (numPasosReduccion + 1) * semanasPorPaso,
        eqDiazepam: 0,
        dosisOriginal: 0,
    });

    return pasos;
}

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export default function DiscontinuacionBZDPage() {
    const [farmacoId, setFarmacoId] = useState<string>("lorazepam");
    const [dosis, setDosis] = useState<string>("");
    const [tiempoUso, setTiempoUso] = useState<TiempoUso>("medio");
    const [velocidad, setVelocidad] = useState<Velocidad>("moderada");
    const [copiedTable, setCopiedTable] = useState(false);
    const [copiedText, setCopiedText] = useState(false);

    const farmaco = BENZOS.find((b) => b.id === farmacoId)!;
    const dosisNum = parseFloat(dosis);
    const dosisValida = !isNaN(dosisNum) && dosisNum > 0;

    const eqDiazepamInicial = useMemo(() => {
        if (!dosisValida) return null;
        return Math.round((dosisNum / farmaco.eq5mgDiazepam) * 5 * 100) / 100;
    }, [dosisNum, farmaco, dosisValida]);

    const plan = useMemo(() => {
        if (!dosisValida || !eqDiazepamInicial) return null;
        return calcularPlan(eqDiazepamInicial, tiempoUso, velocidad, farmaco, dosisNum);
    }, [dosisNum, eqDiazepamInicial, tiempoUso, velocidad, farmaco, dosisValida]);

    const duracionTotal = useMemo(() => {
        if (!plan) return null;
        const ultimaSemana = plan[plan.length - 1].semana;
        return {
            semanas: ultimaSemana,
            meses: Math.round((ultimaSemana / 4.3) * 10) / 10,
        };
    }, [plan]);

    const generarTextoInforme = () => {
        if (!plan || !duracionTotal || !eqDiazepamInicial) return "";
        const tiempoConfig = TIEMPO_USO_CONFIG[tiempoUso];
        const duracion = DURACION_SEMANAS[tiempoUso][velocidad];

        const lines: string[] = [
            `PLAN DE DISCONTINUACIÓN — ${farmaco.nombre.toUpperCase()} (${farmaco.marcaEspana})`,
            `Enfoque de reducción hiperbólica — Maudsley Deprescribing Guidelines (Horowitz & Taylor, 2024)`,
            "",
            `Dosis actual: ${dosisNum} mg/día (equivalente a ${eqDiazepamInicial} mg/día de diazepam)`,
            `Tiempo de uso: ${tiempoConfig.label}`,
            `Velocidad: ${VELOCIDAD_LABEL[velocidad]} — duración estimada ${duracion} semanas`,
            "",
            "PASOS:",
        ];

        plan.forEach((p) => {
            if (p.dosisOriginal === 0 || p.eqDiazepam === 0) {
                lines.push(`  Semana ${p.semana}: Suspensión`);
            } else if (p.paso === 1) {
                lines.push(`  Semana ${p.semana}: ${p.dosisOriginal} mg/día de ${farmaco.nombre} — inicio`);
            } else {
                lines.push(`  Semana ${p.semana}: ${p.dosisOriginal} mg/día de ${farmaco.nombre} (${p.eqDiazepam} mg eq. diazepam)`);
            }
        });

        lines.push("");
        lines.push("CONSIDERACIONES:");
        lines.push("• Si aparecen síntomas de abstinencia, mantener la dosis actual hasta resolución.");
        lines.push("• El ritmo puede ajustarse según tolerancia individual.");
        lines.push("• Para dosis muy pequeñas puede ser necesaria formulación líquida.");
        lines.push("• Las equivalencias son aproximadas — ajustar según respuesta clínica.");

        return lines.join("\n");
    };

    const copyTable = () => {
        if (!plan) return;
        const lines = [
            `Paso\tSemana\t${farmaco.nombre} (mg/día)\tEq. Diazepam (mg)`,
            ...plan.map((p) =>
                p.eqDiazepam === 0
                    ? `${p.paso}\t${p.semana}\tSuspensión\t0`
                    : `${p.paso}\t${p.semana}\t${p.dosisOriginal}\t${p.eqDiazepam}`
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

    const reset = () => setDosis("");

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
                            Reducción hiperbólica progresiva — Maudsley Deprescribing Guidelines
                        </p>
                    </div>
                </div>

                {/* Configuración */}
                <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">

                    {/* Fármaco y dosis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    Equivalente a{" "}
                                    <span className="font-semibold">
                                        {eqDiazepamInicial} mg/día de diazepam
                                    </span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Tiempo de uso */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Tiempo de uso</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {(["corto", "medio", "prolongado", "cronico"] as TiempoUso[]).map((t) => {
                                const config = TIEMPO_USO_CONFIG[t];
                                const selected = tiempoUso === t;
                                return (
                                    <button
                                        key={t}
                                        onClick={() => setTiempoUso(t)}
                                        className={`text-left p-3 rounded-lg border text-sm transition-colors ${selected
                                                ? "bg-slate-800 text-white border-slate-800"
                                                : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                                            }`}
                                    >
                                        <div className="font-semibold text-xs mb-1">{config.label}</div>
                                        <div className={`text-xs leading-tight ${selected ? "text-slate-300" : "text-slate-500"
                                            }`}>
                                            {config.descripcion}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Velocidad */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Velocidad de reducción</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(["rapida", "moderada", "lenta"] as Velocidad[]).map((v) => {
                                const selected = velocidad === v;
                                const semanas = DURACION_SEMANAS[tiempoUso][v];
                                return (
                                    <button
                                        key={v}
                                        onClick={() => setVelocidad(v)}
                                        className={`text-left p-3 rounded-lg border text-sm transition-colors ${selected
                                                ? "bg-slate-800 text-white border-slate-800"
                                                : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                                            }`}
                                    >
                                        <div className="font-semibold mb-1">{VELOCIDAD_LABEL[v]}</div>
                                        <div className={`text-xs ${selected ? "text-slate-300" : "text-slate-500"
                                            }`}>
                                            ~{semanas} semanas
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
                                    <p className="text-xs text-slate-500 mb-1">Pasos</p>
                                    <p className="text-lg font-bold">{plan.length}</p>
                                    <p className="text-xs text-slate-400">incluyendo suspensión</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Duración estimada</p>
                                    <p className="text-lg font-bold">
                                        {duracionTotal.meses < 1
                                            ? `${duracionTotal.semanas} sem.`
                                            : `${duracionTotal.meses} meses`}
                                    </p>
                                    <p className="text-xs text-slate-400">{duracionTotal.semanas} semanas</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabla */}
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-medium text-slate-700">Plan paso a paso</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={reset}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 hover:bg-slate-100 rounded transition-colors"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        Limpiar
                                    </button>
                                    <button
                                        onClick={copyTable}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors"
                                    >
                                        {copiedTable ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        Copiar tabla
                                    </button>
                                </div>
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
                                            <th className="text-right py-2 text-xs text-slate-500 font-medium">
                                                Eq. diazepam (mg)
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {plan.map((p) => {
                                            const esSuspension = p.eqDiazepam === 0;
                                            const esInicio = p.paso === 1;
                                            return (
                                                <tr
                                                    key={p.paso}
                                                    className={`border-b border-slate-100 ${esSuspension
                                                            ? "bg-red-50"
                                                            : esInicio
                                                                ? "bg-slate-50"
                                                                : ""
                                                        }`}
                                                >
                                                    <td className="py-2 pr-4 text-slate-500 font-mono text-xs">
                                                        {p.paso}
                                                    </td>
                                                    <td className="py-2 pr-4 text-slate-600 text-sm">
                                                        {p.semana === 0 ? "Inicio" : `S${p.semana}`}
                                                    </td>
                                                    <td className="py-2 pr-4 text-right font-semibold font-mono">
                                                        {esSuspension ? (
                                                            <span className="text-red-600 font-sans font-medium">
                                                                Suspender
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-800">
                                                                {p.dosisOriginal}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-2 text-right font-mono text-slate-500 text-xs">
                                                        {esSuspension ? "—" : p.eqDiazepam}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Texto para informe */}
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-500" />
                                    <h3 className="text-sm font-medium text-slate-700">
                                        Texto para informe clínico
                                    </h3>
                                </div>
                                <button
                                    onClick={copyTexto}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-800 text-white hover:bg-slate-700 rounded transition-colors"
                                >
                                    {copiedText ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    Copiar texto
                                </button>
                            </div>
                            <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono bg-slate-50 rounded p-3 leading-relaxed max-h-72 overflow-y-auto">
                                {generarTextoInforme()}
                            </pre>
                        </div>
                    </>
                )}

                {/* Nota clínica */}
                <div className="flex items-start gap-2 text-xs text-slate-600">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                        Plan orientativo. Ajustar según tolerancia individual — si aparecen síntomas
                        de abstinencia, mantener la dosis hasta resolución antes de continuar.
                        Las equivalencias son aproximadas.
                        Fuente: Maudsley Deprescribing Guidelines (Horowitz & Taylor, 2024).
                    </span>
                </div>

            </div>
        </div>
    );
}
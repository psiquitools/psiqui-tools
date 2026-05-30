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
    eq10mgDiazepam: number;
    // Dosis posibles ordenadas de mayor a menor según presentaciones reales en España
    // Incluye comprimidos enteros, mitades y combinaciones de presentaciones
    dosisPosibles: number[];
};

type TiempoUso = "corto" | "medio" | "prolongado" | "cronico";
type Velocidad = "rapida" | "moderada" | "lenta";

type Paso = {
    paso: number;
    semana: number;
    eqDiazepam: number;
    dosisOriginal: number;
};

// ─── DATOS — solo fármacos con presentaciones manejables ─────────────────────

const BENZOS: Benzo[] = [
    {
        id: "diazepam",
        nombre: "Diazepam",
        marcaEspana: "Valium®",
        eq10mgDiazepam: 10,
        // Presentaciones: 2 mg, 2.5 mg, 5 mg, 10 mg
        // Permite combinaciones: 10, 7.5, 5, 4, 2.5, 2, 1 (mitad de 2)
        dosisPosibles: [40, 30, 25, 20, 15, 12.5, 10, 7.5, 5, 4, 2.5, 2, 1],
    },
    {
        id: "lorazepam",
        nombre: "Lorazepam",
        marcaEspana: "Orfidal®",
        eq10mgDiazepam: 1,
        // Presentaciones: 1 mg (divisible por la mitad)
        // Combinaciones posibles: 3, 2.5, 2, 1.5, 1, 0.5
        dosisPosibles: [4, 3, 2.5, 2, 1.5, 1, 0.5],
    },
    {
        id: "clonazepam",
        nombre: "Clonazepam",
        marcaEspana: "Rivotril®",
        eq10mgDiazepam: 0.5,
        // Comp 0.5 mg, 2 mg + solución oral 2.5 mg/ml (permite ~0.25 mg)
        dosisPosibles: [4, 3, 2, 1.5, 1, 0.75, 0.5, 0.25],
    },
    {
        id: "lormetazepam",
        nombre: "Lormetazepam",
        marcaEspana: "Noctamid®",
        eq10mgDiazepam: 1,
        // Comp 1 mg, 2 mg + solución oral 2.5 mg/ml
        dosisPosibles: [3, 2, 1.5, 1, 0.5, 0.25],
    },
];

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
// Estrategia: usa solo dosis del array dosisPosibles del fármaco.
// Selecciona pasos descendentes con reducción hiperbólica (proporcional a la
// dosis actual), eligiendo la dosis posible más cercana por debajo.

function calcularPlan(
    tiempoUso: TiempoUso,
    velocidad: Velocidad,
    farmaco: Benzo,
    dosisInicial: number
): Paso[] {
    const duracionTotal = DURACION_SEMANAS[tiempoUso][velocidad];

    // Filtrar dosis posibles a las que están por debajo o iguales a la inicial
    const dosisDisponibles = farmaco.dosisPosibles
        .filter((d) => d <= dosisInicial)
        .sort((a, b) => b - a); // descendente

    // Asegurar que la dosis inicial esté en la lista (puede no estar si el clínico
    // introduce una dosis no estándar)
    if (dosisDisponibles[0] !== dosisInicial) {
        dosisDisponibles.unshift(dosisInicial);
    }

    // Seleccionar pasos: la idea es reducir aprox. un % de la dosis actual cada vez
    // Velocidad rápida = menos pasos (~3-4), lenta = más pasos (~6-8)
    const pasosObjetivo: Record<Velocidad, number> = {
        rapida: 3,
        moderada: 5,
        lenta: 7,
    };
    const numPasosDeseados = pasosObjetivo[velocidad];

    // Construir secuencia hiperbólica de dosis objetivo, luego mapear a la dosis
    // posible más cercana
    const factor = Math.pow(0.1 / dosisInicial, 1 / numPasosDeseados);
    const dosisObjetivo: number[] = [dosisInicial];
    let actual = dosisInicial;
    for (let i = 1; i <= numPasosDeseados; i++) {
        actual = actual * factor;
        dosisObjetivo.push(actual);
    }

    // Mapear cada dosis objetivo a la más cercana del array de posibles (por debajo)
    const dosisReales: number[] = [];
    for (const objetivo of dosisObjetivo) {
        const masCercana = dosisDisponibles.find((d) => d <= objetivo) ?? null;
        if (masCercana !== null && !dosisReales.includes(masCercana)) {
            dosisReales.push(masCercana);
        }
    }

    // Asegurar que la primera dosis sea la inicial
    if (dosisReales[0] !== dosisInicial) {
        dosisReales.unshift(dosisInicial);
    }

    // Si no incluye la mínima disponible, añadirla como penúltimo paso
    const minDisponible = dosisDisponibles[dosisDisponibles.length - 1];
    if (dosisReales[dosisReales.length - 1] !== minDisponible) {
        dosisReales.push(minDisponible);
    }

    // Calcular intervalo entre pasos
    const numPasosReales = dosisReales.length;
    const semanasPorPaso = Math.max(1, Math.round(duracionTotal / numPasosReales));

    // Construir array de Paso
    const pasos: Paso[] = dosisReales.map((dosis, i) => ({
        paso: i + 1,
        semana: i * semanasPorPaso,
        eqDiazepam: Math.round((dosis / farmaco.eq10mgDiazepam) * 10 * 100) / 100,
        dosisOriginal: dosis,
    }));

    // Añadir paso final: suspensión
    pasos.push({
        paso: pasos.length + 1,
        semana: pasos.length * semanasPorPaso,
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
        return Math.round((dosisNum / farmaco.eq10mgDiazepam) * 10 * 100) / 100;
    }, [dosisNum, farmaco, dosisValida]);

    const plan = useMemo(() => {
        if (!dosisValida) return null;
        return calcularPlan(tiempoUso, velocidad, farmaco, dosisNum);
    }, [dosisNum, tiempoUso, velocidad, farmaco, dosisValida]);

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
        lines.push("• Las dosis están adaptadas a las presentaciones disponibles en España.");
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
                    Volver a Herramientas Farmacológicas
                </Link>

                {/* Header */}
                <div className="flex items-center gap-3">
                    <TrendingDown className="w-7 h-7 text-slate-700" />
                    <div>
                        <h1 className="text-2xl font-semibold">Plan de discontinuación de benzodiacepinas</h1>
                        <p className="text-sm text-slate-600">
                            Reducción hiperbólica con dosis farmacéuticamente posibles
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
                            <p className="text-xs text-slate-400 pt-1">
                                Dosis manejables: {farmaco.dosisPosibles.join(", ")} mg
                            </p>
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
                        Plan orientativo basado en presentaciones disponibles en España. Las dosis están adaptadas a comprimidos enteros, mitades y solución oral según corresponda.
                        Si aparecen síntomas de abstinencia, mantener la dosis hasta resolución antes de continuar.
                        Fuente: Maudsley Deprescribing Guidelines (Horowitz & Taylor, 2024).
                    </span>
                </div>

            </div>
        </div>
    );
}
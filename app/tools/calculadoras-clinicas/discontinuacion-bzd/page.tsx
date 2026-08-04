"use client";

import { useState, useMemo } from "react";
import { TrendingDown, AlertCircle, Copy, Check, FileText, RotateCcw, ChevronDown, Download } from "lucide-react";

// ─── TIPOS ───────────────────────────────────────────────────────────────────

type Perfil    = "bajo" | "alto";
type Intervalo = 2 | 4;

type DosisLimpia = { mg: number; posologia: string };

type Farmaco = {
    id: string;
    nombre: string;
    marca: string;
    eq10mgDiazepam: number;
    vidaMedia: "larga" | "corta";
    dosisLimpias: DosisLimpia[]; // ordenadas de mayor a menor
};

type Paso = {
    paso: number;
    semana: number;
    dosis: number;
    eqDiazepam: number;
    posologia: string;
    reduccionPct: number | null;
    suspension: boolean;
};

// ─── PLANES NHS GRAMPIAN ──────────────────────────────────────────────────────
// Fuente: NHS Grampian — Guidance for Prescribing and Withdrawal of
// Benzodiazepines & Hypnotics (2006). Dosis en mg equivalente diazepam.

type PasoReduccion = {
    paso: number;
    semanaInicio: number;
    duracionSemanas: number;
    manana: number;
    mediodia: number;
    tarde: number;
    noche: number;
    totalDia: number;
    nota?: string;
};

export const PLAN_30MG: PasoReduccion[] = [
    { paso: 0,  semanaInicio: 0,  duracionSemanas: 0,  manana: 10, mediodia: 0, tarde: 10, noche: 10, totalDia: 30, nota: "Dosis inicial" },
    { paso: 1,  semanaInicio: 0,  duracionSemanas: 2,  manana: 8,  mediodia: 0, tarde: 8,  noche: 8,  totalDia: 24 },
    { paso: 2,  semanaInicio: 2,  duracionSemanas: 2,  manana: 6,  mediodia: 0, tarde: 6,  noche: 8,  totalDia: 20 },
    { paso: 3,  semanaInicio: 4,  duracionSemanas: 2,  manana: 6,  mediodia: 0, tarde: 6,  noche: 6,  totalDia: 18 },
    { paso: 4,  semanaInicio: 6,  duracionSemanas: 2,  manana: 4,  mediodia: 0, tarde: 6,  noche: 6,  totalDia: 16 },
    { paso: 5,  semanaInicio: 8,  duracionSemanas: 2,  manana: 4,  mediodia: 0, tarde: 4,  noche: 6,  totalDia: 14 },
    { paso: 6,  semanaInicio: 10, duracionSemanas: 2,  manana: 4,  mediodia: 0, tarde: 4,  noche: 4,  totalDia: 12 },
    { paso: 7,  semanaInicio: 12, duracionSemanas: 2,  manana: 2,  mediodia: 0, tarde: 4,  noche: 4,  totalDia: 10 },
    { paso: 8,  semanaInicio: 14, duracionSemanas: 2,  manana: 2,  mediodia: 0, tarde: 2,  noche: 4,  totalDia: 8  },
    { paso: 9,  semanaInicio: 16, duracionSemanas: 2,  manana: 2,  mediodia: 0, tarde: 2,  noche: 2,  totalDia: 6  },
    { paso: 10, semanaInicio: 18, duracionSemanas: 2,  manana: 2,  mediodia: 0, tarde: 0,  noche: 2,  totalDia: 4  },
    { paso: 11, semanaInicio: 20, duracionSemanas: 2,  manana: 0,  mediodia: 0, tarde: 0,  noche: 2,  totalDia: 2  },
    { paso: 12, semanaInicio: 22, duracionSemanas: 0,  manana: 0,  mediodia: 0, tarde: 0,  noche: 0,  totalDia: 0,  nota: "Suspensión" },
];

export const PLAN_80MG: PasoReduccion[] = [
    { paso: 0,  semanaInicio: 0,  duracionSemanas: 0,  manana: 20, mediodia: 20, tarde: 20, noche: 20, totalDia: 80, nota: "Dosis inicial" },
    { paso: 1,  semanaInicio: 0,  duracionSemanas: 2,  manana: 20, mediodia: 20, tarde: 15, noche: 20, totalDia: 75 },
    { paso: 2,  semanaInicio: 2,  duracionSemanas: 2,  manana: 20, mediodia: 15, tarde: 15, noche: 20, totalDia: 70 },
    { paso: 3,  semanaInicio: 4,  duracionSemanas: 2,  manana: 15, mediodia: 15, tarde: 15, noche: 20, totalDia: 65 },
    { paso: 4,  semanaInicio: 6,  duracionSemanas: 2,  manana: 15, mediodia: 15, tarde: 10, noche: 20, totalDia: 60 },
    { paso: 5,  semanaInicio: 8,  duracionSemanas: 2,  manana: 15, mediodia: 10, tarde: 10, noche: 20, totalDia: 55 },
    { paso: 6,  semanaInicio: 10, duracionSemanas: 2,  manana: 10, mediodia: 10, tarde: 10, noche: 20, totalDia: 50 },
    { paso: 7,  semanaInicio: 12, duracionSemanas: 2,  manana: 10, mediodia: 10, tarde: 5,  noche: 20, totalDia: 45 },
    { paso: 8,  semanaInicio: 14, duracionSemanas: 2,  manana: 10, mediodia: 5,  tarde: 5,  noche: 20, totalDia: 40 },
    { paso: 9,  semanaInicio: 16, duracionSemanas: 2,  manana: 10, mediodia: 5,  tarde: 5,  noche: 15, totalDia: 35 },
    { paso: 10, semanaInicio: 18, duracionSemanas: 2,  manana: 5,  mediodia: 5,  tarde: 5,  noche: 15, totalDia: 30, nota: "→ Continuar con Plan desde 30 mg" },
];

export const PLAN_200MG: PasoReduccion[] = [
    { paso: 0, semanaInicio: 0,  duracionSemanas: 0,  manana: 50, mediodia: 50, tarde: 50, noche: 50, totalDia: 200, nota: "Dosis inicial" },
    { paso: 1, semanaInicio: 0,  duracionSemanas: 2,  manana: 50, mediodia: 40, tarde: 40, noche: 50, totalDia: 180 },
    { paso: 2, semanaInicio: 2,  duracionSemanas: 2,  manana: 40, mediodia: 40, tarde: 30, noche: 50, totalDia: 160 },
    { paso: 3, semanaInicio: 4,  duracionSemanas: 2,  manana: 40, mediodia: 30, tarde: 30, noche: 40, totalDia: 140 },
    { paso: 4, semanaInicio: 6,  duracionSemanas: 2,  manana: 30, mediodia: 30, tarde: 20, noche: 40, totalDia: 120 },
    { paso: 5, semanaInicio: 8,  duracionSemanas: 2,  manana: 30, mediodia: 20, tarde: 20, noche: 40, totalDia: 110 },
    { paso: 6, semanaInicio: 10, duracionSemanas: 2,  manana: 30, mediodia: 20, tarde: 20, noche: 30, totalDia: 100 },
    { paso: 7, semanaInicio: 12, duracionSemanas: 2,  manana: 20, mediodia: 20, tarde: 20, noche: 30, totalDia: 90  },
    { paso: 8, semanaInicio: 14, duracionSemanas: 2,  manana: 20, mediodia: 20, tarde: 20, noche: 20, totalDia: 80, nota: "→ Continuar con Plan desde 80 mg" },
];

export function seleccionarPlan(eqDiazepamInicial: number): {
    plan: PasoReduccion[];
    encadenado?: PasoReduccion[][];
    nota: string;
} {
    if (eqDiazepamInicial <= 30) {
        return {
            plan: PLAN_30MG,
            nota: "Plan estándar de reducción desde 30 mg eq. diazepam. Duración mínima: 22 semanas.",
        };
    }
    if (eqDiazepamInicial <= 80) {
        return {
            plan: PLAN_80MG,
            encadenado: [PLAN_30MG],
            nota: "Reducción en dos fases: primero de 80 mg a 30 mg eq. diazepam (20 semanas), luego continuar con el plan desde 30 mg (22 semanas). Total mínimo: 42 semanas.",
        };
    }
    return {
        plan: PLAN_200MG,
        encadenado: [PLAN_80MG, PLAN_30MG],
        nota: "Reducción en tres fases: 200→80 mg (16 semanas) → 80→30 mg (20 semanas) → 30→0 mg (22 semanas). Total mínimo: 58 semanas. Requiere supervisión médica estrecha.",
    };
}

// ─── DATOS ────────────────────────────────────────────────────────────────────
// Dosis limpias = las que se consiguen con 1-2 piezas de comprimido simples.
// Nunca se redondea hacia arriba para evitar exposición extra.

const FARMACOS: Farmaco[] = [
    {
        id: "diazepam",
        nombre: "Diazepam",
        marca: "Valium®",
        eq10mgDiazepam: 10,
        vidaMedia: "larga",
        dosisLimpias: [
            { mg: 40,   posologia: "4 comp. 10 mg" },
            { mg: 30,   posologia: "3 comp. 10 mg" },
            { mg: 25,   posologia: "2 comp. 10 mg + 1 comp. 5 mg" },
            { mg: 20,   posologia: "2 comp. 10 mg" },
            { mg: 15,   posologia: "1 comp. 10 mg + 1 comp. 5 mg" },
            { mg: 12.5, posologia: "1 comp. 10 mg + ½ comp. 5 mg" },
            { mg: 10,   posologia: "1 comp. 10 mg" },
            { mg: 7.5,  posologia: "1 comp. 5 mg + ½ comp. 5 mg" },
            { mg: 5,    posologia: "1 comp. 5 mg" },
            { mg: 4,    posologia: "2 comp. 2 mg" },
            { mg: 2.5,  posologia: "½ comp. 5 mg" },
            { mg: 2,    posologia: "1 comp. 2 mg" },
            { mg: 1,    posologia: "½ comp. 2 mg" },
        ],
    },
    {
        id: "lorazepam",
        nombre: "Lorazepam",
        marca: "Orfidal®",
        eq10mgDiazepam: 1,
        vidaMedia: "corta",
        dosisLimpias: [
            { mg: 4,   posologia: "4 comp. 1 mg" },
            { mg: 3,   posologia: "3 comp. 1 mg" },
            { mg: 2.5, posologia: "2 comp. 1 mg + ½ comp. 1 mg" },
            { mg: 2,   posologia: "2 comp. 1 mg" },
            { mg: 1.5, posologia: "1 comp. 1 mg + ½ comp. 1 mg" },
            { mg: 1,   posologia: "1 comp. 1 mg" },
            { mg: 0.5, posologia: "½ comp. 1 mg" },
        ],
    },
    {
        id: "clonazepam",
        nombre: "Clonazepam",
        marca: "Rivotril®",
        eq10mgDiazepam: 0.5,
        vidaMedia: "larga",
        dosisLimpias: [
            { mg: 4,    posologia: "2 comp. 2 mg" },
            { mg: 3,    posologia: "1 comp. 2 mg + ½ comp. 2 mg" },
            { mg: 2.5,  posologia: "1 comp. 2 mg + 1 comp. 0.5 mg" },
            { mg: 2,    posologia: "1 comp. 2 mg" },
            { mg: 1.5,  posologia: "½ comp. 2 mg + 1 comp. 0.5 mg" },
            { mg: 1,    posologia: "½ comp. 2 mg" },
            { mg: 0.5,  posologia: "1 comp. 0.5 mg" },
            { mg: 0.25, posologia: "½ comp. 0.5 mg" },
        ],
    },
    {
        id: "lormetazepam",
        nombre: "Lormetazepam",
        marca: "Noctamid®",
        eq10mgDiazepam: 1,
        vidaMedia: "corta",
        dosisLimpias: [
            { mg: 4,   posologia: "2 comp. 2 mg" },
            { mg: 3,   posologia: "1 comp. 2 mg + 1 comp. 1 mg" },
            { mg: 2,   posologia: "1 comp. 2 mg" },
            { mg: 1.5, posologia: "1 comp. 1 mg + ½ comp. 1 mg" },
            { mg: 1,   posologia: "1 comp. 1 mg" },
            { mg: 0.5, posologia: "½ comp. 1 mg" },
        ],
    },
];

// Escalones Maudsley en mg de equivalente diazepam por paso
const BANDAS = [
    { min: 50,  lento: 5,    rapido: 10   },
    { min: 20,  lento: 2,    rapido: 5    },
    { min: 10,  lento: 1,    rapido: 2    },
    { min: 5,   lento: 0.5,  rapido: 1    },
    { min: 2.5, lento: 0.25, rapido: 0.5  },
    { min: 0,   lento: 0.1,  rapido: 0.25 },
] as const;

// ─── UTILIDADES ───────────────────────────────────────────────────────────────

function r2(n: number) { return Math.round(n * 100) / 100; }

// Convierte la posología abreviada a texto completo para el informe
function posologiaLarga(pos: string): string {
    return pos
        .replace(/(\d+) comp\. (\d+(?:\.\d+)?) mg/g, (_, n, mg) =>
            `${n} ${n === "1" ? "comprimido" : "comprimidos"} de ${mg} mg`)
        .replace(/½ comp\. (\d+(?:\.\d+)?) mg/g, (_, mg) =>
            `medio comprimido de ${mg} mg`)
        .replace(/ \+ /g, " y ");
}

function getBanda(eq: number) {
    for (const b of BANDAS) if (eq >= b.min) return b;
    return BANDAS[BANDAS.length - 1];
}

// Busca la dosis limpia más alta que sea ≤ dosis (nunca redondea hacia arriba)
function snapDown(dosis: number, dosisLimpias: DosisLimpia[]): DosisLimpia | null {
    return dosisLimpias.find(d => d.mg <= dosis + 0.001) ?? null;
}

// ─── ALGORITMO ───────────────────────────────────────────────────────────────

function calcularPlan(farmaco: Farmaco, dosis: number, perfil: Perfil, intervalo: Intervalo): Paso[] {
    const pasos: Paso[] = [];

    let actual = snapDown(dosis, farmaco.dosisLimpias);
    if (!actual) return [];

    let eq     = r2((actual.mg / farmaco.eq10mgDiazepam) * 10);
    let semana = 0;
    let prevMg: number | null = null;

    while (eq > 0.001 && pasos.length < 60) {
        const reduccionPct = prevMg !== null ? Math.round((1 - actual.mg / prevMg) * 100) : null;

        pasos.push({
            paso: pasos.length + 1,
            semana,
            dosis: actual.mg,
            eqDiazepam: eq,
            posologia: actual.posologia,
            reduccionPct,
            suspension: false,
        });

        const banda      = getBanda(eq);
        const reduccion  = perfil === "alto" ? banda.lento : banda.rapido;
        const newEqIdeal = Math.max(0, eq - reduccion);
        const newDosisIdeal = (newEqIdeal / 10) * farmaco.eq10mgDiazepam;

        const siguiente = snapDown(newDosisIdeal, farmaco.dosisLimpias);
        if (!siguiente || siguiente.mg >= actual.mg) break;

        prevMg = actual.mg;
        actual = siguiente;
        eq     = r2((actual.mg / farmaco.eq10mgDiazepam) * 10);
        semana += intervalo;
    }

    pasos.push({
        paso: pasos.length + 1,
        semana,
        dosis: 0,
        eqDiazepam: 0,
        posologia: "—",
        reduccionPct: null,
        suspension: true,
    });

    return pasos;
}

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export default function DiscontinuacionBZDPage() {
    const [farmacoId, setFarmacoId]     = useState("lorazepam");
    const [dosis, setDosis]             = useState("");
    const [perfil, setPerfil]           = useState<Perfil>("alto");
    const [intervalo, setIntervalo]     = useState<Intervalo>(4);
    const [copiedTabla, setCopiedTabla] = useState(false);
    const [copiedTexto, setCopiedTexto] = useState(false);
    const [refAbierta, setRefAbierta]     = useState(false);
    const [grampianAbierto, setGrampianAbierto] = useState(false);

    const farmaco     = FARMACOS.find(f => f.id === farmacoId)!;
    const dosisNum    = parseFloat(dosis);
    const dosisValida = !isNaN(dosisNum) && dosisNum > 0;

    const eqInicial = useMemo(() =>
        dosisValida ? r2((dosisNum / farmaco.eq10mgDiazepam) * 10) : null,
        [dosisNum, farmaco, dosisValida]);

    const plan = useMemo(() =>
        dosisValida ? calcularPlan(farmaco, dosisNum, perfil, intervalo) : null,
        [dosisNum, farmaco, perfil, intervalo, dosisValida]);

    const duracion = useMemo(() => {
        if (!plan) return null;
        const sem = plan[plan.length - 1].semana;
        return { semanas: sem, meses: Math.round((sem / 4.3) * 10) / 10 };
    }, [plan]);

    const grampianSeleccion = useMemo(() =>
        eqInicial !== null ? seleccionarPlan(eqInicial) : null,
        [eqInicial]);

    const dosisInicioPlan = plan && plan.length > 0 ? plan[0].dosis : null;
    const ajusteInicio    = dosisInicioPlan !== null && dosisInicioPlan < dosisNum;

    const textoInforme = useMemo(() => {
        if (!plan || !duracion || eqInicial === null) return "";
        const perfilLabel = perfil === "bajo"
            ? "Bajo riesgo — reducción 10-20% por escalón"
            : "Alto riesgo — reducción 5-10% por escalón";
        const hayMedio   = plan.some(p => p.posologia.includes("½"));
        const hayLiquido = plan.some(p => !p.suspension && p.eqDiazepam < 2);

        const lines = [
            `PLAN DE DISCONTINUACIÓN — ${farmaco.nombre.toUpperCase()} (${farmaco.marca})`,
            `Maudsley Deprescribing Guidelines (Taylor et al., 2024)`,
            "",
            `Dosis actual: ${dosisNum} mg al día (equivalente a ${eqInicial} mg de diazepam)`,
            `Perfil: ${perfilLabel}`,
            `Intervalo entre escalones: ${intervalo} semanas`,
            `Duración estimada: ${duracion.semanas} semanas (~${duracion.meses} meses)`,
            "",
            "PAUTA:",
            "",
        ];

        plan.forEach(p => {
            if (p.suspension) {
                lines.push(`  A partir de la semana ${p.semana + 1}: Suspender ${farmaco.nombre}`);
            } else {
                const semIni = p.semana + 1;
                const semFin = p.semana + intervalo;
                const rango  = p.paso === 1
                    ? `Semanas ${semIni} a ${semFin} (inicio)`
                    : `Semanas ${semIni} a ${semFin}`;
                lines.push(`  ${rango}:`);
                lines.push(`    ${farmaco.nombre} ${p.dosis} mg al día`);
                lines.push(`    Tomar: ${posologiaLarga(p.posologia)}`);
                lines.push("");
            }
        });

        lines.push("CONSIDERACIONES:");
        lines.push("• Monitorizar síntomas de abstinencia durante las 2-4 semanas siguientes a cada reducción.");
        lines.push("• Si aparecen síntomas significativos: mantener la dosis actual hasta que se resuelvan,");
        lines.push("  o volver a la última dosis que fue bien tolerada. Reducir más lentamente a partir de ahí.");
        if (hayMedio) {
            lines.push("• Para partir los comprimidos por la mitad se puede usar un cortapastillas de farmacia.");
        }
        if (hayLiquido) {
            lines.push("• En los últimos escalones puede ser necesaria una formulación líquida magistral");
            lines.push("  para conseguir dosis más precisas.");
        }

        return lines.join("\n");
    }, [plan, duracion, eqInicial, farmaco, dosisNum, perfil, intervalo]);

    const copyTabla = () => {
        if (!plan) return;
        const lines = [
            `Paso\tSemana\t${farmaco.nombre} (mg/día)\tPosología\tEq. diazepam\tReducción`,
            ...plan.map(p => p.suspension
                ? `${p.paso}\t${p.semana}\tSuspensión\t—\t—\t—`
                : `${p.paso}\t${p.semana === 0 ? "Inicio" : p.semana}\t${p.dosis}\t${p.posologia}\t${p.eqDiazepam} mg\t${p.reduccionPct !== null ? p.reduccionPct + "%" : "—"}`
            ),
        ];
        navigator.clipboard.writeText(lines.join("\n"));
        setCopiedTabla(true);
        setTimeout(() => setCopiedTabla(false), 2000);
    };

    const copyTexto = () => {
        navigator.clipboard.writeText(textoInforme);
        setCopiedTexto(true);
        setTimeout(() => setCopiedTexto(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-6">

                <div className="flex items-center gap-3">
                    <TrendingDown className="w-7 h-7 text-slate-700" />
                    <div>
                        <h1 className="text-2xl font-semibold">Discontinuación de benzodiacepinas</h1>
                        <p className="text-sm text-slate-600">Reducción proporcional escalón por escalón · Maudsley Deprescribing Guidelines</p>
                    </div>
                </div>

                {/* Configuración */}
                <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-6">

                    {/* Fármaco */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Fármaco</label>
                        <div className="flex flex-wrap gap-2">
                            {FARMACOS.map(f => (
                                <button key={f.id} onClick={() => { setFarmacoId(f.id); setDosis(""); }}
                                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                                        farmacoId === f.id
                                            ? "bg-slate-800 text-white border-slate-800"
                                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                    }`}
                                >
                                    {f.nombre}
                                    <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                                        f.vidaMedia === "larga" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                                    } ${farmacoId === f.id ? "opacity-75" : ""}`}>
                                        {f.vidaMedia === "larga" ? "VM larga" : "VM corta"}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dosis */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Dosis actual (mg/día)</label>
                        <input
                            type="number" min="0" step="0.5" value={dosis}
                            onChange={e => setDosis(e.target.value)}
                            placeholder="Ej: 2"
                            className="w-full md:w-48 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                        {dosisValida && eqInicial !== null && (
                            <p className="text-xs text-slate-500">
                                Equivalente a <span className="font-semibold">{eqInicial} mg/día de diazepam</span>
                            </p>
                        )}
                    </div>

                    {/* Perfil */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Perfil de riesgo</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {([
                                { id: "bajo" as Perfil, titulo: "Bajo riesgo", reduccion: "10-20% por escalón",
                                  criterios: ["< 6 meses de uso", "Vida media larga", "Sin abstinencia previa"] },
                                { id: "alto" as Perfil, titulo: "Alto riesgo", reduccion: "5-10% por escalón",
                                  criterios: ["> 6 meses de uso", "Vida media corta", "Antecedente de abstinencia"] },
                            ]).map(p => {
                                const sel = perfil === p.id;
                                return (
                                    <button key={p.id} onClick={() => setPerfil(p.id)}
                                        className={`text-left p-4 rounded-lg border-2 transition-colors ${sel ? "bg-slate-800 text-white border-slate-800" : "bg-slate-50 border-slate-200 hover:border-slate-400"}`}
                                    >
                                        <p className="text-sm font-semibold mb-0.5">{p.titulo}</p>
                                        <p className={`text-xs mb-2 ${sel ? "text-slate-300" : "text-slate-500"}`}>{p.reduccion}</p>
                                        <ul className="space-y-0.5">
                                            {p.criterios.map(c => (
                                                <li key={c} className={`text-xs flex items-center gap-1.5 ${sel ? "text-slate-300" : "text-slate-500"}`}>
                                                    <span className="w-1 h-1 rounded-full bg-slate-400 flex-shrink-0" /> {c}
                                                </li>
                                            ))}
                                        </ul>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Intervalo */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Intervalo entre escalones</label>
                        <div className="flex gap-2">
                            {([2, 4] as Intervalo[]).map(i => (
                                <button key={i} onClick={() => setIntervalo(i)}
                                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                        intervalo === i ? "bg-slate-800 text-white border-slate-800" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                    }`}
                                >
                                    {i} semanas
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400">Monitorizar síntomas 2-4 semanas tras cada reducción antes de continuar.</p>
                    </div>
                </div>

                {/* Resultado */}
                {dosisValida && plan && duracion && (
                    <>
                        {/* Aviso si hubo ajuste de dosis inicial */}
                        {ajusteInicio && (
                            <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                                La dosis actual ({dosisNum} mg) no corresponde a una presentación estándar. El plan comienza desde {dosisInicioPlan} mg ({farmaco.dosisLimpias.find(d => d.mg === dosisInicioPlan)?.posologia}).
                            </div>
                        )}

                        {/* Resumen */}
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Dosis inicio plan</p>
                                    <p className="text-lg font-bold">{plan[0].dosis} mg</p>
                                    <p className="text-xs text-slate-400">{farmaco.nombre}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Eq. diazepam</p>
                                    <p className="text-lg font-bold">{eqInicial} mg</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Escalones</p>
                                    <p className="text-lg font-bold">{plan.length - 1}</p>
                                    <p className="text-xs text-slate-400">+ suspensión</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Duración estimada</p>
                                    <p className="text-lg font-bold">{duracion.semanas} sem.</p>
                                    <p className="text-xs text-slate-400">~{duracion.meses} meses</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabla */}
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-medium text-slate-700">Plan escalón por escalón</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => setDosis("")} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 hover:bg-slate-100 rounded">
                                        <RotateCcw className="w-3 h-3" /> Limpiar
                                    </button>
                                    <button onClick={copyTabla} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded border border-slate-200">
                                        {copiedTabla ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copiar tabla
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left py-2 pr-3 text-xs text-slate-500 font-medium">Semana</th>
                                            <th className="text-right py-2 pr-3 text-xs text-slate-500 font-medium">{farmaco.nombre}</th>
                                            <th className="text-left py-2 pr-3 text-xs text-slate-500 font-medium">Posología</th>
                                            <th className="text-right py-2 pr-3 text-xs text-slate-500 font-medium hidden md:table-cell">Eq. diazepam</th>
                                            <th className="text-right py-2 text-xs text-slate-500 font-medium hidden md:table-cell">Reducción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {plan.map(p => (
                                            <tr key={p.paso} className={`border-b border-slate-100 ${p.suspension ? "bg-red-50" : p.paso === 1 ? "bg-slate-50" : ""}`}>
                                                <td className="py-2.5 pr-3 text-slate-600 text-xs">{p.semana === 0 ? "Inicio" : `S${p.semana}`}</td>
                                                <td className="py-2.5 pr-3 text-right font-mono font-semibold text-sm">
                                                    {p.suspension
                                                        ? <span className="text-red-600 font-sans font-medium text-xs">Suspender</span>
                                                        : <span className="text-slate-800">{p.dosis} mg</span>
                                                    }
                                                </td>
                                                <td className="py-2.5 pr-3 text-xs text-slate-600">{p.posologia}</td>
                                                <td className="py-2.5 pr-3 text-right font-mono text-slate-400 text-xs hidden md:table-cell">
                                                    {p.suspension ? "—" : `${p.eqDiazepam} mg`}
                                                </td>
                                                <td className="py-2.5 text-right text-xs hidden md:table-cell">
                                                    {p.reduccionPct !== null
                                                        ? <span className={p.reduccionPct > 25 ? "text-amber-600 font-medium" : "text-slate-500"}>↓{p.reduccionPct}%</span>
                                                        : <span className="text-slate-300">—</span>
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {plan.some(p => p.reduccionPct !== null && p.reduccionPct > 25) && (
                                <p className="text-xs text-amber-700 mt-3 flex items-start gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                    Algunos escalones superan el 25% de reducción, mayor que el objetivo ideal para este perfil. Considerar ampliar el intervalo entre esos pasos o usar formulación líquida para escalones intermedios.
                                </p>
                            )}
                        </div>

                        {/* Texto para informe */}
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-500" />
                                    <h3 className="text-sm font-medium text-slate-700">Texto para informe clínico</h3>
                                </div>
                                <button onClick={copyTexto} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-800 text-white hover:bg-slate-700 rounded">
                                    {copiedTexto ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copiar
                                </button>
                            </div>
                            <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono bg-slate-50 rounded p-3 leading-relaxed max-h-72 overflow-y-auto">
                                {textoInforme}
                            </pre>
                        </div>

                        {/* Plan de referencia NHS Grampian */}
                        {grampianSeleccion && (
                            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setGrampianAbierto(v => !v)}
                                    className="flex w-full items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-slate-700">Plan de referencia NHS Grampian</span>
                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">Opción alternativa</span>
                                    </div>
                                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${grampianAbierto ? "rotate-180" : ""}`} />
                                </button>

                                {grampianAbierto && (
                                    <div className="px-4 pb-5 space-y-4 border-t border-slate-100 pt-4">
                                        <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-100">
                                            {grampianSeleccion.nota}
                                        </p>

                                        {[grampianSeleccion.plan, ...(grampianSeleccion.encadenado ?? [])].map((planFase, faseIdx) => {
                                            const esEncadenado = faseIdx > 0;
                                            const pasosVisibles = planFase.filter(p =>
                                                p.paso > 0 && (esEncadenado || p.totalDia <= (eqInicial ?? 0) + 0.5)
                                            );
                                            if (pasosVisibles.length === 0) return null;
                                            const tieneNotas = pasosVisibles.some(p => p.nota && p.nota !== "Dosis inicial" && p.nota !== "Suspensión");
                                            const tieneConversion = farmaco.id !== "diazepam";
                                            const totalFases = 1 + (grampianSeleccion.encadenado?.length ?? 0);

                                            return (
                                                <div key={faseIdx} className="space-y-2">
                                                    {totalFases > 1 && (
                                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                            {faseIdx === 0 ? "Fase 1" : `Continuación ${faseIdx}`}
                                                        </p>
                                                    )}
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-xs">
                                                            <thead>
                                                                <tr className="border-b border-slate-200 text-slate-500 font-medium">
                                                                    <th className="text-left py-1.5 pr-3 whitespace-nowrap">Sem.</th>
                                                                    <th className="text-right py-1.5 pr-3 whitespace-nowrap">Dur.</th>
                                                                    <th className="text-right py-1.5 pr-2 whitespace-nowrap">Mañ.</th>
                                                                    <th className="text-right py-1.5 pr-2 whitespace-nowrap">Med.</th>
                                                                    <th className="text-right py-1.5 pr-2 whitespace-nowrap">Tar.</th>
                                                                    <th className="text-right py-1.5 pr-3 whitespace-nowrap">Noch.</th>
                                                                    <th className="text-right py-1.5 pr-2 whitespace-nowrap">Total (Dz)</th>
                                                                    {tieneConversion && <th className="text-right py-1.5 whitespace-nowrap">Total ({farmaco.nombre})</th>}
                                                                    {tieneNotas && <th className="py-1.5"></th>}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {pasosVisibles.map((p, i) => {
                                                                    const esSuspension = p.totalDia === 0;
                                                                    const esPrimero = i === 0 && faseIdx === 0;
                                                                    const notaFila = p.nota && p.nota !== "Dosis inicial" && p.nota !== "Suspensión"
                                                                        ? p.nota : null;
                                                                    return (
                                                                        <tr key={p.paso} className={`border-b border-slate-100 ${esSuspension ? "bg-red-50" : esPrimero ? "bg-sky-50/50" : ""}`}>
                                                                            <td className="py-2 pr-3 text-slate-600 whitespace-nowrap">S{p.semanaInicio}</td>
                                                                            <td className="py-2 pr-3 text-right text-slate-500">{esSuspension ? "—" : `${p.duracionSemanas}s`}</td>
                                                                            <td className="py-2 pr-2 text-right font-mono">{p.manana > 0 ? p.manana : <span className="text-slate-300">—</span>}</td>
                                                                            <td className="py-2 pr-2 text-right font-mono">{p.mediodia > 0 ? p.mediodia : <span className="text-slate-300">—</span>}</td>
                                                                            <td className="py-2 pr-2 text-right font-mono">{p.tarde > 0 ? p.tarde : <span className="text-slate-300">—</span>}</td>
                                                                            <td className="py-2 pr-3 text-right font-mono">{p.noche > 0 ? p.noche : <span className="text-slate-300">—</span>}</td>
                                                                            <td className="py-2 pr-2 text-right font-mono font-semibold">
                                                                                {esSuspension
                                                                                    ? <span className="text-red-600 font-sans font-normal text-xs">Suspender</span>
                                                                                    : `${p.totalDia} mg`}
                                                                            </td>
                                                                            {tieneConversion && (
                                                                                <td className="py-2 pr-2 text-right font-mono text-slate-500">
                                                                                    {esSuspension ? "—" : `${r2(p.totalDia * farmaco.eq10mgDiazepam / 10)} mg`}
                                                                                </td>
                                                                            )}
                                                                            {tieneNotas && (
                                                                                <td className="py-2 pl-2 text-left text-slate-400 italic text-[10px] whitespace-nowrap">
                                                                                    {notaFila ?? ""}
                                                                                </td>
                                                                            )}
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        <p className="text-xs text-slate-400">
                                            Dz = mg equivalente de diazepam. Semanas relativas al inicio de cada fase.{" "}
                                            Fuente: NHS Grampian — Guidance for Prescribing and Withdrawal of Benzodiazepines &amp; Hypnotics (2006).
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Referencia colapsable */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <button onClick={() => setRefAbierta(v => !v)} className="flex w-full items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                        <span className="text-sm font-medium text-slate-700">Guía de escalones Maudsley (equivalente diazepam)</span>
                        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${refAbierta ? "rotate-180" : ""}`} />
                    </button>
                    {refAbierta && (
                        <div className="px-4 pb-4">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-2 pr-4 text-slate-500 font-medium">Dosis actual (eq. diazepam)</th>
                                        <th className="text-right py-2 pr-4 text-slate-500 font-medium">Alto riesgo (5-10%)</th>
                                        <th className="text-right py-2 text-slate-500 font-medium">Bajo riesgo (10-20%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { rango: "≥ 50 mg/día",  lento: "5 mg",    rapido: "10 mg"   },
                                        { rango: "20-50 mg/día", lento: "2 mg",    rapido: "5 mg"    },
                                        { rango: "10-20 mg/día", lento: "1 mg",    rapido: "2 mg"    },
                                        { rango: "5-10 mg/día",  lento: "0.5 mg",  rapido: "1 mg"    },
                                        { rango: "2.5-5 mg/día", lento: "0.25 mg", rapido: "0.5 mg"  },
                                        { rango: "< 2.5 mg/día", lento: "0.1 mg",  rapido: "0.25 mg" },
                                    ].map(row => (
                                        <tr key={row.rango} className="border-b border-slate-100">
                                            <td className="py-2 pr-4 text-slate-700">{row.rango}</td>
                                            <td className="py-2 pr-4 text-right font-mono text-slate-600">{row.lento}</td>
                                            <td className="py-2 text-right font-mono text-slate-600">{row.rapido}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p className="text-xs text-slate-400 mt-2">Fuente: Maudsley Deprescribing Guidelines (Taylor et al., 2024).</p>
                        </div>
                    )}
                </div>

                {/* Documentos descargables */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Download className="w-4 h-4 text-slate-500" />
                        <h3 className="text-sm font-medium text-slate-700">Documentos para el paciente</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                            {
                                label: "Algoritmo de reducción",
                                sublabel: "Guía general NHS Grampian",
                                href: "/pdfs/bzd/bzd-algoritmo-reduccion.pdf",
                                destacado: false,
                            },
                            {
                                label: "Plan desde 30 mg",
                                sublabel: "22 semanas mínimo",
                                href: "/pdfs/bzd/bzd-plan-reduccion-30mg.pdf",
                                destacado: eqInicial !== null && eqInicial <= 30,
                            },
                            {
                                label: "Plan desde 80 mg",
                                sublabel: "20 semanas → continúa con 30 mg",
                                href: "/pdfs/bzd/bzd-plan-reduccion-80mg.pdf",
                                destacado: eqInicial !== null && eqInicial > 30 && eqInicial <= 80,
                            },
                            {
                                label: "Plan desde 200 mg",
                                sublabel: "16 semanas → continúa con 80 mg",
                                href: "/pdfs/bzd/bzd-plan-reduccion-200mg.pdf",
                                destacado: eqInicial !== null && eqInicial > 80,
                            },
                        ].map(doc => (
                            <a
                                key={doc.href}
                                href={doc.href}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-slate-50 ${
                                    doc.destacado
                                        ? "border-slate-800 bg-slate-800 text-white hover:bg-slate-700"
                                        : "border-slate-200 text-slate-700"
                                }`}
                            >
                                <div>
                                    <p className={`text-xs font-medium ${doc.destacado ? "text-white" : "text-slate-800"}`}>{doc.label}</p>
                                    <p className={`text-[10px] ${doc.destacado ? "text-slate-300" : "text-slate-400"}`}>{doc.sublabel}</p>
                                </div>
                                <Download className={`w-3.5 h-3.5 shrink-0 ${doc.destacado ? "text-slate-300" : "text-slate-400"}`} />
                            </a>
                        ))}
                    </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-slate-600">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                        Las dosis se ajustan a presentaciones reales y nunca se redondean hacia arriba. Algunos pasos pueden superar el porcentaje objetivo por limitaciones de las presentaciones disponibles. Fuente: Maudsley Deprescribing Guidelines (Taylor et al., 2024).
                    </span>
                </div>

            </div>
        </div>
    );
}

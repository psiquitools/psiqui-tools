"use client";

import { useState } from "react";
import Link from "next/link";
import { Syringe, ArrowLeft, AlertCircle, ChevronDown } from "lucide-react";

type Familia = "paliperidona" | "aripiprazol" | "olanzapina" | "primera-gen";

type LAI = {
    id: string;
    nombre: string;
    marca: string;
    familia: Familia;
    principioActivo: string;
    intervalo: string;
    via: string;
    dosis: number[];
    inicio: string[];
    inicioAlternativo?: { titulo: string; pasos: string[] };
    solapamientoOral: string | null;
    eqOral: { referencia: string; lai: string }[];
    alertas: string[];
};

const FAMILIA_LABEL: Record<Familia, string> = {
    paliperidona: "Paliperidona / Risperidona",
    aripiprazol: "Aripiprazol",
    olanzapina: "Olanzapina",
    "primera-gen": "1ª generación",
};

const FAMILIA_COLOR: Record<Familia, string> = {
    paliperidona: "bg-blue-50 text-blue-700 border-blue-200",
    aripiprazol: "bg-purple-50 text-purple-700 border-purple-200",
    olanzapina: "bg-amber-50 text-amber-700 border-amber-200",
    "primera-gen": "bg-slate-100 text-slate-600 border-slate-200",
};

const LAIs: LAI[] = [
    {
        id: "consta",
        nombre: "Risperdal Consta®",
        marca: "Risperdal Consta® (Janssen)",
        familia: "paliperidona",
        principioActivo: "Risperidona",
        intervalo: "Cada 2 semanas",
        via: "IM deltoides o glúteo profundo",
        dosis: [12.5, 25, 37.5, 50],
        inicio: [
            "Dosis inicial habitual: 25 mg IM (ajustar según dosis oral previa).",
            "Mantener risperidona oral durante 21 días tras la primera inyección (inicio de acción retardado).",
            "Evaluar respuesta y ajustar dosis a partir de la 4.ª semana.",
        ],
        solapamientoOral: "21 días con risperidona oral",
        eqOral: [
            { referencia: "Risperidona 3 mg/día", lai: "25 mg / 2 semanas" },
            { referencia: "Risperidona 4 mg/día", lai: "37.5 mg / 2 semanas" },
            { referencia: "Risperidona 6 mg/día", lai: "50 mg / 2 semanas" },
        ],
        alertas: [
            "Conservar en nevera (2-8 °C); puede mantenerse a temperatura ambiente máx. 7 días.",
            "Inicio de acción retardado 3-4 semanas: no omitir el solapamiento oral.",
        ],
    },
    {
        id: "xeplion",
        nombre: "Xeplion® 1M",
        marca: "Xeplion® (Janssen)",
        familia: "paliperidona",
        principioActivo: "Paliperidona palmitato",
        intervalo: "Cada 4 semanas (mensual)",
        via: "IM deltoides (1.ª y 2.ª dosis) · luego deltoides o glúteo",
        dosis: [25, 50, 75, 100, 150],
        inicio: [
            "Día 1: 150 mg IM deltoides.",
            "Día 8 (±4 días): 100 mg IM deltoides.",
            "A partir del día 36 (±7 días): dosis de mantenimiento mensual, deltoides o glúteo.",
            "Sin solapamiento oral necesario si se cumple el protocolo de carga.",
        ],
        solapamientoOral: null,
        eqOral: [
            { referencia: "Risperidona 3 mg/día", lai: "50 mg / mes" },
            { referencia: "Risperidona 4 mg/día · Paliperidona 6 mg/día", lai: "75 mg / mes" },
            { referencia: "Paliperidona 6 mg/día", lai: "100 mg / mes" },
            { referencia: "Paliperidona 9 mg/día", lai: "150 mg / mes" },
        ],
        alertas: [
            "Las dos primeras inyecciones deben ser en deltoides para asegurar absorción rápida.",
            "Ventana de administración mensual: ±7 días respecto a la fecha prevista.",
        ],
    },
    {
        id: "trevicta",
        nombre: "Trevicta® 3M",
        marca: "Trevicta® (Janssen)",
        familia: "paliperidona",
        principioActivo: "Paliperidona palmitato",
        intervalo: "Cada 3 meses (trimestral)",
        via: "IM deltoides o glúteo",
        dosis: [175, 263, 350, 525],
        inicio: [
            "Exclusivo para pacientes estabilizados con Xeplion durante ≥ 4 meses.",
            "Administrar cuando corresponda la próxima dosis de Xeplion.",
            "Sin dosis de carga adicional.",
            "Xeplion 50 mg → Trevicta 175 mg · 75 mg → 263 mg · 100 mg → 350 mg · 150 mg → 525 mg.",
        ],
        solapamientoOral: null,
        eqOral: [],
        alertas: [
            "No administrar en pacientes no previamente estabilizados con Xeplion.",
            "Ventana de administración: ±2 semanas respecto a la fecha prevista.",
        ],
    },
    {
        id: "byannli",
        nombre: "Byannli® 6M",
        marca: "Byannli® (Janssen)",
        familia: "paliperidona",
        principioActivo: "Paliperidona palmitato",
        intervalo: "Cada 6 meses (semestral)",
        via: "SC abdominal — dos jeringas simultáneas",
        dosis: [700, 1050],
        inicio: [
            "Exclusivo para pacientes estabilizados con Trevicta o Xeplion.",
            "Desde Trevicta 350 mg → Byannli 700 mg. Desde Trevicta 525 mg → Byannli 1050 mg.",
            "Administrar cuando corresponda la próxima dosis de Trevicta.",
            "Se administran dos jeringas SC simultáneamente en el mismo cuadrante abdominal.",
        ],
        solapamientoOral: null,
        eqOral: [],
        alertas: [
            "Vía subcutánea abdominal, NO intramuscular.",
            "Rotar entre cuadrantes abdominales en visitas sucesivas.",
            "Ventana de administración: ±2 semanas respecto a la fecha prevista.",
        ],
    },
    {
        id: "maintena-1m",
        nombre: "Abilify Maintena® 1M",
        marca: "Abilify Maintena® (Otsuka/Lundbeck)",
        familia: "aripiprazol",
        principioActivo: "Aripiprazol",
        intervalo: "Cada 4 semanas (mensual)",
        via: "IM deltoides o glúteo",
        dosis: [300, 400],
        inicio: [
            "Día 1: 400 mg IM deltoides o glúteo.",
            "Días 1-14: mantener aripiprazol oral 10-20 mg/día.",
            "Reducir a 300 mg en metabolizadores lentos de CYP2D6 o con inhibidores potentes de CYP3A4/2D6.",
        ],
        inicioAlternativo: {
            titulo: "Opción 2 — Doble inyección (sin solapamiento oral)",
            pasos: [
                "Día 1: dos inyecciones separadas de 400 mg IM en dos sitios distintos (total 800 mg).",
                "Día 1 (misma visita): aripiprazol oral 20 mg dosis única.",
                "A partir del día 29: inyección mensual de mantenimiento (400 mg).",
                "No requiere solapamiento oral adicional.",
            ],
        },
        solapamientoOral: "14 días con aripiprazol oral (solo Opción 1)",
        eqOral: [
            { referencia: "Aripiprazol 10-15 mg/día", lai: "300 mg / mes" },
            { referencia: "Aripiprazol 15-30 mg/día", lai: "400 mg / mes" },
        ],
        alertas: [
            "No iniciar en pacientes que no hayan tolerado aripiprazol oral.",
            "Interacciones CYP2D6 y CYP3A4 relevantes: ajustar dosis según ficha técnica.",
        ],
    },
    {
        id: "asimtufii",
        nombre: "Aripiprazol 2M (Asimtufii®)",
        marca: "Abilify Asimtufii® (Otsuka) — verificar disponibilidad en España",
        familia: "aripiprazol",
        principioActivo: "Aripiprazol",
        intervalo: "Cada 2 meses (bimensual)",
        via: "IM glúteo (único sitio aprobado)",
        dosis: [960],
        inicio: [
            "Exclusivo para pacientes ya estabilizados con Abilify Maintena 400 mg/mes.",
            "Administrar cuando corresponda la próxima dosis mensual.",
            "Sin solapamiento oral adicional si ya estabilizado.",
        ],
        solapamientoOral: null,
        eqOral: [
            { referencia: "Aripiprazol Maintena 400 mg/mes (estabilizado)", lai: "960 mg / 2 meses" },
        ],
        alertas: [
            "Solo glúteo profundo; no deltoides.",
            "Verificar nombre comercial y disponibilidad en España (puede aparecer como Abilify Asimtufii® o equivalente).",
        ],
    },
    {
        id: "okedi",
        nombre: "Okedi®",
        marca: "Okedi® (H. Lundbeck)",
        familia: "aripiprazol",
        principioActivo: "Aripiprazol",
        intervalo: "Cada 4 semanas (mensual)",
        via: "IM glúteo (único sitio aprobado)",
        dosis: [300, 400],
        inicio: [
            "Día 1: 400 mg IM glúteo.",
            "Días 1-14: mantener aripiprazol oral 15 mg/día.",
            "Reducir a 300 mg según interacciones o tolerabilidad (mismos criterios que Maintena).",
        ],
        inicioAlternativo: {
            titulo: "Opción 2 — Doble inyección (sin solapamiento oral)",
            pasos: [
                "Día 1: dos inyecciones separadas de 400 mg IM glúteo en cuadrantes distintos (total 800 mg).",
                "Día 1 (misma visita): aripiprazol oral 20 mg dosis única.",
                "A partir del día 29: inyección mensual de mantenimiento (400 mg).",
                "Verificar protocolo exacto en ficha técnica de Okedi, puede diferir de Abilify Maintena.",
            ],
        },
        solapamientoOral: "14 días con aripiprazol oral (solo Opción 1)",
        eqOral: [
            { referencia: "Aripiprazol 10-15 mg/día", lai: "300 mg / mes" },
            { referencia: "Aripiprazol 15-30 mg/día", lai: "400 mg / mes" },
        ],
        alertas: [
            "A diferencia de Abilify Maintena, Okedi solo se aprobó para administración en glúteo (no deltoides).",
            "Formulación diferente a Abilify Maintena; no son intercambiables sin reevaluación clínica.",
        ],
    },
    {
        id: "zypadhera",
        nombre: "ZypAdhera®",
        marca: "ZypAdhera® (Eli Lilly)",
        familia: "olanzapina",
        principioActivo: "Olanzapina pamoato",
        intervalo: "Cada 2 semanas (150-210 mg) o cada 4 semanas (300-405 mg)",
        via: "IM glúteo profundo — solo glúteo",
        dosis: [150, 210, 300, 405],
        inicio: [
            "Sin protocolo de carga especial; iniciar con la dosis equivalente a la oral.",
            "Olanzapina 10 mg/día → 210 mg/2 sem o 405 mg/4 sem.",
            "Olanzapina 15 mg/día → 300 mg/4 sem.",
            "Observación obligatoria de 3 horas post-inyección en centro autorizado (riesgo de PDSS).",
        ],
        solapamientoOral: null,
        eqOral: [
            { referencia: "Olanzapina 10 mg/día", lai: "210 mg / 2 sem o 405 mg / 4 sem" },
            { referencia: "Olanzapina 15 mg/día", lai: "300 mg / 4 sem" },
            { referencia: "Olanzapina 20 mg/día", lai: "300 mg / 4 sem (revisar)" },
        ],
        alertas: [
            "PDSS (Post-injection Delirium/Sedation Syndrome): riesgo ~0.07% por inyección. Observación 3 h obligatoria.",
            "Solo glúteo profundo. No administrar en deltoides.",
            "Administración restringida a centros con protocolo de observación post-inyección.",
        ],
    },
    {
        id: "haloperidol-dec",
        nombre: "Haloperidol decanoato",
        marca: "Haloperidol decanoato (genérico)",
        familia: "primera-gen",
        principioActivo: "Haloperidol decanoato",
        intervalo: "Cada 4 semanas",
        via: "IM glúteo profundo",
        dosis: [50, 100, 150, 200],
        inicio: [
            "Dosis orientativa: 10-15× la dosis oral diaria de haloperidol (en mg mensual).",
            "Iniciar con dosis baja (50 mg) y ajustar gradualmente.",
            "Solapamiento oral 2-4 semanas si es la primera administración.",
            "Ejemplo: haloperidol oral 5 mg/día → inicio con 50-75 mg/mes depot.",
        ],
        solapamientoOral: "2-4 semanas si primera dosis",
        eqOral: [
            { referencia: "Haloperidol 3 mg/día", lai: "50 mg / 4 semanas" },
            { referencia: "Haloperidol 5 mg/día", lai: "100 mg / 4 semanas" },
            { referencia: "Haloperidol 10 mg/día", lai: "150-200 mg / 4 semanas" },
        ],
        alertas: [
            "Equivalencias orientativas; ajustar según respuesta y tolerabilidad.",
            "Confirmar ausencia de alergia al aceite de sésamo (excipiente del vehículo).",
        ],
    },
    {
        id: "clopixol-depot",
        nombre: "Clopixol Depot®",
        marca: "Clopixol Depot® (Lundbeck)",
        familia: "primera-gen",
        principioActivo: "Zuclopentixol decanoato",
        intervalo: "Cada 2-4 semanas según respuesta",
        via: "IM glúteo profundo",
        dosis: [100, 200, 400],
        inicio: [
            "Dosis inicial orientativa: 100-200 mg IM glúteo.",
            "Evaluar respuesta a las 2-4 semanas y ajustar dosis e intervalo.",
            "Dosis habitual de mantenimiento: 200-400 mg cada 2-4 semanas.",
        ],
        solapamientoOral: "Puede ser necesario inicialmente",
        eqOral: [
            { referencia: "Zuclopentixol oral 20 mg/día", lai: "200 mg / 4 semanas (aprox.)" },
            { referencia: "Zuclopentixol oral 30 mg/día", lai: "300 mg / 4 semanas (aprox.)" },
        ],
        alertas: [
            "No confundir con Clopixol Acuphase® (acetato, acción ultracorta para agitación aguda).",
            "Concentración: 200 mg/mL. Volumen máximo por punto de inyección: 2-3 mL.",
        ],
    },
];

const FAMILIAS: { id: Familia | "todas"; label: string }[] = [
    { id: "todas", label: "Todas" },
    { id: "paliperidona", label: "Paliperidona / Risperidona" },
    { id: "aripiprazol", label: "Aripiprazol" },
    { id: "olanzapina", label: "Olanzapina" },
    { id: "primera-gen", label: "1ª generación" },
];

const EQ_PALIPERIDONA = [
    { oral: "Ris. 3 mg/d", consta: "25 mg", xeplion: "50 mg", trevicta: "175 mg", byannli: "—" },
    { oral: "Ris. 4 mg/d · Pal. 6 mg/d", consta: "37.5 mg", xeplion: "75 mg", trevicta: "263 mg", byannli: "—" },
    { oral: "Pal. 6-9 mg/d", consta: "50 mg", xeplion: "100 mg", trevicta: "350 mg", byannli: "700 mg" },
    { oral: "Pal. 9-12 mg/d", consta: "—", xeplion: "150 mg", trevicta: "525 mg", byannli: "1050 mg" },
];

export default function DepotLAIPage() {
    const [familiaActiva, setFamiliaActiva] = useState<Familia | "todas">("todas");
    const [seleccionado, setSeleccionado] = useState("xeplion");
    const [tablaAbierta, setTablaAbierta] = useState(false);

    const visibles = familiaActiva === "todas" ? LAIs : LAIs.filter(l => l.familia === familiaActiva);
    const lai = LAIs.find(l => l.id === seleccionado) ?? LAIs[0];

    const handleFamiliaChange = (f: Familia | "todas") => {
        setFamiliaActiva(f);
        const first = LAIs.find(l => f === "todas" || l.familia === f);
        if (first) setSeleccionado(first.id);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6">
            <div className="max-w-3xl mx-auto space-y-6">

                <Link href="/tools/calculadoras-clinicas" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Herramientas Farmacológicas
                </Link>

                <div className="flex items-center gap-3">
                    <Syringe className="w-7 h-7 text-slate-700" />
                    <div>
                        <h1 className="text-2xl font-semibold">Antipsicóticos de depósito (LAI)</h1>
                        <p className="text-sm text-slate-600">Protocolos de inicio, equivalencias y vías de administración</p>
                    </div>
                </div>

                {/* Filtro por familia */}
                <div className="flex flex-wrap gap-2">
                    {FAMILIAS.map(f => (
                        <button
                            key={f.id}
                            onClick={() => handleFamiliaChange(f.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                familiaActiva === f.id
                                    ? "bg-slate-800 text-white"
                                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900"
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Selector de LAI */}
                <div className="flex flex-wrap gap-2">
                    {visibles.map(l => (
                        <button
                            key={l.id}
                            onClick={() => setSeleccionado(l.id)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                                seleccionado === l.id
                                    ? "bg-slate-800 text-white border-slate-800"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                            }`}
                        >
                            {l.nombre}
                        </button>
                    ))}
                </div>

                {/* Ficha */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">

                    <div className="p-4 border-b border-slate-100">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800">{lai.nombre}</h2>
                                <p className="text-xs text-slate-500 mt-0.5">{lai.marca}</p>
                            </div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded border flex-shrink-0 ${FAMILIA_COLOR[lai.familia]}`}>
                                {FAMILIA_LABEL[lai.familia]}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 space-y-5">

                        {/* Info rápida */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 rounded-lg p-3">
                                <p className="text-xs text-slate-500 mb-1">Intervalo</p>
                                <p className="text-sm font-semibold text-slate-800">{lai.intervalo}</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-3">
                                <p className="text-xs text-slate-500 mb-1">Vía</p>
                                <p className="text-sm font-semibold text-slate-800">{lai.via}</p>
                            </div>
                        </div>

                        {/* Dosis */}
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Dosis disponibles</p>
                            <div className="flex flex-wrap gap-2">
                                {lai.dosis.map(d => (
                                    <span key={d} className="text-sm font-mono font-medium px-3 py-1 bg-slate-100 rounded-lg text-slate-700">
                                        {d} mg
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Solapamiento */}
                        {lai.solapamientoOral && (
                            <div className="flex items-center gap-2 text-sm bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                                <span className="text-amber-800"><strong>Solapamiento oral requerido:</strong> {lai.solapamientoOral}</span>
                            </div>
                        )}

                        {/* Protocolo de inicio */}
                        <div className="space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Protocolo de inicio / switch</p>

                            {lai.inicioAlternativo && (
                                <p className="text-xs font-medium text-slate-500">Opción 1 — Con solapamiento oral</p>
                            )}
                            <ol className="space-y-2">
                                {lai.inicio.map((paso, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-slate-700">
                                        <span className="w-5 h-5 bg-slate-800 text-white rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5">
                                            {i + 1}
                                        </span>
                                        {paso}
                                    </li>
                                ))}
                            </ol>

                            {lai.inicioAlternativo && (
                                <div className="border-t border-slate-100 pt-4">
                                    <p className="text-xs font-medium text-slate-500 mb-2">{lai.inicioAlternativo.titulo}</p>
                                    <ol className="space-y-2">
                                        {lai.inicioAlternativo.pasos.map((paso, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-slate-700">
                                                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5">
                                                    {i + 1}
                                                </span>
                                                {paso}
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}
                        </div>

                        {/* Equivalencia oral */}
                        {lai.eqOral.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Equivalencia orientativa a oral</p>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="text-left py-1.5 pr-4 text-xs text-slate-400 font-medium">Dosis oral</th>
                                            <th className="text-left py-1.5 text-xs text-slate-400 font-medium">LAI equivalente</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lai.eqOral.map((eq, i) => (
                                            <tr key={i} className="border-b border-slate-50">
                                                <td className="py-2 pr-4 text-slate-600">{eq.referencia}</td>
                                                <td className="py-2 font-semibold text-slate-800">{eq.lai}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Alertas */}
                        {lai.alertas.length > 0 && (
                            <div className="space-y-2">
                                {lai.alertas.map((alerta, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                        <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
                                        {alerta}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabla cadena paliperidona */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <button
                        onClick={() => setTablaAbierta(v => !v)}
                        className="flex w-full items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                    >
                        <span className="text-sm font-medium text-slate-700">
                            Cadena de equivalencias: Consta → Xeplion → Trevicta → Byannli
                        </span>
                        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${tablaAbierta ? "rotate-180" : ""}`} />
                    </button>
                    {tablaAbierta && (
                        <div className="px-4 pb-4 overflow-x-auto">
                            <table className="w-full text-xs min-w-[520px]">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-2 pr-3 text-slate-500 font-medium">Oral (risperidona / paliperidona)</th>
                                        <th className="text-right py-2 pr-3 text-slate-500 font-medium">Consta (2 sem)</th>
                                        <th className="text-right py-2 pr-3 text-slate-500 font-medium">Xeplion (1M)</th>
                                        <th className="text-right py-2 pr-3 text-slate-500 font-medium">Trevicta (3M)</th>
                                        <th className="text-right py-2 text-slate-500 font-medium">Byannli (6M)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {EQ_PALIPERIDONA.map((row, i) => (
                                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-2 pr-3 text-slate-600">{row.oral}</td>
                                            <td className="py-2 pr-3 text-right font-mono font-medium text-slate-700">{row.consta}</td>
                                            <td className="py-2 pr-3 text-right font-mono font-medium text-slate-700">{row.xeplion}</td>
                                            <td className="py-2 pr-3 text-right font-mono font-medium text-slate-700">{row.trevicta}</td>
                                            <td className="py-2 text-right font-mono font-medium text-slate-700">{row.byannli}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p className="text-xs text-slate-400 mt-2">
                                Ris = risperidona · Pal = paliperidona · Byannli solo disponible desde Trevicta 350 mg o 525 mg.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex items-start gap-2 text-xs text-slate-600">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                        Equivalencias y protocolos orientativos según fichas técnicas y Maudsley Prescribing Guidelines (2024). Verificar siempre con la ficha técnica vigente. No sustituye el criterio médico profesional.
                    </span>
                </div>

            </div>
        </div>
    );
}

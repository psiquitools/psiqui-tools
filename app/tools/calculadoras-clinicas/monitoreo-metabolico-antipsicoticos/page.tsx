"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, CheckCheck } from "lucide-react";

/* ===================== DATOS ===================== */

type VisitaKey = "basal" | "semanas4" | "semanas8" | "semanas12" | "trimestral" | "anual";

interface Factor {
  id: string;
  nombre: string;
  nota?: string;
  basal: boolean;
  semanas4: boolean | "cond";
  semanas8: boolean;
  semanas12: boolean;
  trimestral: boolean;
  anual: boolean;
}

const FACTORES: Factor[] = [
  {
    id: "historia",
    nombre: "Historial personal o familiar de DM, HTA o ECV",
    basal: true, semanas4: false, semanas8: false, semanas12: false, trimestral: false, anual: true,
  },
  {
    id: "peso",
    nombre: "Peso / IMC",
    basal: true, semanas4: true, semanas8: true, semanas12: true, trimestral: true, anual: false,
  },
  {
    id: "cintura",
    nombre: "Circunferencia de cintura",
    basal: true, semanas4: false, semanas8: false, semanas12: true, trimestral: false, anual: true,
  },
  {
    id: "ta",
    nombre: "Tensión arterial",
    basal: true, semanas4: false, semanas8: false, semanas12: true, trimestral: true, anual: false,
  },
  {
    id: "glucosa",
    nombre: "Glucosa en ayunas o HbA1c",
    nota: "HbA1c suele ser más práctico que la glucosa en ayunas; cualquiera de los dos es válido.",
    basal: true, semanas4: false, semanas8: false, semanas12: true, trimestral: false, anual: true,
  },
  {
    id: "lipidos",
    nombre: "Perfil lipídico en ayunas",
    nota: "A las 4 semanas: solo si toma olanzapina, quetiapina o clozapina.",
    basal: true, semanas4: "cond", semanas8: false, semanas12: true, trimestral: false, anual: true,
  },
];

const VISITAS: { key: VisitaKey; label: string; grupo: string }[] = [
  { key: "basal",      label: "Basal",       grupo: "Inicio" },
  { key: "semanas4",   label: "4 semanas",   grupo: "Inicio" },
  { key: "semanas8",   label: "8 semanas",   grupo: "Inicio" },
  { key: "semanas12",  label: "12 semanas",  grupo: "Inicio" },
  { key: "trimestral", label: "Trimestral",  grupo: "Largo plazo" },
  { key: "anual",      label: "Anual",       grupo: "Largo plazo" },
];

const COLS: VisitaKey[] = ["basal", "semanas4", "semanas8", "semanas12", "trimestral", "anual"];

/* ===================== COMPONENTE ===================== */

export default function MonitoreoMetabolicoPage() {
  const [altaMetabolico, setAltaMetabolico] = useState(false);
  const [visitaActiva, setVisitaActiva] = useState<VisitaKey | null>(null);
  const [copiado, setCopiado] = useState(false);

  function estaActivo(f: Factor, key: VisitaKey): boolean {
    const val = f[key];
    if (val === "cond") return altaMetabolico;
    return val;
  }

  function esCondicional(f: Factor, key: VisitaKey): boolean {
    return f[key] === "cond" && !altaMetabolico;
  }

  const itemsVisita = visitaActiva ? FACTORES.filter(f => estaActivo(f, visitaActiva)) : [];

  function copiarChecklist() {
    if (!visitaActiva) return;
    const visita = VISITAS.find(v => v.key === visitaActiva)!;
    const lineas = [
      `Monitoreo metabólico — Visita ${visita.label}`,
      "",
      ...itemsVisita.map(f => `☐  ${f.nombre}`),
      "",
      "(Fuente: UpToDate — Monitoring for metabolic side effects of antipsychotic drugs)",
    ];
    navigator.clipboard.writeText(lineas.join("\n"));
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-5">

        <Link
          href="/tools/calculadoras-clinicas"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Herramientas Farmacológicas
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Monitoreo metabólico de antipsicóticos</h1>
          <p className="text-sm text-slate-500 mt-1">
            Referencia base: <span className="font-medium text-slate-700">UpToDate — Monitoring for metabolic side effects of antipsychotic drugs</span>
          </p>
        </div>

        {/* Toggle drug group */}
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-3.5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-800">
              ¿El paciente toma olanzapina, quetiapina o clozapina?
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Activa el control de lípidos a las 4 semanas
            </p>
          </div>
          <button
            onClick={() => setAltaMetabolico(v => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
              altaMetabolico ? "bg-slate-800" : "bg-slate-300"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              altaMetabolico ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
        </div>

        {/* Tabla completa */}
        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
          <table className="min-w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th rowSpan={2} className="px-4 py-3 text-left font-semibold min-w-[220px] border-b border-slate-700">
                  Factor de riesgo
                </th>
                <th rowSpan={2} className="px-3 py-3 text-center font-semibold whitespace-nowrap border-b border-slate-700 min-w-[80px]">
                  Basal
                </th>
                <th colSpan={3} className="px-3 py-2 text-center font-semibold border-b border-slate-700 text-slate-300 text-[11px] uppercase tracking-wide">
                  Monitoreo inicial
                </th>
                <th colSpan={2} className="px-3 py-2 text-center font-semibold border-b border-slate-700 text-slate-300 text-[11px] uppercase tracking-wide">
                  Largo plazo
                </th>
              </tr>
              <tr className="bg-slate-800 text-white">
                <th className="px-3 py-2 text-center font-semibold whitespace-nowrap min-w-[80px]">4 sem.</th>
                <th className="px-3 py-2 text-center font-semibold whitespace-nowrap min-w-[80px]">8 sem.</th>
                <th className="px-3 py-2 text-center font-semibold whitespace-nowrap min-w-[80px]">12 sem.</th>
                <th className="px-3 py-2 text-center font-semibold whitespace-nowrap min-w-[90px]">Trimestral</th>
                <th className="px-3 py-2 text-center font-semibold whitespace-nowrap min-w-[80px]">Anual</th>
              </tr>
            </thead>
            <tbody>
              {FACTORES.map((f, idx) => (
                <tr
                  key={f.id}
                  className={`border-t border-slate-100 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                >
                  <td className="px-4 py-3 font-medium text-slate-800 leading-snug">
                    {f.nombre}
                    {f.nota && (
                      <p className="text-[11px] text-slate-500 font-normal mt-0.5 leading-relaxed">{f.nota}</p>
                    )}
                  </td>
                  {COLS.map(k => {
                    const activo = estaActivo(f, k);
                    const cond = esCondicional(f, k);
                    return (
                      <td key={k} className="px-3 py-3 text-center">
                        {activo && (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-800">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </span>
                        )}
                        {cond && (
                          <span
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold"
                            title="Solo si toma olanzapina, quetiapina o clozapina — activa el toggle arriba"
                          >
                            ¶
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Checklist por visita */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
          <p className="text-sm font-semibold text-slate-800">¿Qué toca en esta visita?</p>

          <div className="flex flex-wrap gap-2">
            {VISITAS.map(v => (
              <button
                key={v.key}
                onClick={() => setVisitaActiva(prev => prev === v.key ? null : v.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  visitaActiva === v.key
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {visitaActiva && (
            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  {VISITAS.find(v => v.key === visitaActiva)?.label} —{" "}
                  {itemsVisita.length === 0
                    ? "sin controles programados"
                    : `${itemsVisita.length} controles`}
                </p>
                {itemsVisita.length > 0 && (
                  <button
                    onClick={copiarChecklist}
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg border transition-colors ${
                      copiado
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {copiado ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiado ? "Copiado" : "Copiar"}
                  </button>
                )}
              </div>

              {itemsVisita.length === 0 ? (
                <p className="text-sm text-slate-500">No hay controles programados para esta visita.</p>
              ) : (
                <div className="space-y-2">
                  {itemsVisita.map(f => (
                    <div key={f.id} className="flex items-start gap-3 py-1">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-slate-500" />
                      </span>
                      <span className="text-sm text-slate-800">{f.nombre}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 text-center pb-4">
          Adaptado de: UpToDate · ADA/APA/AACE Consensus 2004 · Herramienta orientativa, no sustituye el criterio clínico
        </p>

      </div>
    </div>
  );
}

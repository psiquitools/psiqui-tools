"use client";

import { useState, Fragment } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/* ===================== TIPOS Y DATOS ===================== */

type Nivel = string;

interface Farmaco {
  nombre: string;
  grupo: string;
  peso: Nivel;
  glucosa: Nivel;
  hiperlipidemia: Nivel;
  acatisia: Nivel;
  parkinsonismo: Nivel;
  distonia: Nivel;
  discTardia: Nivel;
  prolactina: Nivel;
  sedacion: Nivel;
  anticolinergico: Nivel;
  hipotension: Nivel;
  qtc: Nivel;
  nota?: string;
}

const GRUPOS = [
  "Todos",
  "Segunda generación",
  "Otros",
  "Primera generación",
];

const FARMACOS: Farmaco[] = [
  // ── Segunda generación ──
  { nombre: "Aripiprazol",         grupo: "Segunda generación", peso: "+",   glucosa: "+",   hiperlipidemia: "+",   acatisia: "++",  parkinsonismo: "+",   distonia: "+",   discTardia: "+",  prolactina: "0",   sedacion: "+",   anticolinergico: "+",   hipotension: "+",    qtc: "*" },
  { nombre: "Asenapina",           grupo: "Segunda generación", peso: "++",  glucosa: "++",  hiperlipidemia: "++",  acatisia: "++",  parkinsonismo: "+",   distonia: "++",  discTardia: "++", prolactina: "++",  sedacion: "++",  anticolinergico: "+",   hipotension: "+/++", qtc: "+" },
  { nombre: "Brexpiprazol",        grupo: "Segunda generación", peso: "+",   glucosa: "+",   hiperlipidemia: "++",  acatisia: "++",  parkinsonismo: "+",   distonia: "+",   discTardia: "+",  prolactina: "0",   sedacion: "++",  anticolinergico: "+",   hipotension: "+",    qtc: "*",  nota: "Datos basados en experiencia limitada." },
  { nombre: "Cariprazina",         grupo: "Segunda generación", peso: "++",  glucosa: "+",   hiperlipidemia: "+",   acatisia: "++",  parkinsonismo: "+",   distonia: "+",   discTardia: "+",  prolactina: "+",   sedacion: "++",  anticolinergico: "++",  hipotension: "+",    qtc: "*",  nota: "Datos basados en experiencia limitada." },
  { nombre: "Clozapina",           grupo: "Segunda generación", peso: "+++", glucosa: "+++", hiperlipidemia: "+++", acatisia: "+",   parkinsonismo: "+",   distonia: "+",   discTardia: "+",  prolactina: "+",   sedacion: "+++", anticolinergico: "+++", hipotension: "+++",  qtc: "++", nota: "Causa granulocitopenia o agranulocitosis en ~1% de los pacientes; requiere monitoreo regular del hemograma (protocolo REMS). Riesgo aumentado de miocarditis y eventos tromboembólicos venosos." },
  { nombre: "Iloperidona",         grupo: "Segunda generación", peso: "++",  glucosa: "++",  hiperlipidemia: "+",   acatisia: "+",   parkinsonismo: "+",   distonia: "+",   discTardia: "+",  prolactina: "++",  sedacion: "++",  anticolinergico: "+",   hipotension: "+++",  qtc: "++", nota: "Riesgo QTc relativamente bajo a dosis habituales; puede ser moderado a dosis altas o con fármacos interactuantes — se recomienda monitoreo ECG en pacientes de alto riesgo." },
  { nombre: "Lumateperona",        grupo: "Segunda generación", peso: "+",   glucosa: "+",   hiperlipidemia: "+",   acatisia: "+",   parkinsonismo: "+",   distonia: "+",   discTardia: "+",  prolactina: "0",   sedacion: "+",   anticolinergico: "+",   hipotension: "+",    qtc: "*",  nota: "Datos basados en experiencia limitada." },
  { nombre: "Lurasidona",          grupo: "Segunda generación", peso: "+",   glucosa: "++",  hiperlipidemia: "++",  acatisia: "++",  parkinsonismo: "++",  distonia: "++",  discTardia: "++", prolactina: "++",  sedacion: "++",  anticolinergico: "+",   hipotension: "+",    qtc: "*" },
  { nombre: "Olanzapina",          grupo: "Segunda generación", peso: "+++", glucosa: "+++", hiperlipidemia: "+++", acatisia: "++",  parkinsonismo: "++",  distonia: "+",   discTardia: "+",  prolactina: "++",  sedacion: "+++", anticolinergico: "++",  hipotension: "++",   qtc: "++" },
  { nombre: "Paliperidona",        grupo: "Segunda generación", peso: "++",  glucosa: "+",   hiperlipidemia: "++",  acatisia: "++",  parkinsonismo: "++",  distonia: "++",  discTardia: "++", prolactina: "+++", sedacion: "++",  anticolinergico: "+",   hipotension: "++",   qtc: "+" },
  { nombre: "Pimavanserin",        grupo: "Segunda generación", peso: "–",   glucosa: "+",   hiperlipidemia: "+",   acatisia: "+",   parkinsonismo: "+",   distonia: "+",   discTardia: "+",  prolactina: "+",   sedacion: "+",   anticolinergico: "+",   hipotension: "++",   qtc: "+",  nota: "Datos basados en experiencia limitada. El símbolo — en aumento de peso indica ausencia de efecto metabólico significativo." },
  { nombre: "Quetiapina",          grupo: "Segunda generación", peso: "++",  glucosa: "++",  hiperlipidemia: "+++", acatisia: "+",   parkinsonismo: "+",   distonia: "+",   discTardia: "+",  prolactina: "+",   sedacion: "+++", anticolinergico: "++",  hipotension: "++",   qtc: "+++" },
  { nombre: "Risperidona",         grupo: "Segunda generación", peso: "++",  glucosa: "++",  hiperlipidemia: "+",   acatisia: "+++", parkinsonismo: "+++", distonia: "++",  discTardia: "++", prolactina: "+++", sedacion: "++",  anticolinergico: "+",   hipotension: "++",   qtc: "++" },
  { nombre: "Ziprasidona",         grupo: "Segunda generación", peso: "+",   glucosa: "+",   hiperlipidemia: "+",   acatisia: "++",  parkinsonismo: "+",   distonia: "+",   discTardia: "+",  prolactina: "++",  sedacion: "++",  anticolinergico: "+",   hipotension: "++",   qtc: "+++" },

  // ── Otros ──
  { nombre: "Xanomeline-trospium", grupo: "Otros",              peso: "0",   glucosa: "0",   hiperlipidemia: "0",   acatisia: "0",   parkinsonismo: "0",   distonia: "0",   discTardia: "0",  prolactina: "0",   sedacion: "+",   anticolinergico: "+++", hipotension: "+",    qtc: "0",  nota: "Datos basados en experiencia limitada. Mecanismo único: agonismo M1/M4 combinado con trospium periférico para atenuar los efectos adversos colinérgicos sistémicos." },

  // ── Primera generación ──
  { nombre: "Clorpromazina",       grupo: "Primera generación", peso: "++",  glucosa: "++",  hiperlipidemia: "+",   acatisia: "++",  parkinsonismo: "++",  distonia: "++",  discTardia: "+++", prolactina: "+",   sedacion: "+++", anticolinergico: "+++", hipotension: "+++", qtc: "+++" },
  { nombre: "Flufenazina",         grupo: "Primera generación", peso: "++",  glucosa: "+",   hiperlipidemia: "+",   acatisia: "+++", parkinsonismo: "+++", distonia: "+++", discTardia: "+++", prolactina: "+++", sedacion: "+",   anticolinergico: "+",   hipotension: "+",   qtc: "+" },
  { nombre: "Haloperidol",         grupo: "Primera generación", peso: "++",  glucosa: "+",   hiperlipidemia: "+",   acatisia: "+++", parkinsonismo: "+++", distonia: "+++", discTardia: "+++", prolactina: "+++", sedacion: "+",   anticolinergico: "+",   hipotension: "+",   qtc: "++", nota: "Prolongación QTc: oral ++ / intravenoso +++. Se recomienda monitoreo ECG con la formulación IV." },
  { nombre: "Loxapina",            grupo: "Primera generación", peso: "+",   glucosa: "+",   hiperlipidemia: "+",   acatisia: "++",  parkinsonismo: "++",  distonia: "++",  discTardia: "++",  prolactina: "++",  sedacion: "++",  anticolinergico: "++",  hipotension: "++",  qtc: "*" },
  { nombre: "Molindona",           grupo: "Primera generación", peso: "+",   glucosa: "+",   hiperlipidemia: "+",   acatisia: "++",  parkinsonismo: "++",  distonia: "++",  discTardia: "++",  prolactina: "++",  sedacion: "++",  anticolinergico: "+",   hipotension: "+",   qtc: "*" },
  { nombre: "Perfenazina",         grupo: "Primera generación", peso: "++",  glucosa: "+",   hiperlipidemia: "+",   acatisia: "++",  parkinsonismo: "++",  distonia: "++",  discTardia: "++",  prolactina: "++",  sedacion: "++",  anticolinergico: "++",  hipotension: "++",  qtc: "*" },
  { nombre: "Pimozida",            grupo: "Primera generación", peso: "+",   glucosa: "+",   hiperlipidemia: "+",   acatisia: "+++", parkinsonismo: "+++", distonia: "++",  discTardia: "+++", prolactina: "+++", sedacion: "+",   anticolinergico: "+",   hipotension: "+",   qtc: "++" },
  { nombre: "Tioridazina",         grupo: "Primera generación", peso: "++",  glucosa: "+",   hiperlipidemia: "+",   acatisia: "+",   parkinsonismo: "+",   distonia: "+",   discTardia: "+",   prolactina: "++",  sedacion: "+++", anticolinergico: "+++", hipotension: "+++", qtc: "+++", nota: "Asociada a retinitis pigmentosa dosis-dependiente — se recomienda monitoreo oftalmológico periódico." },
  { nombre: "Tiotixeno",           grupo: "Primera generación", peso: "+",   glucosa: "+",   hiperlipidemia: "+",   acatisia: "+++", parkinsonismo: "+++", distonia: "+++", discTardia: "+++", prolactina: "+++", sedacion: "+",   anticolinergico: "+",   hipotension: "+",   qtc: "*" },
  { nombre: "Trifluoperazina",     grupo: "Primera generación", peso: "++",  glucosa: "+",   hiperlipidemia: "+",   acatisia: "++",  parkinsonismo: "++",  distonia: "++",  discTardia: "++",  prolactina: "++",  sedacion: "+",   anticolinergico: "++",  hipotension: "+",   qtc: "*" },
];

const COLUMNAS = [
  { key: "peso",            label: "Aumento de peso" },
  { key: "glucosa",         label: "Glucosa" },
  { key: "hiperlipidemia",  label: "Hiperlipidemia" },
  { key: "acatisia",        label: "Acatisia" },
  { key: "parkinsonismo",   label: "Parkinsonismo" },
  { key: "distonia",        label: "Distonía" },
  { key: "discTardia",      label: "Discinesia tardía" },
  { key: "prolactina",      label: "Elevación de prolactina" },
  { key: "sedacion",        label: "Sedación" },
  { key: "anticolinergico", label: "Anticolinérgico" },
  { key: "hipotension",     label: "Hipotensión ortostática" },
  { key: "qtc",             label: "Prolongación QTc" },
] as const;

const SINT_ANTICOLINERGICOS = [
  "Sequedad de boca",
  "Estreñimiento",
  "Retención urinaria",
  "Visión borrosa",
  "Taquicardia",
  "Confusión / deterioro cognitivo",
  "Midriasis",
  "Piel seca",
  "Hipohidrosis",
];

/* ===================== HELPERS ===================== */

function nivelColor(val: string): string {
  if (val === "*") return "bg-slate-200 text-slate-600";
  if (val === "0" || val === "–") return "bg-slate-100 text-slate-500";
  const grupos = val.match(/\++/g);
  if (!grupos) return "bg-slate-100 text-slate-600";
  const max = Math.max(...grupos.map(g => g.length));
  if (max === 1) return "bg-sky-100 text-sky-800";
  if (max === 2) return "bg-amber-100 text-amber-800";
  return "bg-orange-200 text-orange-900";
}

/* ===================== COMPONENTE ===================== */

export default function EfectosAdversosAntipsicoticoPage() {
  const [grupoActivo, setGrupoActivo] = useState("Todos");

  const visibles = grupoActivo === "Todos"
    ? FARMACOS
    : FARMACOS.filter(f => f.grupo === grupoActivo);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-5">

        <Link
          href="/tools/calculadoras-clinicas"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Herramientas Farmacológicas
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Efectos adversos de antipsicóticos</h1>
          <p className="text-sm text-slate-500 mt-1">
            Referencia base: <span className="font-medium text-slate-700">UpToDate — Selected adverse effects of antipsychotic medications for schizophrenia</span>
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 leading-relaxed">
          Tabla de referencia orientativa. Los valores reflejan la frecuencia relativa entre antipsicóticos, no la frecuencia absoluta de aparición en el paciente individual.
          No sustituye la ficha técnica ni el criterio clínico.
        </div>

        <div className="flex flex-wrap gap-2">
          {GRUPOS.map(g => (
            <button
              key={g}
              onClick={() => setGrupoActivo(g)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                grupoActivo === g
                  ? "bg-slate-800 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
          <table className="min-w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="sticky left-0 z-10 bg-slate-800 px-4 py-3 text-left font-semibold min-w-[180px]">
                  Fármaco
                </th>
                {COLUMNAS.map(col => {
                  if (col.key === "anticolinergico") {
                    return (
                      <th key={col.key} className="relative group/ac px-3 py-3 text-center font-semibold whitespace-nowrap min-w-[120px] cursor-help z-10 hover:z-[100]">
                        <span className="border-b border-dashed border-slate-400">{col.label}</span>
                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 invisible group-hover/ac:visible opacity-0 group-hover/ac:opacity-100 transition-opacity w-52 bg-slate-900 text-white text-xs rounded-lg p-3 shadow-xl text-left normal-case tracking-normal font-normal leading-relaxed pointer-events-none">
                          <p className="font-semibold mb-2 border-b border-slate-600 pb-1.5">Síntomas anticolinérgicos</p>
                          {SINT_ANTICOLINERGICOS.map(s => (
                            <p key={s} className="py-0.5">· {s}</p>
                          ))}
                        </div>
                      </th>
                    );
                  }
                  return (
                    <th key={col.key} className="px-3 py-3 text-center font-semibold whitespace-nowrap min-w-[100px]">
                      {col.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {visibles.map((f, idx) => {
                const esNuevoGrupo = idx === 0 || f.grupo !== visibles[idx - 1].grupo;
                return (
                  <Fragment key={f.nombre}>
                    {esNuevoGrupo && (
                      <tr className="bg-slate-200">
                        <td
                          colSpan={13}
                          className="sticky left-0 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-800"
                        >
                          {f.grupo}
                        </td>
                      </tr>
                    )}
                    <tr
                      className={`border-t border-slate-100 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                    >
                      <td className={`sticky left-0 z-10 hover:z-[100] group/nota px-4 py-2.5 font-medium text-slate-800 border-r border-slate-100 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                        <div className="relative flex items-center gap-1.5">
                          <span>{f.nombre}</span>
                          {f.nota && (
                            <>
                              <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-600 text-[9px] font-bold cursor-help flex-shrink-0">i</span>
                              <div className="absolute left-0 top-full mt-1 invisible group-hover/nota:visible opacity-0 group-hover/nota:opacity-100 transition-opacity w-64 bg-slate-900 text-white text-xs rounded-lg p-2.5 shadow-xl leading-relaxed pointer-events-none">
                                {f.nota}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      {COLUMNAS.map(col => {
                        const val = f[col.key as keyof Farmaco] as string;
                        return (
                          <td
                            key={col.key}
                            className={`px-3 py-2.5 text-center font-medium rounded-none ${nivelColor(val)}`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-3 items-center text-xs">
          <span className="text-slate-500 font-medium">Escala:</span>
          {[
            { val: "0",   label: "Ninguno",                            cls: "bg-slate-100 text-slate-600" },
            { val: "+",   label: "Leve",                               cls: "bg-sky-100 text-sky-800" },
            { val: "++",  label: "Moderado",                           cls: "bg-amber-100 text-amber-800" },
            { val: "+++", label: "Alto",                               cls: "bg-orange-200 text-orange-900" },
            { val: "*",   label: "Sin prolongación QTc significativa",  cls: "bg-slate-200 text-slate-600" },
            { val: "–",   label: "Sin efecto / N/A",                   cls: "bg-slate-100 text-slate-500" },
          ].map(item => (
            <span key={item.val} className={`px-2 py-1 rounded font-medium border border-slate-200 ${item.cls}`}>
              {item.val} — {item.label}
            </span>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 text-xs text-slate-600 space-y-2 leading-relaxed">
          <p className="font-semibold text-slate-700 mb-1">Notas clínicas</p>
          <p>· Las clasificaciones de EPS (acatisia, parkinsonismo, distonía, discinesia tardía) y prolactina son consistentes con las guías de práctica clínica de la APA para esquizofrenia.</p>
          <p>· Las clasificaciones de QTc se basan en UpToDate Lexidrug según guía de la FDA. Otras fuentes pueden clasificar algunos agentes de forma diferente.</p>
          <p>· El icono <strong>i</strong> junto al nombre del fármaco indica una nota clínica específica visible al pasar el cursor.</p>
          <p>· La <strong>clozapina</strong> requiere monitoreo obligatorio del hemograma por riesgo de agranulocitosis (~1%). Consultar el protocolo REMS vigente antes de prescribir.</p>
        </div>

        <p className="text-xs text-slate-400 text-center pb-4">
          Basado en: UpToDate · "Selected adverse effects of antipsychotic medications for schizophrenia" · Herramienta orientativa, no sustituye el criterio clínico
        </p>

      </div>
    </div>
  );
}

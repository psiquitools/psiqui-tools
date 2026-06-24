"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/* ===================== TIPOS Y DATOS ===================== */

type Nivel = string;

interface Farmaco {
  nombre: string;
  grupo: string;
  anticolinergico: Nivel;
  somnolencia: Nivel;
  insomnio: Nivel;
  hipotension: Nivel;
  qtc: Nivel;
  gi: Nivel;
  peso: Nivel;
  sexualidad: Nivel;
  nota?: string;
}

const GRUPOS = [
  "Todos",
  "ISRS",
  "Agentes atípicos",
  "IRSN",
  "Moduladores de serotonina",
  "Tricíclicos y tetracíclicos",
  "IMAO",
];

const FARMACOS: Farmaco[] = [
  // ── ISRS ──
  { nombre: "Citalopram",    grupo: "ISRS", anticolinergico: "0",  somnolencia: "1+", insomnio: "1+",     hipotension: "1+",     qtc: "2 a 3+",  gi: "1+",     peso: "1+",     sexualidad: "3+" },
  { nombre: "Escitalopram",  grupo: "ISRS", anticolinergico: "0",  somnolencia: "1+", insomnio: "1+",     hipotension: "1+",     qtc: "2+",      gi: "1+",     peso: "1+",     sexualidad: "3+" },
  { nombre: "Fluoxetina",    grupo: "ISRS", anticolinergico: "0",  somnolencia: "0",  insomnio: "2+",     hipotension: "1+",     qtc: "1+",      gi: "1+",     peso: "0",      sexualidad: "3+" },
  { nombre: "Fluvoxamina",   grupo: "ISRS", anticolinergico: "0",  somnolencia: "1+", insomnio: "1+",     hipotension: "1+",     qtc: "1+",      gi: "1+",     peso: "1+",     sexualidad: "3+" },
  { nombre: "Paroxetina",    grupo: "ISRS", anticolinergico: "1+", somnolencia: "2+", insomnio: "1+",     hipotension: "2+",     qtc: "1+",      gi: "1+",     peso: "2+",     sexualidad: "4+" },
  { nombre: "Sertralina",    grupo: "ISRS", anticolinergico: "0",  somnolencia: "1+", insomnio: "2+",     hipotension: "1+",     qtc: "1+",      gi: "2+",     peso: "1+",     sexualidad: "3+", nota: "Mayor tasa de diarrea respecto al resto de ISRS" },

  // ── Agentes atípicos ──
  { nombre: "Agomelatina",              grupo: "Agentes atípicos", anticolinergico: "0",  somnolencia: "1+", insomnio: "1+",     hipotension: "0",      qtc: "0",       gi: "1+",     peso: "0",      sexualidad: "0 a 1+", nota: "No disponible en EE.UU. Hepatotóxica — contraindicada en insuficiencia hepática; monitorizar transaminasas" },
  { nombre: "Bupropión",                grupo: "Agentes atípicos", anticolinergico: "0",  somnolencia: "0",  insomnio: "2+",     hipotension: "0",      qtc: "0 a 1+",  gi: "1+",     peso: "0",      sexualidad: "0" },
  { nombre: "Dextrometorfano-bupropión",grupo: "Agentes atípicos", anticolinergico: "0",  somnolencia: "1+", insomnio: "1+",     hipotension: "0",      qtc: "0 a 1+",  gi: "1+",     peso: "0",      sexualidad: "1+" },
  { nombre: "Mirtazapina",              grupo: "Agentes atípicos", anticolinergico: "1+", somnolencia: "4+", insomnio: "0",      hipotension: "0",      qtc: "1+",      gi: "0",      peso: "4+",     sexualidad: "1+" },

  // ── IRSN ──
  { nombre: "Desvenlafaxina",  grupo: "IRSN", anticolinergico: "0", somnolencia: "0",  insomnio: "2+",     hipotension: "0",      qtc: "0",       gi: "2+",     peso: "Desc.", sexualidad: "1+" },
  { nombre: "Duloxetina",      grupo: "IRSN", anticolinergico: "0", somnolencia: "0",  insomnio: "1+",     hipotension: "0",      qtc: "0",       gi: "2+",     peso: "0 a 1+", sexualidad: "1+" },
  { nombre: "Levomilnaciprán", grupo: "IRSN", anticolinergico: "0", somnolencia: "0",  insomnio: "0 a 1+", hipotension: "0 a 1+", qtc: "0",       gi: "2+",     peso: "0",      sexualidad: "1+", nota: "Puede causar retención urinaria dosis-dependiente" },
  { nombre: "Milnaciprán",     grupo: "IRSN", anticolinergico: "0", somnolencia: "1+", insomnio: "0",      hipotension: "0",      qtc: "0",       gi: "2+",     peso: "0",      sexualidad: "1+" },
  { nombre: "Venlafaxina",     grupo: "IRSN", anticolinergico: "0", somnolencia: "1+", insomnio: "2+",     hipotension: "0",      qtc: "0 a 1+",  gi: "2+",     peso: "0 a 1+", sexualidad: "3+" },

  // ── Moduladores de serotonina ──
  { nombre: "Gepirona",    grupo: "Moduladores de serotonina", anticolinergico: "0", somnolencia: "0 a 1+", insomnio: "1+", hipotension: "0",      qtc: "2+",     gi: "3+",     peso: "1+",      sexualidad: "0" },
  { nombre: "Trazodona",   grupo: "Moduladores de serotonina", anticolinergico: "0", somnolencia: "4+",     insomnio: "0",  hipotension: "1+ / 3+", qtc: "1 a 2+", gi: "1+ / 3+", peso: "0 / 1+",  sexualidad: "1+", nota: "Valores: dosis hipnótica / dosis antidepresiva. Asociada raramente a priapismo (emergencia médica)" },
  { nombre: "Vilazodona",  grupo: "Moduladores de serotonina", anticolinergico: "0", somnolencia: "0",      insomnio: "2+", hipotension: "0",      qtc: "0",      gi: "4+",     peso: "0",       sexualidad: "1+" },
  { nombre: "Vortioxetina",grupo: "Moduladores de serotonina", anticolinergico: "0", somnolencia: "0",      insomnio: "0",  hipotension: "0",      qtc: "0",      gi: "3+",     peso: "0",       sexualidad: "1+" },

  // ── Tricíclicos y tetracíclicos ──
  { nombre: "Amitriptilina", grupo: "Tricíclicos y tetracíclicos", anticolinergico: "4+", somnolencia: "4+", insomnio: "0",  hipotension: "3+", qtc: "1 a 2+", gi: "1+", peso: "4+", sexualidad: "3 a 4+" },
  { nombre: "Amoxapina",     grupo: "Tricíclicos y tetracíclicos", anticolinergico: "2+", somnolencia: "2+", insomnio: "2+", hipotension: "2+", qtc: "ND",     gi: "0",  peso: "2+", sexualidad: "ND" },
  { nombre: "Clomipramina",  grupo: "Tricíclicos y tetracíclicos", anticolinergico: "4+", somnolencia: "4+", insomnio: "1+", hipotension: "2+", qtc: "3+",     gi: "1+", peso: "4+", sexualidad: "4+" },
  { nombre: "Desipramina",   grupo: "Tricíclicos y tetracíclicos", anticolinergico: "1+", somnolencia: "2+", insomnio: "1+", hipotension: "2+", qtc: "1 a 2+", gi: "0",  peso: "1+", sexualidad: "ND" },
  { nombre: "Doxepina",      grupo: "Tricíclicos y tetracíclicos", anticolinergico: "3+", somnolencia: "3+", insomnio: "0",  hipotension: "2+", qtc: "3+",     gi: "0",  peso: "4+", sexualidad: "3+" },
  { nombre: "Imipramina",    grupo: "Tricíclicos y tetracíclicos", anticolinergico: "3+", somnolencia: "3+", insomnio: "1+", hipotension: "4+", qtc: "3+",     gi: "1+", peso: "4+", sexualidad: "3+" },
  { nombre: "Maprotilina",   grupo: "Tricíclicos y tetracíclicos", anticolinergico: "2+", somnolencia: "3+", insomnio: "0",  hipotension: "2+", qtc: "1+",     gi: "0",  peso: "2+", sexualidad: "ND" },
  { nombre: "Nortriptilina", grupo: "Tricíclicos y tetracíclicos", anticolinergico: "2+", somnolencia: "2+", insomnio: "0",  hipotension: "1+", qtc: "1 a 2+", gi: "0",  peso: "1+", sexualidad: "ND" },
  { nombre: "Protriptilina", grupo: "Tricíclicos y tetracíclicos", anticolinergico: "2+", somnolencia: "1+", insomnio: "1+", hipotension: "2+", qtc: "ND",     gi: "1+", peso: "1+", sexualidad: "3 a 4+" },
  { nombre: "Trimipramina",  grupo: "Tricíclicos y tetracíclicos", anticolinergico: "4+", somnolencia: "4+", insomnio: "1+", hipotension: "3+", qtc: "ND",     gi: "0",  peso: "4+", sexualidad: "ND" },

  // ── IMAO ──
  { nombre: "Isocarboxazida",  grupo: "IMAO", anticolinergico: "1+", somnolencia: "1+", insomnio: "2+", hipotension: "2+", qtc: "0", gi: "1+", peso: "1+", sexualidad: "4+" },
  { nombre: "Fenelzina",       grupo: "IMAO", anticolinergico: "1+", somnolencia: "2+", insomnio: "1+", hipotension: "3+", qtc: "0", gi: "1+", peso: "2+", sexualidad: "4+" },
  { nombre: "Selegilina",      grupo: "IMAO", anticolinergico: "1+", somnolencia: "0",  insomnio: "1+", hipotension: "1+", qtc: "0", gi: "0",  peso: "0",  sexualidad: "0" },
  { nombre: "Tranilcipromina", grupo: "IMAO", anticolinergico: "1+", somnolencia: "1+", insomnio: "2+", hipotension: "2+", qtc: "0", gi: "1+", peso: "1+", sexualidad: "4+" },
];

const COLUMNAS = [
  { key: "anticolinergico",  label: "Anticolinérgico" },
  { key: "somnolencia",      label: "Somnolencia" },
  { key: "insomnio",         label: "Insomnio / agitación" },
  { key: "hipotension",      label: "Hipotensión ortostática" },
  { key: "qtc",              label: "Prolongación QTc" },
  { key: "gi",               label: "Toxicidad GI" },
  { key: "peso",             label: "Aumento de peso" },
  { key: "sexualidad",       label: "Disfunción sexual" },
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
  if (val === "ND" || val === "Desc.") return "bg-slate-200 text-slate-600";
  if (val === "0") return "bg-slate-100 text-slate-600";
  const numeros = val.match(/[1-4]/g);
  if (!numeros) return "bg-slate-100 text-slate-600";
  const max = Math.max(...numeros.map(Number));
  if (max === 1) return "bg-sky-100 text-sky-800";
  if (max === 2) return "bg-amber-100 text-amber-800";
  if (max === 3) return "bg-orange-200 text-orange-900";
  return "bg-red-200 text-red-900";
}

/* ===================== COMPONENTE ===================== */

export default function EfectosAdversosPage() {
  const [grupoActivo, setGrupoActivo] = useState("Todos");

  const visibles = grupoActivo === "Todos"
    ? FARMACOS
    : FARMACOS.filter(f => f.grupo === grupoActivo);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* Volver */}
        <Link
          href="/tools/calculadoras-clinicas"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Herramientas Farmacológicas
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Efectos adversos de antidepresivos</h1>
          <p className="text-sm text-slate-500 mt-1">
            Referencia base: <span className="font-medium text-slate-700">UpToDate — Side effects of antidepressant medications</span>
          </p>
        </div>

        {/* Aviso */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 leading-relaxed">
          Tabla de referencia orientativa. Los valores reflejan la frecuencia relativa entre antidepresivos, no la frecuencia absoluta de aparición en el paciente individual.
          No sustituye la ficha técnica ni el criterio clínico.
        </div>

        {/* Filtros */}
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

        {/* Tabla */}
        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
          <table className="min-w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="sticky left-0 z-10 bg-slate-800 px-4 py-3 text-left font-semibold min-w-[160px]">
                  Fármaco
                </th>
                {COLUMNAS.map(col => {
                  if (col.key === "anticolinergico") {
                    return (
                      <th key={col.key} className="relative group/ac px-3 py-3 text-center font-semibold whitespace-nowrap min-w-[140px] cursor-help z-10 hover:z-[100]">
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
                    <th key={col.key} className="px-3 py-3 text-center font-semibold whitespace-nowrap min-w-[120px]">
                      {col.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {visibles.map((f, idx) => {
                const esNuevoGrupo =
                  idx === 0 || f.grupo !== visibles[idx - 1].grupo;
                return (
                  <>
                    {esNuevoGrupo && (
                      <tr key={`grupo-${f.grupo}`} className="bg-slate-200">
                        <td
                          colSpan={9}
                          className="sticky left-0 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-800"
                        >
                          {f.grupo}
                        </td>
                      </tr>
                    )}
                    <tr
                      key={f.nombre}
                      className={`border-t border-slate-100 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                    >
                      <td className={`sticky left-0 z-10 hover:z-[100] group/nota px-4 py-2.5 font-medium text-slate-800 border-r border-slate-100 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                        <div className="relative flex items-center gap-1.5">
                          <span>{f.nombre}</span>
                          {f.nota && (
                            <>
                              <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-600 text-[9px] font-bold cursor-help flex-shrink-0">i</span>
                              <div className="absolute left-0 top-full mt-1 invisible group-hover/nota:visible opacity-0 group-hover/nota:opacity-100 transition-opacity w-60 bg-slate-900 text-white text-xs rounded-lg p-2.5 shadow-xl leading-relaxed pointer-events-none">
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
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap gap-3 items-center text-xs">
          <span className="text-slate-500 font-medium">Escala:</span>
          {[
            { val: "0",   label: "Ninguno",             cls: "bg-slate-100 text-slate-600" },
            { val: "1+",  label: "Leve",                cls: "bg-sky-100 text-sky-800" },
            { val: "2+",  label: "Bajo-moderado",       cls: "bg-amber-100 text-amber-800" },
            { val: "3+",  label: "Moderado",            cls: "bg-orange-200 text-orange-900" },
            { val: "4+",  label: "Alto",                cls: "bg-red-200 text-red-900" },
            { val: "ND",  label: "Datos insuficientes", cls: "bg-slate-200 text-slate-600" },
          ].map(item => (
            <span key={item.val} className={`px-2 py-1 rounded font-medium border border-slate-200 ${item.cls}`}>
              {item.val} — {item.label}
            </span>
          ))}
        </div>

        {/* Notas */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-xs text-slate-600 space-y-2 leading-relaxed">
          <p className="font-semibold text-slate-700 mb-1">Notas clínicas</p>
          <p>· Todos los ISRS e IRSN pueden causar náuseas transitorias al iniciar el tratamiento o aumentar la dosis.</p>
          <p>· La dosis máxima de <strong>citalopram</strong> es 40 mg/día (20 mg en mayores de 60 años, hepatopatía o interacciones que aumenten la exposición), por riesgo de prolongación del QTc dosis-dependiente.</p>
          <p>· Los IRSN no tienen efectos anticolinérgicos significativos directos, pero pueden producir síntomas similares (boca seca, estreñimiento) por estimulación noradrenérgica.</p>
          <p>· La prolongación del QTc con <strong>bupropión</strong> y <strong>venlafaxina</strong> a dosis terapéuticas es clínicamente baja; el riesgo arritmogénico aumenta significativamente en sobredosis.</p>
          <p>· El icono <strong>i</strong> junto al nombre del fármaco indica una nota clínica específica visible al pasar el cursor.</p>
        </div>

        <p className="text-xs text-slate-400 text-center pb-4">
          Basado en: UpToDate · "Side effects of antidepressant medications" · Herramienta orientativa, no sustituye el criterio clínico
        </p>

      </div>
    </div>
  );
}

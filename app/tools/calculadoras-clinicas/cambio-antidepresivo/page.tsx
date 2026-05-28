"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, AlertTriangle, CheckCircle, Clock, Minus, ChevronDown } from "lucide-react";

/* ─── tipos ─────────────────────────────────────────────── */

type CellType = "ok" | "caution" | "warning" | "same" | "neutral";
interface Cell { type: CellType; text: string; }

/* ─── datos ──────────────────────────────────────────────── */

const DRUGS = [
  { id: 0, label: "Agomelatina" },
  { id: 1, label: "Bupropión" },
  { id: 2, label: "Clomipramina" },
  { id: 3, label: "Fluoxetina" },
  { id: 4, label: "Fluvoxamina" },
  { id: 5, label: "IMAOs", sub: "Fenelzina / Tranilcipromina / Selegilina" },
  { id: 6, label: "Moclobemida" },
  { id: 7, label: "Mirtazapina" },
  { id: 8, label: "Reboxetina" },
  { id: 9, label: "Trazodona" },
  { id: 10, label: "Otros ISRS / Vortioxetina", sub: "Citalopram · Escitalopram · Paroxetina · Sertralina" },
  { id: 11, label: "IRSN", sub: "Duloxetina / Venlafaxina / Desvenlafaxina" },
  { id: 12, label: "TCAs", sub: "excepto clomipramina" },
  { id: 13, label: "Viloxazina" },
];

const ok = (t: string): Cell => ({ type: "ok", text: t });
const warn = (t: string): Cell => ({ type: "warning", text: t });
const caut = (t: string): Cell => ({ type: "caution", text: t });
const same = (): Cell => ({ type: "same", text: "—" });
const neu = (t: string): Cell => ({ type: "neutral", text: t });
const CC = "Cambio cruzado gradual";

/* 14 × 14  [desde][hacia] */
const MATRIX: Cell[][] = [
  /* 0 Agomelatina */
  [same(), ok(CC), ok(CC), ok(CC), neu("Suspender agomelatina, iniciar fluvoxamina"), ok(CC), ok(CC), ok(CC), ok(CC), ok(CC), ok(CC), ok(CC), ok(CC), neu("Suspender agomelatina, iniciar viloxazina")],
  /* 1 Bupropión */
  [ok(CC), same(), ok(CC + " con clomipramina a dosis bajas"), ok(CC), ok(CC), warn("Retirada gradual y suspensión, esperar 2 semanas, iniciar IMAOs"), neu("Retirada gradual y suspensión, iniciar moclobemida"), ok(CC), ok(CC), ok(CC), ok(CC), ok(CC), ok(CC + " con TCA a dosis bajas"), ok(CC)],
  /* 2 Clomipramina */
  [ok(CC), ok(CC), same(), neu("Retirada gradual y suspensión, iniciar fluoxetina 10 mg/día"), neu("Retirada gradual y suspensión, iniciar fluvoxamina a dosis bajas"), warn("Retirada gradual y suspensión, esperar 3 semanas, iniciar IMAOs"), caut("Retirada gradual y suspensión, esperar 1 semana, iniciar moclobemida"), ok(CC), ok(CC), ok(CC), neu("Retirada gradual y suspensión, iniciar ISRS a dosis bajas"), neu("Retirada gradual y suspensión, iniciar IRSN a dosis bajas"), ok(CC), ok(CC)],
  /* 3 Fluoxetina */
  [ok(CC), neu("Suspender fluoxetina, esperar 4–7 días, iniciar bupropión"), warn("Suspender fluoxetina, esperar 2 semanas, iniciar clomipramina a dosis bajas"), same(), neu("Suspender fluoxetina, esperar 4–7 días, iniciar fluvoxamina"), warn("Suspender fluoxetina, esperar 5–6 semanas, iniciar IMAOs"), warn("Suspender fluoxetina, esperar 5–6 semanas, iniciar moclobemida"), ok(CC), ok(CC), ok(CC), neu("Suspender fluoxetina, esperar 4–7 días, iniciar ISRS a dosis bajas"), neu("Suspender fluoxetina, esperar 4–7 días, iniciar IRSN"), neu("Suspender fluoxetina, esperar 4–7 días, iniciar TCA a dosis bajas"), ok(CC)],
  /* 4 Fluvoxamina */
  [neu("Retirada gradual y suspensión, esperar 4 días"), ok(CC), neu("Retirada gradual y suspensión, iniciar clomipramina a dosis bajas"), neu("Cambio directo posible^"), same(), warn("Retirada gradual y suspensión, esperar 1 semana, iniciar IMAOs"), caut("Retirada gradual y suspensión, esperar 1 semana, iniciar moclobemida"), ok(CC + ", iniciar mirtazapina 15 mg"), ok(CC), ok(CC), neu("Cambio directo posible"), neu("Cambio directo posible"), ok(CC + " con TCA a dosis bajas"), ok(CC)],
  /* 5 IMAOs */
  [ok(CC), warn("Retirada gradual y suspensión, esperar 2 semanas"), warn("Retirada gradual y suspensión, esperar 3 semanas"), warn("Retirada gradual y suspensión, esperar 2 semanas"), warn("Retirada gradual y suspensión, esperar 2 semanas"), same(), warn("Retirada gradual y suspensión, esperar 2 semanas, iniciar moclobemida"), warn("Retirada gradual y suspensión, esperar 2 semanas"), warn("Retirada gradual y suspensión, esperar 2 semanas"), warn("Retirada gradual y suspensión, esperar 2 semanas"), warn("Retirada gradual y suspensión, esperar 2 semanas"), warn("Retirada gradual y suspensión, esperar 2 semanas"), warn("Retirada gradual y suspensión, esperar 2 semanas"), warn("Retirada gradual y suspensión, esperar 2 semanas")],
  /* 6 Moclobemida */
  [caut("Retirada gradual y suspensión, esperar 24 h"), caut("Retirada gradual y suspensión, esperar 24 h"), caut("Retirada gradual y suspensión, esperar 24 h"), caut("Retirada gradual y suspensión, esperar 24 h"), caut("Retirada gradual y suspensión, esperar 24 h"), warn("Retirada gradual y suspensión, esperar 24 h, iniciar IMAOs"), same(), caut("Retirada gradual y suspensión, esperar 24 h"), caut("Retirada gradual y suspensión, esperar 24 h"), caut("Retirada gradual y suspensión, esperar 24 h"), caut("Retirada gradual y suspensión, esperar 24 h"), caut("Retirada gradual y suspensión, esperar 24 h"), caut("Retirada gradual y suspensión, esperar 24 h"), caut("Retirada gradual y suspensión, esperar 24 h")],
  /* 7 Mirtazapina */
  [ok(CC), ok(CC), ok(CC), ok(CC), ok(CC), warn("Retirada gradual y suspensión, esperar 2 semanas"), caut("Retirada gradual y suspensión, esperar 1 semana, iniciar moclobemida"), same(), ok(CC), ok(CC), ok(CC), ok(CC), ok(CC), ok(CC)],
  /* 8 Reboxetina */
  [ok(CC), ok(CC), ok(CC), ok(CC), ok(CC), warn("Retirada gradual y suspensión, esperar 1 semana, iniciar IMAOs"), caut("Retirada gradual y suspensión, esperar 1 semana, iniciar moclobemida"), ok(CC), same(), ok(CC), ok(CC), ok(CC), ok(CC), ok(CC)],
  /* 9 Trazodona */
  [ok(CC), ok(CC), ok(CC + " con clomipramina a dosis bajas"), ok(CC), ok(CC), warn("Retirada gradual y suspensión, esperar 1 semana"), caut("Retirada gradual y suspensión, esperar 1 semana, iniciar moclobemida"), ok(CC), ok(CC), same(), ok(CC), ok(CC), ok(CC + " con TCA a dosis bajas"), ok(CC)],
  /* 10 Otros ISRS / Vortioxetina */
  [ok(CC), ok(CC), neu("Retirada gradual y suspensión, iniciar clomipramina a dosis bajas"), neu("Cambio directo posible^"), neu("Cambio directo posible"), warn("Retirada gradual y suspensión, esperar 1 semana (3 semanas si vortioxetina)"), caut("Retirada gradual y suspensión, esperar 1 semana, iniciar moclobemida"), ok(CC), ok(CC), ok(CC), same(), neu("Cambio directo posible"), ok(CC + " con TCA a dosis bajas"), ok(CC)],
  /* 11 IRSN */
  [ok(CC), ok(CC), neu("Retirada gradual y suspensión, iniciar clomipramina a dosis bajas"), neu("Cambio directo posible^"), neu("Cambio directo posible"), warn("Retirada gradual y suspensión, esperar 1 semana (3 semanas si duloxetina)"), caut("Retirada gradual y suspensión, esperar 1 semana, iniciar moclobemida"), ok(CC), ok(CC), ok(CC), neu("Cambio directo posible"), same(), ok(CC + " con TCA a dosis bajas"), ok(CC)],
  /* 12 TCAs */
  [ok(CC), neu("Reducir a la mitad, añadir bupropión, luego retirada lenta"), neu("Cambio directo posible"), neu("Reducir a la mitad, añadir fluoxetina, luego retirada lenta"), ok(CC), warn("Retirada gradual y suspensión, esperar 2 semanas"), caut("Retirada gradual y suspensión, esperar 1 semana, iniciar moclobemida"), ok(CC), ok(CC), neu("Reducir a la mitad, añadir trazodona, luego retirada lenta"), neu("Reducir a la mitad, añadir ISRS a dosis bajas, luego retirada lenta"), ok(CC + " con IRSN a dosis bajas"), same(), ok(CC)],
  /* 13 Viloxazina */
  [neu("Retirada gradual y suspensión, esperar 48 horas"), ok(CC), ok(CC), ok(CC), ok(CC), warn("Retirada gradual y suspensión, esperar 2 semanas"), caut("Retirada gradual y suspensión, esperar 1 semana, iniciar moclobemida"), ok(CC), ok(CC), ok(CC), ok(CC), ok(CC), ok(CC), same()],
];

/* ─── estilos por tipo ───────────────────────────────────── */

const CELL_BG: Record<CellType, string> = {
  ok: "bg-emerald-50",
  caution: "bg-amber-50",
  warning: "bg-red-50",
  same: "bg-slate-100",
  neutral: "bg-white",
};

const RESULT_STYLES: Record<CellType, { bg: string; border: string; icon: React.ElementType; iconColor: string; label: string }> = {
  ok: { bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle, iconColor: "text-emerald-600", label: "Cambio cruzado directo" },
  caution: { bg: "bg-amber-50", border: "border-amber-200", icon: Clock, iconColor: "text-amber-600", label: "Lavado corto requerido" },
  warning: { bg: "bg-red-50", border: "border-red-200", icon: AlertTriangle, iconColor: "text-red-600", label: "Lavado prolongado — precaución" },
  same: { bg: "bg-slate-100", border: "border-slate-200", icon: Minus, iconColor: "text-slate-400", label: "Misma molécula" },
  neutral: { bg: "bg-slate-50", border: "border-slate-200", icon: ArrowRight, iconColor: "text-slate-500", label: "Instrucción específica" },
};

/* ─── componente ─────────────────────────────────────────── */

export default function CambioAntidepresivo() {
  const [desde, setDesde] = useState<number | null>(null);
  const [hacia, setHacia] = useState<number | null>(null);
  const [tablaAbierta, setTablaAbierta] = useState(false);
  const [notasAbiertas, setNotasAbiertas] = useState(false);

  const result = desde !== null && hacia !== null ? MATRIX[desde][hacia] : null;
  const style = result ? RESULT_STYLES[result.type] : null;
  const Icon = style?.icon;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Volver */}
        <Link href="/tools/calculadoras-clinicas" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Volver a Herramientas Farmacológicas
        </Link>

        {/* Encabezado */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Cambio de antidepresivo</h1>
          <p className="mt-1 text-sm text-slate-500">Herramienta basada en: Maudsley Prescribing Guidelines </p>
        </div>

        {/* ── Selector ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-medium text-slate-700">Consulta rápida</p>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Desde</label>
              <select
                value={desde ?? ""}
                onChange={e => setDesde(e.target.value === "" ? null : Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
              >
                <option value="">Selecciona fármaco actual…</option>
                {DRUGS.map(d => (
                  <option key={d.id} value={d.id}>{d.label}{d.sub ? ` (${d.sub})` : ""}</option>
                ))}
              </select>
            </div>

            <ArrowRight className="hidden h-5 w-5 flex-shrink-0 self-center text-slate-400 sm:block" />

            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Hacia</label>
              <select
                value={hacia ?? ""}
                onChange={e => setHacia(e.target.value === "" ? null : Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
              >
                <option value="">Selecciona fármaco nuevo…</option>
                {DRUGS.map(d => (
                  <option key={d.id} value={d.id}>{d.label}{d.sub ? ` (${d.sub})` : ""}</option>
                ))}
              </select>
            </div>
          </div>

          {result && style && Icon && (
            <div className={`mt-5 rounded-xl border ${style.border} ${style.bg} p-4`}>
              <div className="mb-2 flex items-center gap-2">
                <Icon className={`h-4 w-4 flex-shrink-0 ${style.iconColor}`} />
                <span className={`text-xs font-semibold uppercase tracking-wide ${style.iconColor}`}>{style.label}</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-800">{result.text}</p>
            </div>
          )}
        </div>

        {/* ── Tabla completa (colapsable) ── */}
        <div>
          <button
            onClick={() => setTablaAbierta(v => !v)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm hover:bg-slate-50 transition-colors"
          >
            <span className="text-sm font-medium text-slate-700">Tabla de referencia completa</span>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${tablaAbierta ? "rotate-180" : ""}`}
            />
          </button>

          {tablaAbierta && (
            <div className="mt-3">
              <div className="mb-4 flex flex-wrap gap-3">
                {[
                  { bg: "bg-emerald-50 border-emerald-200", label: "Cambio cruzado gradual" },
                  { bg: "bg-amber-50 border-amber-200", label: "Lavado 24 h (moclobemida)" },
                  { bg: "bg-red-50 border-red-200", label: "Lavado 1–6 semanas (IMAOs / fluoxetina)" },
                  { bg: "bg-slate-100 border-slate-200", label: "Misma molécula" },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <div className={`h-3.5 w-3.5 flex-shrink-0 rounded border ${l.bg}`} />
                    {l.label}
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                <table className="border-collapse text-xs" style={{ minWidth: "1100px" }}>
                  <thead>
                    <tr>
                      <th className="border border-slate-200 bg-slate-800 px-3 py-2 text-left text-xs font-semibold text-white" style={{ minWidth: "130px" }}>
                        DESDE → HACIA
                      </th>
                      {DRUGS.map(d => (
                        <th key={d.id} className="border border-slate-200 bg-slate-800 px-2 py-2 text-center text-xs font-medium text-white" style={{ minWidth: "90px" }}>
                          {d.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DRUGS.map((rowDrug, r) => (
                      <tr key={rowDrug.id}>
                        <td className="border border-slate-200 bg-slate-800 px-3 py-2 font-semibold text-white">
                          <div>{rowDrug.label}</div>
                          {rowDrug.sub && <div className="mt-0.5 text-xs font-normal text-slate-400">{rowDrug.sub}</div>}
                        </td>
                        {DRUGS.map((_, c) => {
                          const cell = MATRIX[r][c];
                          const isSelected = r === desde && c === hacia;
                          return (
                            <td
                              key={c}
                              className={`cursor-pointer border border-slate-200 px-2 py-2 text-xs leading-snug text-slate-700 transition-all hover:brightness-95
                                ${CELL_BG[cell.type]}
                                ${isSelected ? "outline outline-2 outline-offset-[-2px] outline-slate-800" : ""}`}
                              onClick={() => { setDesde(r); setHacia(c); }}
                            >
                              {cell.type === "same"
                                ? <span className="italic text-slate-400">—</span>
                                : cell.text}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Notas (colapsable) */}
        <div>
          <button
            onClick={() => setNotasAbiertas(v => !v)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm hover:bg-slate-50 transition-colors"
          >
            <span className="text-sm font-medium text-slate-700">Notas clave del Maudsley</span>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${notasAbiertas ? "rotate-180" : ""}`}
            />
          </button>

          {notasAbiertas && (
            <div className="mt-3 rounded-xl border-l-4 border-slate-400 bg-slate-100 px-5 py-4 text-xs leading-relaxed text-slate-600">
              <ul className="space-y-1">
                <li><strong>^ Cambio directo posible:</strong> la fluoxetina puede requerir algunos días de solapamiento para que se acumule antes de retirar el fármaco previo.</li>
                <li><strong>Fluoxetina → IMAOs:</strong> periodo de lavado mínimo de 5–6 semanas por vida media larga del metabolito norfluoxetina.</li>
                <li><strong>IMAOs → cualquier serotoninérgico:</strong> periodo de lavado mínimo de 2 semanas.</li>
                <li><strong>Moclobemida (IMAO reversible):</strong> periodo de lavado de solo 24 horas en la mayoría de transiciones.</li>
                <li><strong>Vortioxetina:</strong> esperar 3 semanas antes de iniciar IMAOs.</li>
                <li><strong>Duloxetina:</strong> cambio abrupto desde ISRS e IRSN posible iniciando a 60 mg/día.</li>
                <li><strong>Cambio cruzado gradual:</strong> habitualmente 2–4 semanas de solapamiento.</li>
                <li><strong>Fluvoxamina:</strong> inhibidor potente de CYP1A2 y CYP2C19 — precaución extra en todas las transiciones.</li>
              </ul>
              <p className="mt-3 text-slate-400">Fuente: The Maudsley Prescribing Guidelines in Psychiatry, Tabla 3.7</p>
            </div>
          )}
        </div>

        <p className="pb-4 text-center text-xs text-slate-400">
          Herramienta de apoyo clínico · No sustituye el criterio médico profesional
        </p>

      </div>
    </div>
  );
}

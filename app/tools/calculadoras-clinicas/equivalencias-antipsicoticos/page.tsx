"use client";

import { useState, Fragment } from "react";
import { ArrowRight, RotateCcw, Copy, CheckCheck } from "lucide-react";

/* ===================== DATOS ===================== */

interface Antipsicotico {
  id: string;
  nombre: string;
  grupo: "SGA" | "FGA";
  cpzEq: number;    // mg del fármaco equivalentes a 100 mg de clorpromazina
  dosisMin: number; // rango habitual mínimo (mg/día, oral)
  dosisMax: number; // rango habitual máximo (mg/día, oral)
}

const FARMACOS: Antipsicotico[] = [
  // ── Segunda generación ──
  { id: "amisulpride",     nombre: "Amisulpride",     grupo: "SGA", cpzEq: 100,  dosisMin: 400,  dosisMax: 800  },
  { id: "aripiprazol",     nombre: "Aripiprazol",     grupo: "SGA", cpzEq: 7.5,  dosisMin: 10,   dosisMax: 30   },
  { id: "asenapina",       nombre: "Asenapina",       grupo: "SGA", cpzEq: 5,    dosisMin: 10,   dosisMax: 20   },
  { id: "brexpiprazol",    nombre: "Brexpiprazol",    grupo: "SGA", cpzEq: 5,    dosisMin: 2,    dosisMax: 4    },
  { id: "cariprazina",     nombre: "Cariprazina",     grupo: "SGA", cpzEq: 1.5,  dosisMin: 1.5,  dosisMax: 6    },
  { id: "clozapina",       nombre: "Clozapina",       grupo: "SGA", cpzEq: 50,   dosisMin: 150,  dosisMax: 450  },
  { id: "iloperidona",     nombre: "Iloperidona",     grupo: "SGA", cpzEq: 12,   dosisMin: 12,   dosisMax: 24   },
  { id: "lurasidona",      nombre: "Lurasidona",      grupo: "SGA", cpzEq: 37.5, dosisMin: 40,   dosisMax: 160  },
  { id: "olanzapina",      nombre: "Olanzapina",      grupo: "SGA", cpzEq: 5,    dosisMin: 10,   dosisMax: 20   },
  { id: "paliperidona",    nombre: "Paliperidona",    grupo: "SGA", cpzEq: 2,    dosisMin: 3,    dosisMax: 12   },
  { id: "quetiapina",      nombre: "Quetiapina",      grupo: "SGA", cpzEq: 75,   dosisMin: 150,  dosisMax: 750  },
  { id: "risperidona",     nombre: "Risperidona",     grupo: "SGA", cpzEq: 2,    dosisMin: 2,    dosisMax: 8    },
  { id: "ziprasidona",     nombre: "Ziprasidona",     grupo: "SGA", cpzEq: 40,   dosisMin: 80,   dosisMax: 160  },
  // ── Primera generación ──
  { id: "clorpromazina",   nombre: "Clorpromazina",   grupo: "FGA", cpzEq: 100,  dosisMin: 200,  dosisMax: 800  },
  { id: "flufenazina",     nombre: "Flufenazina",     grupo: "FGA", cpzEq: 2,    dosisMin: 5,    dosisMax: 20   },
  { id: "flupentixol",     nombre: "Flupentixol",     grupo: "FGA", cpzEq: 3,    dosisMin: 6,    dosisMax: 18   },
  { id: "haloperidol",     nombre: "Haloperidol",     grupo: "FGA", cpzEq: 2,    dosisMin: 5,    dosisMax: 20   },
  { id: "levomepromazina", nombre: "Levomepromazina", grupo: "FGA", cpzEq: 50,   dosisMin: 25,   dosisMax: 300  },
  { id: "perfenazina",     nombre: "Perfenazina",     grupo: "FGA", cpzEq: 10,   dosisMin: 12,   dosisMax: 64   },
  { id: "pimozida",        nombre: "Pimozida",        grupo: "FGA", cpzEq: 2,    dosisMin: 2,    dosisMax: 20   },
  { id: "trifluoperazina", nombre: "Trifluoperazina", grupo: "FGA", cpzEq: 5,    dosisMin: 10,   dosisMax: 40   },
  { id: "zuclopentixol",   nombre: "Zuclopentixol",   grupo: "FGA", cpzEq: 25,   dosisMin: 20,   dosisMax: 60   },
];

/* ===================== HELPERS ===================== */

function cpzBand(cpz: number): { label: string; cls: string } {
  if (cpz < 300)  return { label: "Dosis baja",      cls: "text-sky-700 bg-sky-50 border-sky-200" };
  if (cpz < 600)  return { label: "Dosis moderada",  cls: "text-amber-700 bg-amber-50 border-amber-200" };
  return             { label: "Dosis alta",       cls: "text-red-700 bg-red-50 border-red-200" };
}

function fmt(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  const r = Math.round(n * 10) / 10;
  return r.toString();
}

function rangoBadge(dosis: number, min: number, max: number) {
  if (dosis < min) return { texto: `Por debajo del rango habitual (${min}–${max} mg/día)`, cls: "text-sky-600" };
  if (dosis > max) return { texto: `Por encima del rango habitual (${min}–${max} mg/día)`, cls: "text-red-600" };
  return { texto: `Dentro del rango habitual (${min}–${max} mg/día)`, cls: "text-emerald-600" };
}

/* ===================== COMPONENTE ===================== */

export default function EquivalenciasAntipsicoticosPage() {
  const [origenId, setOrigenId]   = useState("");
  const [destinoId, setDestinoId] = useState("");
  const [dosis, setDosis]         = useState("");
  const [copiado, setCopiado]     = useState(false);

  const origen  = FARMACOS.find(f => f.id === origenId)  ?? null;
  const destino = FARMACOS.find(f => f.id === destinoId) ?? null;
  const dosisNum = parseFloat(dosis);

  const cpzEq      = origen && dosisNum > 0 ? (dosisNum / origen.cpzEq) * 100 : null;
  const dosisDest  = cpzEq !== null && destino ? (cpzEq / 100) * destino.cpzEq : null;
  const banda      = cpzEq !== null ? cpzBand(cpzEq) : null;
  const rangoInfo  = dosisDest !== null && destino ? rangoBadge(dosisDest, destino.dosisMin, destino.dosisMax) : null;

  function limpiar() { setOrigenId(""); setDestinoId(""); setDosis(""); }

  function copiar() {
    if (!origen || !destino || dosisDest === null || cpzEq === null) return;
    const texto =
      `Equivalencia antipsicótica\n` +
      `${dosisNum} mg/día de ${origen.nombre} ≈ ${fmt(dosisDest)} mg/día de ${destino.nombre}\n` +
      `Equivalente CPZ: ${Math.round(cpzEq)} mg/día`;
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  const hayResultado = dosisDest !== null && cpzEq !== null && banda;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-5">

        <div>
          <h1 className="text-2xl font-semibold">Equivalencias de antipsicóticos</h1>
          <p className="text-sm text-slate-500 mt-1">
            Basado en Gardner et al. 2010 <em>(Am J Psychiatry)</em> · Leucht et al. 2016 <em>(Schizophrenia Bulletin)</em> · Maudsley 14.ª ed.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 leading-relaxed">
          Las equivalencias son <strong>orientativas y aproximadas</strong>. Reflejan potencia antipsicótica relativa en esquizofrenia; no tienen en cuenta diferencias en perfil de efectos adversos ni son aplicables a formulaciones depot. Dosis siempre de forma gradual al cambiar de antipsicótico.
        </div>

        {/* ── Calculadora ── */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <p className="text-sm font-semibold text-slate-800">Calculadora</p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_32px_1fr]">

            {/* Origen */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Fármaco origen</label>
              <select
                value={origenId}
                onChange={e => setOrigenId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="">— Selecciona —</option>
                <optgroup label="Segunda generación">
                  {FARMACOS.filter(f => f.grupo === "SGA").map(f => (
                    <option key={f.id} value={f.id}>{f.nombre}</option>
                  ))}
                </optgroup>
                <optgroup label="Primera generación">
                  {FARMACOS.filter(f => f.grupo === "FGA").map(f => (
                    <option key={f.id} value={f.id}>{f.nombre}</option>
                  ))}
                </optgroup>
              </select>

              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={dosis}
                  onChange={e => setDosis(e.target.value)}
                  placeholder="Dosis (mg/día)"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 pointer-events-none">mg/día</span>
              </div>

              {origen && dosisNum > 0 && (
                <p className="text-xs text-slate-400">
                  Rango habitual: {origen.dosisMin}–{origen.dosisMax} mg/día
                </p>
              )}
            </div>

            {/* Flecha central */}
            <div className="hidden md:flex items-center justify-center text-slate-200 pt-7">
              <ArrowRight className="w-5 h-5" />
            </div>

            {/* Destino */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Fármaco destino</label>
              <select
                value={destinoId}
                onChange={e => setDestinoId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="">— Selecciona —</option>
                <optgroup label="Segunda generación">
                  {FARMACOS.filter(f => f.grupo === "SGA").map(f => (
                    <option key={f.id} value={f.id}>{f.nombre}</option>
                  ))}
                </optgroup>
                <optgroup label="Primera generación">
                  {FARMACOS.filter(f => f.grupo === "FGA").map(f => (
                    <option key={f.id} value={f.id}>{f.nombre}</option>
                  ))}
                </optgroup>
              </select>

              {dosisDest !== null && destino ? (
                <>
                  <div className="rounded-lg bg-slate-800 text-white px-4 py-3">
                    <p className="text-2xl font-bold tracking-tight">
                      {fmt(dosisDest)}{" "}
                      <span className="text-sm font-normal text-slate-400">mg/día</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{destino.nombre}</p>
                  </div>
                  {rangoInfo && (
                    <p className={`text-xs ${rangoInfo.cls}`}>{rangoInfo.texto}</p>
                  )}
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-slate-300 text-sm text-center">
                  —
                </div>
              )}
            </div>
          </div>

          {/* CPZ equivalente */}
          {hayResultado && banda && cpzEq !== null && (
            <div className={`rounded-lg border px-4 py-3 flex items-center justify-between gap-4 ${banda.cls}`}>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5 opacity-70">
                  Equivalente en clorpromazina
                </p>
                <p className="text-xl font-bold">{Math.round(cpzEq)} mg CPZ/día</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${banda.cls}`}>
                {banda.label}
              </span>
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-3 pt-1">
            {hayResultado && origen && destino && (
              <button
                onClick={copiar}
                className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  copiado
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-400"
                }`}
              >
                {copiado ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiado ? "Copiado" : "Copiar resultado"}
              </button>
            )}
            {(origenId || destinoId || dosis) && (
              <button
                onClick={limpiar}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* ── Tabla de referencia ── */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">Tabla de referencia (equivalentes CPZ)</p>
          <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
            <table className="min-w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-4 py-3 text-left font-semibold">Fármaco</th>
                  <th className="px-3 py-3 text-center font-semibold whitespace-nowrap">Eq. CPZ</th>
                  <th className="px-3 py-3 text-center font-semibold whitespace-nowrap">Rango habitual (oral)</th>
                </tr>
              </thead>
              <tbody>
                {(["SGA", "FGA"] as const).map(grupo => (
                  <Fragment key={grupo}>
                    <tr className="bg-slate-200">
                      <td colSpan={3} className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-800">
                        {grupo === "SGA" ? "Segunda generación" : "Primera generación"}
                      </td>
                    </tr>
                    {FARMACOS.filter(f => f.grupo === grupo).map((f, idx) => (
                      <tr
                        key={f.id}
                        className={`border-t border-slate-100 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                      >
                        <td className="px-4 py-2.5 font-medium text-slate-800">{f.nombre}</td>
                        <td className="px-3 py-2.5 text-center text-slate-700">
                          {f.cpzEq} mg ≡ 100 mg CPZ
                        </td>
                        <td className="px-3 py-2.5 text-center text-slate-600">
                          {f.dosisMin}–{f.dosisMax} mg/día
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notas */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-xs text-slate-600 space-y-1.5 leading-relaxed">
          <p className="font-semibold text-slate-700 mb-1">Notas clínicas</p>
          <p>· <strong>Eq. CPZ</strong>: dosis del fármaco terapéuticamente equivalente a 100 mg de clorpromazina en esquizofrenia aguda.</p>
          <p>· Cálculo: CPZ-eq = dosis × (100 ÷ Eq. CPZ). Dosis equivalente = CPZ-eq × (Eq. CPZ destino ÷ 100).</p>
          <p>· <strong>Dosis alta</strong> se define convencionalmente como &gt; 600 mg CPZ-eq/día; el límite de seguridad absoluto es 1 000 mg CPZ-eq/día (RCPsych).</p>
          <p>· <strong>Quetiapina</strong> y <strong>clozapina</strong> presentan mayor variabilidad según la fuente — manejar con especial precaución clínica.</p>
          <p>· No aplicable a formulaciones <strong>depot (LAI)</strong>; para estas, consultar la herramienta específica de depósito.</p>
          <p>· Fuentes: Gardner et al. 2010 <em>Am J Psychiatry</em> 167:686 · Leucht et al. 2016 <em>Schizophrenia Bull</em> 41:1397 · Maudsley Prescribing Guidelines 14.ª ed.</p>
        </div>

        <p className="text-xs text-slate-400 text-center pb-4">
          Herramienta orientativa · No sustituye el criterio clínico
        </p>

      </div>
    </div>
  );
}

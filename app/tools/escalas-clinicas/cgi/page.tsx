"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, ArrowLeft, RotateCcw, Copy, Check } from "lucide-react";

/* ===================== DATOS ===================== */

const CGI_S = [
  { valor: 1, etiqueta: "1 — Normal, no está enfermo/a" },
  { valor: 2, etiqueta: "2 — Borderline, en el límite de la enfermedad mental" },
  { valor: 3, etiqueta: "3 — Levemente enfermo/a" },
  { valor: 4, etiqueta: "4 — Moderadamente enfermo/a" },
  { valor: 5, etiqueta: "5 — Marcadamente enfermo/a" },
  { valor: 6, etiqueta: "6 — Gravemente enfermo/a" },
  { valor: 7, etiqueta: "7 — Entre los pacientes más graves" },
];

const CGI_I = [
  { valor: 1, etiqueta: "1 — Muy mejorado/a" },
  { valor: 2, etiqueta: "2 — Moderadamente mejorado/a" },
  { valor: 3, etiqueta: "3 — Mínimamente mejorado/a" },
  { valor: 4, etiqueta: "4 — Sin cambios" },
  { valor: 5, etiqueta: "5 — Mínimamente empeorado/a" },
  { valor: 6, etiqueta: "6 — Moderadamente empeorado/a" },
  { valor: 7, etiqueta: "7 — Muy empeorado/a" },
];

function colorS(v: number) {
  if (v <= 2) return { bg: "bg-green-50", border: "border-green-300", text: "text-green-700" };
  if (v <= 3) return { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700" };
  if (v <= 4) return { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700" };
  if (v <= 5) return { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700" };
  return { bg: "bg-red-50", border: "border-red-300", text: "text-red-700" };
}

function colorI(v: number) {
  if (v <= 2) return { bg: "bg-green-50", border: "border-green-300", text: "text-green-700" };
  if (v === 3) return { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700" };
  if (v === 4) return { bg: "bg-slate-50", border: "border-slate-300", text: "text-slate-700" };
  if (v === 5) return { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700" };
  if (v === 6) return { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700" };
  return { bg: "bg-red-50", border: "border-red-300", text: "text-red-700" };
}

/* ===================== COMPONENTE ===================== */

export default function CgiPage() {
  const [gravedad, setGravedad] = useState<number | null>(null);
  const [cambio, setCambio] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  function reset() {
    setGravedad(null);
    setCambio(null);
    setCopied(false);
  }

  function copiar() {
    const etS = gravedad ? CGI_S.find(i => i.valor === gravedad)?.etiqueta : "No evaluado";
    const etI = cambio ? CGI_I.find(i => i.valor === cambio)?.etiqueta : "No evaluado";
    const texto =
      `CGI — Impresión Clínica Global\n` +
      `\nCGI-S (Gravedad): ${etS}` +
      `\nCGI-I (Cambio global): ${etI}`;
    navigator.clipboard.writeText(texto);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const estiloS = gravedad ? colorS(gravedad) : null;
  const estiloI = cambio ? colorI(cambio) : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Volver */}
        <Link
          href="/tools/escalas-clinicas"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Escalas Clínicas
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3">
          <Activity className="w-7 h-7 text-slate-700" />
          <div>
            <h1 className="text-2xl font-semibold">CGI</h1>
            <p className="text-sm text-slate-600">Impresión Clínica Global</p>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
          Escala de valoración global realizada por el clínico. Evalúa la gravedad actual
          del cuadro (CGI-S) y el cambio respecto a la evaluación previa (CGI-I).
          Selecciona una opción en cada subescala.
        </div>

        {/* ── CGI-S ── */}
        <div>
          <h2 className="text-base font-semibold text-slate-800 mb-1">
            CGI-S — Gravedad de la enfermedad
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Teniendo en cuenta su experiencia clínica, ¿cómo de grave es el estado mental del paciente en este momento?
          </p>
          <div className="space-y-2">
            {CGI_S.map((item) => {
              const sel = gravedad === item.valor;
              return (
                <button
                  key={item.valor}
                  onClick={() => setGravedad(item.valor)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                    sel
                      ? "bg-slate-800 text-white border-slate-800 font-medium"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  {item.etiqueta}
                </button>
              );
            })}
          </div>
          {gravedad && estiloS && (
            <div className={`mt-3 rounded-lg px-4 py-2.5 border ${estiloS.bg} ${estiloS.border}`}>
              <p className={`text-sm font-medium ${estiloS.text}`}>
                CGI-S: {gravedad} — {CGI_S.find(i => i.valor === gravedad)?.etiqueta.split(" — ")[1]}
              </p>
            </div>
          )}
        </div>

        {/* ── CGI-I ── */}
        <div>
          <h2 className="text-base font-semibold text-slate-800 mb-1">
            CGI-I — Cambio global
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            En comparación con el estado del paciente al inicio del tratamiento o la última evaluación, ¿cómo ha cambiado?
          </p>
          <div className="space-y-2">
            {CGI_I.map((item) => {
              const sel = cambio === item.valor;
              return (
                <button
                  key={item.valor}
                  onClick={() => setCambio(item.valor)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                    sel
                      ? "bg-slate-800 text-white border-slate-800 font-medium"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  {item.etiqueta}
                </button>
              );
            })}
          </div>
          {cambio && estiloI && (
            <div className={`mt-3 rounded-lg px-4 py-2.5 border ${estiloI.bg} ${estiloI.border}`}>
              <p className={`text-sm font-medium ${estiloI.text}`}>
                CGI-I: {cambio} — {CGI_I.find(i => i.valor === cambio)?.etiqueta.split(" — ")[1]}
              </p>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-2 pt-2 pb-4">
          <button
            onClick={copiar}
            disabled={!gravedad && !cambio}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            Copiar resultado
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded hover:bg-slate-100 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Limpiar
          </button>
        </div>

      </div>
    </div>
  );
}

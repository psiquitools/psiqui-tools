"use client";

import { useState, useMemo } from "react";
import { Activity, RotateCcw, Copy, Check, AlertCircle } from "lucide-react";

/* ===================== DATOS ===================== */

const IDEACION_ITEMS = [
  {
    id: "i1",
    tipo: 1,
    titulo: "Deseos de estar muerto",
    pregunta:
      "¿Ha deseado estar muerto o dormirse para no despertar?",
  },
  {
    id: "i2",
    tipo: 2,
    titulo: "Pensamientos suicidas inespecíficos",
    pregunta:
      "¿Ha tenido pensamientos de hacerse daño o de quitarse la vida?",
  },
  {
    id: "i3",
    tipo: 3,
    titulo: "Ideación con método (sin plan ni intención de actuar)",
    pregunta:
      "¿Ha pensado en algún método para quitarse la vida, sin intención de llevarlo a cabo?",
  },
  {
    id: "i4",
    tipo: 4,
    titulo: "Ideación con intención de actuar",
    pregunta:
      "¿Ha tenido pensamientos de suicidarse y alguna intención de actuar en consecuencia?",
  },
  {
    id: "i5",
    tipo: 5,
    titulo: "Ideación con plan específico e intención",
    pregunta:
      "¿Ha comenzado a preparar los detalles de cómo quitarse la vida y tiene intención de llevar a cabo ese plan?",
  },
];

const CONDUCTA_ITEMS = [
  {
    id: "c1",
    titulo: "Intento real de suicidio",
    pregunta:
      "¿Ha intentado suicidarse?",
  },
  {
    id: "c2",
    titulo: "Intento interrumpido",
    pregunta:
      "¿Ha iniciado una conducta suicida que fue interrumpida por circunstancias externas antes de poder hacerse daño?",
  },
  {
    id: "c3",
    titulo: "Intento abortado",
    pregunta:
      "¿Inició conductas preparatorias para suicidarse pero las interrumpió por decisión propia antes de hacerse daño?",
  },
  {
    id: "c4",
    titulo: "Conductas preparatorias",
    pregunta:
      "¿Ha realizado actos preparatorios para suicidarse (conseguir medios, poner en orden asuntos, despedirse)?",
  },
  {
    id: "c5",
    titulo: "Autolesiones sin intención suicida",
    pregunta:
      "¿Se ha hecho daño a propósito sin intención de suicidarse (cortarse, quemarse, golpearse)?",
  },
];

/* ===================== RIESGO ===================== */

type RiesgoNivel = "ninguno" | "bajo" | "moderado" | "alto" | "muy_alto";

function calcularRiesgo(
  ideacion: Record<string, boolean | null>,
  conducta: Record<string, boolean | null>
): { nivel: RiesgoNivel; etiqueta: string; descripcion: string; color: string; border: string; texto: string } {
  const maxIdeacion = IDEACION_ITEMS.reduce(
    (max, item) => (ideacion[item.id] === true ? Math.max(max, item.tipo) : max),
    0
  );
  const tieneConducataSuicida = ["c1", "c2", "c3", "c4"].some(id => conducta[id] === true);
  const tieneAutolesion = conducta["c5"] === true;

  if (maxIdeacion === 0 && !tieneConducataSuicida && !tieneAutolesion) {
    return { nivel: "ninguno", etiqueta: "Sin ideación ni conducta activa", descripcion: "No se identifica ideación suicida ni conducta en el período evaluado.", color: "bg-slate-50", border: "border-slate-200", texto: "text-slate-700" };
  }
  if (maxIdeacion >= 4 || (maxIdeacion >= 3 && tieneConducataSuicida) || tieneConducataSuicida && maxIdeacion >= 3) {
    if (maxIdeacion === 5 && tieneConducataSuicida) {
      return { nivel: "muy_alto", etiqueta: "Riesgo muy alto", descripcion: "Ideación activa con plan e intención y conducta suicida presente. Requiere actuación inmediata.", color: "bg-red-50", border: "border-red-400", texto: "text-red-800" };
    }
    return { nivel: "alto", etiqueta: "Riesgo alto", descripcion: "Ideación activa con intención de actuar o conducta suicida presente. Evaluación urgente.", color: "bg-red-50", border: "border-red-300", texto: "text-red-700" };
  }
  if (maxIdeacion >= 4) {
    return { nivel: "alto", etiqueta: "Riesgo alto", descripcion: "Ideación activa con intención de actuar. Evaluación urgente.", color: "bg-red-50", border: "border-red-300", texto: "text-red-700" };
  }
  if (maxIdeacion === 3 || tieneConducataSuicida) {
    return { nivel: "moderado", etiqueta: "Riesgo moderado", descripcion: "Ideación activa con método identificado o conducta presente. Evaluación especializada indicada.", color: "bg-orange-50", border: "border-orange-300", texto: "text-orange-700" };
  }
  if (maxIdeacion === 2) {
    return { nivel: "bajo", etiqueta: "Riesgo bajo-moderado", descripcion: "Ideación activa inespecífica. Seguimiento estrecho y evaluación de factores de riesgo.", color: "bg-yellow-50", border: "border-yellow-300", texto: "text-yellow-700" };
  }
  // maxIdeacion === 1 o solo autolesiones
  return { nivel: "bajo", etiqueta: "Riesgo bajo", descripcion: "Ideación pasiva sin planificación ni intención. Seguimiento clínico habitual.", color: "bg-blue-50", border: "border-blue-300", texto: "text-blue-700" };
}

/* ===================== COMPONENTE ===================== */

type Respuesta = true | false | null;

function BotonesRespuesta({
  valor,
  onChange,
}: {
  valor: Respuesta;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex gap-2 mt-3">
      <button
        onClick={() => onChange(true)}
        className={`px-5 py-2 rounded text-sm font-medium border transition-colors ${
          valor === true
            ? "bg-red-600 text-white border-red-600"
            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
        }`}
      >
        Sí
      </button>
      <button
        onClick={() => onChange(false)}
        className={`px-5 py-2 rounded text-sm font-medium border transition-colors ${
          valor === false
            ? "bg-slate-800 text-white border-slate-800"
            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
        }`}
      >
        No
      </button>
    </div>
  );
}

export default function CssrsPage() {
  const [ideacion, setIdeacion] = useState<Record<string, Respuesta>>(
    Object.fromEntries(IDEACION_ITEMS.map(i => [i.id, null]))
  );
  const [conducta, setConducta] = useState<Record<string, Respuesta>>(
    Object.fromEntries(CONDUCTA_ITEMS.map(i => [i.id, null]))
  );
  const [copied, setCopied] = useState(false);

  const todasRespondidas =
    Object.values(ideacion).every(v => v !== null) &&
    Object.values(conducta).every(v => v !== null);

  const riesgo = useMemo(() => calcularRiesgo(ideacion, conducta), [ideacion, conducta]);

  const maxTipo = useMemo(
    () => IDEACION_ITEMS.reduce((max, item) => (ideacion[item.id] === true ? Math.max(max, item.tipo) : max), 0),
    [ideacion]
  );

  function reset() {
    setIdeacion(Object.fromEntries(IDEACION_ITEMS.map(i => [i.id, null])));
    setConducta(Object.fromEntries(CONDUCTA_ITEMS.map(i => [i.id, null])));
    setCopied(false);
  }

  function copiar() {
    const lineas: string[] = [
      "C-SSRS — Escala de Gravedad de la Conducta Suicida de Columbia",
      `Período evaluado: último mes`,
      "",
      "IDEACIÓN SUICIDA",
      ...IDEACION_ITEMS.map(
        item => `  ${item.tipo}. ${item.titulo}: ${ideacion[item.id] === true ? "Sí" : ideacion[item.id] === false ? "No" : "—"}`
      ),
      `  Tipo de ideación más alta: ${maxTipo > 0 ? maxTipo : "Ninguna"}`,
      "",
      "CONDUCTA SUICIDA",
      ...CONDUCTA_ITEMS.map(
        item => `  ${item.titulo}: ${conducta[item.id] === true ? "Sí" : conducta[item.id] === false ? "No" : "—"}`
      ),
      "",
      `NIVEL DE RIESGO: ${riesgo.etiqueta}`,
      riesgo.descripcion,
    ];
    navigator.clipboard.writeText(lineas.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Activity className="w-7 h-7 text-slate-700" />
          <div>
            <h1 className="text-2xl font-semibold">C-SSRS</h1>
            <p className="text-sm text-slate-600">
              Escala de Gravedad de la Conducta Suicida de Columbia
            </p>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900 space-y-1">
          <p><strong>Período de referencia:</strong> último mes (o desde la última visita en seguimiento).</p>
          <p>Preguntar de forma directa y en orden. Cada categoría representa mayor gravedad.</p>
        </div>

        {/* ── Sección 1: Ideación ── */}
        <div>
          <h2 className="text-base font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-200">
            Ideación suicida
          </h2>
          <div className="space-y-3">
            {IDEACION_ITEMS.map((item) => (
              <div
                key={item.id}
                className={`bg-white border rounded-lg p-4 ${
                  ideacion[item.id] === true ? "border-red-300" : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`text-xs font-bold mt-0.5 w-5 flex-shrink-0 ${
                    ideacion[item.id] === true ? "text-red-600" : "text-slate-400"
                  }`}>
                    {item.tipo}.
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">
                      {item.titulo}
                    </p>
                    <p className="text-sm text-slate-800">{item.pregunta}</p>
                    <BotonesRespuesta
                      valor={ideacion[item.id]}
                      onChange={(v) => setIdeacion(prev => ({ ...prev, [item.id]: v }))}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sección 2: Conducta ── */}
        <div>
          <h2 className="text-base font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-200">
            Conducta suicida y autolesiva
          </h2>
          <div className="space-y-3">
            {CONDUCTA_ITEMS.map((item) => (
              <div
                key={item.id}
                className={`bg-white border rounded-lg p-4 ${
                  conducta[item.id] === true ? "border-red-300" : "border-slate-200"
                }`}
              >
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">
                  {item.titulo}
                </p>
                <p className="text-sm text-slate-800">{item.pregunta}</p>
                <BotonesRespuesta
                  valor={conducta[item.id]}
                  onChange={(v) => setConducta(prev => ({ ...prev, [item.id]: v }))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Resultado ── */}
        <div className={`rounded-lg p-5 border-2 ${riesgo.color} ${riesgo.border}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">Nivel de riesgo</span>
            {(riesgo.nivel === "alto" || riesgo.nivel === "muy_alto") && (
              <AlertCircle className={`w-5 h-5 ${riesgo.texto}`} />
            )}
          </div>
          <p className={`text-lg font-bold mb-1 ${riesgo.texto}`}>{riesgo.etiqueta}</p>
          {maxTipo > 0 && (
            <p className="text-xs text-slate-600 mb-1">
              Tipo de ideación más alta: <strong>{maxTipo}</strong> — {IDEACION_ITEMS.find(i => i.tipo === maxTipo)?.titulo}
            </p>
          )}
          <p className="text-sm text-slate-700 mb-4">{riesgo.descripcion}</p>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={copiar}
              disabled={!todasRespondidas}
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

        <p className="text-xs text-slate-400 text-center pb-4">
          Herramienta de apoyo clínico · No sustituye el criterio médico profesional
        </p>
      </div>
    </div>
  );
}

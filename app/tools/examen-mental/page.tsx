"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Brain, Download, ArrowLeft, ChevronLeft, ChevronRight, Check, AlertTriangle,
} from "lucide-react";
import jsPDF from "jspdf";

/* ==================== TIPOS ==================== */

type SeccionData = { opciones: string[]; texto: string };

type ExamenMentalData = {
  aspecto: SeccionData;
  conciencia: SeccionData;
  orientacion: SeccionData;
  contacto: SeccionData;
  psicomotricidad: SeccionData;
  sustancias: SeccionData;
  discurso: SeccionData;
  humor: SeccionData;
  afecto: SeccionData;
  hedonia: SeccionData;
  pensamiento: SeccionData;
  sensopercepcion: SeccionData;
  riesgo: SeccionData;
  biorritmos: SeccionData;
  juicioInsight: SeccionData;
};

/* ==================== ESTADO INICIAL ==================== */

const estadoInicial: ExamenMentalData = {
  aspecto: { opciones: [], texto: "" },
  conciencia: { opciones: [], texto: "" },
  orientacion: { opciones: [], texto: "" },
  contacto: { opciones: [], texto: "" },
  psicomotricidad: { opciones: [], texto: "" },
  sustancias: { opciones: [], texto: "" },
  discurso: { opciones: [], texto: "" },
  humor: { opciones: [], texto: "" },
  afecto: { opciones: [], texto: "" },
  hedonia: { opciones: [], texto: "" },
  pensamiento: { opciones: [], texto: "" },
  sensopercepcion: { opciones: [], texto: "" },
  riesgo: { opciones: [], texto: "" },
  biorritmos: { opciones: [], texto: "" },
  juicioInsight: { opciones: [], texto: "" },
};

/* ==================== OPCIONES AGRUPADAS ==================== */

type GrupoOpciones = { label: string; opciones: string[] };

const seccionesAgrupadas: Record<keyof ExamenMentalData, GrupoOpciones[]> = {
  aspecto: [
    { label: "Aspecto general", opciones: [
      "Cuidado", "Descuidado", "Acorde a la situación",
      "Aparenta la edad referida", "Aparenta más edad", "Aparenta menos edad",
    ]},
  ],
  conciencia: [
    { label: "Nivel de conciencia", opciones: [
      "Consciente", "Obnubilación leve", "Obnubilación moderada",
      "Obnubilación grave", "Estuporoso",
    ]},
  ],
  orientacion: [
    { label: "Orientación", opciones: [
      "Orientado globalmente", "Orientado en las tres esferas",
      "Desorientado en tiempo", "Desorientado en espacio", "Desorientado en persona",
    ]},
  ],
  contacto: [
    { label: "Colaboración", opciones: [
      "Colaborador y atento", "Colaborador parcial", "Actitud reservada",
      "Suspicaz", "Hostil", "Negativista",
    ]},
    { label: "Contacto", opciones: [
      "Contacto sintónico", "Contacto distante", "Escasa reciprocidad emocional",
    ]},
  ],
  psicomotricidad: [
    { label: "Sin alteraciones", opciones: ["Sin alteraciones de la psicomotricidad"] },
    { label: "Aumentada", opciones: [
      "Inquietud psicomotriz leve", "Inquietud psicomotriz moderada", "Agitación psicomotriz",
    ]},
    { label: "Disminuida", opciones: ["Enlentecimiento psicomotor", "Inhibición motora"] },
  ],
  sustancias: [
    { label: "Estado", opciones: [
      "Sin signos ni síntomas de intoxicación ni abstinencia",
      "Signos de intoxicación",
      "Síntomas de abstinencia leves",
      "Síntomas de abstinencia moderados",
      "Síntomas de abstinencia graves",
    ]},
  ],
  discurso: [
    { label: "Cantidad", opciones: [
      "Espontáneo", "Cantidad conservada", "Cantidad aumentada / logorrea",
      "Cantidad disminuida", "Mutismo",
    ]},
    { label: "Ritmo", opciones: [
      "Fluido", "Acelerado / taquipsiquia", "Enlentecido / bradipsiquia", "Latencia aumentada",
    ]},
    { label: "Forma", opciones: [
      "Coherente", "Bien estructurado", "Bien articulado",
      "Tangencial", "Circunstancial", "Disgregado", "Incoherente",
    ]},
  ],
  humor: [
    { label: "Humor", opciones: [
      "Eutímico", "Hipotimia leve", "Hipotimia moderada", "Humor depresivo",
      "Disfórico", "Eufórico", "Expansivo", "Ansioso", "Lábil",
    ]},
  ],
  afecto: [
    { label: "Expresividad", opciones: [
      "Reactivo", "Rango amplio", "Rango restringido", "Aplanado", "Embotado",
    ]},
    { label: "Congruencia", opciones: [
      "Congruente con el discurso", "Incongruente con el discurso",
    ]},
    { label: "Resonancia afectiva", opciones: [
      "Resonancia afectiva conservada", "Resonancia afectiva disminuida", "Resonancia afectiva ausente",
    ]},
  ],
  hedonia: [
    { label: "Conservada", opciones: [
      "Interés conservado", "Ilusión conservada", "Capacidad de disfrute conservada",
    ]},
    { label: "Disminuida / ausente", opciones: [
      "Pérdida del interés", "Pérdida de la ilusión",
      "Pérdida de la capacidad de disfrute", "Anhedonia completa",
    ]},
  ],
  pensamiento: [
    { label: "Curso", opciones: [
      "Sin alteraciones del curso", "Taquipsiquia", "Bradipsiquia",
      "Fuga de ideas", "Bloqueo del pensamiento", "Perseveración", "Pobreza del pensamiento",
    ]},
    { label: "Forma", opciones: [
      "Sin alteraciones de la forma", "Tangencial", "Circunstancial",
      "Disgregado", "Incoherente", "Pensamiento concreto", "Neologismos",
    ]},
    { label: "Contenido", opciones: [
      "Sin ideas delirantes ni obsesivas",
      "Ideación de perjuicio", "Ideación persecutoria", "Ideación autorreferencial",
      "Ideación de grandiosidad", "Ideación celotípica", "Ideación somática",
      "Ideas de minusvalía", "Ideas de culpa", "Ideas de desesperanza", "Ideas nihilistas",
      "Ideas obsesivas", "Ideas sobrevaloradas",
      "Inserción del pensamiento", "Robo del pensamiento", "Difusión del pensamiento",
    ]},
  ],
  sensopercepcion: [
    { label: "Estado general", opciones: ["Sin alteraciones de la sensopercepción"] },
    { label: "Auditivas", opciones: [
      "Alucinaciones auditivas en segunda persona", "Alucinaciones auditivas en tercera persona",
      "Contenido insultante", "Contenido imperativo",
    ]},
    { label: "Otras", opciones: [
      "Alucinaciones visuales", "Alucinaciones olfativas", "Pseudoalucinaciones", "Ilusiones",
    ]},
  ],
  riesgo: [
    { label: "Ideación autolítica", opciones: [
      "Sin ideación autolítica",
      "Ideación pasiva de muerte",
      "Ideación autolítica sin planificación",
      "Ideación autolítica con planificación",
      "Ideación autolítica con intencionalidad activa",
      "Egodistónica", "Egosintónica",
    ]},
    { label: "Conductas autolesivas", opciones: [
      "Sin conductas autolesivas",
      "Conductas autolesivas sin intencionalidad suicida (NSSI)",
    ]},
    { label: "Heteroagresividad", opciones: [
      "Sin ideación heteroagresiva", "Ideación heteroagresiva presente",
    ]},
  ],
  biorritmos: [
    { label: "Sueño", opciones: [
      "Sueño conservado", "Insomnio de conciliación", "Insomnio de mantenimiento",
      "Despertar precoz", "Hipersomnia", "Inversión del ritmo sueño-vigilia",
    ]},
    { label: "Apetito", opciones: [
      "Apetito conservado", "Hiporexia", "Anorexia con pérdida ponderal",
      "Hiperfagia", "Aumento ponderal",
    ]},
  ],
  juicioInsight: [
    { label: "Juicio de la realidad", opciones: [
      "Juicio de la realidad conservado",
      "Juicio de la realidad parcialmente comprometido",
      "Juicio de la realidad gravemente comprometido",
    ]},
    { label: "Insight", opciones: [
      "Insight conservado",
      "Insight parcial: reconoce el malestar pero minimiza la gravedad",
      "Insight parcial: reconoce la enfermedad pero no la necesidad de tratamiento",
      "Insight ausente: sin conciencia de enfermedad",
      "Insight ausente: sin conciencia de necesidad de tratamiento",
    ]},
  ],
};

const gridCols: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
};

/* ==================== RIESGO ALTO ==================== */

const OPCIONES_RIESGO_ALTO = [
  "Ideación autolítica sin planificación",
  "Ideación autolítica con planificación",
  "Ideación autolítica con intencionalidad activa",
];

/* ==================== SECCIONES ==================== */

const secciones: { key: keyof ExamenMentalData; titulo: string }[] = [
  { key: "aspecto",         titulo: "Aspecto" },
  { key: "conciencia",      titulo: "Conciencia" },
  { key: "orientacion",     titulo: "Orientación" },
  { key: "contacto",        titulo: "Contacto" },
  { key: "psicomotricidad", titulo: "Psicomotricidad" },
  { key: "sustancias",      titulo: "Intoxicación / Abstinencia" },
  { key: "discurso",        titulo: "Discurso" },
  { key: "humor",           titulo: "Humor" },
  { key: "afecto",          titulo: "Afecto" },
  { key: "hedonia",         titulo: "Capacidad Hedónica" },
  { key: "pensamiento",     titulo: "Pensamiento" },
  { key: "sensopercepcion", titulo: "Sensopercepción" },
  { key: "riesgo",          titulo: "Riesgo" },
  { key: "biorritmos",      titulo: "Biorritmos" },
  { key: "juicioInsight",   titulo: "Juicio e Insight" },
];

const TOTAL = secciones.length;

/* ==================== GENERADORES DE TEXTO ==================== */

type GenFn = (opciones: string[], texto: string) => string;

const lc = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

const unir = (items: string[]): string => {
  const f = items.filter(Boolean);
  if (!f.length) return "";
  if (f.length === 1) return f[0];
  if (f.length === 2) return `${f[0]} y ${f[1]}`;
  return `${f.slice(0, -1).join(", ")} y ${f[f.length - 1]}`;
};

const defaultGen: GenFn = (opciones, texto) =>
  unir([...opciones, texto.trim()].filter(Boolean));

const discursoGen: GenFn = (opciones, texto) => {
  const items = [...opciones.map(lc), texto.trim()].filter(Boolean);
  return items.length ? `Discurso ${unir(items)}` : "";
};

const humorGen: GenFn = (opciones, texto) => {
  const items = [...opciones.map(lc), texto.trim()].filter(Boolean);
  return items.length ? `Humor ${unir(items)}` : "";
};

const afectoGen: GenFn = (opciones, texto) => {
  const items = [...opciones.map(lc), texto.trim()].filter(Boolean);
  return items.length ? `Afecto ${unir(items)}` : "";
};

const hedoniaGen: GenFn = (opciones, texto) => {
  if (opciones.includes("Anhedonia completa") && !texto.trim())
    return "Anhedonia completa";

  const perdidas = opciones.filter(o =>
    ["Pérdida del interés", "Pérdida de la ilusión", "Pérdida de la capacidad de disfrute"].includes(o)
  );
  const otros = opciones.filter(o => !perdidas.includes(o));
  const frases: string[] = [];

  if (perdidas.length === 1) frases.push(perdidas[0]);
  else if (perdidas.length === 2) {
    const sufijos = perdidas.map(o =>
      o === "Pérdida del interés" ? "el interés"
      : o === "Pérdida de la ilusión" ? "la ilusión"
      : "la capacidad de disfrute"
    );
    frases.push(`Pérdida de ${unir(sufijos)}`);
  } else if (perdidas.length === 3) {
    frases.push("Pérdida del interés, la ilusión y la capacidad de disfrute");
  }

  if (otros.length) frases.push(unir(otros));
  if (texto.trim()) frases.push(texto.trim());
  return frases.join(". ");
};

const pensamientoGen: GenFn = (opciones, texto) => {
  const CURSO = new Set(["Sin alteraciones del curso", "Taquipsiquia", "Bradipsiquia", "Fuga de ideas", "Bloqueo del pensamiento", "Perseveración", "Pobreza del pensamiento"]);
  const FORMA = new Set(["Sin alteraciones de la forma", "Tangencial", "Circunstancial", "Disgregado", "Incoherente", "Pensamiento concreto", "Neologismos"]);

  const curso    = opciones.filter(o => CURSO.has(o));
  const forma    = opciones.filter(o => FORMA.has(o));
  const contenido = opciones.filter(o => !CURSO.has(o) && !FORMA.has(o));

  const todoNormal =
    curso.length === 1 && curso[0] === "Sin alteraciones del curso" &&
    forma.length === 1 && forma[0] === "Sin alteraciones de la forma" &&
    contenido.length === 1 && contenido[0] === "Sin ideas delirantes ni obsesivas" &&
    !texto.trim();

  if (todoNormal) return "Sin alteraciones del pensamiento en curso, forma ni contenido";

  const frases: string[] = [];

  if (curso.length) {
    const alt = curso.filter(o => o !== "Sin alteraciones del curso");
    frases.push(alt.length ? unir(alt) : "Curso sin alteraciones");
  }
  if (forma.length) {
    const alt = forma.filter(o => o !== "Sin alteraciones de la forma");
    frases.push(alt.length ? unir(alt) : "Forma sin alteraciones");
  }
  if (contenido.length) frases.push(unir(contenido));
  if (texto.trim()) frases.push(texto.trim());

  return frases.join(". ");
};

const sensopercepcionGen: GenFn = (opciones, texto) => {
  if (opciones.includes("Sin alteraciones de la sensopercepción") && opciones.length === 1 && !texto.trim())
    return "Sin alteraciones de la sensopercepción";

  const PERSONA  = new Set(["Alucinaciones auditivas en segunda persona", "Alucinaciones auditivas en tercera persona"]);
  const CONTENIDO = new Set(["Contenido insultante", "Contenido imperativo"]);

  const persona   = opciones.filter(o => PERSONA.has(o));
  const contenido = opciones.filter(o => CONTENIDO.has(o));
  const otras     = opciones.filter(o => o !== "Sin alteraciones de la sensopercepción" && !PERSONA.has(o) && !CONTENIDO.has(o));

  const frases: string[] = [];

  if (persona.length || contenido.length) {
    const base = persona.length ? unir(persona) : "Alucinaciones auditivas";
    const cont = contenido.length ? ` de ${unir(contenido.map(lc))}` : "";
    frases.push(base + cont);
  }
  if (otras.length) frases.push(unir(otras));
  if (texto.trim()) frases.push(texto.trim());

  return frases.join(". ");
};

const riesgoGen: GenFn = (opciones, texto) => {
  const IDEACION  = new Set(["Sin ideación autolítica", "Ideación pasiva de muerte", "Ideación autolítica sin planificación", "Ideación autolítica con planificación", "Ideación autolítica con intencionalidad activa"]);
  const CUALIDAD  = new Set(["Egodistónica", "Egosintónica"]);
  const AUTOLESIVAS = new Set(["Sin conductas autolesivas", "Conductas autolesivas sin intencionalidad suicida (NSSI)"]);
  const HETERO    = new Set(["Sin ideación heteroagresiva", "Ideación heteroagresiva presente"]);

  const ideacion    = opciones.filter(o => IDEACION.has(o));
  const cualidad    = opciones.filter(o => CUALIDAD.has(o));
  const autolesivas = opciones.filter(o => AUTOLESIVAS.has(o));
  const hetero      = opciones.filter(o => HETERO.has(o));

  const frases: string[] = [];

  if (ideacion.length || cualidad.length) {
    let frase = ideacion.length ? unir(ideacion) : "";
    if (cualidad.length) frase += (frase ? `, de carácter ${unir(cualidad.map(lc))}` : unir(cualidad));
    frases.push(frase);
  }
  if (autolesivas.length) frases.push(unir(autolesivas));
  if (hetero.length) frases.push(unir(hetero));
  if (texto.trim()) frases.push(texto.trim());

  return frases.join(". ");
};

const bioritmosGen: GenFn = (opciones, texto) => {
  const SUENO   = new Set(["Sueño conservado", "Insomnio de conciliación", "Insomnio de mantenimiento", "Despertar precoz", "Hipersomnia", "Inversión del ritmo sueño-vigilia"]);
  const APETITO = new Set(["Apetito conservado", "Hiporexia", "Anorexia con pérdida ponderal", "Hiperfagia", "Aumento ponderal"]);

  const sueno   = opciones.filter(o => SUENO.has(o));
  const apetito = opciones.filter(o => APETITO.has(o));
  const frases: string[] = [];

  if (sueno.length) {
    const alt = sueno.filter(o => o !== "Sueño conservado");
    frases.push(
      sueno.includes("Sueño conservado") && !alt.length
        ? "Sueño conservado"
        : `Sueño con ${unir(alt.map(lc))}`
    );
  }
  if (apetito.length) frases.push(unir(apetito));
  if (texto.trim()) frases.push(texto.trim());

  return frases.join(". ");
};

const juicioInsightGen: GenFn = (opciones, texto) => {
  const JUICIO  = new Set(["Juicio de la realidad conservado", "Juicio de la realidad parcialmente comprometido", "Juicio de la realidad gravemente comprometido"]);
  const INSIGHT = new Set(["Insight conservado", "Insight parcial: reconoce el malestar pero minimiza la gravedad", "Insight parcial: reconoce la enfermedad pero no la necesidad de tratamiento", "Insight ausente: sin conciencia de enfermedad", "Insight ausente: sin conciencia de necesidad de tratamiento"]);

  const juicio  = opciones.filter(o => JUICIO.has(o));
  const insight = opciones.filter(o => INSIGHT.has(o));
  const frases: string[] = [];

  if (juicio.length)  frases.push(unir(juicio));
  if (insight.length) frases.push(unir(insight));
  if (texto.trim())   frases.push(texto.trim());

  return frases.join(". ");
};

const GENERADORES: Partial<Record<keyof ExamenMentalData, GenFn>> = {
  discurso:        discursoGen,
  humor:           humorGen,
  afecto:          afectoGen,
  hedonia:         hedoniaGen,
  pensamiento:     pensamientoGen,
  sensopercepcion: sensopercepcionGen,
  riesgo:          riesgoGen,
  biorritmos:      bioritmosGen,
  juicioInsight:   juicioInsightGen,
};

const generarFragmento = (key: keyof ExamenMentalData, opciones: string[], texto: string) =>
  (GENERADORES[key] ?? defaultGen)(opciones, texto);

/* ==================== COMPONENTE ==================== */

export default function ExamenMentalPage() {
  const [examen, setExamen] = useState<ExamenMentalData>(estadoInicial);
  const [paso, setPaso] = useState(0);

  const enResumen = paso === TOTAL;

  const avanzar    = useCallback(() => setPaso(p => Math.min(p + 1, TOTAL)), []);
  const retroceder = useCallback(() => setPaso(p => Math.max(p - 1, 0)), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" || e.key === "Enter") avanzar();
      if (e.key === "ArrowLeft") retroceder();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [avanzar, retroceder]);

  const toggleOpcion = (key: keyof ExamenMentalData, opcion: string) =>
    setExamen(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        opciones: prev[key].opciones.includes(opcion)
          ? prev[key].opciones.filter(o => o !== opcion)
          : [...prev[key].opciones, opcion],
      },
    }));

  const cambiarTexto = (key: keyof ExamenMentalData, texto: string) =>
    setExamen(prev => ({ ...prev, [key]: { ...prev[key], texto } }));

  const generarTexto = () => {
    const fragmentos = secciones
      .map(({ key }) => generarFragmento(key, examen[key].opciones, examen[key].texto))
      .filter(Boolean);
    return fragmentos.length ? fragmentos.join(". ") + "." : "";
  };

  const hayRiesgoAlto = OPCIONES_RIESGO_ALTO.some(o => examen.riesgo.opciones.includes(o));

  const exportarPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    const margin = 20;
    const width = 170;
    const lineH = 7;

    doc.setFont("helvetica", "bold");
    doc.text("EXAMEN MENTAL", 105, y, { align: "center" });
    y += 14;

    secciones.forEach(({ key, titulo }) => {
      const contenido = generarFragmento(key, examen[key].opciones, examen[key].texto);
      if (!contenido) return;

      doc.setFont("helvetica", "bold");
      doc.splitTextToSize(titulo.toUpperCase(), width).forEach((l: string) => {
        if (y > doc.internal.pageSize.getHeight() - margin) { doc.addPage(); y = margin; }
        doc.text(l, margin, y); y += lineH;
      });

      doc.setFont("helvetica", "normal");
      doc.splitTextToSize(contenido + ".", width).forEach((l: string) => {
        if (y > doc.internal.pageSize.getHeight() - margin) { doc.addPage(); y = margin; }
        doc.text(l, margin, y); y += lineH;
      });

      y += 4;
    });

    window.open(URL.createObjectURL(doc.output("blob")));
  };

  const seccionActual = !enResumen ? secciones[paso] : null;
  const progreso = (paso / TOTAL) * 100;

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      {/* Barra superior */}
      <div className="sticky top-0 bg-white border-b z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-slate-700" />
            <span className="font-semibold text-slate-800 text-sm">Examen Mental</span>
          </div>
          <span className="text-sm text-slate-400">
            {enResumen ? "Resumen" : `${paso + 1} / ${TOTAL}`}
          </span>
        </div>
        <div className="h-1 bg-slate-100">
          <div className="h-1 bg-slate-800 transition-all duration-300" style={{ width: `${progreso}%` }} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full px-4 py-8 flex-1 flex flex-col">
        {!enResumen && seccionActual ? (
          <>
            {/* Encabezado */}
            <div className="mb-8">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">
                Sección {paso + 1} de {TOTAL}
              </p>
              <h2 className={`text-3xl font-bold ${seccionActual.key === "riesgo" && hayRiesgoAlto ? "text-red-700" : "text-slate-900"}`}>
                {seccionActual.titulo}
              </h2>
              {seccionActual.key === "riesgo" && hayRiesgoAlto && (
                <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  Se han registrado indicadores de riesgo elevado.
                </div>
              )}
            </div>

            {/* Opciones en columnas */}
            {(() => {
              const grupos = seccionesAgrupadas[seccionActual.key];
              return (
                <div className={`grid gap-x-6 gap-y-5 mb-6 ${gridCols[grupos.length] ?? "grid-cols-2"}`}>
                  {grupos.map(grupo => (
                    <div key={grupo.label}>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                        {grupo.label}
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {grupo.opciones.map(opcion => {
                          const sel = examen[seccionActual.key].opciones.includes(opcion);
                          const esAlto = seccionActual.key === "riesgo" && OPCIONES_RIESGO_ALTO.includes(opcion);
                          return (
                            <button
                              key={opcion}
                              onClick={() => toggleOpcion(seccionActual.key, opcion)}
                              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border text-left ${
                                sel
                                  ? esAlto
                                    ? "bg-red-700 border-red-700 text-white"
                                    : "bg-slate-800 border-slate-800 text-white"
                                  : esAlto
                                  ? "bg-white border-red-200 text-red-700 hover:border-red-400"
                                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-400"
                              }`}
                            >
                              <span className={`w-3.5 h-3.5 flex-shrink-0 rounded border flex items-center justify-center ${
                                sel
                                  ? "bg-white border-white"
                                  : esAlto ? "border-red-300" : "border-slate-300"
                              }`}>
                                {sel && <Check className={`w-2.5 h-2.5 ${esAlto ? "text-red-700" : "text-slate-800"}`} />}
                              </span>
                              {opcion}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Notas adicionales */}
            <textarea
              className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
              placeholder="Notas adicionales (opcional)..."
              rows={3}
              value={examen[seccionActual.key].texto}
              onChange={e => cambiarTexto(seccionActual.key, e.target.value)}
            />

            {/* Navegación */}
            <div className="flex justify-between mt-8">
              <button
                onClick={retroceder}
                disabled={paso === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              <button
                onClick={avanzar}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 text-sm font-medium"
              >
                {paso === TOTAL - 1 ? "Ver resumen" : "Siguiente"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-center text-xs text-slate-300 mt-5">
              Usa las flechas del teclado para navegar · Enter para avanzar
            </p>
          </>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900">Resumen</h2>
              <p className="text-slate-400 text-sm mt-1">
                Haz clic en cualquier sección para editarla.
              </p>
            </div>

            {hayRiesgoAlto && (
              <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Se registraron indicadores de riesgo elevado en la sección de Riesgo.
              </div>
            )}

            <div className="space-y-2 mb-6">
              {secciones.map(({ key, titulo }, i) => {
                const contenido = generarFragmento(key, examen[key].opciones, examen[key].texto);
                const esAlerta = key === "riesgo" && hayRiesgoAlto;
                return (
                  <button
                    key={key}
                    onClick={() => setPaso(i)}
                    className={`w-full text-left bg-white rounded-lg px-4 py-3 border transition-all hover:border-slate-400 ${esAlerta ? "border-red-200" : "border-slate-100"}`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <span className={`text-xs font-semibold uppercase tracking-wide ${esAlerta ? "text-red-500" : "text-slate-400"}`}>
                        {titulo}
                      </span>
                      {contenido
                        ? <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        : <span className="text-xs text-slate-300 flex-shrink-0">Sin datos</span>
                      }
                    </div>
                    {contenido && (
                      <p className="text-sm text-slate-700 mt-1 line-clamp-2">{contenido}.</p>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="bg-slate-800 rounded-lg p-5 text-white mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                Texto generado
              </p>
              <p className="text-sm leading-relaxed">
                {generarTexto() || "No se han registrado datos."}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPaso(TOTAL - 1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Volver
              </button>
              <button
                onClick={exportarPDF}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Exportar PDF
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

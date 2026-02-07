"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Brain,
  Download,
  ArrowLeft,
} from "lucide-react";
import jsPDF from "jspdf";

/* ===================== TIPOS ===================== */

type SeccionData = {
  opciones: string[];
  texto: string;
};

type ExamenMentalData = {
  concienciaOrientacion: SeccionData;
  actitud: SeccionData;
  apariencia: SeccionData;
  psicomotricidad: SeccionData;
  sustancias: SeccionData;
  lenguaje: SeccionData;
  estadoAnimo: SeccionData;
  pensamiento: SeccionData;
  riesgo: SeccionData;
  biorritmos: SeccionData;
  juicioInsight: SeccionData;
};

/* ===================== ESTADO INICIAL ===================== */

const estadoInicial: ExamenMentalData = {
  concienciaOrientacion: { opciones: [], texto: "" },
  actitud: { opciones: [], texto: "" },
  apariencia: { opciones: [], texto: "" },
  psicomotricidad: { opciones: [], texto: "" },
  sustancias: { opciones: [], texto: "" },
  lenguaje: { opciones: [], texto: "" },
  estadoAnimo: { opciones: [], texto: "" },
  pensamiento: { opciones: [], texto: "" },
  riesgo: { opciones: [], texto: "" },
  biorritmos: { opciones: [], texto: "" },
  juicioInsight: { opciones: [], texto: "" },
};

/* ===================== OPCIONES ===================== */

const opcionesDisponibles: Record<keyof ExamenMentalData, string[]> = {
  concienciaOrientacion: [
    "Consciente",
    "Lúcido",
    "Somnoliento",
    "Orientado globalmente",
    "Parcialmente orientado",
    "Desorientado",
  ],

  actitud: [
    "Abordable",
    "Colabora",
    "Parcialmente colaborador",
    "Reticente",
    "Hostil",
    "Buen contacto",
    "Escaso contacto visual",
  ],

  apariencia: [
    "Aspecto adecuado",
    "Aspecto descuidado",
    "Conductualmente adecuado",
    "Conducta desorganizada",
  ],

  psicomotricidad: [
    "Sin alteraciones de la psicomotricidad",
    "Inquietud psicomotriz",
    "Agitación",
    "Enlentecimiento psicomotor",
  ],

  sustancias: [
    "Sin signos de intoxicación o abstinencia",
    "Signos de intoxicación",
    "Signos de abstinencia",
    "Signos de impregnación farmacológica",
  ],

  lenguaje: [
    "Lenguaje conservado",
    "Discurso espontáneo",
    "Discurso inducido",
    "Coherente",
    "Bien estructurado",
    "Circunstancial",
    "Tangencial",
    "Logorrea",
    "Verborrea",
    "Presión del habla",
    "Hipofónico",
  ],

  estadoAnimo: [
    "Eutímico",
    "Estado de ánimo reactivo a la situación actual",
    "Ánimo triste",
    "Ansioso",
    "Irritable",
    "Lábil",
    "Afecto congruente",
    "Afecto aplanado",
    "Buena resonancia afectiva",
  ],

  pensamiento: [
    "Sin alteraciones del pensamiento",
    "Ideas delirantes",
    "Ideas de referencia",
    "Ideas obsesivas",
    "Ideas de perjuicio",
    "Rumiaciones",
    "Fobias de impulsión",
  ],

  riesgo: [
    "No auto ni heteroagresividad",
    "No ideación autolítica en el momento actual",
    "Ideas pasivas de muerte, sin planificación ni estructuración",
    "Ideación autolítica",
    "Ideación estructurada",
    "Planificación suicida",
    "Frenadores presentes",
    "Factores protectores presentes",
    "Verbaliza planes encaminados a la continuidad vital",
  ],

  biorritmos: [
    "Biorritmos conservados",
    "Biorritmos alterados",
    "Insomnio de conciliación",
    "Insomnio de mantenimiento",
    "Insomnio mixto",
    "Sueño no reparador",
    "Apetito conservado",
    "Apetito disminuido",
    "Hiperfagia",
  ],

  juicioInsight: [
    "Juicio de realidad conservado",
    "Juicio de realidad alterado",
    "Insight presente",
    "Insight parcial",
    "Insight ausente",
  ],
};

/* ===================== COMPONENTE ===================== */

export default function ExamenMentalPage() {
  const [examen, setExamen] = useState<ExamenMentalData>(estadoInicial);

  const toggleOpcion = (key: keyof ExamenMentalData, opcion: string) => {
    setExamen((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        opciones: prev[key].opciones.includes(opcion)
          ? prev[key].opciones.filter((o) => o !== opcion)
          : [...prev[key].opciones, opcion],
      },
    }));
  };

  const cambiarTexto = (key: keyof ExamenMentalData, texto: string) => {
    setExamen((prev) => ({
      ...prev,
      [key]: { ...prev[key], texto },
    }));
  };

  const generarTexto = () =>
    Object.values(examen)
      .map((s) =>
        [...s.opciones, s.texto.trim()].filter(Boolean).join(". ")
      )
      .filter(Boolean)
      .join(". ") + ".";

  const exportarPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    const margin = 20;
    const width = 170;
    const line = 7;

    doc.setFont("helvetica", "bold");
    doc.text("EXAMEN MENTAL", 105, y, { align: "center" });
    y += 14;

    doc.setFont("helvetica", "normal");
    const texto = doc.splitTextToSize(
      generarTexto() || "No se registran datos.",
      width
    );

    texto.forEach((l: string) => {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(l, margin, y);
      y += line;
    });

    window.open(URL.createObjectURL(doc.output("blob")));
  };

  const secciones: { key: keyof ExamenMentalData; titulo: string }[] = [
    { key: "concienciaOrientacion", titulo: "Conciencia y Orientación" },
    { key: "actitud", titulo: "Actitud y Abordaje" },
    { key: "apariencia", titulo: "Aspecto y Conducta" },
    { key: "psicomotricidad", titulo: "Psicomotricidad" },
    { key: "sustancias", titulo: "Consumo de Sustancias" },
    { key: "lenguaje", titulo: "Lenguaje y Discurso" },
    { key: "estadoAnimo", titulo: "Estado de Ánimo y Afecto" },
    { key: "pensamiento", titulo: "Pensamiento" },
    { key: "riesgo", titulo: "Riesgo Autolítico y Heteroagresividad" },
    { key: "biorritmos", titulo: "Biorritmos" },
    { key: "juicioInsight", titulo: "Juicio e Insight" },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Barra superior */}
      <div className="sticky top-0 bg-white border-b z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a psiqui.tools
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 p-3 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Examen Mental
              </h1>
              <p className="text-sm text-slate-600">
                Redacción estructurada y exportable
              </p>
            </div>
          </div>

          <button
            onClick={exportarPDF}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
          >
            <Download className="w-4 h-4" />
            Generar PDF
          </button>
        </div>

        {/* Formulario */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {secciones.map(({ key, titulo }) => (
            <div key={key} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">
                {titulo}
              </h3>

              <div className="space-y-2 mb-3">
                {opcionesDisponibles[key].map((opcion) => (
                  <label
                    key={opcion}
                    className="flex items-center gap-2 text-sm text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={(examen[key]?.opciones ?? []).includes(opcion)}
                      onChange={() => toggleOpcion(key, opcion)}
                    />
                    {opcion}
                  </label>
                ))}
              </div>

              <textarea
                className="w-full border border-slate-300 rounded-lg p-2 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500"
                placeholder="Descripción adicional…"
                value={examen[key]?.texto ?? ""}
                onChange={(e) => cambiarTexto(key, e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* Vista previa */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">
            Vista previa
          </h3>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {generarTexto() || "Seleccione opciones para generar el texto."}
          </p>
        </div>
      </div>
    </div>
  );
}
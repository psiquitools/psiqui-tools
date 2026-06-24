"use client";

import { useState } from "react";
import { ClipboardCheck, Clipboard } from "lucide-react";

type Plantilla = {
  id: string;
  titulo: string;
  texto: string;
};

const PLANTILLAS: Plantilla[] = [
  {
    id: "normal",
    titulo: "Exploración normal",
    texto:
      "Paciente consciente y orientado en las tres esferas. " +
      "Abordable y colaborador. " +
      "Atento. " +
      "Conductualmente adecuado. Sin alteraciones de la psicomotricidad. " +
      "No signos ni síntomas de intoxicación ni abstinencia. " +
      "Eutimia. " +
      "Afecto reactivo, congruente y de rango amplio. " +
      "Discurso espontáneo, fluido, coherente, bien estructurado y articulado. " +
      "Sin alteraciones en el curso ni forma del pensamiento. " +
      "Contenido sin ideas delirantes ni obsesivas. " +
      "Sin alteraciones de la sensopercepción. " +
      "No ideas ni conductas autolesivas ni heteroagresivas. No ideación autolítica. " +
      "Apetito y sueño conservados. " +
      "Juicio de realidad conservado. Insight presente.",
  },
  {
    id: "depresiva",
    titulo: "Sint. depresiva",
    texto:
      "Paciente consciente y orientado en las tres esferas. " +
      "Abordable y colaborador. " +
      "Atento. " +
      "Conductualmente adecuado. Sin alteraciones de la psicomotricidad. " +
      "Hipotimia referida con reducción de la capacidad hedónica. " +
      "Afecto reactivo, congruente y de rango restringido. " +
      "Discurso espontáneo, fluido, coherente y bien estructurado. " +
      "Sin alteraciones en el curso ni forma del pensamiento. " +
      "Contenido centrado en ideas rumiativas de carácter negativo. " +
      "Sin alteraciones de la sensopercepción. " +
      "No ideas ni conductas autolesivas ni heteroagresivas. No ideación autolítica. " +
      "Hiporexia e insomnio de mantenimiento referidos. " +
      "Juicio de realidad conservado. Insight presente.",
  },
  {
    id: "dm",
    titulo: "Depresión mayor",
    texto:
      "Paciente consciente y orientado en las tres esferas. " +
      "Abordable y colaborador, con escasa espontaneidad. " +
      "Enlentecimiento psicomotriz objetivado. " +
      "Hipotimia marcada referida con anhedonia para actividades previamente placenteras. " +
      "Afecto aplanado, congruente y de rango restringido. " +
      "Discurso con latencia aumentada, fluido, coherente pero con escasa producción espontánea. " +
      "Sin alteraciones formales del pensamiento. " +
      "Contenido centrado en ideas rumiativas de culpa e inutilidad. " +
      "Sin alteraciones de la sensopercepción. " +
      "Ideación de muerte pasiva referida, sin ideación autolítica activa ni plan estructurado. No ideas ni conductas heteroagresivas. " +
      "Importante hiporexia con pérdida de peso referida. Insomnio de mantenimiento con despertar precoz. Fatigabilidad marcada referida. " +
      "Juicio de realidad conservado. Insight presente.",
  },
  {
    id: "ansiosa",
    titulo: "Sint. ansiosa",
    texto:
      "Paciente consciente y orientado en las tres esferas. " +
      "Abordable y colaborador. " +
      "Atento aunque con dificultad para la concentración. " +
      "Inquietud psicomotriz leve. " +
      "Ansiedad referida con sintomatología somática acompañante. Eutimia. " +
      "Afecto ansioso, reactivo y de rango variable. " +
      "Discurso espontáneo, algo acelerado, coherente y bien estructurado. " +
      "Sin alteraciones en el curso ni forma del pensamiento. " +
      "Contenido centrado en preocupaciones de difícil control con anticipación catastrófica. " +
      "Sin alteraciones de la sensopercepción. " +
      "No ideas ni conductas autolesivas ni heteroagresivas. No ideación autolítica. " +
      "Insomnio de conciliación referido. Apetito conservado. " +
      "Juicio de realidad conservado. Insight presente.",
  },
  {
    id: "ansiosa-depresiva",
    titulo: "Ansioso-depresivo",
    texto:
      "Paciente consciente y orientado en las tres esferas. " +
      "Abordable y colaborador. " +
      "Atento. " +
      "Inquietud psicomotriz leve. " +
      "Hipotimia referida con reducción parcial de la capacidad hedónica y ansiedad concomitante referida. " +
      "Afecto reactivo, congruente y de rango restringido. " +
      "Discurso espontáneo, fluido, coherente y bien estructurado. " +
      "Sin alteraciones en el curso ni forma del pensamiento. " +
      "Contenido centrado en ideas rumiativas y preocupaciones recurrentes de difícil control. " +
      "Sin alteraciones de la sensopercepción. " +
      "No ideas ni conductas autolesivas ni heteroagresivas. No ideación autolítica. " +
      "Hiporexia e insomnio mixto referidos. " +
      "Juicio de realidad conservado. Insight presente.",
  },
  {
    id: "mania",
    titulo: "Manía",
    texto:
      "Paciente consciente y orientado en las tres esferas. " +
      "Abordable con límites difusos y marcada desinhibición, escasamente colaborador cuando se le interrumpe. " +
      "Agitación psicomotriz objetivada. " +
      "Euforia referida y objetivada. " +
      "Afecto expansivo, congruente con el estado de ánimo, de rango amplio con labilidad. " +
      "Discurso verborréico, acelerado, con saltos temáticos y tendencia a la fuga de ideas. " +
      "Aceleración del pensamiento objetivada. " +
      "Contenido con ideas de grandiosidad y proyectos expansivos múltiples. " +
      "Sin alucinaciones en el momento de la entrevista. " +
      "No ideación autolítica. Sin ideación heteroagresiva estructurada aunque con irritabilidad reactiva marcada. " +
      "Reducción de las necesidades de sueño sin sensación de cansancio referida. Apetito variable. " +
      "Juicio de realidad comprometido. Insight ausente.",
  },
  {
    id: "toc",
    titulo: "TOC",
    texto:
      "Paciente consciente y orientado en las tres esferas. " +
      "Abordable y colaborador aunque con notoria tensión interna. " +
      "Conductualmente adecuado durante la entrevista. Sin alteraciones relevantes de la psicomotricidad. " +
      "Eutimia de base con ansiedad secundaria a las obsesiones. " +
      "Afecto reactivo, congruente y de rango variable. " +
      "Discurso espontáneo, fluido y coherente, con tendencia a la descripción detallada y la duda. " +
      "Sin alteraciones en el curso del pensamiento. " +
      "Ideas obsesivas presentes de carácter ego-distónico, reconocidas como propias, con rituales compulsivos asociados. " +
      "Sin fenómenos alucinatorios. " +
      "No ideas ni conductas autolesivas ni heteroagresivas. No ideación autolítica. " +
      "Apetito conservado. Insomnio de conciliación relacionado con la activación obsesiva referido. " +
      "Juicio de realidad conservado. Insight presente.",
  },
  {
    id: "tp",
    titulo: "T. personalidad",
    texto:
      "Paciente consciente y orientado en las tres esferas. " +
      "Abordable y colaborador. " +
      "Atento. " +
      "Conductualmente adecuado durante la entrevista. Sin alteraciones de la psicomotricidad. " +
      "Labilidad emocional referida con baja tolerancia a la frustración de forma egosintónica. " +
      "Afecto reactivo e intenso, congruente con la narrativa referida, de rango amplio. " +
      "Discurso espontáneo, fluido y coherente aunque con marcada carga afectiva. " +
      "Sin alteraciones formales del pensamiento. " +
      "Contenido centrado en conflictos interpersonales con patrón relacional rígido. " +
      "Sin alteraciones de la sensopercepción. " +
      "No ideación autolítica activa en el momento de la entrevista. No ideas heteroagresivas. " +
      "Biorritmos variables según el estado emocional. " +
      "Juicio de realidad conservado. Insight parcial respecto a los patrones propios de funcionamiento.",
  },
  {
    id: "adaptativo",
    titulo: "T. adaptativo",
    texto:
      "Paciente consciente y orientado en las tres esferas. " +
      "Abordable y colaborador. " +
      "Atento. " +
      "Conductualmente adecuado. Sin alteraciones de la psicomotricidad. " +
      "Hipotimia reactiva referida contextualizada en el marco de estresores identificables recientes, sin anhedonia significativa. " +
      "Afecto reactivo, congruente y de rango restringido en relación al estresor. " +
      "Discurso espontáneo, fluido, coherente y bien estructurado. " +
      "Sin alteraciones en el curso ni forma del pensamiento. " +
      "Contenido centrado en el estresor actual sin alcanzar nivel delirante ni obsesivo. " +
      "Sin alteraciones de la sensopercepción. " +
      "No ideas ni conductas autolesivas ni heteroagresivas. No ideación autolítica. " +
      "Leve afectación del apetito y el sueño en relación al contexto referida. " +
      "Juicio de realidad conservado. Insight presente.",
  },
  {
    id: "insomnio",
    titulo: "Insomnio",
    texto:
      "Paciente consciente y orientado en las tres esferas. " +
      "Abordable y colaborador. " +
      "Atento aunque con referencia de somnolencia y fatigabilidad diurnas. " +
      "Conductualmente adecuado. Sin alteraciones de la psicomotricidad. " +
      "Eutimia, con irritabilidad secundaria referida. " +
      "Afecto reactivo, congruente y de rango amplio. " +
      "Discurso espontáneo, fluido, coherente y bien estructurado. " +
      "Sin alteraciones en el curso ni forma del pensamiento. " +
      "Contenido centrado en preocupaciones relacionadas con el sueño y su repercusión funcional diurna. " +
      "Sin alteraciones de la sensopercepción. " +
      "No ideas ni conductas autolesivas ni heteroagresivas. No ideación autolítica. " +
      "Insomnio de conciliación referido con repercusión funcional diurna significativa. Apetito conservado. " +
      "Juicio de realidad conservado. Insight presente.",
  },
  {
    id: "iai",
    titulo: "Ideación autolítica",
    texto:
      "Paciente consciente y orientado en las tres esferas. " +
      "Abordable y colaborador, con notable carga emocional. " +
      "Enlentecimiento psicomotriz leve. " +
      "Hipotimia marcada referida con anhedonia importante. " +
      "Afecto tenso, congruente y de rango restringido. " +
      "Discurso espontáneo con latencia aumentada, fluido y coherente. " +
      "Sin alteraciones formales del pensamiento. " +
      "Contenido centrado en ideas de desesperanza y anticipación negativa del futuro. " +
      "Sin alteraciones de la sensopercepción. " +
      "Ideación autolítica activa presente: ideación frecuente y persistente, con plan parcialmente estructurado, sin intención declarada de llevarlo a cabo en el momento actual. Niega acceso a medios letales. No ideas ni conductas heteroagresivas. " +
      "Hiporexia e insomnio de mantenimiento referidos. " +
      "Juicio de realidad conservado. Insight parcial.",
  },
  {
    id: "tlp",
    titulo: "TLP en crisis",
    texto:
      "Paciente consciente y orientado en las tres esferas. " +
      "Abordable aunque con escasa colaboración inicial y marcada tensión emocional. " +
      "Conductualmente agitado, con gesticulación aumentada. " +
      "Sin signos ni síntomas de intoxicación ni abstinencia. " +
      "Disforia intensa referida con labilidad afectiva marcada. " +
      "Afecto tenso y lábil, congruente con el estado de crisis, de rango amplio. " +
      "Discurso espontáneo, acelerado, coherente aunque con dificultad para la linealidad por la activación emocional. " +
      "Sin alteraciones formales del pensamiento. " +
      "Contenido centrado en el conflicto interpersonal desencadenante con vivencia de abandono. " +
      "Fenómenos disociativos leves referidos de forma puntual previos a la conducta autolesiva. " +
      "Autolesiones no suicidas presentes: incisiones superficiales en cara interna de antebrazo. No ideación autolítica con intención de muerte. No ideación heteroagresiva activa. " +
      "Biorritmos alterados en el contexto de la crisis. " +
      "Juicio de realidad conservado. Insight limitado por la activación emocional.",
  },
];

export default function PlantillasJM() {
  const [seleccionada, setSeleccionada] = useState(PLANTILLAS[0].id);
  const [copiado, setCopiado] = useState(false);

  const plantilla = PLANTILLAS.find((p) => p.id === seleccionada)!;

  async function copiar() {
    await navigator.clipboard.writeText(plantilla.texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function seleccionar(id: string) {
    setSeleccionada(id);
    setCopiado(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-5 py-12 md:py-16">

        {/* Header */}
        <div className="mb-8 border-b border-slate-200 pb-6">
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-slate-400">
            Referencia clínica
          </p>
          <h1 className="text-xl font-semibold text-slate-800">
            Plantillas de Examen Mental
          </h1>
        </div>

        {/* Selector */}
        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PLANTILLAS.map((p) => (
            <button
              key={p.id}
              onClick={() => seleccionar(p.id)}
              className={`rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors leading-tight ${
                seleccionada === p.id
                  ? "bg-slate-800 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {p.titulo}
            </button>
          ))}
        </div>

        {/* Plantilla activa */}
        <div className="rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {plantilla.titulo}
            </p>
            <button
              onClick={copiar}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                copiado
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {copiado ? (
                <>
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  Copiado
                </>
              ) : (
                <>
                  <Clipboard className="h-3.5 w-3.5" />
                  Copiar
                </>
              )}
            </button>
          </div>
          <div className="px-5 py-4">
            <p className="font-mono text-sm leading-relaxed text-slate-700">
              {plantilla.texto}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

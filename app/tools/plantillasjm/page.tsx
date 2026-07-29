"use client";

import { useState } from "react";
import { ClipboardCheck, Clipboard, Sparkles, X } from "lucide-react";

type Plantilla = {
  id: string;
  titulo: string;
  texto: string;
};

type PlantillaPlan = {
  id: string;
  titulo: string;
  descripcion: string;
  texto: string;
  conDetalle?: boolean;
};

const PLANTILLAS_EXAMEN: Plantilla[] = [
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
    id: "psicotica",
    titulo: "Sint. psicótica",
    texto:
      "Paciente consciente, orientado en persona y lugar, con desorientación temporal parcial. " +
      "Abordable con dificultad, actitud suspicaz y escasa colaboración espontánea. " +
      "Sin alteraciones de la psicomotricidad. No signos ni síntomas de intoxicación ni abstinencia. " +
      "Perplejidad referida y objetivada. " +
      "Afecto inapropiado, de rango restringido e incongruente con el contenido del discurso. " +
      "Discurso espontáneo con escasa producción, coherente en su estructura superficial pero con laxitud asociativa. " +
      "Sin aceleración ni enlentecimiento formales del pensamiento. " +
      "Contenido con ideación delirante de carácter persecutorio de probable reciente estructuración. " +
      "Alteraciones de la sensopercepción: alucinaciones auditivas referidas en segunda y tercera persona, con predominio vespertino-nocturno. " +
      "No ideas ni conductas autolesivas ni heteroagresivas activas en el momento de la entrevista. " +
      "Insomnio marcado con reducción de horas de sueño sin sensación subjetiva de cansancio referido. Apetito reducido. " +
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

const PLANTILLAS_PLAN: PlantillaPlan[] = [
  {
    id: "urgencias-general",
    titulo: "Acudir a urgencias si empeoramiento",
    descripcion: "Instrucción general ante complicaciones o deterioro clínico",
    texto: "Ante complicaciones o empeoramiento acudirá nuevamente al servicio de urgencias.",
  },
  {
    id: "urgencias-autolitica",
    titulo: "Conducta suicida — acudir a urgencias",
    descripcion: "Compromiso del paciente ante ideación autolítica emergente",
    texto:
      "Ante nueva aparición o intensificación de ideación autolítica, se compromete a pedir ayuda y/o acudir al servicio de urgencias.",
  },
  {
    id: "linea-024",
    titulo: "Línea 024",
    descripcion: "Recurso de crisis telefónico para conducta suicida",
    texto:
      "Teléfono 024: Línea de Atención a la Conducta Suicida (Disponible 24/7 y anónima).",
  },
  {
    id: "conduccion-maquinaria",
    titulo: "Advertencia conducción y maquinaria",
    descripcion: "Aviso estándar sobre psicofármacos y capacidad de conducción",
    texto:
      "Se informa al paciente de que el tratamiento psicofarmacológico prescrito puede afectar la capacidad de atención, los tiempos de reacción y la coordinación psicomotriz, con potencial repercusión sobre la aptitud para conducir vehículos a motor o manejar maquinaria peligrosa. Se recomienda abstenerse de dichas actividades hasta comprobar la tolerabilidad individual al tratamiento y, en caso de duda, consultar con el médico responsable antes de reanudarlas.",
  },
  {
    id: "abstinencia-toxicos",
    titulo: "Abstinencia a tóxicos",
    descripcion: "Recomendación de abstinencia a sustancias",
    texto: "Se recomienda abstinencia a tóxicos.",
  },
  {
    id: "cta-zona",
    titulo: "Acudir al CTA de zona",
    descripcion: "Derivación a centro de tratamiento de adicciones",
    texto: "Se indica acudir al Centro de Tratamiento de Adicciones (CTA) de zona para valoración y seguimiento.",
  },
  {
    id: "control-map",
    titulo: "Control por MAP",
    descripcion: "Seguimiento por médico de atención primaria",
    texto: "Control por Médico de Atención Primaria (MAP).",
  },
  {
    id: "cita-psiquiatria",
    titulo: "Cita con Psiquiatría",
    descripcion: "Seguimiento ambulatorio en consulta de psiquiatría",
    texto: "Acudirá a su cita con Psiquiatría como tenía previsto.",
    conDetalle: true,
  },
];

type Seccion = "examen" | "plan";

export default function PlantillasJM() {
  const [seccion, setSeccion] = useState<Seccion>("examen");

  const [seleccionada, setSeleccionada] = useState(PLANTILLAS_EXAMEN[0].id);
  const [copiado, setCopiado] = useState(false);

  const [descripcion, setDescripcion] = useState("");
  const [iaLoading, setIaLoading] = useState(false);
  const [iaError, setIaError] = useState<string | null>(null);
  const [iaResultado, setIaResultado] = useState("");
  const [iaCopiado, setIaCopiado] = useState(false);

  const [seleccionadosPlan, setSeleccionadosPlan] = useState<Set<string>>(new Set());
  const [textoPlanLibre, setTextoPlanLibre] = useState("");
  const [textoCita, setTextoCita] = useState("");
  const [copiadoPlanJunto, setCopiadoPlanJunto] = useState(false);

  const plantilla = PLANTILLAS_EXAMEN.find((p) => p.id === seleccionada)!;

  const bulletsPlan = PLANTILLAS_PLAN
    .filter((p) => seleccionadosPlan.has(p.id))
    .map((p) => {
      if (p.id === "cita-psiquiatria" && textoCita.trim()) {
        return `- ${p.texto} ${textoCita.trim()}`;
      }
      return `- ${p.texto}`;
    })
    .join("\n");

  const textoPlanJunto = [textoPlanLibre.trim(), bulletsPlan]
    .filter(Boolean)
    .join("\n");

  function togglePlan(id: string) {
    setSeleccionadosPlan((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function copiar() {
    await navigator.clipboard.writeText(plantilla.texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function seleccionar(id: string) {
    setSeleccionada(id);
    setCopiado(false);
  }

  async function copiarPlanJunto() {
    if (!textoPlanJunto) return;
    await navigator.clipboard.writeText(textoPlanJunto);
    setCopiadoPlanJunto(true);
    setTimeout(() => setCopiadoPlanJunto(false), 2000);
  }

  async function generarConIA() {
    if (!descripcion.trim()) return;
    setIaLoading(true);
    setIaError(null);
    setIaResultado("");
    try {
      const res = await fetch("/api/generar-examen-mental", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error desconocido");
      setIaResultado(data.texto);
    } catch (err) {
      setIaError(err instanceof Error ? err.message : "Error al conectar con la IA");
    } finally {
      setIaLoading(false);
    }
  }

  async function copiarIA() {
    await navigator.clipboard.writeText(iaResultado);
    setIaCopiado(true);
    setTimeout(() => setIaCopiado(false), 2000);
  }

  function descartar() {
    setIaResultado("");
    setIaError(null);
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
            Plantillas
          </h1>
        </div>

        {/* Tabs de sección */}
        <div className="mb-8 flex gap-1 rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setSeccion("examen")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              seccion === "examen"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Examen Mental
          </button>
          <button
            onClick={() => setSeccion("plan")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              seccion === "plan"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Plan
          </button>
        </div>

        {/* Sección: Examen Mental */}
        {seccion === "examen" && (
          <>
            {/* Selector */}
            <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PLANTILLAS_EXAMEN.map((p) => (
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

            {/* Separador */}
            <div className="my-10 border-t border-slate-200" />

            {/* Sección IA */}
            <div className="mb-6">
              <div className="mb-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500" />
                <p className="text-sm font-semibold text-slate-800">Generar con IA</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Describe los hallazgos del paciente en lenguaje libre. La IA redactará el examen mental completo
                en el formato estándar, asumiendo normalidad en lo que no menciones.
              </p>
            </div>

            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              placeholder="Ej: paciente ansioso, con rumiaciones de difícil control, sin alteraciones de la sensopercepción, insomnio de conciliación, sin ideación autolítica..."
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 resize-none"
            />

            <button
              onClick={generarConIA}
              disabled={iaLoading || !descripcion.trim()}
              className="mt-3 flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {iaLoading ? "Generando…" : "Generar examen mental"}
            </button>

            {iaError && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                <X className="h-4 w-4 mt-0.5 shrink-0" />
                {iaError}
              </div>
            )}

            {iaResultado && (
              <div className="mt-4 rounded-lg bg-white shadow-sm ring-1 ring-violet-200">
                <div className="flex items-center justify-between border-b border-violet-100 px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
                      Generado por IA — revisar antes de usar
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copiarIA}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        iaCopiado
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {iaCopiado ? (
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
                    <button
                      onClick={descartar}
                      className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="px-5 py-4">
                  <p className="font-mono text-sm leading-relaxed text-slate-700">
                    {iaResultado}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Sección: Plan */}
        {seccion === "plan" && (
          <div className="flex flex-col gap-4">
            {/* Texto libre */}
            <textarea
              value={textoPlanLibre}
              onChange={(e) => setTextoPlanLibre(e.target.value)}
              rows={4}
              placeholder="Escribe aquí el resto del plan..."
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 resize-none"
            />

            {/* Checklist */}
            {PLANTILLAS_PLAN.map((p) => {
              const activo = seleccionadosPlan.has(p.id);
              const header = (
                <div className="flex items-start gap-3 px-5 py-4">
                  <div className={`mt-0.5 shrink-0 h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                    activo ? "bg-white border-white" : "border-slate-300 bg-white"
                  }`}>
                    {activo && (
                      <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none">
                        <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold leading-tight ${activo ? "text-white" : "text-slate-700"}`}>
                      {p.titulo}
                    </p>
                    <p className={`mt-0.5 text-xs leading-tight ${activo ? "text-slate-300" : "text-slate-400"}`}>
                      {p.descripcion}
                    </p>
                    <p className={`mt-2 font-mono text-sm leading-relaxed ${activo ? "text-slate-200" : "text-slate-600"}`}>
                      {p.texto}
                    </p>
                  </div>
                </div>
              );

              if (p.conDetalle) {
                return (
                  <div
                    key={p.id}
                    className={`rounded-lg text-left transition-all shadow-sm ${
                      activo
                        ? "bg-slate-800 ring-1 ring-slate-700"
                        : "bg-white ring-1 ring-slate-200"
                    }`}
                  >
                    <button
                      onClick={() => togglePlan(p.id)}
                      className="w-full text-left"
                    >
                      {header}
                    </button>
                    {activo && (
                      <div className="px-5 pb-4">
                        <textarea
                          value={textoCita}
                          onChange={(e) => setTextoCita(e.target.value)}
                          rows={2}
                          placeholder="Datos de la cita (fecha, hora, lugar…)"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none resize-none"
                        />
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={p.id}
                  onClick={() => togglePlan(p.id)}
                  className={`w-full rounded-lg text-left transition-all shadow-sm ${
                    activo
                      ? "bg-slate-800 ring-1 ring-slate-700"
                      : "bg-white ring-1 ring-slate-200 hover:ring-slate-300"
                  }`}
                >
                  {header}
                </button>
              );
            })}

            {/* Caja de texto combinado */}
            {textoPlanJunto && (
              <div className="mt-2 rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Texto combinado
                  </p>
                  <button
                    onClick={copiarPlanJunto}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      copiadoPlanJunto
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {copiadoPlanJunto ? (
                      <>
                        <ClipboardCheck className="h-3.5 w-3.5" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Clipboard className="h-3.5 w-3.5" />
                        Copiar todo
                      </>
                    )}
                  </button>
                </div>
                <div className="px-5 py-4">
                  <p className="font-mono text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                    {textoPlanJunto}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

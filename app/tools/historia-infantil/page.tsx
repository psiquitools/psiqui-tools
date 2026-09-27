"use client";

import { useState } from "react";
import {
    FileText,
    ClipboardList,
    Users,
    Brain,
    Download,
    AlertCircle,
    ExternalLink,
    Sparkles,
    Check,
    X,
} from "lucide-react";
import Link from "next/link";

/* ===================== TIPOS ===================== */

interface HistoriaIJ {
    datosIdentificacion: {
        identificador: string;
        edad: string;
        sexo: string;
        escolaridad: string;
        acompanante: string;
        fechaHora: string;
    };
    motivoConsulta: string;
    enfermedadActual: string;
    antecedentes: {
        medicoQuirurgicos: string;
        alergias: string;
        embarazoParto: { estado: "normal" | "complicado"; descripcion: string };
        desarrolloPsicomotor: string;
        lenguaje: string;
        saludMental: string;
        tratamientosPrevios: string;
        ingresos: { estado: "no" | "si"; descripcion: string };
        autoliticos: { estado: "no" | "si"; descripcion: string };
        tratamientoHabitual: string;
        habitosToxicos: string;
    };
    familia: {
        composicion: string;
        dinamica: string;
        saludMentalFamiliar: string;
        suicidioFamiliar: { estado: "no" | "si"; descripcion: string };
        eventosVitales: string;
    };
    escuela: {
        centro: string;
        rendimiento: string;
        relacionesPares: string;
        conducta: string;
    };
    psicobiografia: string;
    examenMental: string;
    juicioClinico: string;
    planManejo: string;
}

/* ===================== SECCIONES ===================== */

const secciones = [
    { id: 0, titulo: "Identificación",        icon: FileText },
    { id: 1, titulo: "Antecedentes",          icon: ClipboardList },
    { id: 2, titulo: "Familia y Escuela",     icon: Users },
    { id: 3, titulo: "Evaluación y Plan",     icon: Brain },
];

/* ===================== COMPONENTE ===================== */

export default function HistoriaInfantilPage() {
    const [seccionActual, setSeccionActual] = useState(0);

    /* — IA episodio actual — */
    const [iaLoading, setIaLoading]                   = useState(false);
    const [iaError, setIaError]                       = useState<string | null>(null);
    const [iaPropuesta, setIaPropuesta]               = useState("");
    const [iaOmisiones, setIaOmisiones]               = useState<string[]>([]);
    const [iaPanel, setIaPanel]                       = useState(false);
    const [iaFeedback, setIaFeedback]                 = useState("");
    const [iaFeedbackLoading, setIaFeedbackLoading]   = useState(false);
    const [iaFeedbackUsado, setIaFeedbackUsado]       = useState(false);

    const estructurarEpisodio = async () => {
        if (!historia.enfermedadActual.trim()) return;
        setIaLoading(true);
        setIaError(null);
        try {
            const res = await fetch("/api/estructurar-episodio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    texto: historia.enfermedadActual,
                    motivoConsulta: historia.motivoConsulta,
                    psicobiografia: historia.psicobiografia,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Error desconocido");
            setIaPropuesta(data.estructurado);
            setIaOmisiones(data.omisiones ?? []);
            setIaPanel(true);
        } catch (err) {
            setIaError(err instanceof Error ? err.message : "Error al conectar con la IA");
        } finally {
            setIaLoading(false);
        }
    };

    const aceptarPropuesta = () => {
        setHistoria({ ...historia, enfermedadActual: iaPropuesta });
        setIaPanel(false);
        setIaPropuesta("");
        setIaOmisiones([]);
    };

    const descartarPropuesta = () => {
        setIaPanel(false);
        setIaPropuesta("");
        setIaOmisiones([]);
        setIaError(null);
        setIaFeedback("");
        setIaFeedbackUsado(false);
    };

    const refinarPropuesta = async () => {
        if (!iaFeedback.trim() || iaFeedbackUsado) return;
        setIaFeedbackLoading(true);
        try {
            const texto = `REVISIÓN DE PROPUESTA:\n\nPropuesta actual:\n${iaPropuesta}\n\nAjuste solicitado:\n${iaFeedback.trim()}\n\nAplica el ajuste sobre la propuesta actual y devuelve el episodio completo revisado.`;
            const res = await fetch("/api/estructurar-episodio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ texto }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Error desconocido");
            setIaPropuesta(data.estructurado);
            setIaOmisiones(data.omisiones ?? []);
            setIaFeedbackUsado(true);
            setIaFeedback("");
        } catch (err) {
            setIaError(err instanceof Error ? err.message : "Error al conectar con la IA");
        } finally {
            setIaFeedbackLoading(false);
        }
    };

    /* — Estado historia — */
    const [historia, setHistoria] = useState<HistoriaIJ>({
        datosIdentificacion: {
            identificador: "",
            edad: "",
            sexo: "",
            escolaridad: "",
            acompanante: "",
            fechaHora: new Date().toLocaleString("es-ES"),
        },
        motivoConsulta: "",
        enfermedadActual: "",
        antecedentes: {
            medicoQuirurgicos: "",
            alergias: "",
            embarazoParto: { estado: "normal", descripcion: "" },
            desarrolloPsicomotor: "",
            lenguaje: "",
            saludMental: "",
            tratamientosPrevios: "",
            ingresos: { estado: "no", descripcion: "" },
            autoliticos: { estado: "no", descripcion: "" },
            tratamientoHabitual: "",
            habitosToxicos: "",
        },
        familia: {
            composicion: "",
            dinamica: "",
            saludMentalFamiliar: "",
            suicidioFamiliar: { estado: "no", descripcion: "" },
            eventosVitales: "",
        },
        escuela: {
            centro: "",
            rendimiento: "",
            relacionesPares: "",
            conducta: "",
        },
        psicobiografia: "",
        examenMental: "",
        juicioClinico: "",
        planManejo: "",
    });

    /* ===================== PDF ===================== */

    const generarPDF = () => {
        const w = window.open("", "_blank");
        if (!w) return;

        const esc = (s: string) =>
            s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        const seccion = (titulo: string) => `<h2>${esc(titulo)}</h2>`;

        const parrafos = (texto: string) => {
            if (!texto.trim()) return "<p>&nbsp;</p>";
            return texto
                .split(/\n{2,}/)
                .map((p) => p.replace(/\n/g, " ").replace(/\s+/g, " ").trim())
                .filter((p) => p.length > 0)
                .map((p) => `<p>${esc(p)}</p>`)
                .join("");
        };

        const { antecedentes, familia, escuela } = historia;
        const { datosIdentificacion: id } = historia;

        const embarazoTexto = antecedentes.embarazoParto.estado === "normal"
            ? "Embarazo y parto sin complicaciones referidas."
            : "Embarazo / parto con complicaciones: " + antecedentes.embarazoParto.descripcion.replace(/\n/g, " ").trim();

        const ingresosTexto = antecedentes.ingresos.estado === "no"
            ? "No antecedentes de ingresos psiquiátricos o pediátricos previos."
            : "Antecedentes de ingresos: " + antecedentes.ingresos.descripcion.replace(/\n/g, " ").trim();

        const autoliticosTexto = antecedentes.autoliticos.estado === "no"
            ? "No antecedentes de conductas autolíticas o autolesivas."
            : "Antecedentes de conductas autolíticas/autolesivas: " + antecedentes.autoliticos.descripcion.replace(/\n/g, " ").trim();

        const suicidioFamiliarTexto = familia.suicidioFamiliar.estado === "no"
            ? "Niega antecedentes familiares de suicidio consumado."
            : "Antecedentes familiares de suicidio consumado" + (familia.suicidioFamiliar.descripcion.trim() ? ": " + familia.suicidioFamiliar.descripcion.trim() : "") + ".";

        const contenido = `
  ${seccion("Datos de identificación:")}
  <p>Identificador: ${esc(id.identificador)}</p>
  ${id.edad ? `<p>Edad: ${esc(id.edad)}</p>` : ""}
  ${id.sexo ? `<p>Sexo: ${esc(id.sexo)}</p>` : ""}
  ${id.escolaridad ? `<p>Escolaridad: ${esc(id.escolaridad)}</p>` : ""}
  ${id.acompanante ? `<p>Acude acompañado de: ${esc(id.acompanante)}</p>` : ""}

  ${seccion("Motivo de consulta:")}
  ${parrafos(historia.motivoConsulta)}

  ${seccion("Datos de filiación / Historia vital:")}
  ${parrafos(historia.psicobiografia)}

  ${seccion("Antecedentes personales médico-quirúrgicos:")}
  <p>Alergias: ${esc(antecedentes.alergias || "No referidas")}</p>
  ${parrafos(antecedentes.medicoQuirurgicos)}

  ${seccion("Antecedentes del desarrollo:")}
  <p>${esc(embarazoTexto)}</p>
  ${antecedentes.desarrolloPsicomotor.trim() ? `<p class="sub">Desarrollo psicomotor:</p>${parrafos(antecedentes.desarrolloPsicomotor)}` : ""}
  ${antecedentes.lenguaje.trim() ? `<p class="sub">Desarrollo del lenguaje:</p>${parrafos(antecedentes.lenguaje)}` : ""}

  ${seccion("Antecedentes personales en salud mental:")}
  ${parrafos(antecedentes.saludMental)}
  ${antecedentes.tratamientosPrevios.trim() ? `<p class="sub">Tratamientos previos:</p>${parrafos(antecedentes.tratamientosPrevios)}` : ""}
  <p>${esc(ingresosTexto)}</p>
  <p>${esc(autoliticosTexto)}</p>
  <p class="sub">Tratamiento habitual:</p>
  ${parrafos(antecedentes.tratamientoHabitual)}
  ${antecedentes.habitosToxicos.trim() ? `<p class="sub">Hábitos tóxicos:</p>${parrafos(antecedentes.habitosToxicos)}` : ""}

  ${seccion("Contexto familiar:")}
  ${familia.composicion.trim() ? `<p class="sub">Composición familiar:</p>${parrafos(familia.composicion)}` : ""}
  ${familia.dinamica.trim() ? `<p class="sub">Dinámica familiar:</p>${parrafos(familia.dinamica)}` : ""}
  ${familia.saludMentalFamiliar.trim() ? `<p class="sub">Salud mental familiar:</p>${parrafos(familia.saludMentalFamiliar)}` : ""}
  <p>${esc(suicidioFamiliarTexto)}</p>
  ${familia.eventosVitales.trim() ? `<p class="sub">Eventos vitales estresantes:</p>${parrafos(familia.eventosVitales)}` : ""}

  ${seccion("Contexto escolar:")}
  ${escuela.centro.trim() ? `<p class="sub">Centro y nivel educativo:</p>${parrafos(escuela.centro)}` : ""}
  ${escuela.rendimiento.trim() ? `<p class="sub">Rendimiento académico:</p>${parrafos(escuela.rendimiento)}` : ""}
  ${escuela.relacionesPares.trim() ? `<p class="sub">Relaciones con pares:</p>${parrafos(escuela.relacionesPares)}` : ""}
  ${escuela.conducta.trim() ? `<p class="sub">Conducta escolar:</p>${parrafos(escuela.conducta)}` : ""}

  ${seccion("Episodio actual:")}
  ${parrafos(historia.enfermedadActual)}

  ${seccion("Examen mental:")}
  ${parrafos(historia.examenMental)}

  ${seccion("Juicio clínico:")}
  ${parrafos(historia.juicioClinico)}

  ${seccion("Plan de manejo:")}
  ${parrafos(historia.planManejo)}`;

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Historia Clínica Infanto-Juvenil</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #111; margin: 0; }
    h2  { font-size: 11pt; font-weight: bold; margin: 20px 0 4px; }
    p   { margin: 0 0 8px; }
    .sub { font-weight: bold; text-decoration: underline; margin: 16px 0 4px; }
    .btn { position: fixed; top: 16px; right: 16px; padding: 8px 18px;
           background: #1e293b; color: #fff; border: none; border-radius: 6px;
           font-size: 13px; cursor: pointer; }
    .wrap { width: 100%; border-collapse: collapse; }
    .wrap thead td, .wrap tfoot td { padding: 0; }
    .wrap tbody td { padding: 0 2.8cm; vertical-align: top; }
    @media screen {
      .wrap { max-width: 760px; margin: 0 auto; }
      .wrap thead td { height: 48px; }
      .wrap tfoot td { height: 32px; }
    }
    @media print {
      @page { size: A4; margin: 0; }
      .btn { display: none; }
      .wrap thead td { height: 2.2cm; }
      .wrap tfoot td { height: 1cm; }
      h2 { page-break-after: avoid; }
      p  { orphans: 3; widows: 3; }
    }
  </style>
</head>
<body>
  <button class="btn" onclick="window.print()">Imprimir / PDF</button>
  <table class="wrap">
    <thead><tr><td></td></tr></thead>
    <tfoot><tr><td></td></tr></tfoot>
    <tbody><tr><td>${contenido}</td></tr></tbody>
  </table>
</body>
</html>`;

        w.document.write(html);
        w.document.close();
    };

    /* ===================== CLASES ===================== */

    const input =
        "w-full px-3 py-2 border border-gray-300 rounded-lg text-slate-800 " +
        "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500";

    const textarea =
        "w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[120px] text-sm font-sans text-slate-800 " +
        "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500";

    const radioSi = (checked: boolean, onChange: () => void, label: string) => (
        <label className="flex items-center gap-2 mt-1 text-sm text-slate-800">
            <input type="radio" checked={checked} onChange={onChange} />
            {label}
        </label>
    );

    const radioNo = (checked: boolean, onChange: () => void, label: string) => (
        <label className="flex items-center gap-2 text-sm text-slate-800">
            <input type="radio" checked={checked} onChange={onChange} />
            {label}
        </label>
    );

    /* ===================== SECCIÓN ===================== */

    const renderSeccion = () => {
        switch (seccionActual) {

            /* ── 0. IDENTIFICACIÓN ── */
            case 0:
                return (
                    <>
                        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-2">
                            Identificación
                        </h2>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                            <p className="text-sm text-blue-800">
                                No introduzca datos identificativos reales del paciente.
                            </p>
                        </div>

                        <label className="block text-slate-800 font-semibold mb-1">Identificador</label>
                        <input
                            className={input}
                            placeholder="Ej: PAC-001"
                            value={historia.datosIdentificacion.identificador}
                            onChange={(e) => setHistoria({ ...historia, datosIdentificacion: { ...historia.datosIdentificacion, identificador: e.target.value } })}
                        />

                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Edad</label>
                                <input
                                    className={input}
                                    placeholder="Ej: 12 años"
                                    value={historia.datosIdentificacion.edad}
                                    onChange={(e) => setHistoria({ ...historia, datosIdentificacion: { ...historia.datosIdentificacion, edad: e.target.value } })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Sexo</label>
                                <input
                                    className={input}
                                    placeholder="Ej: Varón, Mujer"
                                    value={historia.datosIdentificacion.sexo}
                                    onChange={(e) => setHistoria({ ...historia, datosIdentificacion: { ...historia.datosIdentificacion, sexo: e.target.value } })}
                                />
                            </div>
                        </div>

                        <label className="block text-sm font-medium text-slate-700 mt-4 mb-1">Escolaridad</label>
                        <input
                            className={input}
                            placeholder="Ej: 6.º de Primaria, 2.º de ESO..."
                            value={historia.datosIdentificacion.escolaridad}
                            onChange={(e) => setHistoria({ ...historia, datosIdentificacion: { ...historia.datosIdentificacion, escolaridad: e.target.value } })}
                        />

                        <label className="block text-sm font-medium text-slate-700 mt-4 mb-1">Acude acompañado de</label>
                        <input
                            className={input}
                            placeholder="Ej: Ambos progenitores, madre, tutor legal..."
                            value={historia.datosIdentificacion.acompanante}
                            onChange={(e) => setHistoria({ ...historia, datosIdentificacion: { ...historia.datosIdentificacion, acompanante: e.target.value } })}
                        />

                        <h3 className="text-slate-800 font-semibold mt-8 mb-2">Motivo de Consulta</h3>
                        <textarea
                            className={`${textarea} min-h-[60px]`}
                            value={historia.motivoConsulta}
                            onChange={(e) => setHistoria({ ...historia, motivoConsulta: e.target.value })}
                        />

                        <h3 className="text-slate-800 font-semibold mt-6 mb-2">Psicobiografía / Historia Vital</h3>
                        <textarea
                            className={`${textarea} min-h-[140px]`}
                            placeholder="Historia vital relevante, contexto psicosocial, eventos significativos, desarrollo temprano..."
                            value={historia.psicobiografia}
                            onChange={(e) => setHistoria({ ...historia, psicobiografia: e.target.value })}
                        />
                    </>
                );

            /* ── 1. ANTECEDENTES ── */
            case 1:
                return (
                    <>
                        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-2">
                            Antecedentes Personales
                        </h2>

                        {/* Médico-quirúrgicos */}
                        <h3 className="text-slate-800 font-semibold mb-2">Antecedentes Médico-Quirúrgicos</h3>
                        <label className="block text-sm text-slate-700 mb-1">Alergias</label>
                        <input
                            className={input}
                            value={historia.antecedentes.alergias}
                            onChange={(e) => setHistoria({ ...historia, antecedentes: { ...historia.antecedentes, alergias: e.target.value } })}
                        />
                        <textarea
                            className={`${textarea} mt-3`}
                            placeholder="Patologías médicas, cirugías, comorbilidades, enfermedades crónicas..."
                            value={historia.antecedentes.medicoQuirurgicos}
                            onChange={(e) => setHistoria({ ...historia, antecedentes: { ...historia.antecedentes, medicoQuirurgicos: e.target.value } })}
                        />

                        {/* Desarrollo */}
                        <h3 className="text-slate-800 font-semibold mt-6 mb-2">Antecedentes del Desarrollo</h3>

                        <label className="block text-sm font-medium text-slate-800 mb-1">Embarazo y parto</label>
                        {radioNo(
                            historia.antecedentes.embarazoParto.estado === "normal",
                            () => setHistoria({ ...historia, antecedentes: { ...historia.antecedentes, embarazoParto: { estado: "normal", descripcion: "" } } }),
                            "Sin complicaciones referidas"
                        )}
                        {radioSi(
                            historia.antecedentes.embarazoParto.estado === "complicado",
                            () => setHistoria({ ...historia, antecedentes: { ...historia.antecedentes, embarazoParto: { ...historia.antecedentes.embarazoParto, estado: "complicado" } } }),
                            "Con complicaciones"
                        )}
                        {historia.antecedentes.embarazoParto.estado === "complicado" && (
                            <textarea
                                className={`${textarea} mt-2`}
                                placeholder="Describa las complicaciones (prematuridad, hipoxia, bajo peso, cesárea urgente...)..."
                                value={historia.antecedentes.embarazoParto.descripcion}
                                onChange={(e) => setHistoria({ ...historia, antecedentes: { ...historia.antecedentes, embarazoParto: { ...historia.antecedentes.embarazoParto, descripcion: e.target.value } } })}
                            />
                        )}

                        <label className="block text-sm font-medium text-slate-700 mt-4 mb-1">Desarrollo psicomotor</label>
                        <textarea
                            className={`${textarea} min-h-[80px]`}
                            placeholder="Primeros pasos, sedestación, marcha autónoma... Señalar si hay retrasos o regresiones."
                            value={historia.antecedentes.desarrolloPsicomotor}
                            onChange={(e) => setHistoria({ ...historia, antecedentes: { ...historia.antecedentes, desarrolloPsicomotor: e.target.value } })}
                        />

                        <label className="block text-sm font-medium text-slate-700 mt-4 mb-1">Desarrollo del lenguaje</label>
                        <textarea
                            className={`${textarea} min-h-[80px]`}
                            placeholder="Primeras palabras, frases, comunicación actual. Señalar retrasos, regresiones o dificultades articulatorias."
                            value={historia.antecedentes.lenguaje}
                            onChange={(e) => setHistoria({ ...historia, antecedentes: { ...historia.antecedentes, lenguaje: e.target.value } })}
                        />

                        {/* Salud mental */}
                        <h3 className="text-slate-800 font-semibold mt-6 mb-2">Antecedentes en Salud Mental</h3>
                        <textarea
                            className={textarea}
                            placeholder="Diagnósticos previos, evaluaciones anteriores, tratamientos psicológicos realizados..."
                            value={historia.antecedentes.saludMental}
                            onChange={(e) => setHistoria({ ...historia, antecedentes: { ...historia.antecedentes, saludMental: e.target.value } })}
                        />

                        <label className="block text-sm font-medium text-slate-700 mt-4 mb-1">Tratamientos previos</label>
                        <textarea
                            className={`${textarea} min-h-[80px]`}
                            placeholder="Psicofármacos previos, dosis, duración, motivo de suspensión..."
                            value={historia.antecedentes.tratamientosPrevios}
                            onChange={(e) => setHistoria({ ...historia, antecedentes: { ...historia.antecedentes, tratamientosPrevios: e.target.value } })}
                        />

                        {/* Ingresos */}
                        <label className="block text-sm font-medium text-slate-800 mt-4 mb-1">Ingresos psiquiátricos o pediátricos previos</label>
                        {radioNo(
                            historia.antecedentes.ingresos.estado === "no",
                            () => setHistoria({ ...historia, antecedentes: { ...historia.antecedentes, ingresos: { estado: "no", descripcion: "" } } }),
                            "No antecedentes de ingresos"
                        )}
                        {radioSi(
                            historia.antecedentes.ingresos.estado === "si",
                            () => setHistoria({ ...historia, antecedentes: { ...historia.antecedentes, ingresos: { ...historia.antecedentes.ingresos, estado: "si" } } }),
                            "Antecedentes de ingresos"
                        )}
                        {historia.antecedentes.ingresos.estado === "si" && (
                            <textarea
                                className={`${textarea} mt-2`}
                                placeholder="Número, fechas, duración, motivo..."
                                value={historia.antecedentes.ingresos.descripcion}
                                onChange={(e) => setHistoria({ ...historia, antecedentes: { ...historia.antecedentes, ingresos: { ...historia.antecedentes.ingresos, descripcion: e.target.value } } })}
                            />
                        )}

                        {/* Autolíticos / autolesiones */}
                        <label className="block text-sm font-medium text-slate-800 mt-4 mb-1">Conductas autolíticas o autolesivas previas</label>
                        {radioNo(
                            historia.antecedentes.autoliticos.estado === "no",
                            () => setHistoria({ ...historia, antecedentes: { ...historia.antecedentes, autoliticos: { estado: "no", descripcion: "" } } }),
                            "No antecedentes"
                        )}
                        {radioSi(
                            historia.antecedentes.autoliticos.estado === "si",
                            () => setHistoria({ ...historia, antecedentes: { ...historia.antecedentes, autoliticos: { ...historia.antecedentes.autoliticos, estado: "si" } } }),
                            "Con antecedentes"
                        )}
                        {historia.antecedentes.autoliticos.estado === "si" && (
                            <textarea
                                className={`${textarea} mt-2`}
                                placeholder="Tipo de conducta, número de episodios, método, contexto, intencionalidad, atención médica recibida..."
                                value={historia.antecedentes.autoliticos.descripcion}
                                onChange={(e) => setHistoria({ ...historia, antecedentes: { ...historia.antecedentes, autoliticos: { ...historia.antecedentes.autoliticos, descripcion: e.target.value } } })}
                            />
                        )}

                        <label className="block text-sm font-medium text-slate-700 mt-4 mb-1">Tratamiento habitual</label>
                        <input
                            className={input}
                            placeholder="Psicofármacos actuales, dosis, posología..."
                            value={historia.antecedentes.tratamientoHabitual}
                            onChange={(e) => setHistoria({ ...historia, antecedentes: { ...historia.antecedentes, tratamientoHabitual: e.target.value } })}
                        />

                        <label className="block text-sm font-medium text-slate-700 mt-4 mb-1">Hábitos tóxicos</label>
                        <p className="text-xs text-slate-400 mb-1">En preadolescentes puede no ser aplicable.</p>
                        <textarea
                            className={`${textarea} min-h-[80px]`}
                            placeholder="Tabaco, alcohol, cannabis u otras sustancias. Frecuencia, cantidad, edad de inicio..."
                            value={historia.antecedentes.habitosToxicos}
                            onChange={(e) => setHistoria({ ...historia, antecedentes: { ...historia.antecedentes, habitosToxicos: e.target.value } })}
                        />
                    </>
                );

            /* ── 2. FAMILIA Y ESCUELA ── */
            case 2:
                return (
                    <>
                        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-2">
                            Familia y Contexto Social
                        </h2>

                        {/* Familia */}
                        <h3 className="text-slate-800 font-semibold mb-2">Contexto Familiar</h3>

                        <label className="block text-sm font-medium text-slate-700 mb-1">Composición y estructura familiar</label>
                        <textarea
                            className={`${textarea} min-h-[100px]`}
                            placeholder="Con quién convive, estructura del hogar, situación de los progenitores (juntos, separados, fallecidos)..."
                            value={historia.familia.composicion}
                            onChange={(e) => setHistoria({ ...historia, familia: { ...historia.familia, composicion: e.target.value } })}
                        />

                        <label className="block text-sm font-medium text-slate-700 mt-4 mb-1">Dinámica y relaciones familiares</label>
                        <textarea
                            className={`${textarea} min-h-[100px]`}
                            placeholder="Calidad de las relaciones, conflictos, estilos parentales, apoyo familiar, comunicación..."
                            value={historia.familia.dinamica}
                            onChange={(e) => setHistoria({ ...historia, familia: { ...historia.familia, dinamica: e.target.value } })}
                        />

                        <label className="block text-sm font-medium text-slate-700 mt-4 mb-1">Salud mental familiar</label>
                        <textarea
                            className={`${textarea} min-h-[80px]`}
                            placeholder="Diagnósticos psiquiátricos en familiares de primer y segundo grado, tratamientos..."
                            value={historia.familia.saludMentalFamiliar}
                            onChange={(e) => setHistoria({ ...historia, familia: { ...historia.familia, saludMentalFamiliar: e.target.value } })}
                        />

                        <label className="block text-sm font-medium text-slate-800 mt-4 mb-1">Suicidio consumado en familia</label>
                        {radioNo(
                            historia.familia.suicidioFamiliar.estado === "no",
                            () => setHistoria({ ...historia, familia: { ...historia.familia, suicidioFamiliar: { estado: "no", descripcion: "" } } }),
                            "Niega antecedentes familiares de suicidio consumado"
                        )}
                        {radioSi(
                            historia.familia.suicidioFamiliar.estado === "si",
                            () => setHistoria({ ...historia, familia: { ...historia.familia, suicidioFamiliar: { ...historia.familia.suicidioFamiliar, estado: "si" } } }),
                            "Antecedentes familiares de suicidio consumado"
                        )}
                        {historia.familia.suicidioFamiliar.estado === "si" && (
                            <textarea
                                className={`${textarea} mt-2`}
                                placeholder="Parentesco, circunstancias conocidas por el paciente..."
                                value={historia.familia.suicidioFamiliar.descripcion}
                                onChange={(e) => setHistoria({ ...historia, familia: { ...historia.familia, suicidioFamiliar: { ...historia.familia.suicidioFamiliar, descripcion: e.target.value } } })}
                            />
                        )}

                        <label className="block text-sm font-medium text-slate-700 mt-4 mb-1">Eventos vitales estresantes</label>
                        <textarea
                            className={`${textarea} min-h-[100px]`}
                            placeholder="Pérdidas, divorcios, cambios de domicilio, situaciones de maltrato, acoso, trauma, migración..."
                            value={historia.familia.eventosVitales}
                            onChange={(e) => setHistoria({ ...historia, familia: { ...historia.familia, eventosVitales: e.target.value } })}
                        />

                        {/* Escuela */}
                        <h3 className="text-slate-800 font-semibold mt-8 mb-2">Contexto Escolar</h3>

                        <label className="block text-sm font-medium text-slate-700 mb-1">Centro y nivel educativo</label>
                        <input
                            className={input}
                            placeholder="Tipo de centro, adaptaciones curriculares, ACNEAE, apoyo en PT/AL..."
                            value={historia.escuela.centro}
                            onChange={(e) => setHistoria({ ...historia, escuela: { ...historia.escuela, centro: e.target.value } })}
                        />

                        <label className="block text-sm font-medium text-slate-700 mt-4 mb-1">Rendimiento académico</label>
                        <textarea
                            className={`${textarea} min-h-[80px]`}
                            placeholder="Calificaciones habituales, asignaturas problemáticas, cambios recientes en el rendimiento, repetición de curso..."
                            value={historia.escuela.rendimiento}
                            onChange={(e) => setHistoria({ ...historia, escuela: { ...historia.escuela, rendimiento: e.target.value } })}
                        />

                        <label className="block text-sm font-medium text-slate-700 mt-4 mb-1">Relaciones con iguales</label>
                        <textarea
                            className={`${textarea} min-h-[80px]`}
                            placeholder="Grupo de amigos, calidad de las relaciones, aislamiento, acoso escolar (como víctima o agresor)..."
                            value={historia.escuela.relacionesPares}
                            onChange={(e) => setHistoria({ ...historia, escuela: { ...historia.escuela, relacionesPares: e.target.value } })}
                        />

                        <label className="block text-sm font-medium text-slate-700 mt-4 mb-1">Conducta escolar</label>
                        <textarea
                            className={`${textarea} min-h-[80px]`}
                            placeholder="Comportamiento en aula, partes disciplinarios, expulsiones, actitud ante el profesorado..."
                            value={historia.escuela.conducta}
                            onChange={(e) => setHistoria({ ...historia, escuela: { ...historia.escuela, conducta: e.target.value } })}
                        />
                    </>
                );

            /* ── 3. EVALUACIÓN ── */
            case 3:
                return (
                    <>
                        <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
                            <h2 className="text-xl font-bold text-slate-800">Examen Mental</h2>
                            <Link
                                href="/tools/examen-mental"
                                target="_blank"
                                className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-3 py-1.5 transition-colors"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Abrir herramienta
                            </Link>
                        </div>
                        <textarea
                            className={`${textarea} min-h-[200px]`}
                            placeholder="Apariencia, conducta, nivel de actividad, orientación, atención, memoria, lenguaje, pensamiento, percepción, afecto, juicio e insight, actitud durante la entrevista..."
                            value={historia.examenMental}
                            onChange={(e) => setHistoria({ ...historia, examenMental: e.target.value })}
                        />

                        <div className="flex items-center justify-between mt-8 mb-4 border-b border-slate-200 pb-2">
                            <h2 className="text-xl font-bold text-slate-800">Juicio Clínico</h2>
                        </div>
                        <textarea
                            className={`${textarea} min-h-[200px]`}
                            placeholder="Integración clínica, hipótesis diagnóstica, diagnóstico diferencial, factores de riesgo y protectores, gravedad, pronóstico..."
                            value={historia.juicioClinico}
                            onChange={(e) => setHistoria({ ...historia, juicioClinico: e.target.value })}
                        />

                        <div className="flex items-center justify-between mt-8 mb-4 border-b border-slate-200 pb-2">
                            <h2 className="text-xl font-bold text-slate-800">Plan de Manejo</h2>
                            <Link
                                href="/tools/generador-pauta"
                                target="_blank"
                                className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-3 py-1.5 transition-colors"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Abrir generador de pauta
                            </Link>
                        </div>
                        <textarea
                            className={`${textarea} min-h-[200px]`}
                            placeholder="Conducta, tratamiento farmacológico, intervención psicológica, orientación familiar, coordinación escolar, interconsultas, seguimiento..."
                            value={historia.planManejo}
                            onChange={(e) => setHistoria({ ...historia, planManejo: e.target.value })}
                        />
                    </>
                );

            default:
                return null;
        }
    };

    /* ===================== RENDER ===================== */

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto p-4">

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <p className="text-sm text-amber-800">
                            Esta herramienta funciona íntegramente en el dispositivo del usuario.
                            No guarda ni transmite información clínica.
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Historia Clínica Infanto-Juvenil
                        </h1>
                        <p className="text-sm text-slate-600">Psiquiatría y Psicología Infanto-Juvenil</p>
                    </div>
                    <button
                        onClick={generarPDF}
                        className="flex items-center gap-2 px-5 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
                    >
                        <Download className="w-4 h-4" />
                        Generar PDF
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* Nav lateral */}
                    <aside className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-4 sticky top-[60px]">
                            <h3 className="text-sm font-semibold text-slate-800 mb-3 border-b pb-2">Secciones</h3>
                            <nav className="space-y-1">
                                {secciones.map((s) => {
                                    const Icon = s.icon;
                                    const active = seccionActual === s.id;
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => setSeccionActual(s.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                                                active
                                                    ? "bg-slate-700 text-white"
                                                    : "text-slate-700 hover:bg-slate-100"
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span className="text-sm">{s.titulo}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    {/* Contenido principal */}
                    <main className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow p-6 min-h-[400px]">
                            {renderSeccion()}

                            <div className="flex justify-between mt-10 pt-6 border-t">
                                <button
                                    disabled={seccionActual === 0}
                                    onClick={() => setSeccionActual(seccionActual - 1)}
                                    className="px-6 py-2 rounded-lg bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Anterior
                                </button>
                                {seccionActual === secciones.length - 1 ? (
                                    <button
                                        onClick={generarPDF}
                                        className="flex items-center gap-2 px-6 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-800"
                                    >
                                        <Download className="w-4 h-4" />
                                        Generar PDF
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setSeccionActual(seccionActual + 1)}
                                        className="px-6 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-800"
                                    >
                                        Siguiente
                                    </button>
                                )}
                            </div>
                        </div>
                    </main>

                    {/* Panel lateral fijo: Episodio Actual */}
                    <aside className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow p-6 sticky top-[60px] self-start">
                            <h3 className="text-slate-800 font-semibold mb-3 border-b border-slate-200 pb-2">
                                Episodio Actual
                            </h3>
                            <textarea
                                className={`${textarea} min-h-[280px]`}
                                value={historia.enfermedadActual}
                                onChange={(e) => setHistoria({ ...historia, enfermedadActual: e.target.value })}
                            />

                            <div className="mt-2 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={estructurarEpisodio}
                                    disabled={iaLoading || !historia.enfermedadActual.trim()}
                                    className="inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <Sparkles className="h-3.5 w-3.5" />
                                    {iaLoading ? "Estructurando..." : "Estructurar con IA"}
                                </button>
                                {iaError && <p className="text-xs text-red-500">{iaError}</p>}
                            </div>
                            <p className="mt-1.5 text-xs text-slate-400">
                                Esta función envía únicamente el contenido de &quot;Episodio Actual&quot; a un proveedor de IA. No introduzca datos identificativos de pacientes.
                            </p>

                            {iaPanel && (
                                <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                                            Propuesta de IA
                                        </p>
                                        <button
                                            type="button"
                                            onClick={descartarPropuesta}
                                            className="rounded-md p-1 text-violet-400 hover:bg-violet-100 hover:text-violet-700"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {iaOmisiones.length > 0 && (
                                        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                            <div className="flex items-start gap-2">
                                                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="text-xs font-semibold text-amber-800 mb-1.5">
                                                        Elementos no documentados a evaluar
                                                    </p>
                                                    <ul className="space-y-1">
                                                        {iaOmisiones.map((o, i) => (
                                                            <li key={i} className="text-xs text-amber-700">• {o}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <textarea
                                        className="min-h-[160px] w-full rounded-lg border border-violet-300 bg-white p-3 text-sm leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-300"
                                        value={iaPropuesta}
                                        onChange={(e) => setIaPropuesta(e.target.value)}
                                    />

                                    {!iaFeedbackUsado && (
                                        <div className="mt-3 rounded-lg border border-violet-200 bg-white p-3">
                                            <p className="mb-1.5 text-xs font-medium text-violet-700">
                                                Indicaciones de ajuste
                                            </p>
                                            <textarea
                                                value={iaFeedback}
                                                onChange={(e) => setIaFeedback(e.target.value)}
                                                rows={2}
                                                placeholder="Ej: acortar el texto, añadir que el inicio fue insidioso..."
                                                className="w-full resize-none rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-300"
                                            />
                                            <div className="mt-2 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={refinarPropuesta}
                                                    disabled={iaFeedbackLoading || !iaFeedback.trim()}
                                                    className="inline-flex items-center gap-1.5 rounded-md bg-violet-100 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    <Sparkles className="h-3 w-3" />
                                                    {iaFeedbackLoading ? "Ajustando…" : "Ajustar propuesta"}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-3 flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={descartarPropuesta}
                                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                                        >
                                            Descartar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={aceptarPropuesta}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium text-white hover:bg-violet-700"
                                        >
                                            <Check className="h-3.5 w-3.5" />
                                            Aceptar propuesta
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                </div>
            </div>
        </div>
    );
}

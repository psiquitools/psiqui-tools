"use client";

import { useState } from "react";
import {
    User,
    FileText,
    ClipboardList,
    Brain,
    Eye,
    Pill,
    Download,
    AlertCircle,
    ArrowLeft,
    ExternalLink,
    Sparkles,
    Check,
    X,
} from "lucide-react";
import Link from "next/link";

/* ===================== TIPOS ===================== */

interface HistoriaClinica {
    datosIdentificacion: {
        identificador: string;
        fechaHora: string;
    };
    motivoConsulta: string;
    enfermedadActual: string;
    antecedentes: {
        medicoQuirurgicos: string;
        alergias: string;
        saludMental: string;
        ingresosPsiq: {
            estado: "no" | "si";
            descripcion: string;
        };
        intentosAutoliticos: {
            estado: "no" | "si";
            descripcion: string;
        };
        tratamientoHabitual: string;
        familiaresSaludMental: string;
        habitosToxicos: string;
    };
    psicobiografia: string;
    examenMental: string;
    juicioClinico: string;
    planManejo: string;
}

/* ===================== SECCIONES ===================== */

const secciones = [
    { id: 0, titulo: "Identificación y Episodio Actual", icon: FileText },
    { id: 1, titulo: "Antecedentes Personales", icon: ClipboardList },
    { id: 2, titulo: "Psicobiografía", icon: User },
    { id: 3, titulo: "Examen Mental", icon: Brain },
    { id: 4, titulo: "Juicio Clínico", icon: Eye },
    { id: 5, titulo: "Plan de Manejo", icon: Pill },
];

export default function HistoriaClinicaPage() {
    const [seccionActual, setSeccionActual] = useState(0);

    const [iaLoading, setIaLoading]       = useState(false);
    const [iaError, setIaError]           = useState<string | null>(null);
    const [iaPropuesta, setIaPropuesta]   = useState("");
    const [iaPanel, setIaPanel]           = useState(false);

    const estructurarEpisodio = async () => {
        if (!historia.enfermedadActual.trim()) return;
        setIaLoading(true);
        setIaError(null);
        try {
            const res = await fetch("/api/estructurar-episodio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ texto: historia.enfermedadActual }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Error desconocido");
            setIaPropuesta(data.estructurado);
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
    };

    const descartarPropuesta = () => {
        setIaPanel(false);
        setIaPropuesta("");
        setIaError(null);
    };

    const [historia, setHistoria] = useState<HistoriaClinica>({
        datosIdentificacion: {
            identificador: "",
            fechaHora: new Date().toLocaleString("es-ES"),
        },
        motivoConsulta: "",
        enfermedadActual: "",
        antecedentes: {
            medicoQuirurgicos: "",
            alergias: "",
            saludMental: "",
            ingresosPsiq: { estado: "no", descripcion: "" },
            intentosAutoliticos: { estado: "no", descripcion: "" },
            tratamientoHabitual: "",
            familiaresSaludMental: "",
            habitosToxicos: "",
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

        const seccion = (titulo: string) =>
            `<h2>${esc(titulo)}</h2>`;

        const parrafos = (texto: string) => {
            if (!texto.trim()) return "<p>&nbsp;</p>";
            return texto
                .split(/\n{2,}/)
                .map((p) => p.replace(/\n/g, " ").replace(/\s+/g, " ").trim())
                .filter((p) => p.length > 0)
                .map((p) => `<p>${esc(p)}</p>`)
                .join("");
        };

        const { antecedentes } = historia;

        const ingresoTexto =
            antecedentes.ingresosPsiq.estado === "no"
                ? "No antecedentes de ingresos psiquiátricos previos."
                : "Antecedentes de ingresos psiquiátricos previos: " +
                  antecedentes.ingresosPsiq.descripcion.replace(/\n/g, " ").trim();

        const autoliticosTexto =
            antecedentes.intentosAutoliticos.estado === "no"
                ? "No antecedentes de intentos autolíticos previos."
                : "Antecedentes de intentos autolíticos previos: " +
                  antecedentes.intentosAutoliticos.descripcion.replace(/\n/g, " ").trim();

        const contenido = `
  <h1>HISTORIA CLÍNICA PSIQUIÁTRICA</h1>

  ${seccion("DATOS DE IDENTIFICACIÓN")}
  <p>Identificador: ${esc(historia.datosIdentificacion.identificador)}</p>

  ${seccion("MOTIVO DE CONSULTA")}
  ${parrafos(historia.motivoConsulta)}

  ${seccion("ANTECEDENTES PERSONALES MÉDICO-QUIRÚRGICOS")}
  <p>Alergias: ${esc(antecedentes.alergias)}</p>
  ${parrafos(antecedentes.medicoQuirurgicos)}

  ${seccion("ANTECEDENTES PERSONALES EN SALUD MENTAL")}
  ${parrafos(antecedentes.saludMental)}
  <p>${esc(ingresoTexto)}</p>
  <p>${esc(autoliticosTexto)}</p>
  <p class="sub">Tratamiento habitual:</p>
  ${parrafos(antecedentes.tratamientoHabitual)}

  ${seccion("ANTECEDENTES FAMILIARES EN SALUD MENTAL")}
  ${parrafos(antecedentes.familiaresSaludMental)}
  <p class="sub">Hábitos tóxicos:</p>
  ${parrafos(antecedentes.habitosToxicos)}

  ${seccion("PSICOBIOGRAFÍA")}
  ${parrafos(historia.psicobiografia)}

  ${seccion("ENFERMEDAD ACTUAL")}
  ${parrafos(historia.enfermedadActual)}

  ${seccion("EXAMEN MENTAL")}
  ${parrafos(historia.examenMental)}

  ${seccion("JUICIO CLÍNICO")}
  ${parrafos(historia.juicioClinico)}

  ${seccion("PLAN DE MANEJO")}
  ${parrafos(historia.planManejo)}`;

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Historia Clínica</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #111; margin: 0; }
    h1  { font-size: 11pt; font-weight: bold; margin: 0 0 20px; }
    h2  { font-size: 11pt; font-weight: bold; margin: 20px 0 4px; }
    p   { margin: 0 0 8px; }
    .sub { font-weight: bold; text-decoration: underline; margin: 16px 0 4px; }
    .btn { position: fixed; top: 16px; right: 16px; padding: 8px 18px;
           background: #1e293b; color: #fff; border: none; border-radius: 6px;
           font-size: 13px; cursor: pointer; }
    /* Tabla que envuelve el contenido — thead/tfoot se repiten en cada página impresa */
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
        "w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[120px] text-slate-800 " +
        "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500";

    /* ===================== CONTENIDO ===================== */

    const renderSeccion = () => {
        switch (seccionActual) {
            case 0:
                return (
                    <>
                        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-2">
                            Identificación y Episodio Actual
                        </h2>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                            <p className="text-sm text-blue-800">
                                No introduzca datos identificativos reales del paciente.
                            </p>
                        </div>

                        <label className="text-slate-800 font-semibold mt-8 mb-2">
                            Identificador
                        </label>
                        <input
                            className={input}
                            placeholder="Ej: PAC-001"
                            value={historia.datosIdentificacion.identificador}
                            onChange={(e) =>
                                setHistoria({
                                    ...historia,
                                    datosIdentificacion: {
                                        ...historia.datosIdentificacion,
                                        identificador: e.target.value,
                                    },
                                })
                            }
                        />

                        <h3 className="text-slate-800 font-semibold mt-8 mb-2">
                            Motivo de Consulta
                        </h3>
                        <textarea
                            className={`${textarea} min-h-[38px]`}
                            value={historia.motivoConsulta}
                            onChange={(e) =>
                                setHistoria({
                                    ...historia,
                                    motivoConsulta: e.target.value,
                                })
                            }
                        />

                        <h3 className="text-slate-800 font-semibold mt-6 mb-2">
                            Episodio Actual
                        </h3>
                        <textarea
                            className={`${textarea} min-h-[280px]`}
                            value={historia.enfermedadActual}
                            onChange={(e) =>
                                setHistoria({
                                    ...historia,
                                    enfermedadActual: e.target.value,
                                })
                            }
                        />

                        {/* Botón IA */}
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
                            {iaError && (
                                <p className="text-xs text-red-500">{iaError}</p>
                            )}
                        </div>

                        {/* Panel propuesta IA */}
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

                                <textarea
                                    className="min-h-[160px] w-full rounded-lg border border-violet-300 bg-white p-3 text-sm leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-300"
                                    value={iaPropuesta}
                                    onChange={(e) => setIaPropuesta(e.target.value)}
                                />

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
                    </>
                );

            case 1:
                return (
                    <>
                        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-2">
                            Antecedentes Personales
                        </h2>

                        <h3 className="text-slate-800 font-semibold mb-2">
                            Antecedentes Médico-Quirúrgicos
                        </h3>

                        <label className="block text-sm text-slate-700 mb-1">
                            Alergias
                        </label>
                        <input
                            className={input}
                            value={historia.antecedentes.alergias}
                            onChange={(e) =>
                                setHistoria({
                                    ...historia,
                                    antecedentes: {
                                        ...historia.antecedentes,
                                        alergias: e.target.value,
                                    },
                                })
                            }
                        />

                        <textarea
                            className={`${textarea} mt-3`}
                            placeholder="Patologías médicas relevantes, cirugías, comorbilidades..."
                            value={historia.antecedentes.medicoQuirurgicos}
                            onChange={(e) =>
                                setHistoria({
                                    ...historia,
                                    antecedentes: {
                                        ...historia.antecedentes,
                                        medicoQuirurgicos: e.target.value,
                                    },
                                })
                            }
                        />

                        <h3 className="text-slate-800 font-semibold mt-6 mb-2">
                            Antecedentes Personales en Salud Mental
                        </h3>

                        <textarea
                            className={textarea}
                            value={historia.antecedentes.saludMental}
                            onChange={(e) =>
                                setHistoria({
                                    ...historia,
                                    antecedentes: {
                                        ...historia.antecedentes,
                                        saludMental: e.target.value,
                                    },
                                })
                            }
                        />

                        <label className="block text-sm font-medium text-slate-800 mt-3 mb-1">
                            Ingresos psiquiátricos
                        </label>

                        <label className="flex items-center gap-2 text-sm text-slate-800">
                            <input
                                type="radio"
                                name="ingresosPsiq"
                                checked={historia.antecedentes.ingresosPsiq.estado === "no"}
                                onChange={() =>
                                    setHistoria({
                                        ...historia,
                                        antecedentes: {
                                            ...historia.antecedentes,
                                            ingresosPsiq: { estado: "no", descripcion: "" },
                                        },
                                    })
                                }
                            />
                            No antecedentes de ingresos psiquiátricos previos
                        </label>

                        <label className="flex items-center gap-2 mt-1 text-sm text-slate-800">
                            <input
                                type="radio"
                                name="ingresosPsiq"
                                checked={historia.antecedentes.ingresosPsiq.estado === "si"}
                                onChange={() =>
                                    setHistoria({
                                        ...historia,
                                        antecedentes: {
                                            ...historia.antecedentes,
                                            ingresosPsiq: {
                                                ...historia.antecedentes.ingresosPsiq,
                                                estado: "si",
                                            },
                                        },
                                    })
                                }
                            />
                            Presenta antecedentes de ingresos psiquiátricos
                        </label>

                        {historia.antecedentes.ingresosPsiq.estado === "si" && (
                            <textarea
                                className={`${textarea} mt-2`}
                                placeholder="Describa ingresos previos relevantes..."
                                value={historia.antecedentes.ingresosPsiq.descripcion}
                                onChange={(e) =>
                                    setHistoria({
                                        ...historia,
                                        antecedentes: {
                                            ...historia.antecedentes,
                                            ingresosPsiq: {
                                                ...historia.antecedentes.ingresosPsiq,
                                                descripcion: e.target.value,
                                            },
                                        },
                                    })
                                }
                            />
                        )}

                        <label className="block text-sm font-medium text-slate-800 mt-4 mb-1">
                            Intentos autolíticos
                        </label>

                        <label className="flex items-center gap-2 text-sm text-slate-800">
                            <input
                                type="radio"
                                name="intentosAutoliticos"
                                checked={historia.antecedentes.intentosAutoliticos.estado === "no"}
                                onChange={() =>
                                    setHistoria({
                                        ...historia,
                                        antecedentes: {
                                            ...historia.antecedentes,
                                            intentosAutoliticos: { estado: "no", descripcion: "" },
                                        },
                                    })
                                }
                            />
                            No antecedentes de intentos autolíticos previos
                        </label>

                        <label className="flex items-center gap-2 mt-1 text-sm text-slate-800">
                            <input
                                type="radio"
                                name="intentosAutoliticos"
                                checked={historia.antecedentes.intentosAutoliticos.estado === "si"}
                                onChange={() =>
                                    setHistoria({
                                        ...historia,
                                        antecedentes: {
                                            ...historia.antecedentes,
                                            intentosAutoliticos: {
                                                ...historia.antecedentes.intentosAutoliticos,
                                                estado: "si",
                                            },
                                        },
                                    })
                                }
                            />
                            Presenta antecedentes de intentos autolíticos
                        </label>

                        {historia.antecedentes.intentosAutoliticos.estado === "si" && (
                            <textarea
                                className={`${textarea} mt-2`}
                                placeholder="Describa intentos autolíticos previos..."
                                value={historia.antecedentes.intentosAutoliticos.descripcion}
                                onChange={(e) =>
                                    setHistoria({
                                        ...historia,
                                        antecedentes: {
                                            ...historia.antecedentes,
                                            intentosAutoliticos: {
                                                ...historia.antecedentes.intentosAutoliticos,
                                                descripcion: e.target.value,
                                            },
                                        },
                                    })
                                }
                            />
                        )}

                        <h3 className="text-slate-800 font-semibold mt-6 mb-2">
                            Tratamiento Habitual
                        </h3>
                        <textarea
                            className={textarea}
                            value={historia.antecedentes.tratamientoHabitual}
                            onChange={(e) =>
                                setHistoria({
                                    ...historia,
                                    antecedentes: {
                                        ...historia.antecedentes,
                                        tratamientoHabitual: e.target.value,
                                    },
                                })
                            }
                        />

                        <h3 className="text-slate-800 font-semibold mt-6 mb-2">
                            Antecedentes Familiares en Salud Mental
                        </h3>
                        <textarea
                            className={textarea}
                            value={historia.antecedentes.familiaresSaludMental}
                            onChange={(e) =>
                                setHistoria({
                                    ...historia,
                                    antecedentes: {
                                        ...historia.antecedentes,
                                        familiaresSaludMental: e.target.value,
                                    },
                                })
                            }
                        />

                        <h3 className="text-slate-800 font-semibold mt-6 mb-2">
                            Hábitos Tóxicos
                        </h3>
                        <textarea
                            className={textarea}
                            value={historia.antecedentes.habitosToxicos}
                            onChange={(e) =>
                                setHistoria({
                                    ...historia,
                                    antecedentes: {
                                        ...historia.antecedentes,
                                        habitosToxicos: e.target.value,
                                    },
                                })
                            }
                        />
                    </>
                );

            case 2:
                return (
                    <>
                        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                            Psicobiografía
                        </h2>
                        <textarea
                            className={textarea}
                            placeholder="Historia vital relevante, desarrollo, contexto psicosocial, eventos significativos..."
                            value={historia.psicobiografia}
                            onChange={(e) =>
                                setHistoria({ ...historia, psicobiografia: e.target.value })
                            }
                        />
                    </>
                );

            case 3:
                return (
                    <>
                        <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
                            <h2 className="text-xl font-bold text-slate-800">
                                Examen Mental
                            </h2>
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
                            placeholder="Apariencia, conducta, conciencia, orientación, atención, memoria, lenguaje, pensamiento, percepción, afecto, juicio e insight..."
                            value={historia.examenMental}
                            onChange={(e) =>
                                setHistoria({ ...historia, examenMental: e.target.value })
                            }
                        />
                    </>
                );

            case 4:
                return (
                    <>
                        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                            Juicio Clínico
                        </h2>
                        <textarea
                            className={textarea}
                            placeholder="Integración clínica, hipótesis diagnóstica, factores de riesgo, gravedad, juicio profesional..."
                            value={historia.juicioClinico}
                            onChange={(e) =>
                                setHistoria({ ...historia, juicioClinico: e.target.value })
                            }
                        />
                    </>
                );

            case 5:
                return (
                    <>
                        <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
                            <h2 className="text-xl font-bold text-slate-800">
                                Plan de Manejo
                            </h2>
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
                            className={textarea}
                            placeholder="Conducta, tratamiento farmacológico, contención, interconsultas, seguimiento..."
                            value={historia.planManejo}
                            onChange={(e) =>
                                setHistoria({ ...historia, planManejo: e.target.value })
                            }
                        />
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="sticky top-0 z-50 bg-white border-b">
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
                            Historia Clínica Psiquiátrica
                        </h1>
                        <p className="text-sm text-slate-600">Evaluación Completa</p>
                    </div>
                    <button
                        onClick={generarPDF}
                        className="flex items-center gap-2 px-5 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
                    >
                        <Download className="w-4 h-4" />
                        Generar PDF
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <aside className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-4 sticky top-28">
                            <h3 className="text-sm font-semibold text-slate-800 mb-3 border-b pb-2">
                                Secciones
                            </h3>
                            <nav className="space-y-1">
                                {secciones.map((s) => {
                                    const Icon = s.icon;
                                    const active = seccionActual === s.id;
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => setSeccionActual(s.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${active
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

                    <main className="lg:col-span-3">
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
                </div>
            </div>
        </div>
    );
}
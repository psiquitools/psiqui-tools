"use client";

import { useState } from "react";
import {
    User,
    FileText,
    Stethoscope,
    ClipboardList,
    Brain,
    Eye,
    Pill,
    Download,
    AlertCircle,
    ArrowLeft,
} from "lucide-react";
import jsPDF from "jspdf";
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
        hospitalizacionesPsiq: string;
        intentosAutoliticos: string;

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
    { id: 0, titulo: "Datos de Identificación", icon: User },
    { id: 1, titulo: "Motivo de Consulta", icon: FileText },
    { id: 2, titulo: "Enfermedad Actual", icon: Stethoscope },
    { id: 3, titulo: "Antecedentes Personales", icon: ClipboardList },
    { id: 4, titulo: "Psicobiografía", icon: User },
    { id: 5, titulo: "Examen Mental", icon: Brain },
    { id: 6, titulo: "Juicio Clínico", icon: Eye },
    { id: 7, titulo: "Plan de Manejo", icon: Pill },
];

export default function HistoriaClinicaPage() {
    const [seccionActual, setSeccionActual] = useState(0);

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
            hospitalizacionesPsiq: "",
            intentosAutoliticos: "",
            tratamientoHabitual: "",
            familiaresSaludMental: "",
            habitosToxicos: "",
        },
        psicobiografia: "",
        examenMental: "",
        juicioClinico: "",
        planManejo: "",
    });

    /* ===================== PDF (SIN CAMBIOS) ===================== */

    const generarPDF = () => {
        const doc = new jsPDF();
        const marginX = 20;
        let y = 20;
        const line = 7;
        const width = 170;

        const titulo = (texto: string) => {
            doc.setFont("helvetica", "bold");
            doc.text(texto, marginX, y);
            y += line;
            doc.setFont("helvetica", "normal");
        };

        const parrafo = (texto: string) => {
            const contenido = texto && texto.trim() !== "" ? texto : "No especificado";
            const lineas = doc.splitTextToSize(contenido, width);
            const pageHeight = doc.internal.pageSize.getHeight();

            lineas.forEach((linea: string) => {
                if (y > pageHeight - 20) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(linea, marginX, y);
                y += line;
            });

            y += line;
        };

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);

        // Encabezado
        doc.setFont("helvetica", "bold");
        doc.text("HISTORIA CLÍNICA PSIQUIÁTRICA", marginX, y);
        y += line * 2;

        doc.setFont("helvetica", "normal");
        doc.text(`Fecha y hora: ${historia.datosIdentificacion.fechaHora}`, marginX, y);
        y += line * 2;

        // 1. Datos de identificación
        titulo("1. DATOS DE IDENTIFICACIÓN");
        parrafo(`Identificador: ${historia.datosIdentificacion.identificador}`);

        // 2. Motivo de consulta
        titulo("2. MOTIVO DE CONSULTA");
        parrafo(historia.motivoConsulta);

        // 3. Antecedentes personales
        titulo("3. ANTECEDENTES PERSONALES");

        doc.setFont("helvetica", "bold");
        doc.text("ANTECEDENTES MÉDICO-QUIRÚRGICOS:", marginX, y);
        y += line;
        doc.setFont("helvetica", "normal");
        parrafo(historia.antecedentes.medicoQuirurgicos);

        parrafo(`Alergias: ${historia.antecedentes.alergias}`);

        doc.setFont("helvetica", "bold");
        doc.text("ANTECEDENTES PERSONALES EN SALUD MENTAL:", marginX, y);
        y += line;
        doc.setFont("helvetica", "normal");
        parrafo(historia.antecedentes.saludMental);

        parrafo(`Hospitalizaciones psiquiátricas: ${historia.antecedentes.hospitalizacionesPsiq}`);
        parrafo(`Intentos autolíticos: ${historia.antecedentes.intentosAutoliticos}`);

        // Subapartado menor
        doc.setFont("helvetica", "bold");
        doc.text("Tratamiento habitual:", marginX, y);
        y += line;
        doc.setFont("helvetica", "bold");
        parrafo(historia.antecedentes.tratamientoHabitual);

        doc.setFont("helvetica", "bold");
        doc.text("ANTECEDENTES FAMILIARES EN SALUD MENTAL:", marginX, y);
        y += line;
        doc.setFont("helvetica", "normal");
        parrafo(historia.antecedentes.familiaresSaludMental);

        doc.setFont("helvetica", "bold");
        doc.text("Hábitos tóxicos:", marginX, y);
        y += line;
        doc.setFont("helvetica", "normal");
        parrafo(historia.antecedentes.habitosToxicos);

        titulo("PSICOBIOGRAFÍA");
        parrafo(historia.psicobiografia);

        // 4. Enfermedad actual
        titulo("4. ENFERMEDAD ACTUAL");
        parrafo(historia.enfermedadActual);

        // 5. Examen mental
        titulo("5. EXAMEN MENTAL");
        parrafo(historia.examenMental);

        // 6. Juicio clínico
        titulo("6. JUICIO CLÍNICO");
        parrafo(historia.juicioClinico);

        // 7. Plan de manejo
        titulo("7. PLAN DE MANEJO");
        parrafo(historia.planManejo);

        // Abrir PDF en navegador
        const blob = doc.output("blob");
        window.open(URL.createObjectURL(blob), "_blank");
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
                        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                            Datos de Identificación
                        </h2>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-blue-800">
                                No introduzca datos identificativos reales del paciente.
                            </p>
                        </div>

                        <label className="block text-sm text-slate-700 mb-1">
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

                        <label className="block text-sm text-slate-700 mt-4 mb-1">
                            Fecha y hora
                        </label>
                        <input
                            className={`${input} bg-gray-50`}
                            readOnly
                            value={historia.datosIdentificacion.fechaHora}
                        />
                    </>
                );

            case 1:
                return (
                    <>
                        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                            Motivo de Consulta
                        </h2>
                        <textarea
                            className={textarea}
                            value={historia.motivoConsulta}
                            onChange={(e) =>
                                setHistoria({ ...historia, motivoConsulta: e.target.value })
                            }
                        />
                    </>
                );

            case 2:
                return (
                    <>
                        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                            Enfermedad Actual
                        </h2>
                        <textarea
                            className={`${textarea} min-h-[180px]`}
                            value={historia.enfermedadActual}
                            onChange={(e) =>
                                setHistoria({ ...historia, enfermedadActual: e.target.value })
                            }
                        />
                    </>
                );

            case 3:
                return (
                    <>
                        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-2">
                            Antecedentes Personales
                        </h2>

                        <h3 className="text-slate-800 font-semibold mb-2">
                            Antecedentes Médico-Quirúrgicos
                        </h3>
                        <textarea
                            className={textarea}
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

                        <label className="block text-sm text-slate-700 mt-3 mb-1">
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

                        <label className="block text-sm text-slate-700 mt-3 mb-1">
                            Hospitalizaciones psiquiátricas
                        </label>
                        <textarea
                            className={textarea}
                            value={historia.antecedentes.hospitalizacionesPsiq}
                            onChange={(e) =>
                                setHistoria({
                                    ...historia,
                                    antecedentes: {
                                        ...historia.antecedentes,
                                        hospitalizacionesPsiq: e.target.value,
                                    },
                                })
                            }
                        />

                        <label className="block text-sm text-slate-700 mt-3 mb-1">
                            Intentos autolíticos
                        </label>
                        <textarea
                            className={textarea}
                            value={historia.antecedentes.intentosAutoliticos}
                            onChange={(e) =>
                                setHistoria({
                                    ...historia,
                                    antecedentes: {
                                        ...historia.antecedentes,
                                        intentosAutoliticos: e.target.value,
                                    },
                                })
                            }
                        />

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
            case 4:
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
                                setHistoria({
                                    ...historia,
                                    psicobiografia: e.target.value,
                                })
                            }
                        />
                    </>
                );
            case 5:
                return (
                    <>
                        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                            Examen Mental
                        </h2>

                        <textarea
                            className={`${textarea} min-h-[200px]`}
                            placeholder="Apariencia, conducta, conciencia, orientación, atención, memoria, lenguaje, pensamiento, percepción, afecto, juicio e insight..."
                            value={historia.examenMental}
                            onChange={(e) =>
                                setHistoria({
                                    ...historia,
                                    examenMental: e.target.value,
                                })
                            }
                        />
                    </>
                );
            case 6:
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
                                setHistoria({
                                    ...historia,
                                    juicioClinico: e.target.value,
                                })
                            }
                        />
                    </>
                );
            case 7:
                return (
                    <>
                        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                            Plan de Manejo
                        </h2>

                        <textarea
                            className={textarea}
                            placeholder="Conducta, tratamiento farmacológico, contención, interconsultas, seguimiento..."
                            value={historia.planManejo}
                            onChange={(e) =>
                                setHistoria({
                                    ...historia,
                                    planManejo: e.target.value,
                                })
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
            {/* Barra superior fija */}
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
                {/* Aviso privacidad */}
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <p className="text-sm text-amber-800">
                            Esta herramienta funciona íntegramente en el dispositivo del usuario.
                            No guarda ni transmite información clínica.
                        </p>
                    </div>
                </div>

                {/* Encabezado */}
                <div className="bg-white rounded-lg shadow p-6 mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Historia Clínica Psiquiátrica
                        </h1>
                        <p className="text-sm text-slate-600">
                            Evaluación Completa
                        </p>
                    </div>

                    <button
                        onClick={generarPDF}
                        className="flex items-center gap-2 px-5 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
                    >
                        <Download className="w-4 h-4" />
                        Generar PDF
                    </button>
                </div>

                {/* Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
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

                    {/* Contenido */}
                    <main className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow p-6 min-h-[400px]">
                            {renderSeccion()}

                            <div className="flex justify-between mt-10 pt-6 border-t">
                                <button
                                    disabled={seccionActual === 0}
                                    onClick={() => setSeccionActual(seccionActual - 1)}
                                    className="
                    px-6 py-2 rounded-lg
                    bg-slate-100 text-slate-700
                    border border-slate-300
                    hover:bg-slate-200
                    disabled:opacity-40 disabled:cursor-not-allowed
                  "
                                >
                                    Anterior
                                </button>

                                <button
                                    onClick={() => setSeccionActual(seccionActual + 1)}
                                    disabled={seccionActual >= secciones.length - 1}
                                    className="
                    px-6 py-2 rounded-lg
                    bg-slate-700 text-white
                    hover:bg-slate-800
                    disabled:opacity-40 disabled:cursor-not-allowed
                  "
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
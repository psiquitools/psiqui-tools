import Link from "next/link";
import Image from "next/image";
import {
  Brain,
  FileText,
  ArrowRight,
  Activity,
  BookOpen,
  CalendarClock,
  Calculator,
  ClipboardList,
  LineChart,
} from "lucide-react";

export default function Prueba4() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F0F4FF" }}>

      <div className="mx-auto max-w-5xl p-6 md:p-12">

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-5 flex items-center justify-center">
            <div className="overflow-hidden rounded-2xl shadow-md">
              <Image
                src="/logo1.png"
                alt="psiqui.tools"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
          </div>

          <h1 className="mb-3 text-4xl tracking-wide">
            <span className="font-light" style={{ color: "#1E3A5F" }}>psiqui</span>
            <span className="font-semibold" style={{ color: "#4338CA" }}>.tools</span>
          </h1>

          <p
            className="mx-auto mb-8 max-w-2xl text-base tracking-wide"
            style={{ color: "rgba(29, 78, 216, 0.7)" }}
          >
            Herramientas clínicas para residentes de psiquiatría
          </p>
        </div>

        {/* Historia Clínica — card destacada */}
        <Link
          href="/tools/historia-clinica"
          className="group flex items-center gap-6 rounded-xl border border-[#1D4ED8] p-7 text-left transition-all duration-200 hover:shadow-[0_4px_20px_rgba(37,99,235,0.35)] w-full"
          style={{ backgroundColor: "#1D4ED8" }}
        >
          <div
            className="shrink-0 rounded-xl p-3 transition-colors"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
          >
            <FileText className="h-7 w-7" style={{ color: "#FFFFFF" }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="mb-1 text-2xl font-bold" style={{ color: "#FFFFFF" }}>
              Historia Clínica Psiquiátrica
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "#BFDBFE" }}>
              Formato estructurado para evaluación psiquiátrica completa. Recoge identificación, motivo de consulta, episodio actual, antecedentes y examen mental. Genera informe en PDF listo para archivar.
            </p>
          </div>
          <ArrowRight
            className="shrink-0 h-5 w-5 transition-all group-hover:translate-x-1"
            style={{ color: "#BFDBFE" }}
          />
        </Link>

        {/* Seguimiento — card normal */}
        <Link
          href="/tools/seguimiento"
          className="group mt-4 flex items-center gap-6 rounded-xl border border-[#DBEAFE] p-7 text-left transition-all duration-200 hover:border-[#2563EB] hover:shadow-[0_4px_20px_rgba(37,99,235,0.15)] w-full"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          <div className="shrink-0 rounded-xl p-3 transition-colors bg-[#EFF6FF] group-hover:bg-[#DBEAFE]">
            <CalendarClock className="h-7 w-7" style={{ color: "#1D4ED8" }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="mb-1 text-2xl font-bold" style={{ color: "#1E3A5F" }}>
              Consulta de Seguimiento
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(29, 78, 216, 0.7)" }}>
              Registra los dominios clínicos explorados, cambios de tratamiento y pauta de tomas. Genera la nota de seguimiento y la nota de tratamiento con IA.
            </p>
          </div>
          <ArrowRight
            className="shrink-0 h-5 w-5 transition-all group-hover:translate-x-1 text-[#93C5FD] group-hover:text-[#1D4ED8]"
          />
        </Link>

        {/* Evaluación */}
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">

          <Link
            href="/tools/examen-mental"
            className="group rounded-xl border border-[#DBEAFE] p-6 text-left transition-all duration-200 hover:border-[#2563EB] hover:shadow-[0_4px_20px_rgba(37,99,235,0.15)]"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl p-3" style={{ backgroundColor: "#EFF6FF" }}>
                <Brain className="h-5 w-5" style={{ color: "#1D4ED8" }} />
              </div>
              <ArrowRight className="h-4 w-4 transition-all group-hover:translate-x-0.5 text-[#93C5FD] group-hover:text-[#1D4ED8]" />
            </div>
            <h3 className="mt-4 mb-1 text-base font-semibold" style={{ color: "#1E3A5F" }}>
              Examen Mental
            </h3>
            <p className="text-sm" style={{ color: "rgba(29, 78, 216, 0.7)" }}>
              Elaborar el examen mental de forma estructurada.
            </p>
          </Link>

          <Link
            href="/tools/escalas-clinicas"
            className="group rounded-xl border border-[#DBEAFE] p-6 text-left transition-all duration-200 hover:border-[#2563EB] hover:shadow-[0_4px_20px_rgba(37,99,235,0.15)]"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl p-3" style={{ backgroundColor: "#EFF6FF" }}>
                <Activity className="h-5 w-5" style={{ color: "#1D4ED8" }} />
              </div>
              <ArrowRight className="h-4 w-4 transition-all group-hover:translate-x-0.5 text-[#93C5FD] group-hover:text-[#1D4ED8]" />
            </div>
            <h3 className="mt-4 mb-1 text-base font-semibold" style={{ color: "#1E3A5F" }}>
              Escalas Clínicas
            </h3>
            <p className="text-sm" style={{ color: "rgba(29, 78, 216, 0.7)" }}>
              Escalas de evaluación de uso frecuente en psiquiatría.
            </p>
          </Link>

          <Link
            href="/tools/linea-vida-psiquiatrica"
            className="group rounded-xl border border-[#DBEAFE] p-6 text-left transition-all duration-200 hover:border-[#2563EB] hover:shadow-[0_4px_20px_rgba(37,99,235,0.15)]"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl p-3" style={{ backgroundColor: "#EFF6FF" }}>
                <LineChart className="h-5 w-5" style={{ color: "#1D4ED8" }} />
              </div>
              <ArrowRight className="h-4 w-4 transition-all group-hover:translate-x-0.5 text-[#93C5FD] group-hover:text-[#1D4ED8]" />
            </div>
            <h3 className="mt-4 mb-1 text-base font-semibold" style={{ color: "#1E3A5F" }}>
              Línea de Vida
            </h3>
            <p className="text-sm" style={{ color: "rgba(29, 78, 216, 0.7)" }}>
              Evolución clínica del paciente representada visualmente.
            </p>
          </Link>

        </div>

        {/* Tratamiento */}
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">

          <Link
            href="/tools/generador-pauta"
            className="group rounded-xl border border-[#DBEAFE] p-6 text-left transition-all duration-200 hover:border-[#2563EB] hover:shadow-[0_4px_20px_rgba(37,99,235,0.15)]"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl p-3" style={{ backgroundColor: "#EFF6FF" }}>
                <ClipboardList className="h-5 w-5" style={{ color: "#1D4ED8" }} />
              </div>
              <ArrowRight className="h-4 w-4 transition-all group-hover:translate-x-0.5 text-[#93C5FD] group-hover:text-[#1D4ED8]" />
            </div>
            <h3 className="mt-4 mb-1 text-base font-semibold" style={{ color: "#1E3A5F" }}>
              Generador de Pauta
            </h3>
            <p className="text-sm" style={{ color: "rgba(29, 78, 216, 0.7)" }}>
              Genera pauta de tratamiento para el plan de manejo.
            </p>
          </Link>

          <Link
            href="/tools/calculadoras-clinicas"
            className="group rounded-xl border border-[#DBEAFE] p-6 text-left transition-all duration-200 hover:border-[#2563EB] hover:shadow-[0_4px_20px_rgba(37,99,235,0.15)]"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl p-3" style={{ backgroundColor: "#EFF6FF" }}>
                <Calculator className="h-5 w-5" style={{ color: "#1D4ED8" }} />
              </div>
              <ArrowRight className="h-4 w-4 transition-all group-hover:translate-x-0.5 text-[#93C5FD] group-hover:text-[#1D4ED8]" />
            </div>
            <h3 className="mt-4 mb-1 text-base font-semibold" style={{ color: "#1E3A5F" }}>
              Herramientas Farmacológicas
            </h3>
            <p className="text-sm" style={{ color: "rgba(29, 78, 216, 0.7)" }}>
              Dosis, equivalencias, planes de discontinuación y más.
            </p>
          </Link>

          <Link
            href="/recursos-psicoeducacion"
            className="group rounded-xl border border-[#DBEAFE] p-6 text-left transition-all duration-200 hover:border-[#2563EB] hover:shadow-[0_4px_20px_rgba(37,99,235,0.15)]"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl p-3" style={{ backgroundColor: "#EFF6FF" }}>
                <BookOpen className="h-5 w-5" style={{ color: "#1D4ED8" }} />
              </div>
              <ArrowRight className="h-4 w-4 transition-all group-hover:translate-x-0.5 text-[#93C5FD] group-hover:text-[#1D4ED8]" />
            </div>
            <h3 className="mt-4 mb-1 text-base font-semibold" style={{ color: "#1E3A5F" }}>
              Recursos de Psicoeducación
            </h3>
            <p className="text-sm" style={{ color: "rgba(29, 78, 216, 0.7)" }}>
              Material educativo para pacientes y familiares listo para entregar en consulta.
            </p>
          </Link>

        </div>

        {/* Footer */}
        <div className="mt-16 flex flex-col items-center gap-3 text-center border-t border-[#DBEAFE] pt-8">
          <p className="text-sm" style={{ color: "rgba(37, 99, 235, 0.6)" }}>
            Herramienta con fines formativos • No sustituye el criterio médico profesional •{" "}
            <Link
              href="/feedback"
              className="underline underline-offset-2 hover:text-[#1E3A5F] transition-colors"
              style={{ color: "rgba(37, 99, 235, 0.6)" }}
            >
              ¿Sugerencias? Escríbenos
            </Link>
          </p>
          <p className="text-xs" style={{ color: "rgba(37, 99, 235, 0.5)" }}>
            Todas las herramientas funcionan localmente en tu dispositivo. No se almacena ni transmite información clínica.
          </p>
        </div>

      </div>
    </div>
  );
}

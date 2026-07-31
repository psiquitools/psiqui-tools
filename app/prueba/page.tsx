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

export default function Prueba() {
  return (
    <div className="min-h-screen bg-white">

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
            <span className="font-light" style={{ color: "#1E1B4B" }}>psiqui</span>
            <span className="font-semibold" style={{ color: "#4338CA" }}>.tools</span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-base tracking-wide text-slate-500">
            Herramientas clínicas para residentes de psiquiatría
          </p>
        </div>

        {/* Bloque 1 — Historia Clínica + Seguimiento en paralelo */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          <Link
            href="/tools/historia-clinica"
            className="group flex flex-col gap-4 rounded-xl bg-slate-100 border border-slate-200 p-7 text-left transition-all duration-200 hover:bg-slate-150 hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="shrink-0 rounded-xl bg-slate-800 p-3 transition-colors group-hover:bg-slate-700">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-slate-700" />
            </div>
            <div>
              <h3 className="mb-1 text-xl font-bold text-slate-900">Historia Clínica Psiquiátrica</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Formato estructurado para evaluación psiquiátrica completa. Recoge identificación, motivo de consulta, episodio actual, antecedentes y examen mental. Genera informe en PDF listo para archivar.
              </p>
            </div>
          </Link>

          <Link
            href="/tools/seguimiento"
            className="group flex flex-col gap-4 rounded-xl border border-amber-200 bg-amber-50 p-7 text-left transition-all duration-200 hover:border-amber-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="shrink-0 rounded-xl bg-amber-100 p-3 transition-colors group-hover:bg-amber-200">
                <CalendarClock className="h-7 w-7 text-amber-600" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-slate-700" />
            </div>
            <div>
              <h3 className="mb-1 text-xl font-bold text-slate-900">Consulta de Seguimiento</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Registra los dominios clínicos explorados, cambios de tratamiento y pauta de tomas. Genera la nota de seguimiento y la nota de tratamiento con IA.
              </p>
            </div>
          </Link>

        </div>

        {/* Bloque 2 — Evaluación */}
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">

          <Link
            href="/tools/examen-mental"
            className="group rounded-xl border border-slate-300 bg-white p-6 text-left transition-all duration-200 hover:border-slate-400 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-slate-50 p-3">
                <Brain className="h-5 w-5 text-slate-600" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-slate-600" />
            </div>
            <h3 className="mt-4 mb-1 text-base font-semibold text-slate-800">Examen Mental</h3>
            <p className="text-sm text-slate-500">
              Elaborar el examen mental de forma estructurada.
            </p>
          </Link>

          <Link
            href="/tools/escalas-clinicas"
            className="group rounded-xl border border-slate-300 bg-white p-6 text-left transition-all duration-200 hover:border-slate-400 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-slate-50 p-3">
                <Activity className="h-5 w-5 text-slate-600" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-slate-600" />
            </div>
            <h3 className="mt-4 mb-1 text-base font-semibold text-slate-800">Escalas Clínicas</h3>
            <p className="text-sm text-slate-500">
              Escalas de evaluación de uso frecuente en psiquiatría.
            </p>
          </Link>

          <Link
            href="/tools/linea-vida-psiquiatrica"
            className="group rounded-xl border border-slate-300 bg-white p-6 text-left transition-all duration-200 hover:border-slate-400 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-slate-50 p-3">
                <LineChart className="h-5 w-5 text-slate-600" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-slate-600" />
            </div>
            <h3 className="mt-4 mb-1 text-base font-semibold text-slate-800">Línea de Vida</h3>
            <p className="text-sm text-slate-500">
              Evolución clínica del paciente representada visualmente.
            </p>
          </Link>

        </div>

        {/* Bloque 3 — Tratamiento */}
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">

          <Link
            href="/tools/generador-pauta"
            className="group rounded-xl border border-slate-300 bg-white p-6 text-left transition-all duration-200 hover:border-slate-400 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-slate-50 p-3">
                <ClipboardList className="h-5 w-5 text-slate-600" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-slate-600" />
            </div>
            <h3 className="mt-4 mb-1 text-base font-semibold text-slate-800">Generador de Pauta</h3>
            <p className="text-sm text-slate-500">
              Genera pauta de tratamiento para el plan de manejo.
            </p>
          </Link>

          <Link
            href="/tools/calculadoras-clinicas"
            className="group rounded-xl border border-slate-300 bg-white p-6 text-left transition-all duration-200 hover:border-slate-400 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-slate-50 p-3">
                <Calculator className="h-5 w-5 text-slate-600" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-slate-600" />
            </div>
            <h3 className="mt-4 mb-1 text-base font-semibold text-slate-800">Herramientas Farmacológicas</h3>
            <p className="text-sm text-slate-500">
              Dosis, equivalencias, planes de discontinuación y más.
            </p>
          </Link>

          <Link
            href="/recursos-psicoeducacion"
            className="group rounded-xl border border-slate-300 bg-white p-6 text-left transition-all duration-200 hover:border-slate-400 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-slate-50 p-3">
                <BookOpen className="h-5 w-5 text-slate-600" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-slate-600" />
            </div>
            <h3 className="mt-4 mb-1 text-base font-semibold text-slate-800">Recursos de Psicoeducación</h3>
            <p className="text-sm text-slate-500">
              Material educativo para pacientes y familiares listo para entregar en consulta.
            </p>
          </Link>

        </div>

        {/* Footer */}
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-slate-500">
            Herramienta con fines formativos • No sustituye el criterio médico profesional •{" "}
            <Link
              href="/feedback"
              className="underline underline-offset-2 hover:text-slate-800 transition-colors"
            >
              ¿Sugerencias? Escríbenos
            </Link>
          </p>
          <p className="text-xs text-slate-400">
            Todas las herramientas funcionan localmente en tu dispositivo. No se almacena ni transmite información clínica.
          </p>
        </div>

      </div>
    </div>
  );
}

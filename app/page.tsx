import Link from "next/link";
import Image from "next/image";
import {
  Brain,
  FileText,
  ArrowRight,
  Shield,
  Activity,
  BookOpen,
  History,
  Calculator,
  ClipboardList,
  LineChart,
} from "lucide-react";
import FeedbackSection from "./components/FeedbackSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">

      <div className="mx-auto max-w-6xl p-6 md:p-12">

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-6 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-slate-800 shadow-lg">
              <Image
                src="/logo1.png"
                alt="psiqui.tools"
                width={85}
                height={85}
                className="object-contain"
                priority
              />
            </div>
          </div>

          <h1 className="mb-3 text-4xl tracking-tight text-slate-800 md:text-5xl">
            <span className="font-light">psiqui</span>
            <span className="font-normal">.tools</span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
            Herramientas clínicas para residentes de psiquiatría
          </p>

          {/* Disclaimer */}
          <div className="mx-auto mb-12 max-w-3xl rounded-lg bg-slate-800 p-4 text-white">
            <div className="flex items-start gap-3 text-left">
              <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-300" />
              <div>
                <h3 className="mb-1 text-sm font-semibold">Privacidad y Seguridad</h3>
                <p className="text-sm text-slate-300">
                  Todas las herramientas funcionan localmente en su dispositivo.
                  No se almacena, transmite ni guarda información clínica. Evite
                  introducir datos identificativos de pacientes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de herramientas */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

          {/* Historia Clínica — tamaño normal */}
          <Link
            href="/tools/historia-clinica"
            className="group relative rounded-lg border-2 border-slate-200 bg-white p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:border-slate-400 hover:shadow-xl"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-slate-100 p-3 transition-colors group-hover:bg-slate-800">
                <FileText className="h-6 w-6 text-slate-700 transition-colors group-hover:text-white" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-slate-800" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-800">Historia Clínica Psiquiátrica</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Formato estructurado para evaluación psiquiátrica básica. Generación de informe en PDF.
            </p>
          </Link>

          {/* Examen Mental + Generador de Pauta — apilados, mismo ancho que una tarjeta normal */}
          <div className="flex flex-col gap-3">
            <Link
              href="/tools/examen-mental"
              className="flex-1 group relative rounded-lg border-2 border-indigo-100 bg-indigo-50 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="rounded-lg bg-white p-2 shadow-sm transition-colors group-hover:bg-indigo-700">
                  <Brain className="h-5 w-5 text-indigo-600 transition-colors group-hover:text-white" />
                </div>
                <ArrowRight className="h-4 w-4 text-indigo-300 transition-all group-hover:translate-x-1 group-hover:text-indigo-700" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-indigo-900">Examen Mental</h3>
              <p className="text-xs leading-relaxed text-indigo-500">
                Herramienta de ayuda para elaborar el examen mental de forma estructurada.
              </p>
            </Link>

            <Link
              href="/tools/generador-pauta"
              className="flex-1 group relative rounded-lg border-2 border-indigo-100 bg-indigo-50 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="rounded-lg bg-white p-2 shadow-sm transition-colors group-hover:bg-indigo-700">
                  <ClipboardList className="h-5 w-5 text-indigo-600 transition-colors group-hover:text-white" />
                </div>
                <ArrowRight className="h-4 w-4 text-indigo-300 transition-all group-hover:translate-x-1 group-hover:text-indigo-700" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-indigo-900">Generador de Pauta</h3>
              <p className="text-xs leading-relaxed text-indigo-500">
                Generar pauta de tratamiento para el plan de manejo.
              </p>
            </Link>
          </div>

          {/* Escalas Clínicas */}
          <Link
            href="/tools/escalas-clinicas"
            className="group relative rounded-lg border-2 border-slate-200 bg-white p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:border-slate-400 hover:shadow-xl"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-slate-100 p-3 transition-colors group-hover:bg-slate-800">
                <Activity className="h-6 w-6 text-slate-700 transition-colors group-hover:text-white" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-slate-800" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-800">Escalas Clínicas</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Escalas de evaluación de uso frecuente en psiquiatría.
            </p>
          </Link>

          {/* Calculadoras Clínicas */}
          <Link
            href="/tools/calculadoras-clinicas"
            className="group relative rounded-lg border-2 border-slate-200 bg-white p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:border-slate-400 hover:shadow-xl"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-slate-100 p-3 transition-colors group-hover:bg-slate-800">
                <Calculator className="h-6 w-6 text-slate-700 transition-colors group-hover:text-white" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-slate-800" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-800">Herramientas Farmacológicas</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Dosis, equivalencias, planes de discontinuación y más.
            </p>
          </Link>

          {/* Psicoeducación */}
          <Link
            href="/recursos-psicoeducacion"
            className="group relative rounded-lg border-2 border-slate-200 bg-white p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:border-slate-400 hover:shadow-xl"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-slate-100 p-3 transition-colors group-hover:bg-slate-800">
                <BookOpen className="h-6 w-6 text-slate-700 transition-colors group-hover:text-white" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-slate-800" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-800">Recursos de Psicoeducación</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Material educativo para pacientes y familiares, listo para imprimir y entregar en consulta.
            </p>
          </Link>

          {/* Organizador de Antecedentes */}
          <Link
            href="/tools/organizador-antecedentes-psq"
            className="group relative rounded-lg border-2 border-slate-200 bg-white p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:border-slate-400 hover:shadow-xl"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-slate-100 p-3 transition-colors group-hover:bg-slate-800">
                <History className="h-6 w-6 text-slate-700 transition-colors group-hover:text-white" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-slate-800" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-800">Organizador de Antecedentes</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Organiza de forma cornológica los antecedentes psiquiátricos del paciente.
            </p>
          </Link>

          {/* Gráfico de Vida Psiquiátrica */}
          <Link
            href="/tools/grafico-vida-psiquiatrica"
            className="group relative rounded-lg border-2 border-slate-200 bg-white p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:border-slate-400 hover:shadow-xl"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-slate-100 p-3 transition-colors group-hover:bg-slate-800">
                <LineChart className="h-6 w-6 text-slate-700 transition-colors group-hover:text-white" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-slate-800" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-800">Gráfico de Vida Psiquiátrica</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Representa visualmente la evolución clínica del paciente a lo largo del tiempo.
            </p>
          </Link>

        </div>

        <FeedbackSection />

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-500">
            Herramienta con fines formativos • No sustituye el criterio médico profesional
          </p>
        </div>
      </div>
    </div>
  );
}

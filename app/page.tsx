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
} from "lucide-react";

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: typeof Brain;
  available: boolean;
  href: string;
}

export default function Home() {
  const tools: Tool[] = [
    {
      id: "historia-clinica",
      title: "Historia Clínica de Urgencias",
      description:
        "Formato estructurado para evaluación psiquiátrica básica. Generación de informes en PDF.",
      icon: FileText,
      available: true,
      href: "/tools/historia-clinica",
    },
    {
      id: "examen-mental",
      title: "Examen Mental",
      description:
        "Herramienta tipo checklist para elaborar examen mental de forma estructurada.",
      icon: Brain,
      available: true,
      href: "/tools/examen-mental",
    },
    {
      id: "escalas-clinicas",
      title: "Escalas Clínicas",
      description:
        "Calculadoras clínicas de uso frecuente en psiquiatría.",
      icon: Activity,
      available: true,
      href: "/tools/escalas-clinicas",
    },
    {
      id: "psicoeducacion",
      title: "Recursos de Psicoeducación",
      description:
        "Material educativo para pacientes y familiares, listo para imprimir y entregar en consulta.",
      icon: BookOpen,
      available: true,
      href: "/recursos-psicoeducacion",
    },
    {
      id: "antecedentes",
      title: "Organizador de Antecedentes",
      description:
        "Introduce los eventos de los antecedentes psiquiátricos del paciente y esta herramienta los organizará cronológicamente.",
      icon: History,
      available: true,
      href: "/tools/organizador-antecedentes-psq",
    },
  ];

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
                <h3 className="mb-1 text-sm font-semibold">
                  Privacidad y Seguridad
                </h3>
                <p className="text-sm text-slate-300">
                  Todas las herramientas funcionan localmente en su dispositivo.
                  No se almacena, transmite ni guarda información clínica. De cualquier forma, evite
                  introducir datos identificativos de pacientes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de herramientas */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;

            return (
              <Link
                key={tool.id}
                href={tool.href}
                className="group relative rounded-lg border-2 border-slate-200 bg-white p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:border-slate-400 hover:shadow-xl"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-slate-100 p-3 transition-colors group-hover:bg-slate-800">
                    <Icon className="h-6 w-6 text-slate-700 transition-colors group-hover:text-white" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-slate-800" />
                </div>

                <h3 className="mb-2 text-lg font-semibold text-slate-800">
                  {tool.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {tool.description}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-500">
            Herramienta de apoyo clínico • No sustituye el criterio médico
            profesional
          </p>
        </div>
      </div>
    </div>
  );
}
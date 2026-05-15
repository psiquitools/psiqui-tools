import Link from "next/link";
import { ArrowLeft, ArrowRight, Pill } from "lucide-react";

interface Calculadora {
    id: string;
    title: string;
    description: string;
    icon: typeof Pill;
    href: string;
}

export default function CalculadorasPage() {
    const calculadoras: Calculadora[] = [
        {
            id: "equivalencias-bzd",
            title: "Equivalencias de benzodiacepinas",
            description:
                "Conversión entre benzodiacepinas usando diazepam como referencia. Incluye fármacos Z y presentaciones disponibles en España.",
            icon: Pill,
            href: "/tools/calculadoras-clinicas/equivalencias-bzd",
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Volver */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a psiqui.tools
                </Link>

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Calculadoras Clínicas
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Conversiones y cálculos de uso frecuente en psiquiatría
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {calculadoras.map((calc) => {
                        const Icon = calc.icon;
                        return (
                            <Link
                                key={calc.id}
                                href={calc.href}
                                className="group bg-white border-2 border-slate-200 rounded-lg p-6 hover:border-slate-400 hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="bg-slate-100 p-3 rounded-lg group-hover:bg-slate-800 transition-colors">
                                        <Icon className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors" />
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-slate-800 transition-all" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                    {calc.title}
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {calc.description}
                                </p>
                            </Link>
                        );
                    })}
                </div>

                {/* Footer */}
                <p className="text-xs text-slate-400 text-center pt-4">
                    Herramienta de apoyo clínico • No sustituye el criterio médico profesional
                </p>

            </div>
        </div>
    );
}
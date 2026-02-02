"use client";

import Link from "next/link";
import {
    Activity,
    ArrowLeft,
    AlertCircle,
} from "lucide-react";

export default function EscalasClinicasPage() {
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
                {/* Aviso de privacidad */}
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <p className="text-sm text-amber-800">
                            Las escalas clínicas se calculan íntegramente en el navegador.
                            No se almacena ni transmite información clínica.
                        </p>
                    </div>
                </div>

                {/* Encabezado */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-slate-100 rounded-lg">
                            <Activity className="w-6 h-6 text-slate-700" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">
                                Escalas Clínicas
                            </h1>
                            <p className="text-sm text-slate-600">
                                Herramientas de evaluación clínica de uso frecuente en psiquiatría
                            </p>
                        </div>
                    </div>
                </div>

                {/* Grid de escalas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* CIWA-Ar */}
                    <Link
                        href="/tools/escalas-clinicas/ciwa-ar"
                        className="
              group bg-white rounded-lg border-2 border-slate-200 p-6
              hover:border-slate-400 hover:shadow-lg transition
            "
                    >
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                            CIWA-Ar
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Escala de evaluación del síndrome de abstinencia alcohólica.
                            Permite estimar gravedad y orientar el manejo.
                        </p>
                    </Link>

                    {/* PHQ-9 */}
                    <Link
                        href="/tools/escalas-clinicas/phq-9"
                        className="
              group bg-white rounded-lg border-2 border-slate-200 p-6
              hover:border-slate-400 hover:shadow-lg transition
            "
                    >
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                            PHQ-9
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Cuestionario de cribado y severidad de depresión.
                            Incluye ítem de riesgo suicida.
                        </p>
                    </Link>

                    {/* GAD-7 */}
                    <Link
                        href="/tools/escalas-clinicas/gad-7"
                        className="
              group bg-white rounded-lg border-2 border-slate-200 p-6
              hover:border-slate-400 hover:shadow-lg transition
            "
                    >
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                            GAD-7
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Escala de ansiedad generalizada.
                            Útil para cribado y seguimiento clínico.
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
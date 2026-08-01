"use client";

import { useState, useMemo } from "react";
import { AlertCircle, Copy, Check, Info } from "lucide-react";

type Pluma = {
    id: string;
    label: string;
    concentracion: number; // mg/mL
    dosis_max: number;
    dosis_estandar: number[];
};

// Fórmula: clicks = Math.round(dosis_mg * 100 / concentracion_mg_ml)
// Cada click = 0,01 mL independientemente de la pluma
const PLUMAS: Pluma[] = [
    {
        id: "ozempic-1mg",
        label: "Ozempic 1 mg",
        concentracion: 1.34,
        dosis_max: 4.0,   // 4 × 1 mg = 4 mg total (3 mL)
        dosis_estandar: [0.25, 0.5, 1.0],
    },
    {
        id: "wegovy-1mg",
        label: "Wegovy 1 mg",
        concentracion: 1.34,
        dosis_max: 4.0,   // 4 × 1 mg = 4 mg total (3 mL)
        dosis_estandar: [0.25, 0.5, 1.0],
    },
    {
        id: "wegovy-17mg",
        label: "Wegovy 1,7 mg",
        concentracion: 2.27,
        dosis_max: 6.8,   // 4 × 1,7 mg = 6,8 mg total (3 mL)
        dosis_estandar: [0.25, 0.5, 1.0, 1.7],
    },
    {
        id: "wegovy-24mg",
        label: "Wegovy 2,4 mg",
        concentracion: 3.20,
        dosis_max: 9.6,   // 4 × 2,4 mg = 9,6 mg total (3 mL)
        dosis_estandar: [0.25, 0.5, 1.0, 1.7, 2.4],
    },
];

function fmt(n: number) {
    return (Math.round(n * 1000) / 1000).toString().replace(".", ",");
}

export default function SemaglutidaPage() {
    const [plumaId, setPlumaId] = useState("ozempic-1mg");
    const [inputVal, setInputVal] = useState("");
    const [copied, setCopied] = useState(false);

    const pluma = PLUMAS.find(p => p.id === plumaId)!;
    const dosis = parseFloat(inputVal.replace(",", "."));
    const valid = !isNaN(dosis) && dosis > 0;

    const resultado = useMemo(() => {
        if (!valid) return null;
        const clicks = Math.round(dosis * 100 / pluma.concentracion);
        const dosisReal = Math.round(clicks * pluma.concentracion) / 100;
        const redondeado = Math.abs(dosisReal - dosis) >= 0.005;
        const excede = dosis > pluma.dosis_max;
        return { clicks, dosisReal, redondeado, excede };
    }, [valid, dosis, pluma]);

    const copy = () => {
        if (!resultado) return;
        navigator.clipboard.writeText(
            `${pluma.label}: ${fmt(resultado.dosisReal)} mg → ${resultado.clicks} clicks`
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6">
            <div className="max-w-xl mx-auto space-y-6">

                <div>
                    <h1 className="text-2xl font-semibold">Semaglutida · Clicks por dosis</h1>
                    <p className="text-sm text-slate-600">Selecciona la pluma, introduce los mg y obtén los clicks</p>
                </div>

                {/* Selector de pluma */}
                <div className="flex flex-wrap gap-2">
                    {PLUMAS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => { setPlumaId(p.id); setInputVal(""); }}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                plumaId === p.id
                                    ? "bg-slate-800 text-white"
                                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900"
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Info de la pluma */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-3 text-center text-sm">
                        <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-slate-500 mb-1">Concentración</p>
                            <p className="font-bold">{fmt(pluma.concentracion)} mg/mL</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-slate-500 mb-1">Por click</p>
                            <p className="font-bold">{fmt(pluma.concentracion / 100)} mg</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-slate-500 mb-1">Dosis máx.</p>
                            <p className="font-bold">{fmt(pluma.dosis_max)} mg</p>
                        </div>
                    </div>
                </div>

                {/* Input */}
                <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Dosis deseada (mg/semana)</label>

                        {/* Presets según la pluma seleccionada */}
                        <div className="flex flex-wrap gap-2">
                            {pluma.dosis_estandar.map(d => (
                                <button
                                    key={d}
                                    onClick={() => setInputVal(fmt(d))}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                                        inputVal === fmt(d)
                                            ? "bg-slate-800 text-white border-slate-800"
                                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                    }`}
                                >
                                    {fmt(d)} mg
                                </button>
                            ))}
                        </div>

                        <input
                            type="text"
                            inputMode="decimal"
                            value={inputVal}
                            onChange={e => setInputVal(e.target.value)}
                            placeholder="Ej: 0,3"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                    </div>

                    {/* Resultado */}
                    {resultado && (
                        <div className="bg-slate-800 text-white rounded-lg p-5">
                            <div className="flex items-end justify-center gap-3 mb-1">
                                <span className="text-6xl font-bold tabular-nums">{resultado.clicks}</span>
                                <span className="text-lg text-slate-400 pb-2">clicks</span>
                            </div>
                            <p className="text-center text-sm text-slate-400 mb-4">
                                = {fmt(resultado.dosisReal)} mg
                                {resultado.redondeado && (
                                    <span className="text-amber-300 ml-1">(redondeado al click más cercano)</span>
                                )}
                            </p>

                            {resultado.excede && (
                                <p className="flex items-center gap-1.5 text-xs text-amber-300 mb-3">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    La dosis supera el máximo de esta pluma ({fmt(pluma.dosis_max)} mg).
                                </p>
                            )}

                            <div className="border-t border-slate-600 pt-3">
                                <button
                                    onClick={copy}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-800 rounded hover:bg-slate-100 text-xs font-medium"
                                >
                                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    Copiar
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Duración por pluma */}
                {valid && (
                    <div className="space-y-3">
                        <h2 className="text-sm font-semibold text-slate-700">
                            ¿Cuánto dura cada pluma a {fmt(dosis)} mg/semana?
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {PLUMAS.map(p => {
                                const incompatible = dosis > p.dosis_max;
                                const semanas = incompatible
                                    ? 0
                                    : Math.floor(p.dosis_max / dosis);
                                const clicks = incompatible
                                    ? 0
                                    : Math.round(dosis * 100 / p.concentracion);
                                const activa = p.id === plumaId;

                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => !incompatible && setPlumaId(p.id)}
                                        disabled={incompatible}
                                        className={`rounded-xl border p-4 text-left transition-all ${
                                            incompatible
                                                ? "border-slate-200 bg-slate-50 opacity-40 cursor-not-allowed"
                                                : activa
                                                    ? "border-slate-800 bg-slate-800 text-white shadow-md"
                                                    : "border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm cursor-pointer"
                                        }`}
                                    >
                                        <p className={`text-xs font-medium mb-2 ${activa ? "text-slate-300" : "text-slate-500"}`}>
                                            {p.label}
                                        </p>
                                        {incompatible ? (
                                            <p className="text-xs text-slate-400">Dosis supera el máximo</p>
                                        ) : (
                                            <>
                                                <div className="flex items-baseline gap-1 mb-2">
                                                    <span className="text-3xl font-bold tabular-nums">{semanas}</span>
                                                    <span className={`text-xs ${activa ? "text-slate-400" : "text-slate-500"}`}>
                                                        {semanas === 1 ? "semana" : "semanas"}
                                                    </span>
                                                </div>
                                                {/* Puntos visuales: 1 por semana */}
                                                <div className="flex flex-wrap gap-1 mb-2">
                                                    {Array.from({ length: Math.min(semanas, 8) }).map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className={`w-2 h-2 rounded-full ${activa ? "bg-white/60" : "bg-slate-300"}`}
                                                        />
                                                    ))}
                                                    {semanas > 8 && (
                                                        <span className={`text-xs ${activa ? "text-slate-400" : "text-slate-400"}`}>
                                                            +{semanas - 8}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`text-xs ${activa ? "text-slate-400" : "text-slate-400"}`}>
                                                    {clicks} clicks / dosis
                                                </p>
                                            </>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="flex items-start gap-2 text-xs text-slate-500">
                    <Info className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                        Cada click = 0,01 mL. Los clicks varían entre plumas porque cada presentación tiene distinta concentración. No sustituye el criterio médico profesional.
                    </span>
                </div>

            </div>
        </div>
    );
}

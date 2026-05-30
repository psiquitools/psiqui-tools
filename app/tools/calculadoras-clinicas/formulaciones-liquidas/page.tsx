"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Droplets, ArrowLeft, Copy, Check, AlertCircle, RotateCcw } from "lucide-react";

type Medida = "gotas" | "jeringa";
type Modo = "mg" | "gotas" | "ml";

type Farmaco = {
    id: string;
    nombre: string;
    marca: string;
    concMgMl: number;
    medida: Medida;
    gotasPorMl?: number;
    notas?: string;
};

const FARMACOS: Farmaco[] = [
    {
        id: "haloperidol",
        nombre: "Haloperidol",
        marca: "Haloperidol Esteve® gotas",
        concMgMl: 2,
        medida: "gotas",
        gotasPorMl: 20,
        notas: "Mezclar en agua, zumo o leche antes de administrar.",
    },
    {
        id: "clonazepam",
        nombre: "Clonazepam",
        marca: "Rivotril® solución oral",
        concMgMl: 2.5,
        medida: "gotas",
        gotasPorMl: 25,
    },
    {
        id: "risperidona",
        nombre: "Risperidona",
        marca: "Risperdal® solución oral",
        concMgMl: 1,
        medida: "gotas",
        gotasPorMl: 20,
        notas: "Mezclar en agua, zumo de naranja o leche.",
    },
    {
        id: "levomepromazina",
        nombre: "Levomepromazina",
        marca: "Sinogan® gotas",
        concMgMl: 40,
        medida: "gotas",
        gotasPorMl: 40,
        notas: "Uso habitual en contexto hospitalario.",
    },
    {
        id: "clorpromazina",
        nombre: "Clorpromazina",
        marca: "Largactil® gotas",
        concMgMl: 40,
        medida: "gotas",
        gotasPorMl: 40,
    },
    {
        id: "aripiprazol",
        nombre: "Aripiprazol",
        marca: "Abilify® solución oral",
        concMgMl: 1,
        medida: "jeringa",
        notas: "Administrar con jeringa oral graduada. Compatible con agua, zumo, leche y refrescos.",
    },
    {
        id: "quetiapina",
        nombre: "Quetiapina",
        marca: "Ketyalix® solución oral",
        concMgMl: 20,
        medida: "jeringa",
        notas: "Administrar con jeringa oral graduada (Italfarmaco). Verificar concentración en ficha técnica del lote.",
    },
];

function r3(n: number) {
    return Math.round(n * 1000) / 1000;
}

const MODOS_LABEL: Record<Modo, string> = { mg: "Desde mg", gotas: "Desde gotas", ml: "Desde mL" };
const MODOS_INPUT: Record<Modo, string> = { mg: "Dosis (mg)", gotas: "Número de gotas", ml: "Volumen (mL)" };
const MODOS_PLACEHOLDER: Record<Modo, string> = { mg: "Ej: 2", gotas: "Ej: 20", ml: "Ej: 1" };

export default function FormulacionesLiquidasPage() {
    const [farmacoId, setFarmacoId] = useState("haloperidol");
    const [modo, setModo] = useState<Modo>("mg");
    const [inputVal, setInputVal] = useState("");
    const [copied, setCopied] = useState(false);

    const farmaco = FARMACOS.find(f => f.id === farmacoId)!;
    const mgPorGota = farmaco.gotasPorMl ? r3(farmaco.concMgMl / farmaco.gotasPorMl) : null;

    const handleFarmacoChange = (id: string) => {
        const f = FARMACOS.find(f => f.id === id)!;
        setFarmacoId(id);
        setInputVal("");
        if (modo === "gotas" && f.medida !== "gotas") setModo("mg");
    };

    const parsedVal = parseFloat(inputVal);
    const validVal = !isNaN(parsedVal) && parsedVal > 0;

    const resultado = useMemo(() => {
        if (!validVal) return null;
        let mg: number;
        if (modo === "mg") mg = parsedVal;
        else if (modo === "gotas" && mgPorGota) mg = parsedVal * mgPorGota;
        else mg = parsedVal * farmaco.concMgMl;

        const ml = mg / farmaco.concMgMl;
        const gotas = farmaco.gotasPorMl ? r3(ml * farmaco.gotasPorMl) : null;

        return { mg: r3(mg), ml: r3(ml), gotas };
    }, [validVal, parsedVal, modo, farmaco, mgPorGota]);

    const textoCopia = useMemo(() => {
        if (!resultado) return "";
        if (farmaco.medida === "gotas") {
            return `${farmaco.nombre} (${farmaco.marca}): ${resultado.gotas} gotas = ${resultado.mg} mg = ${resultado.ml} mL por toma`;
        }
        return `${farmaco.nombre} (${farmaco.marca}): ${resultado.ml} mL = ${resultado.mg} mg por toma`;
    }, [resultado, farmaco]);

    const copyResult = () => {
        navigator.clipboard.writeText(textoCopia);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const reset = () => { setInputVal(""); setCopied(false); };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6">
            <div className="max-w-3xl mx-auto space-y-6">

                <Link href="/tools/calculadoras-clinicas" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Herramientas Farmacológicas
                </Link>

                <div className="flex items-center gap-3">
                    <Droplets className="w-7 h-7 text-slate-700" />
                    <div>
                        <h1 className="text-2xl font-semibold">Formulaciones líquidas</h1>
                        <p className="text-sm text-slate-600">Conversión mg · mL · gotas para soluciones orales</p>
                    </div>
                </div>

                {/* Selector de fármaco */}
                <div className="flex flex-wrap gap-2">
                    {FARMACOS.map(f => (
                        <button
                            key={f.id}
                            onClick={() => handleFarmacoChange(f.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                farmacoId === f.id
                                    ? "bg-slate-800 text-white"
                                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900"
                            }`}
                        >
                            {f.nombre}
                        </button>
                    ))}
                </div>

                {/* Info del fármaco */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-slate-800 mb-3">{farmaco.marca}</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-center text-sm">
                        <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-slate-500 mb-1">Concentración</p>
                            <p className="font-bold">{farmaco.concMgMl} mg/mL</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-slate-500 mb-1">Presentación</p>
                            <p className="font-bold">{farmaco.medida === "gotas" ? "Gotas" : "Jeringa oral"}</p>
                        </div>
                        {mgPorGota !== null && farmaco.gotasPorMl && (
                            <div className="bg-slate-50 rounded-lg p-3">
                                <p className="text-xs text-slate-500 mb-1">Por gota</p>
                                <p className="font-bold">{mgPorGota} mg</p>
                                <p className="text-xs text-slate-400">{farmaco.gotasPorMl} gotas = 1 mL</p>
                            </div>
                        )}
                    </div>
                    {farmaco.notas && (
                        <p className="text-xs text-slate-500 italic mt-3">{farmaco.notas}</p>
                    )}
                </div>

                {/* Calculadora */}
                <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">

                    {/* Selector de modo */}
                    <div className="flex gap-2 flex-wrap">
                        {(["mg", "gotas", "ml"] as Modo[]).map(m => {
                            if (m === "gotas" && farmaco.medida !== "gotas") return null;
                            return (
                                <button
                                    key={m}
                                    onClick={() => { setModo(m); setInputVal(""); }}
                                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                                        modo === m
                                            ? "bg-slate-800 text-white border-slate-800"
                                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                    }`}
                                >
                                    {MODOS_LABEL[m]}
                                </button>
                            );
                        })}
                    </div>

                    {/* Input */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">{MODOS_INPUT[modo]}</label>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={inputVal}
                            onChange={e => setInputVal(e.target.value)}
                            placeholder={MODOS_PLACEHOLDER[modo]}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                    </div>

                    {/* Resultado */}
                    {resultado && (
                        <div className="bg-slate-800 text-white rounded-lg p-4 space-y-4">
                            <div className={`grid gap-4 text-center ${resultado.gotas !== null ? "grid-cols-3" : "grid-cols-2"}`}>
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">mg</p>
                                    <p className="text-2xl font-bold">{resultado.mg}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">mL</p>
                                    <p className="text-2xl font-bold">{resultado.ml}</p>
                                </div>
                                {resultado.gotas !== null && (
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">gotas</p>
                                        <p className="text-2xl font-bold">{resultado.gotas}</p>
                                    </div>
                                )}
                            </div>
                            <div className="border-t border-slate-600 pt-3 flex gap-2">
                                <button onClick={copyResult} className="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-800 rounded hover:bg-slate-100 text-xs font-medium">
                                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    Copiar texto
                                </button>
                                <button onClick={reset} className="flex items-center gap-2 px-3 py-1.5 border border-slate-600 text-slate-300 rounded hover:bg-slate-700 text-xs">
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Limpiar
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabla de referencia rápida */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Referencia rápida</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-2 pr-3 text-slate-500 font-medium">Fármaco</th>
                                    <th className="text-left py-2 pr-3 text-slate-500 font-medium">Marca</th>
                                    <th className="text-right py-2 pr-3 text-slate-500 font-medium">mg/mL</th>
                                    <th className="text-right py-2 pr-3 text-slate-500 font-medium">gotas/mL</th>
                                    <th className="text-right py-2 text-slate-500 font-medium">mg/gota</th>
                                </tr>
                            </thead>
                            <tbody>
                                {FARMACOS.map(f => (
                                    <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-2 pr-3 font-medium text-slate-800">{f.nombre}</td>
                                        <td className="py-2 pr-3 text-slate-500">{f.marca}</td>
                                        <td className="py-2 pr-3 text-right font-mono">{f.concMgMl}</td>
                                        <td className="py-2 pr-3 text-right font-mono text-slate-600">
                                            {f.gotasPorMl ?? "—"}
                                        </td>
                                        <td className="py-2 text-right font-mono text-slate-600">
                                            {f.gotasPorMl ? r3(f.concMgMl / f.gotasPorMl) : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-slate-600">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                        Concentraciones según fichas técnicas vigentes en España. Verificar siempre con el prospecto del lote dispensado. No sustituye el criterio médico profesional.
                    </span>
                </div>

            </div>
        </div>
    );
}

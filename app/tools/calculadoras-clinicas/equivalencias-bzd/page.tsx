"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
    Pill,
    RotateCcw,
    Copy,
    Check,
    AlertCircle,
    ArrowLeft,
    ArrowRight,
} from "lucide-react";

type Benzo = {
    id: string;
    nombre: string;
    marcaEspana: string;
    eq5mgDiazepam: number; // mg de este fármaco equivalentes a 5mg diazepam
    duracion: "muy-corta" | "corta" | "intermedia" | "larga";
    presentaciones: number[]; // mg disponibles en España
    notas?: string;
};

const BENZOS: Benzo[] = [
    // Acción larga
    {
        id: "diazepam",
        nombre: "Diazepam",
        marcaEspana: "Valium®",
        eq5mgDiazepam: 5,
        duracion: "larga",
        presentaciones: [2, 5, 10],
    },
    {
        id: "clordiazepoxido",
        nombre: "Clordiazepóxido",
        marcaEspana: "Huberplex®",
        eq5mgDiazepam: 12.5,
        duracion: "larga",
        presentaciones: [5, 10, 25],
    },
    {
        id: "clorazepato",
        nombre: "Clorazepato dipotásico",
        marcaEspana: "Tranxilium®",
        eq5mgDiazepam: 15,
        duracion: "larga",
        presentaciones: [5, 10, 15, 50],
    },
    {
        id: "clobazam",
        nombre: "Clobazam",
        marcaEspana: "Noiafren®",
        eq5mgDiazepam: 10,
        duracion: "larga",
        presentaciones: [10, 20],
    },
    {
        id: "clonazepam",
        nombre: "Clonazepam",
        marcaEspana: "Rivotril®",
        eq5mgDiazepam: 0.25,
        duracion: "larga",
        presentaciones: [0.5, 2],
        notas: "250 mcg ≈ 5 mg diazepam",
    },
    // Acción intermedia
    {
        id: "nitrazepam",
        nombre: "Nitrazepam",
        marcaEspana: "Mogadon®",
        eq5mgDiazepam: 5,
        duracion: "intermedia",
        presentaciones: [5],
    },
    {
        id: "flunitrazepam",
        nombre: "Flunitrazepam",
        marcaEspana: "Rohypnol®",
        eq5mgDiazepam: 1,
        duracion: "intermedia",
        presentaciones: [1],
    },
    // Acción corta
    {
        id: "lorazepam",
        nombre: "Lorazepam",
        marcaEspana: "Orfidal®",
        eq5mgDiazepam: 0.5,
        duracion: "corta",
        presentaciones: [1],
        notas: "500 mcg ≈ 5 mg diazepam",
    },
    {
        id: "alprazolam",
        nombre: "Alprazolam",
        marcaEspana: "Trankimazin®",
        eq5mgDiazepam: 0.25,
        duracion: "corta",
        presentaciones: [0.25, 0.5, 1, 2],
        notas: "250 mcg ≈ 5 mg diazepam",
    },
    {
        id: "oxazepam",
        nombre: "Oxazepam",
        marcaEspana: "Adumbran®",
        eq5mgDiazepam: 10,
        duracion: "corta",
        presentaciones: [10, 15],
    },
    {
        id: "lormetazepam",
        nombre: "Lormetazepam",
        marcaEspana: "Noctamid®",
        eq5mgDiazepam: 0.5,
        duracion: "corta",
        presentaciones: [0.5, 1, 2],
        notas: "500 mcg ≈ 5 mg diazepam",
    },
    {
        id: "temazepam",
        nombre: "Temazepam",
        marcaEspana: "Normison®",
        eq5mgDiazepam: 10,
        duracion: "corta",
        presentaciones: [10, 20],
    },
    // Acción muy corta
    {
        id: "midazolam",
        nombre: "Midazolam",
        marcaEspana: "Dormicum®",
        eq5mgDiazepam: 2.5,
        duracion: "muy-corta",
        presentaciones: [5, 15],
        notas: "Uso principalmente hospitalario IV/IM",
    },
    // Fármacos Z
    {
        id: "zopiclona",
        nombre: "Zopiclona",
        marcaEspana: "Zimovane®",
        eq5mgDiazepam: 7.5,
        duracion: "corta",
        presentaciones: [3.75, 7.5],
        notas: "Fármaco Z — uso en insomnio",
    },
    {
        id: "zolpidem",
        nombre: "Zolpidem",
        marcaEspana: "Stilnox®",
        eq5mgDiazepam: 10,
        duracion: "muy-corta",
        presentaciones: [5, 10],
        notas: "Fármaco Z — uso en insomnio",
    },
];

const DURACION_LABEL: Record<Benzo["duracion"], string> = {
    "larga": "Larga (>24h)",
    "intermedia": "Intermedia (10-24h)",
    "corta": "Corta (6-12h)",
    "muy-corta": "Muy corta (<6h)",
};

const DURACION_COLOR: Record<Benzo["duracion"], string> = {
    "larga": "bg-blue-50 text-blue-700 border-blue-200",
    "intermedia": "bg-purple-50 text-purple-700 border-purple-200",
    "corta": "bg-amber-50 text-amber-700 border-amber-200",
    "muy-corta": "bg-red-50 text-red-700 border-red-200",
};

function calcularEquivalencia(
    benzoDe: Benzo,
    benzoA: Benzo,
    dosis: number
): number {
    // Convertir primero a equivalente de diazepam, luego al fármaco destino
    const eqDiazepam = (dosis / benzoDe.eq5mgDiazepam) * 5;
    const eqDestino = (eqDiazepam / 5) * benzoA.eq5mgDiazepam;
    return Math.round(eqDestino * 1000) / 1000; // redondear a 3 decimales
}

export default function EquivalenciasBZDPage() {
    const [benzoDe, setBenzoDe] = useState<string>("lorazepam");
    const [benzoA, setBenzoA] = useState<string>("diazepam");
    const [dosis, setDosis] = useState<string>("");
    const [copied, setCopied] = useState(false);

    const farmacoDe = BENZOS.find((b) => b.id === benzoDe)!;
    const farmacoA = BENZOS.find((b) => b.id === benzoA)!;
    const dosisNum = parseFloat(dosis);
    const dosisValida = !isNaN(dosisNum) && dosisNum > 0;

    const resultado = useMemo(() => {
        if (!dosisValida) return null;
        return calcularEquivalencia(farmacoDe, farmacoA, dosisNum);
    }, [farmacoDe, farmacoA, dosisNum, dosisValida]);

    const eqDiazepam = useMemo(() => {
        if (!dosisValida) return null;
        return Math.round((dosisNum / farmacoDe.eq5mgDiazepam) * 5 * 1000) / 1000;
    }, [farmacoDe, dosisNum, dosisValida]);

    const intercambiar = () => {
        setBenzoDe(benzoA);
        setBenzoA(benzoDe);
        setDosis("");
    };

    const copyResult = () => {
        if (!resultado) return;
        const text = [
            "Equivalencia de benzodiacepinas",
            `${farmacoDe.nombre} ${dosisNum} mg → ${farmacoA.nombre} ${resultado} mg`,
            `(Equivalente a diazepam ${eqDiazepam} mg)`,
            "",
            "Nota: Las equivalencias son aproximadas. Ajustar según respuesta clínica individual.",
        ].join("\n");
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Volver */}
                <Link
                    href="/tools/calculadoras-clinicas"
                    className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Herramientas Farmacológicas
                </Link>

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Pill className="w-7 h-7 text-slate-700" />
                    <div>
                        <h1 className="text-2xl font-semibold">Equivalencia de benzodiacepinas</h1>
                        <p className="text-sm text-slate-600">
                            Conversión usando diazepam como referencia
                        </p>
                    </div>
                </div>

                {/* Calculadora */}
                <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">

                    {/* Selectores */}
                    <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">

                        {/* Fármaco origen */}
                        <div className="flex-1 space-y-1">
                            <label className="text-sm font-medium text-slate-700">Fármaco origen</label>
                            <select
                                value={benzoDe}
                                onChange={(e) => { setBenzoDe(e.target.value); setDosis(""); }}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
                            >
                                {BENZOS.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.nombre} ({b.marcaEspana})
                                    </option>
                                ))}
                            </select>
                            {farmacoDe && (
                                <span className={`inline-flex text-xs px-2 py-0.5 rounded border ${DURACION_COLOR[farmacoDe.duracion]}`}>
                                    {DURACION_LABEL[farmacoDe.duracion]}
                                </span>
                            )}
                        </div>

                        {/* Botón intercambiar */}
                        <button
                            onClick={intercambiar}
                            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 shrink-0 self-center mt-4 md:mt-0"
                            title="Intercambiar fármacos"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </button>

                        {/* Fármaco destino */}
                        <div className="flex-1 space-y-1">
                            <label className="text-sm font-medium text-slate-700">Fármaco destino</label>
                            <select
                                value={benzoA}
                                onChange={(e) => setBenzoA(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
                            >
                                {BENZOS.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.nombre} ({b.marcaEspana})
                                    </option>
                                ))}
                            </select>
                            {farmacoA && (
                                <span className={`inline-flex text-xs px-2 py-0.5 rounded border ${DURACION_COLOR[farmacoA.duracion]}`}>
                                    {DURACION_LABEL[farmacoA.duracion]}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Dosis */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">
                            Dosis de {farmacoDe.nombre} (mg/día)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.25"
                            value={dosis}
                            onChange={(e) => setDosis(e.target.value)}
                            placeholder="Ej: 1"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                        {farmacoDe.presentaciones.length > 0 && (
                            <p className="text-xs text-slate-400">
                                Presentaciones en España: {farmacoDe.presentaciones.map(p => `${p} mg`).join(", ")}
                            </p>
                        )}
                        {farmacoDe.notas && (
                            <p className="text-xs text-slate-400 italic">{farmacoDe.notas}</p>
                        )}
                    </div>

                    {/* Resultado */}
                    {dosisValida && resultado !== null && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">

                            {/* Resultado principal */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-slate-500">Equivalente en {farmacoA.nombre}</p>
                                    <p className="text-3xl font-bold text-slate-900">
                                        {resultado} <span className="text-lg font-normal text-slate-500">mg/día</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400">Eq. diazepam</p>
                                    <p className="text-lg font-semibold text-slate-600">{eqDiazepam} mg</p>
                                </div>
                            </div>

                            {/* Presentaciones disponibles */}
                            {farmacoA.presentaciones.length > 0 && (
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">
                                        Presentaciones disponibles de {farmacoA.nombre}:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {farmacoA.presentaciones.map((p) => (
                                            <span
                                                key={p}
                                                className="text-xs px-2 py-1 bg-white border border-slate-200 rounded font-mono"
                                            >
                                                {p} mg
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {farmacoA.notas && (
                                <p className="text-xs text-slate-400 italic">{farmacoA.notas}</p>
                            )}

                            {/* Botones */}
                            <div className="flex gap-2 pt-1">
                                <button
                                    onClick={copyResult}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 text-sm"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    Copiar
                                </button>
                                <button
                                    onClick={() => setDosis("")}
                                    className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-slate-100 text-sm"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Limpiar
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabla de referencia */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-700 mb-3">
                        Tabla de equivalencias (referencia a 5 mg de diazepam)
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-2 pr-4 text-slate-600 font-medium">Fármaco</th>
                                    <th className="text-left py-2 pr-4 text-slate-600 font-medium">Marca</th>
                                    <th className="text-right py-2 pr-4 text-slate-600 font-medium">Eq. a 5 mg diazepam</th>
                                    <th className="text-left py-2 text-slate-600 font-medium">Duración</th>
                                </tr>
                            </thead>
                            <tbody>
                                {BENZOS.map((b) => (
                                    <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-2 pr-4 font-medium text-slate-800">{b.nombre}</td>
                                        <td className="py-2 pr-4 text-slate-500">{b.marcaEspana}</td>
                                        <td className="py-2 pr-4 text-right font-mono text-slate-800">
                                            {b.eq5mgDiazepam < 1
                                                ? `${b.eq5mgDiazepam * 1000} mcg`
                                                : `${b.eq5mgDiazepam} mg`}
                                        </td>
                                        <td className="py-2">
                                            <span className={`px-2 py-0.5 rounded border text-xs ${DURACION_COLOR[b.duracion]}`}>
                                                {b.duracion === "larga" ? "Larga" :
                                                    b.duracion === "intermedia" ? "Intermedia" :
                                                        b.duracion === "corta" ? "Corta" : "Muy corta"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Nota */}
                <div className="flex items-start gap-2 text-xs text-slate-600">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                        Las equivalencias son <strong>aproximadas</strong> y deben ajustarse según la respuesta clínica individual, la función hepática y renal, y la edad del paciente. No sustituye el juicio médico profesional. Fuente: NHS Specialist Pharmacy Service (2025), RCCC.
                    </span>
                </div>

            </div>
        </div>
    );
}
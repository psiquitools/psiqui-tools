"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, ChevronRight, Copy, Check, RotateCcw } from "lucide-react";

/* ─────────── TIPOS ─────────── */

type Risk   = "ninguno" | "bajo" | "moderado" | "alto" | "muy-alto";
type Phase  = "ideacion" | "conducta";

interface Option {
    label:     string;
    sublabel?: string;
    value:     string;
    next:      string;
    isRisk?:   boolean;
}

interface FlowNode {
    id:           string;
    phase:        Phase;
    badge?:       string;
    title:        string;
    instruction?: string;
    options:      Option[];
}

/* ─────────── ÁRBOL ─────────── */

const NODES: Record<string, FlowNode> = {
    q1: {
        id: "q1",
        phase: "ideacion",
        badge: "C-SSRS — Tipo 1",
        title: "¿Ha deseado estar muerto, dormirse y no despertar, o que algo malo le ocurriera?",
        instruction: 'Incluye pensamientos pasivos como "ojalá no hubiera nacido" o "todos estarían mejor sin mí". No implica intención de actuar.',
        options: [
            { label: "Sí", value: "si", next: "q2",          isRisk: true  },
            { label: "No", value: "no", next: "conducta_prep", isRisk: false },
        ],
    },
    q2: {
        id: "q2",
        phase: "ideacion",
        badge: "C-SSRS — Tipo 2",
        title: "¿Ha tenido pensamientos de hacerse daño o de quitarse la vida?",
        instruction: "Ideación activa inespecífica. Pregunte con normalidad — la pregunta directa no incrementa el riesgo.",
        options: [
            { label: "Sí", value: "si", next: "q3",          isRisk: true  },
            { label: "No", value: "no", next: "conducta_prep", isRisk: false },
        ],
    },
    q3: {
        id: "q3",
        phase: "ideacion",
        badge: "C-SSRS — Tipo 3",
        title: "¿Ha pensado en algún método concreto para hacerse daño o quitarse la vida?",
        instruction: "¿Ha pensado específicamente en cómo lo haría? Por ejemplo, con medicamentos, una caída, un corte, etc.",
        options: [
            { label: "Sí", value: "si", next: "q4",          isRisk: true  },
            { label: "No", value: "no", next: "conducta_prep", isRisk: false },
        ],
    },
    q4: {
        id: "q4",
        phase: "ideacion",
        badge: "C-SSRS — Tipo 4",
        title: "¿Siente que actuaría sobre estos pensamientos? ¿Tiene intención de llevarlos a cabo?",
        instruction: 'Registre también la ambivalencia — un "quizás" o "no lo sé" es clínicamente significativo. Marque Sí si hay cualquier grado de intención.',
        options: [
            { label: "Sí / Ambivalente", value: "si", next: "q5",          isRisk: true  },
            { label: "No",               value: "no", next: "conducta_prep", isRisk: false },
        ],
    },
    q5: {
        id: "q5",
        phase: "ideacion",
        badge: "C-SSRS — Tipo 5",
        title: "¿Ha elaborado un plan concreto? ¿Tiene decidido cuándo, dónde y cómo lo haría?",
        instruction: "Plan específico con tiempo y lugar determinados, con intención clara de ejecutarlo.",
        options: [
            { label: "Sí", value: "si", next: "conducta_prep", isRisk: true  },
            { label: "No", value: "no", next: "conducta_prep", isRisk: false },
        ],
    },
    conducta_prep: {
        id: "conducta_prep",
        phase: "conducta",
        title: "¿Ha tomado algún paso preparatorio para hacerse daño, sin llegar a intentarlo?",
        instruction: "Buscar o adquirir el método, escribir una nota de despedida, redistribuir posesiones personales, ensayar el acto.",
        options: [
            { label: "Sí", value: "si", next: "intento_previo", isRisk: true  },
            { label: "No", value: "no", next: "intento_previo", isRisk: false },
        ],
    },
    intento_previo: {
        id: "intento_previo",
        phase: "conducta",
        title: "¿Ha intentado quitarse la vida alguna vez en el pasado?",
        instruction: "Incluye intentos remotos o de baja letalidad aparente.",
        options: [
            { label: "Sí", value: "si", next: "intento_recencia", isRisk: true  },
            { label: "No", value: "no", next: "resultado",         isRisk: false },
        ],
    },
    intento_recencia: {
        id: "intento_recencia",
        phase: "conducta",
        title: "¿Cuándo fue el intento más reciente?",
        instruction: "La recencia del último intento es uno de los predictores más robustos de riesgo futuro.",
        options: [
            { label: "Hace menos de 3 meses",  sublabel: "Período de mayor riesgo estadístico", value: "reciente",    next: "resultado", isRisk: true  },
            { label: "Entre 3 meses y 1 año",                                                   value: "intermedio",  next: "resultado", isRisk: true  },
            { label: "Hace más de 1 año",                                                       value: "lejano",      next: "resultado", isRisk: false },
        ],
    },
};

/* ─────────── CÓMPUTO DE RIESGO ─────────── */

const RISK_CONFIG: Record<Risk, {
    label:           string;
    sublabel:        string;
    bg:              string;
    text:            string;
    border:          string;
    dot:             string;
    recommendations: string[];
}> = {
    ninguno: {
        label:    "Sin riesgo identificado",
        sublabel: "No se detecta ideación ni conducta autolítica activa",
        bg: "bg-green-50", text: "text-green-800", border: "border-green-300", dot: "bg-green-500",
        recommendations: [
            "Registrar la evaluación en la historia clínica",
            "Explorar factores de riesgo y protección de forma global",
            "Mantener seguimiento habitual",
        ],
    },
    bajo: {
        label:    "Riesgo bajo",
        sublabel: "Ideación pasiva sin intención ni conducta asociada",
        bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-300", dot: "bg-blue-500",
        recommendations: [
            "Psicoeducación sobre manejo de la crisis y recursos disponibles",
            "Informar del número de crisis 024 y urgencias",
            "Plan de seguridad básico (a quién llamar en caso de crisis)",
            "Programar seguimiento próximo y dejar abierta la consulta urgente",
        ],
    },
    moderado: {
        label:    "Riesgo moderado",
        sublabel: "Ideación activa sin plan ni intención, o ideación pasiva con historia previa",
        bg: "bg-yellow-50", text: "text-yellow-800", border: "border-yellow-300", dot: "bg-yellow-500",
        recommendations: [
            "Elaborar plan de seguridad detallado por escrito",
            "Limitar acceso a medios letales (medicamentos, objetos cortantes, etc.)",
            "Implicar red de apoyo con consentimiento del paciente",
            "Intensificar frecuencia de seguimiento",
            "Registrar evaluación, razonamiento clínico y plan en historia",
        ],
    },
    alto: {
        label:    "Riesgo alto",
        sublabel: "Ideación con intención de actuar, actos preparatorios o intento previo reciente",
        bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-300", dot: "bg-orange-500",
        recommendations: [
            "No dejar al paciente solo hasta completar la evaluación",
            "Contactar o implicar a la red de apoyo inmediata",
            "Plan de seguridad activo con compromisos concretos y verificables",
            "Considerar derivación a urgencias psiquiátricas",
            "Restricción urgente de acceso a medios letales",
        ],
    },
    "muy-alto": {
        label:    "Riesgo muy alto",
        sublabel: "Plan específico con intención, actos preparatorios o intento en los últimos 3 meses",
        bg: "bg-red-50", text: "text-red-800", border: "border-red-300", dot: "bg-red-500",
        recommendations: [
            "Actuación inmediata — no dejar al paciente solo bajo ningún concepto",
            "Valorar ingreso hospitalario urgente",
            "Acompañar a urgencias o contactar al 112 si es necesario",
            "Notificar a familiares o persona de referencia",
            "No posponer — el riesgo es presente y puede ser inminente",
        ],
    },
};

function computeRisk(answers: Record<string, string>): {
    nivel:       Risk;
    csssrsTipo:  number;
    factores:    string[];
} {
    let tipo = 0;
    if (answers.q1 === "si") tipo = 1;
    if (answers.q2 === "si") tipo = 2;
    if (answers.q3 === "si") tipo = 3;
    if (answers.q4 === "si") tipo = 4;
    if (answers.q5 === "si") tipo = 5;

    const conductaPrep  = answers.conducta_prep   === "si";
    const intentoPrevio = answers.intento_previo  === "si";
    const recencia      = answers.intento_recencia as "reciente" | "intermedio" | "lejano" | undefined;

    const factores: string[] = [];
    if (tipo > 0) factores.push(`Ideación C-SSRS Tipo ${tipo}`);
    if (conductaPrep) factores.push("Actos preparatorios");
    if (intentoPrevio) {
        if      (recencia === "reciente")   factores.push("Intento reciente (< 3 meses)");
        else if (recencia === "intermedio") factores.push("Intento previo (3–12 meses)");
        else                                factores.push("Antecedentes de intento (> 1 año)");
    }

    let nivel: Risk = "ninguno";
    if      (recencia === "reciente" || tipo === 5 || (tipo >= 4 && conductaPrep)) nivel = "muy-alto";
    else if (tipo === 4 || conductaPrep || recencia === "intermedio")              nivel = "alto";
    else if (tipo >= 2 || (tipo >= 1 && intentoPrevio))                            nivel = "moderado";
    else if (tipo === 1 || intentoPrevio)                                          nivel = "bajo";

    return { nivel, csssrsTipo: tipo, factores };
}

/* ─────────── COMPONENTE ─────────── */

function answerChipStyle(_nodeId: string, value: string): string {
    if (value === "no" || value === "lejano")  return "bg-green-100 text-green-700 border-green-200";
    if (value === "reciente")                  return "bg-red-100 text-red-700 border-red-200";
    if (value === "intermedio")                return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-amber-100 text-amber-700 border-amber-200"; // "si"
}

function phaseBadge(phase: Phase): string {
    return phase === "ideacion"
        ? "bg-indigo-100 text-indigo-700"
        : "bg-amber-100 text-amber-700";
}

function phaseLabel(phase: Phase): string {
    return phase === "ideacion" ? "Ideación" : "Conducta";
}

export default function Prueba3Page() {
    const [answers,        setAnswers]       = useState<Record<string, string>>({});
    const [history,        setHistory]       = useState<string[]>([]);
    const [currentNodeId,  setCurrentNodeId] = useState<string>("q1");
    const [copied,         setCopied]        = useState(false);

    const done = currentNodeId === "resultado";

    const risk       = useMemo(() => done ? computeRisk(answers) : null, [done, answers]);
    const riskConfig = risk ? RISK_CONFIG[risk.nivel] : null;

    const select = (option: Option) => {
        setAnswers(prev => ({ ...prev, [currentNodeId]: option.value }));
        setHistory(prev => [...prev, currentNodeId]);
        setCurrentNodeId(option.next);
    };

    const reset = () => {
        setAnswers({});
        setHistory([]);
        setCurrentNodeId("q1");
        setCopied(false);
    };

    const copyResult = () => {
        if (!risk || !riskConfig) return;
        const lines: string[] = [
            "EVALUACIÓN DE RIESGO AUTOLÍTICO (C-SSRS)",
            `Nivel de riesgo: ${riskConfig.label.toUpperCase()}`,
            "",
        ];
        if (risk.factores.length > 0) {
            lines.push("Factores identificados:");
            risk.factores.forEach(f => lines.push(`  • ${f}`));
            lines.push("");
        }
        lines.push("Acciones recomendadas:");
        riskConfig.recommendations.forEach(r => lines.push(`  • ${r}`));
        lines.push("");
        lines.push("Detalle de la evaluación:");
        history.forEach(nodeId => {
            const node   = NODES[nodeId];
            const val    = answers[nodeId];
            const option = node?.options.find(o => o.value === val);
            if (option) lines.push(`  ${node.title}  →  ${option.label}`);
        });
        navigator.clipboard.writeText(lines.join("\n"));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const currentNode = NODES[currentNodeId];

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-xl mx-auto">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">Riesgo Autolítico</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Evaluación estructurada · Basada en C-SSRS (Posner et al., 2011)
                    </p>
                </div>

                {/* Aviso */}
                <div className="flex gap-2.5 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-8 text-sm text-amber-800">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                    <span>Herramienta de apoyo clínico. No reemplaza el criterio profesional ni las medidas de seguridad inmediatas ante riesgo grave.</span>
                </div>

                {/* Nodos respondidos */}
                {history.map((nodeId) => {
                    const node   = NODES[nodeId];
                    const val    = answers[nodeId];
                    const option = node.options.find(o => o.value === val);
                    return (
                        <div key={nodeId}>
                            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-start justify-between gap-3 opacity-75">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        {node.badge && (
                                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                                                {node.badge}
                                            </span>
                                        )}
                                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${phaseBadge(node.phase)}`}>
                                            {phaseLabel(node.phase)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-snug">{node.title}</p>
                                </div>
                                <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${answerChipStyle(nodeId, val)}`}>
                                    {option?.label}
                                </span>
                            </div>
                            {/* Conector */}
                            <div className="flex flex-col items-center py-0.5">
                                <div className="w-px h-3 bg-slate-300" />
                                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-300" />
                            </div>
                        </div>
                    );
                })}

                {/* Nodo activo */}
                {!done && currentNode && (
                    <div className="bg-white border-2 border-slate-800 rounded-xl p-5 shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                            {currentNode.badge && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                                    {currentNode.badge}
                                </span>
                            )}
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${phaseBadge(currentNode.phase)}`}>
                                {phaseLabel(currentNode.phase)}
                            </span>
                        </div>

                        <h2 className="text-[15px] font-semibold text-slate-900 leading-snug mb-2">
                            {currentNode.title}
                        </h2>

                        {currentNode.instruction && (
                            <p className="text-xs text-slate-500 italic mb-4 leading-relaxed">
                                {currentNode.instruction}
                            </p>
                        )}

                        <div className="space-y-2">
                            {currentNode.options.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => select(opt)}
                                    className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg border-2 border-slate-200 hover:border-slate-600 hover:bg-slate-50 text-left transition-all duration-150 group"
                                >
                                    <span>
                                        <span className="block text-sm font-medium text-slate-800">{opt.label}</span>
                                        {opt.sublabel && (
                                            <span className="block text-xs text-slate-500 mt-0.5">{opt.sublabel}</span>
                                        )}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 group-hover:text-slate-600 transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Resultado */}
                {done && risk && riskConfig && (
                    <>
                        <div className={`rounded-xl border-2 p-5 ${riskConfig.bg} ${riskConfig.border}`}>
                            {/* Nivel */}
                            <div className="flex items-center gap-3 mb-5">
                                <div className={`w-3 h-3 rounded-full shrink-0 ${riskConfig.dot}`} />
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Nivel de riesgo</p>
                                    <h2 className={`text-xl font-bold ${riskConfig.text}`}>{riskConfig.label}</h2>
                                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{riskConfig.sublabel}</p>
                                </div>
                            </div>

                            {/* C-SSRS tipo */}
                            {risk.csssrsTipo > 0 && (
                                <div className="mb-4 flex items-center gap-2">
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
                                        C-SSRS Tipo {risk.csssrsTipo} (máximo alcanzado)
                                    </span>
                                </div>
                            )}

                            {/* Factores */}
                            {risk.factores.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                        Factores identificados
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {risk.factores.map(f => (
                                            <span
                                                key={f}
                                                className="text-xs bg-white bg-opacity-60 border border-white px-2.5 py-1 rounded-full text-slate-700"
                                            >
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recomendaciones */}
                            <div className="mb-5">
                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                    Acciones recomendadas
                                </p>
                                <ul className="space-y-1.5">
                                    {riskConfig.recommendations.map((r, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-slate-700">
                                            <span className="shrink-0 font-bold">•</span>
                                            <span>{r}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Acciones */}
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={copyResult}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    {copied
                                        ? <Check   className="w-4 h-4 text-green-500" />
                                        : <Copy    className="w-4 h-4" />
                                    }
                                    {copied ? "Copiado" : "Copiar resultado"}
                                </button>
                                <button
                                    onClick={reset}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Nueva evaluación
                                </button>
                            </div>
                        </div>
                    </>
                )}

                <p className="text-xs text-slate-400 text-center mt-10 pb-4">
                    C-SSRS · Columbia Suicide Severity Rating Scale · Posner et al., 2011
                </p>
            </div>
        </div>
    );
}

"use client";

import { useState, useMemo } from "react";
import { Activity, RotateCcw, Copy, Check, AlertTriangle, Download } from "lucide-react";

/* ─── datos ─────────────────────────────────────────────── */

const ITEMS = [
    {
        id: "m1", label: "1. Tristeza observada",
        nota: "Representa el abatimiento, la melancolía y la desesperación (algo más que una simple tristeza normal y pasajera) que se refleja en la manera de hablar, la expresión facial y la postura. Evalúe el grado de incapacidad para animarse.",
        opts: [
            { value: 0, label: "Sin tristeza" },
            { value: 1, label: "..." },
            { value: 2, label: "Parece decaído/a pero se anima sin dificultad" },
            { value: 3, label: "..." },
            { value: 4, label: "Parece triste y desgraciado/a la mayor parte del tiempo" },
            { value: 5, label: "..." },
            { value: 6, label: "Parece siempre desgraciado/a. Extremadamente abatido/a" },
        ],
    },
    {
        id: "m2", label: "2. Tristeza declarada por el paciente",
        nota: "Representa un estado de ánimo depresivo que se siente, sin tener en cuenta si se refleja en la apariencia o no. Incluye tristeza, abatimiento o el sentimiento de que no hay esperanza y nada ni nadie puede ayudarle. Evalúe de acuerdo con la intensidad, la duración y la medida en que el estado de ánimo se ve influido por los acontecimientos.",
        opts: [
            { value: 0, label: "Tristeza esporádica según las circunstancias" },
            { value: 1, label: "..." },
            { value: 2, label: "Triste o decaído/a, pero se anima sin dificultad" },
            { value: 3, label: "..." },
            { value: 4, label: "Sentimientos generalizados de tristeza o melancolía. El estado de ánimo todavía se ve influido por circunstancias externas" },
            { value: 5, label: "..." },
            { value: 6, label: "Abatimiento, desdicha o tristeza continuada o invariable" },
        ],
    },
    {
        id: "m3", label: "3. Tensión interna",
        nota: "Representa sentimientos de malestar mal definido, irritabilidad, confusión interna y tensión mental hasta llegar al pánico, terror o angustia. Evalúe de acuerdo con la intensidad, frecuencia, duración y la medida en que se busca consuelo.",
        opts: [
            { value: 0, label: "Apacible. Sólo tensión interna pasajera" },
            { value: 1, label: "..." },
            { value: 2, label: "Sentimientos ocasionales de nerviosismo y malestar indefinido" },
            { value: 3, label: "..." },
            { value: 4, label: "Sentimientos continuados de tensión interna o pánico intermitente que el sujeto solo puede dominar con alguna dificultad" },
            { value: 5, label: "..." },
            { value: 6, label: "Terror o angustia tenaz. Pánico irresistible" },
        ],
    },
    {
        id: "m4", label: "4. Sueño reducido",
        nota: "Representa la reducción de la duración o profundidad del sueño comparada con las pautas normales del sujeto cuando se encuentra bien.",
        opts: [
            { value: 0, label: "Duerme como siempre" },
            { value: 1, label: "..." },
            { value: 2, label: "Ligera dificultad para dormirse o sueño ligeramente reducido, sueño ligero o perturbado" },
            { value: 3, label: "..." },
            { value: 4, label: "Sueño reducido o interrumpido durante al menos 2 h" },
            { value: 5, label: "..." },
            { value: 6, label: "Menos de 2 o 3 h de sueño" },
        ],
    },
    {
        id: "m5", label: "5. Apetito reducido",
        nota: "Representa la sensación de pérdida de apetito comparada con el que tiene cuando se encuentra bien. Evalúe según la pérdida del deseo por la comida o la necesidad de forzarse a sí mismo/a para comer.",
        opts: [
            { value: 0, label: "Apetito normal o aumentado" },
            { value: 1, label: "..." },
            { value: 2, label: "Apetito ligeramente reducido" },
            { value: 3, label: "..." },
            { value: 4, label: "Sin apetito. La comida es insípida" },
            { value: 5, label: "..." },
            { value: 6, label: "Necesita persuasión para comer algo" },
        ],
    },
    {
        id: "m6", label: "6. Dificultades para concentrarse",
        nota: "Representa las dificultades para centrar los pensamientos en algo hasta llegar a la falta de concentración incapacitante. Evalúe según la intensidad, frecuencia y grado de incapacidad resultante.",
        opts: [
            { value: 0, label: "Ninguna dificultad para concentrarse" },
            { value: 1, label: "..." },
            { value: 2, label: "Dificultades ocasionales para centrar los pensamientos" },
            { value: 3, label: "..." },
            { value: 4, label: "Dificultades para concentrarse y seguir una idea que reduce la capacidad de leer o mantener una conversación" },
            { value: 5, label: "..." },
            { value: 6, label: "Incapacidad de leer o mantener una conversación si no es con gran dificultad" },
        ],
    },
    {
        id: "m7", label: "7. Lasitud",
        nota: "Representa la dificultad para empezar algo o la lentitud para iniciar y realizar las actividades diarias.",
        opts: [
            { value: 0, label: "Casi sin dificultad para empezar algo. Sin apatía" },
            { value: 1, label: "..." },
            { value: 2, label: "Dificultades para empezar actividades" },
            { value: 3, label: "..." },
            { value: 4, label: "Dificultades para empezar actividades rutinarias sencillas que se llevan a cabo con esfuerzo" },
            { value: 5, label: "..." },
            { value: 6, label: "Lasitud total. Incapacidad de hacer nada sin ayuda" },
        ],
    },
    {
        id: "m8", label: "8. Incapacidad para sentir",
        nota: "Representa la experiencia subjetiva de un menor interés por el entorno o por actividades que habitualmente dan placer. La capacidad para reaccionar con la emoción adecuada a las circunstancias o personas se ve reducida.",
        opts: [
            { value: 0, label: "Interés por el entorno y por otras personas" },
            { value: 1, label: "..." },
            { value: 2, label: "Menor capacidad para disfrutar de las cosas que normalmente le interesan" },
            { value: 3, label: "..." },
            { value: 4, label: "Pérdida de interés por el entorno. Pérdida de sentimientos respecto a los amigos y conocidos" },
            { value: 5, label: "..." },
            { value: 6, label: "La experiencia de estar emocionalmente paralizado, incapacidad para sentir enfado, pena o placer y una total o incluso dolorosa falta de sentimientos hacia los parientes próximos y amigos" },
        ],
    },
    {
        id: "m9", label: "9. Pensamientos pesimistas",
        nota: "Representa los pensamientos de culpabilidad, inferioridad, autorreproche, pecado, remordimiento y ruina.",
        opts: [
            { value: 0, label: "Sin pensamientos pesimistas" },
            { value: 1, label: "..." },
            { value: 2, label: "Ideas variables de fracaso, autorreproche o autodesprecio" },
            { value: 3, label: "..." },
            { value: 4, label: "Autoacusaciones persistentes o ideas definidas, pero aún racionales de culpabilidad o pecado. Cada vez más pesimista respecto al futuro" },
            { value: 5, label: "..." },
            { value: 6, label: "Alucinaciones de ruina, remordimiento o pecado irredimible. Autoacusaciones que son absurdas e inquebrantables" },
        ],
    },
    {
        id: "m10", label: "10. Pensamientos suicidas",
        nota: "Representa el sentimiento de que no vale la pena vivir, que desearía que le llegara una muerte natural, pensamientos suicidas y preparativos para el suicidio. Los intentos de suicidio en sí no deberían influir en la evaluación.",
        opts: [
            { value: 0, label: "Disfruta de la vida o la acepta tal como viene" },
            { value: 1, label: "..." },
            { value: 2, label: "Cansado/a de vivir. Sólo pensamientos suicidas pasajeros" },
            { value: 3, label: "..." },
            { value: 4, label: "Probablemente estaría mejor muerto/a. Los pensamientos suicidas son habituales, y se considera el suicidio como una posible solución, pero sin ninguna intención o plan específico" },
            { value: 5, label: "..." },
            { value: 6, label: "Planes explícitos de suicidio cuando se presenta una oportunidad. Preparativos activos para el suicidio" },
        ],
    },
];

/* ─── interpretación ─────────────────────────────────────── */

const scoreStyle = (score: number) => {
    if (score <= 6)  return { bg: "bg-green-50",  border: "border-green-300",  text: "text-green-700",  label: "Sin depresión",       action: "Seguimiento clínico habitual." };
    if (score <= 19) return { bg: "bg-blue-50",   border: "border-blue-300",   text: "text-blue-700",   label: "Depresión leve",       action: "Considerar psicoterapia y/o seguimiento estrecho." };
    if (score <= 34) return { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", label: "Depresión moderada",   action: "Tratamiento activo; valorar farmacoterapia." };
    return               { bg: "bg-red-50",    border: "border-red-300",    text: "text-red-700",    label: "Depresión grave",      action: "Intervención urgente; valorar hospitalización." };
};

/* ─── componente ─────────────────────────────────────────── */

export default function MadrsPage() {
    const [scores, setScores] = useState<Record<string, number>>({});
    const [copied, setCopied] = useState(false);
    const [notas, setNotas] = useState("");

    const total = useMemo(() => Object.values(scores).reduce((a, b) => a + b, 0), [scores]);
    const answered = Object.keys(scores).length;
    const style = scoreStyle(total);

    const set   = (id: string, v: number) => setScores(p => ({ ...p, [id]: v }));
    const reset = () => { setScores({}); setCopied(false); setNotas(""); };

    const copyResult = () => {
        const text = [
            "MADRS",
            `Puntaje total: ${total}/60`,
            `Resultado: ${style.label}`,
            "",
            ...ITEMS.map(item => {
                const v = scores[item.id];
                return `${item.label}: ${v ?? "-"}`;
            }),
        ].join("\n");
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const descargarResultado = () => {
        const datos = {
            herramienta: "MADRS",
            version: "CIBERSAM",
            timestamp: new Date().toISOString(),
            notas,
            total,
            interpretacion: style.label,
            completado: answered === 10,
            items: ITEMS.map(item => ({
                id: item.id,
                label: item.label,
                puntuacion: scores[item.id] ?? null,
            })),
        };

        const notasHtml = notas.trim()
            ? `<div class="meta">${notas.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`
            : "";

        const filas = ITEMS.map(item => {
            const v = scores[item.id];
            const sinResp = v === undefined;
            return `<tr>
              <td style="padding:5px 10px;border:1px solid #d1d5db;font-size:11px;color:${sinResp ? "#9ca3af" : "#111827"}">${item.label}</td>
              <td style="padding:5px 10px;border:1px solid #d1d5db;text-align:center;font-weight:600;font-size:12px;color:${sinResp ? "#d1d5db" : "#111827"}">${sinResp ? "—" : v}</td>
            </tr>`;
        }).join("");

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>MADRS</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Times New Roman',Times,serif;font-size:12px;color:#111827;background:#fff;padding:18mm 20mm}
  @media print{body{padding:12mm 15mm}button{display:none!important}}
  button{display:block;margin-bottom:16px;padding:7px 18px;background:#111827;color:#fff;border:none;font-family:inherit;font-size:11px;cursor:pointer;letter-spacing:.03em}
  .header{border-bottom:2px solid #111827;padding-bottom:10px;margin-bottom:14px}
  h1{font-size:16px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;margin-bottom:2px}
  .sub{font-size:10px;color:#6b7280}
  .meta{border:1px solid #d1d5db;padding:10px 12px;margin-bottom:14px;font-size:11px;white-space:pre-wrap;line-height:1.7;font-family:'Times New Roman',Times,serif}
  table{width:100%;border-collapse:collapse;margin-bottom:0}
  th{background:#f3f4f6;text-align:left;padding:6px 10px;border:1px solid #d1d5db;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#374151}
  .ref{font-size:9px;color:#9ca3af;line-height:1.6;border-top:1px solid #e5e7eb;padding-top:10px;margin-top:16px}
</style>
</head>
<body>
<button onclick="window.print()">Imprimir / Guardar PDF</button>
<div class="header">
  <h1>MADRS — Escala de Depresión de Montgomery-Åsberg</h1>
  <p class="sub">Versión validada en español · CIBERSAM</p>
</div>
${notasHtml}
<table>
  <thead><tr><th>Ítem</th><th style="width:90px;text-align:center">Puntuación</th></tr></thead>
  <tbody>${filas}</tbody>
  <tfoot><tr>
    <td style="padding:8px 10px;border:1px solid #d1d5db;border-top:2px solid #111827;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#374151">
      Total
      <span style="font-weight:400;font-size:10px;color:#6b7280;margin-left:8px">${style.label} · ${style.action}</span>
    </td>
    <td style="padding:8px 10px;border:1px solid #d1d5db;border-top:2px solid #111827;text-align:center;font-size:20px;font-weight:700;color:#111827">${total}<span style="font-size:11px;font-weight:400;color:#6b7280"> /60</span></td>
  </tr></tfoot>
</table>
<p class="ref">Montgomery SA, Åsberg M. A new depression scale designed to be sensitive to change. <em>Br J Psychiatry.</em> 1979;134:382–9.<br>
Versión española: Lobo A, Saz P. <em>Esquemas de trabajo de Psiquiatría: Curso 06–07.</em> CIBERSAM – Banco de instrumentos y metodologías en Salud Mental.</p>
<script id="psiqui-madrs-data" type="application/json">${JSON.stringify(datos)}</script>
</body></html>`;

        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.download = `MADRS-${new Date().toISOString().slice(0,10)}.html`;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6">
            <div className="max-w-3xl mx-auto space-y-6">

                <div className="flex items-center gap-3">
                    <Activity className="w-7 h-7 text-slate-700" />
                    <div>
                        <h1 className="text-2xl font-semibold">MADRS</h1>
                        <p className="text-sm text-slate-600">Escala de Depresión de Montgomery-Åsberg</p>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900 space-y-2">
                    <p>La evaluación debería basarse en una entrevista clínica que va desde preguntas de carácter general sobre los síntomas hasta preguntas más detalladas que permiten una evaluación precisa de la gravedad. El evaluador debe decidir si la valoración corresponde a las respuestas definidas en los niveles de la escala <strong>(0, 2, 4, 6)</strong> o las situaciones entre ellas <strong>(1, 3, 5)</strong>.</p>
                    <p>Es importante recordar que sólo en contadas ocasiones se encuentra a algún/a paciente deprimido/a que no puede ser valorado/a dentro de los apartados de la escala. Si no se puede obtener respuestas precisas del paciente, debe usarse cualquier dato relevante, así como la información procedente de otras fuentes como base para la valoración, de acuerdo con la práctica clínica habitual.</p>
                </div>

                {ITEMS.map(item => (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-slate-800 mb-0.5">{item.label}</p>
                        {item.nota && <p className="text-xs text-slate-500 mb-3 italic">{item.nota}</p>}
                        <div className="space-y-1">
                            {item.opts.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => set(item.id, opt.value)}
                                    className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors
                                        ${scores[item.id] === opt.value
                                            ? "bg-slate-800 text-white border-slate-800"
                                            : opt.label === "..."
                                                ? "bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-400 italic"
                                                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"}`}
                                >
                                    <span className="font-bold mr-2 not-italic text-inherit">{opt.value}</span>
                                    {opt.label === "..." ? "Intermedio" : opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Notas de sesión */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Notas</label>
                    <textarea
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-slate-400 text-slate-700 resize-none"
                        rows={3}
                        value={notas}
                        onChange={e => setNotas(e.target.value)}
                    />
                </div>

                {/* Alerta ítem 10 */}
                {(scores.m10 ?? 0) >= 4 && (
                    <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-900">
                            <strong>Riesgo suicida elevado:</strong> Puntuación ≥4 en ítem 10 — evaluación inmediata del riesgo e intervención clínica urgente.
                        </p>
                    </div>
                )}

                <div className={`rounded-xl border-2 ${style.bg} ${style.border} p-5`}>
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Puntaje Total</p>
                            <p className={`text-4xl font-bold ${style.text}`}>{total}<span className="text-base opacity-60"> / 60</span></p>
                            {answered < 10 && <p className="text-xs text-slate-400 mt-1">{answered}/10 ítems puntuados</p>}
                        </div>
                        <div className="text-right">
                            <p className={`text-lg font-semibold ${style.text}`}>{style.label}</p>
                            <p className="text-sm text-slate-600 mt-0.5 max-w-[200px]">{style.action}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                        <button onClick={descargarResultado} disabled={answered === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                            <Download className="w-4 h-4" />
                            Descargar resultado
                        </button>
                        <button onClick={copyResult} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-100 text-sm">
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            Copiar
                        </button>
                        <button onClick={reset} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-100 text-sm">
                            <RotateCcw className="w-4 h-4" />
                            Limpiar
                        </button>
                    </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-4 text-xs text-slate-500 space-y-1 bg-white">
                    <p className="font-semibold text-slate-600">Referencia</p>
                    <p>Montgomery SA, Åsberg M. A new depression scale designed to be sensitive to change. <em>Br J Psychiatry.</em> 1979;134:382–9.</p>
                    <p>Versión validada en español: Lobo A, Saz P. <em>Esquemas de trabajo de Psiquiatría: Curso 06–07.</em> CIBERSAM – Banco de instrumentos y metodologías en Salud Mental.</p>
                </div>

                <p className="text-center text-xs text-slate-400 pb-4">
                    Herramienta de apoyo clínico · No sustituye el criterio médico profesional
                </p>
            </div>
        </div>
    );
}

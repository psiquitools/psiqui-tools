import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const PROMPT_SISTEMA = `Eres un psiquiatra clínico organizando la sección de antecedentes psiquiátricos personales de una historia clínica. Tu tarea requiere criterio clínico, no solo reformateo de texto.

OBJETIVO: Transformar notas acumuladas, desordenadas o con entradas repetidas en un resumen clínico cronológico, conciso y sin redundancias. Es una síntesis activa con juicio clínico: consolida duplicados, elimina lo redundante, prioriza lo clínicamente relevante y ordena de forma coherente.

REGLAS GENERALES:
- Escribe siempre en español. Conserva términos clínicos en inglés solo si el médico los usa (insight, craving, etc.).
- No expandas ni interpretes siglas o abreviaturas; cópialas exactamente.
- No inventes ni infieras información que no esté en el texto original.
- No añadas diagnósticos ni interpretaciones clínicas propias.
- Si hay fechas ambiguas o contradictorias, refléjalas tal como aparecen sin corregirlas.
- Cuando hay múltiples entradas sobre el mismo evento (p. ej. varios registros del mismo ingreso), consolídalas en una sola entrada sin perder información relevante.
- Corrige errores de redacción evidentes sin alterar el contenido clínico.

ESTRUCTURA DE SALIDA — redacta en este orden, en bloque continuo, SIN títulos ni encabezados:

① ANTECEDENTES Y DIAGNÓSTICOS PREVIOS: Resumen breve de los diagnósticos conocidos y antecedentes relevantes anteriores al inicio del seguimiento actual. Si no hay información previa clara, omite este bloque sin mencionarlo.

② LÍNEA TEMPORAL: Episodios, ingresos, descompensaciones y cambios relevantes en orden cronológico estricto del más antiguo al más reciente. Formato: "Año/Fecha: texto". Consolida entradas duplicadas del tipo "último ingreso:" en un único registro con la fecha más reciente. La información sobre adherencia, abandono de seguimiento o de tratamiento se integra en el punto temporal al que corresponde, no en bloque separado. Psicoterapia y otras intervenciones no farmacológicas se mencionan en el punto temporal correspondiente, no en bloque separado.

③ TRATAMIENTOS FARMACOLÓGICOS PREVIOS: Lista corta al final, solo si se mencionan en el texto. Formato: "- Fármaco (indicación o fechas si constan)". Si no hay información farmacológica, omite este bloque sin mencionarlo.

REGLAS DE FORMATO:
- Prosa continua para ① y ②. Lista con guiones solo para ③.
- Solo signos de puntuación básicos: punto, coma, punto y coma, dos puntos, paréntesis, comillas dobles ("") y guion (-). Prohibido: comillas angulares (« »), guion largo (—), guion medio (–) y viñetas especiales (•, ·, *).
- Sin títulos, encabezados ni etiquetas de sección de ningún tipo.

RESPONDE ÚNICAMENTE con JSON válido en este formato exacto, sin texto adicional fuera del JSON:
{
  "estructurado": "texto organizado aquí"
}`;

export async function POST(req: NextRequest) {
  const { texto } = await req.json();

  if (!texto?.trim()) {
    return NextResponse.json({ error: "Texto vacío" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key no configurada" }, { status: 500 });
  }

  try {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: PROMPT_SISTEMA,
      messages: [{ role: "user", content: texto }],
    });

    const raw = (message.content[0] as { type: string; text: string }).text;

    let estructurado = "";

    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
      estructurado = parsed.estructurado ?? "";
    } catch {
      estructurado = raw;
    }

    return NextResponse.json({ estructurado });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Error Anthropic:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

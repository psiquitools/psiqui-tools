import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const PROMPT_SISTEMA = `Eres un asistente clínico especializado en psiquiatría.
Tu tarea tiene DOS partes:

PARTE 1 — ESTRUCTURAR:
Reescribe el texto del episodio actual de una historia clínica psiquiátrica en formato clínico adecuado.
- Escribe en tercera persona
- Mantén orden cronológico claro
- Describe síntomas con precisión clínica (inicio, duración, intensidad)
- Incluye repercusión funcional si se menciona
- Usa vocabulario clínico psicopatológico cuando corresponda
- NO inventes ni añadas información que no esté en el texto original
- NO uses listas ni bullets, solo prosa continua bien estructurada
- NO incluyas diagnóstico ni plan de manejo

PARTE 2 — OMISIONES CLÍNICAS:
El texto corresponde ÚNICAMENTE a la sección de episodio actual / enfermedad actual de una historia clínica. Otras secciones (antecedentes personales psiquiátricos y médicos, antecedentes familiares, examen mental, plan de manejo) se registran por separado — NO los señales como omisiones.

Solo marca como omisión lo que debería estar en el relato del episodio actual y no aparece. Revisa:
- Riesgo suicida / ideación autolítica (señalar SIEMPRE si no está documentado explícitamente en el texto)
- Riesgo heteroagresivo o impulsos agresivos (si el cuadro lo justifica)
- Alucinaciones o percepciones anómalas actuales (si el cuadro lo justifica)
- Síntomas psicóticos actuales (si hay depresión grave, manía u otro cuadro que los implique)
- Patrón de sueño actual y cambios de apetito / peso durante el episodio
- Repercusión funcional actual concreta (laboral, social, familiar)
- Consumo activo de alcohol o sustancias durante el episodio
- Tiempo de evolución preciso o fecha de inicio del episodio
- Desencadenantes o estresores identificables del episodio actual
- Conductas autolesivas sin intención suicida

NO señales como omisiones: antecedentes psiquiátricos previos, antecedentes médicos, historia familiar, insight/conciencia de enfermedad, ni hallazgos del examen mental — todo eso va en otras secciones de la historia clínica.
Incluye solo las omisiones genuinamente relevantes para el cuadro específico descrito. Si un elemento ya está documentado, no lo incluyas. Frases cortas y directas.

RESPONDE ÚNICAMENTE con JSON válido en este formato exacto, sin texto adicional fuera del JSON:
{
  "estructurado": "texto clínico estructurado aquí",
  "omisiones": ["omisión 1", "omisión 2"]
}
Si no hay omisiones relevantes, devuelve "omisiones": [].`;

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
      model: "claude-haiku-4-5",
      max_tokens: 2048,
      system: PROMPT_SISTEMA,
      messages: [{ role: "user", content: texto }],
    });

    const raw = (message.content[0] as { type: string; text: string }).text;

    let estructurado = "";
    let omisiones: string[] = [];

    try {
      // Extraer el bloque JSON aunque venga envuelto en markdown (```json ... ```)
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
      estructurado = parsed.estructurado ?? "";
      omisiones = Array.isArray(parsed.omisiones) ? parsed.omisiones : [];
    } catch {
      estructurado = raw;
    }

    return NextResponse.json({ estructurado, omisiones });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Error Anthropic:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

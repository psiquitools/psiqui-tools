import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const PROMPT_SISTEMA = `Eres un psiquiatra clínico experto. Recibirás el examen mental de un paciente en formato de lista o texto estructurado. Tienes dos tareas:

TAREA 1 — REDACTAR EN PROSA CLÍNICA
Convierte el listado en texto corrido usando este estilo exacto:
- Frases cortas separadas por punto. No listas, no párrafo narrativo largo.
- "referida" para síntomas subjetivos que reporta el paciente.
- Ánimo y hedonia en la misma frase: "Hipotimia referida sin pérdida de capacidad hedónica, mantiene interés, ilusión y capacidad de disfrute."
- Afecto con tres cualidades: reactivo/aplanado/embotado — congruente/incongruente — rango amplio/restringido.
- Discurso: descriptores separados por coma ("espontáneo, fluido, coherente, bien estructurado y articulado").
- Pensamiento: curso y forma en una frase, contenido en frase separada.
- Si no hay riesgo: "No ideas ni conductas autolesivas ni heteroagresivas. No ideación autolítica."
- Si no hay alteraciones en biorritmos: "Apetito y sueño conservados."
- Final: "Juicio de realidad conservado. Insight presente." o describir el grado si están alterados.
- No inventes información que no esté en los datos. Si un dominio no tiene datos, omítelo.

EJEMPLO de cómo debe quedar el texto:
Paciente consciente y orientado en las tres esferas. Abordable y colaborador. Atento. Conductualmente adecuado. Sin alteraciones de la psicomotricidad. Hipotimia referida sin pérdida de capacidad hedónica, mantiene interés, ilusión y capacidad de disfrute. Afecto reactivo, congruente y de rango amplio. Discurso espontáneo, fluido, coherente, bien estructurado y articulado. Sin alteraciones en el curso ni forma del pensamiento. Contenido sin ideas delirantes ni obsesivas. Sin alteraciones de la sensopercepción. No ideas ni conductas autolesivas ni heteroagresivas. No ideación autolítica. Apetito y sueño conservados. Juicio de realidad conservado. Insight presente.

TAREA 2 — IDENTIFICAR INCONGRUENCIAS
Detecta contradicciones internas clínicamente relevantes (ej: ánimo eufórico con anhedonia completa, insight conservado con delirios activos sin crítica). Solo incongruencias reales. Una frase breve por incongruencia. Si no hay ninguna, devuelve array vacío.

FORMATO DE RESPUESTA — devuelve ÚNICAMENTE este JSON, sin texto adicional:
{"estructurado": "aquí el texto redactado", "incongruencias": ["frase 1", "frase 2"]}`;

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
      max_tokens: 1024,
      system: PROMPT_SISTEMA,
      messages: [{ role: "user", content: texto }],
    });

    const raw = (message.content[0] as { type: string; text: string }).text;

    let estructurado = "";
    let incongruencias: string[] = [];

    try {
      const codeBlock = raw.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      const bare = raw.match(/\{[\s\S]*\}/);
      const jsonStr = codeBlock ? codeBlock[1] : bare ? bare[0] : raw;
      const parsed = JSON.parse(jsonStr);
      estructurado = parsed.estructurado || raw;
      incongruencias = Array.isArray(parsed.incongruencias) ? parsed.incongruencias : [];
    } catch {
      estructurado = raw;
    }

    if (!estructurado?.trim()) {
      return NextResponse.json({ error: "La IA no devolvió texto. Intenta de nuevo." }, { status: 422 });
    }

    return NextResponse.json({ estructurado, incongruencias });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Error Anthropic:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

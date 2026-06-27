import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const PROMPT_SISTEMA = `Eres un psiquiatra clínico redactando el examen mental de una historia clínica de psiquiatría.

OBJETIVO: Convertir datos de examen mental (selecciones de checklist o notas por dominio) en prosa clínica estructurada. No filtres ni resumas más de lo que hay — el objetivo es formato correcto y lenguaje clínico, no síntesis.

REGLAS GENERALES:
- Escribe en español. Conserva los términos clínicos en inglés cuando el profesional los usa (insight, craving, burnout, rapport, etc.) — no los traduzcas ni los modifiques.
- No expandas ni interpretes siglas o abreviaturas; cópialas exactamente.
- No inventes ni infieras información que no esté en los datos recibidos.
- Respeta el orden de los dominios tal como lleguen en la entrada — el profesional ha elegido ese orden.
- Si un dominio no tiene datos, omítelo sin mencionarlo.
- Si un dominio tiene datos parciales, redacta solo lo que hay sin completar lo que falta.
- Corrige errores de redacción evidentes sin alterar el contenido clínico.

TAREA 1 — REDACTAR EN PROSA CLÍNICA

Convierte cada dominio en prosa clínica en el mismo orden en que aparece en la entrada. Aplica las siguientes reglas por dominio:

HUMOR Y HEDONIA — en la misma frase:
"Hipotimia referida sin pérdida de capacidad hedónica, mantiene interés, ilusión y capacidad de disfrute."
Si hay anhedonia: especifica qué componentes están afectados (interés, ilusión, disfrute).

AFECTO — tres cualidades siempre que haya datos:
reactivo / aplanado / embotado — congruente / incongruente — rango amplio / restringido.

DISCURSO — descriptores separados por coma:
"espontáneo, fluido, coherente, bien estructurado y articulado."

PENSAMIENTO — curso y forma en una frase; contenido en frase separada:
"Sin alteraciones en el curso ni en la forma del pensamiento. Contenido sin ideas delirantes ni obsesivas."

IDEACIÓN AUTOLÍTICA Y HETEROAGRESIVA — si no hay ideación:
"No ideas ni conductas autolesivas ni heteroagresivas. No ideación autolítica."
Si hay ideación: describir tipo (pasiva/activa), planificación, intencionalidad, egodistónica/egosintónica.

BIORRITMOS — si apetito y sueño están conservados: "Apetito y sueño conservados."
Si solo hay dato de uno: mencionar solo ese. No completar el que falta.
Esfera sexual: mencionar solo si hay datos. "Deseo sexual conservado / disminuido / aumentado."

JUICIO E INSIGHT — si conservados: "Juicio de realidad conservado. Insight presente."
Si alterados: describir el grado. El término insight puede mantenerse en inglés.

EJEMPLO DE SALIDA CORRECTA:
Paciente consciente y orientado en las tres esferas. Abordable y colaborador. Atento. Conductualmente adecuado. Sin alteraciones de la psicomotricidad. Hipotimia referida sin pérdida de capacidad hedónica, mantiene interés, ilusión y capacidad de disfrute. Afecto reactivo, congruente y de rango amplio. Discurso espontáneo, fluido, coherente, bien estructurado y articulado. Sin alteraciones en el curso ni en la forma del pensamiento. Contenido sin ideas delirantes ni obsesivas. Sin alteraciones de la sensopercepción. No ideas ni conductas autolesivas ni heteroagresivas. No ideación autolítica. Apetito y sueño conservados. Juicio de realidad conservado. Insight presente.

TAREA 2 — IDENTIFICAR INCONGRUENCIAS
Detecta contradicciones internas clínicamente relevantes (ej: ánimo eufórico con anhedonia completa, insight conservado con delirios activos sin crítica, discurso coherente con pensamiento disgregado). Solo incongruencias reales. Una frase breve por incongruencia. Si no hay ninguna, devuelve array vacío.

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

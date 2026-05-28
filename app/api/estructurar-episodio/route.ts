import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const PROMPT_SISTEMA = `Eres un asistente clínico especializado en psiquiatría.
Tu tarea es reescribir el texto del episodio actual de una historia clínica psiquiátrica en un formato clínico adecuado.

Reglas estrictas:
- Escribe en tercera persona
- Mantén orden cronológico claro
- Describe síntomas con precisión clínica (inicio, duración, intensidad)
- Incluye repercusión funcional si se menciona
- Usa vocabulario clínico apropiado (psicopatológico cuando corresponda)
- NO inventes ni añadas información que no esté en el texto original
- NO uses listas ni bullets, solo prosa continua bien estructurada
- NO incluyas diagnóstico ni plan de manejo
- Responde únicamente con el texto reescrito, sin títulos, sin comentarios, sin explicaciones adicionales`;

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

    const estructurado = (message.content[0] as { type: string; text: string }).text;

    return NextResponse.json({ estructurado });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Error Anthropic:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

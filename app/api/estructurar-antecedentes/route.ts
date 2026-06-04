import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const PROMPT_SISTEMA = `Eres un asistente clínico especializado en psiquiatría.
Tu tarea es organizar y estructurar notas de antecedentes psiquiátricos personales que pueden estar desordenadas, incompletas o con entradas acumuladas de forma confusa (por ejemplo, múltiples registros de "último ingreso:" añadidos en distintas fechas, diagnósticos dispersos, tratamientos mencionados sin orden).

Genera un resumen clínico organizado siguiendo estas pautas:
- NO añadas ningún título ni encabezado de sección (sin "ANTECEDENTES PSIQUIÁTRICOS", sin "Línea temporal:", sin "Episodios previos:", sin "Adhesión:", etc.)
- Escribe todo como un bloque continuo: primero los antecedentes previos al inicio del seguimiento, luego la línea temporal cronológica, luego los tratamientos farmacológicos previos si los hay
- Ordena cronológicamente: del episodio o antecedente más antiguo al más reciente
- Consolida entradas repetidas del tipo "último ingreso:" en una línea de tiempo clara con fechas cuando estén disponibles
- La información sobre adherencia, cumplimiento terapéutico o abandono de seguimiento debe integrarse en el punto temporal al que corresponde, no en sección separada
- Si se mencionan tratamientos farmacológicos previos, agrúpalos al final en una lista corta
- NO crees sección separada para psicoterapia ni "otros tratamientos" — menciónalo brevemente en el punto temporal si es relevante
- Usa solo signos de puntuación básicos (punto, coma, punto y coma, guion -). NO uses viñetas especiales (•, ·, *, –, etc.)
- Para listas cortas (antecedentes previos, fármacos) usa guiones: "- elemento"
- La línea temporal usa el formato "Año/Fecha: texto"
- Corrige errores de redacción evidentes pero sin alterar el contenido clínico
- NO inventes ni infieras información que no esté explícitamente en el texto original
- NO añadas diagnósticos ni interpretaciones clínicas propias
- Si hay fechas ambiguas o contradictorias, refléjalas tal como aparecen sin corregirlas

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
      model: "claude-haiku-4-5",
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

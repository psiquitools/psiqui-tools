import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const PROMPT_SISTEMA = `Eres un psiquiatra clínico redactando la nota de una consulta de seguimiento ambulatoria de psiquiatría.

Recibirás información organizada en dos bloques:
1. DOMINIOS CLÍNICOS — lo que el paciente refiere o el médico observa en cada área explorada
2. TRATAMIENTO — fármacos actuales y cambios realizados en esta consulta

NOTA CLÍNICA DE SEGUIMIENTO:
- Prosa continua en tercera persona, sin bullets ni headers
- 100–220 palabras. Conciso y clínicamente preciso
- Integra los dominios de forma natural, sin anunciarlos como titulares ("En cuanto a X…", "Respecto a Y…"). Varía la estructura sintáctica y el punto de entrada de cada oración
- Usa terminología psicopatológica precisa cuando corresponda (hipotimia, anhedonia, bradipsiquia, etc.)
- Solo incluye los dominios con información. Los vacíos, ignóralos
- No incluyas diagnóstico, plan ni información de tratamiento
- El texto debe sonar como la redacción espontánea de un psiquiatra con dominio del idioma, no como una plantilla rellenada
- Puntuación permitida: punto, coma, punto y coma, dos puntos, paréntesis y comillas dobles (""). Prohibido: comillas angulares (« »), guion largo (—) y guion medio (–)

NOTA DE TRATAMIENTO:
- Una o dos frases en tercera persona que reflejen el estado del tratamiento y los cambios de esta consulta
- Formato fluido: "Se mantiene [fármaco] a [dosis]. Se ajusta [fármaco] de [dosis anterior] a [nueva dosis]. Se retira [fármaco]. Se incorpora [fármaco] a [dosis]."
- Si no hay ningún cambio en ningún fármaco: "Se mantiene tratamiento psicofarmacológico sin modificaciones."
- Si no hay información de tratamiento en el input, devuelve null

RESPONDE ÚNICAMENTE con JSON válido sin texto adicional fuera del JSON:
{
  "nota": "texto de nota clínica",
  "tratamiento": "texto de nota de tratamiento o null"
}`;

export async function POST(req: NextRequest) {
  const { contenido } = await req.json();

  if (!contenido?.trim()) {
    return NextResponse.json({ error: "Contenido vacío" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key no configurada" }, { status: 500 });
  }

  try {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: PROMPT_SISTEMA,
      messages: [{ role: "user", content: contenido }],
    });

    const raw = (message.content[0] as { type: string; text: string }).text;

    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
      return NextResponse.json({
        nota: parsed.nota ?? "",
        tratamiento: parsed.tratamiento ?? null,
      });
    } catch {
      return NextResponse.json({ nota: raw, tratamiento: null });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Error Anthropic:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const PROMPT_SISTEMA = `Eres un psiquiatra clínico con experiencia en comunicación con pacientes, especializado en redactar documentos de psicoeducación de alta calidad para entregar en consulta.

OBJETIVO: Generar un documento de psicoeducación personalizado sobre el tema solicitado, adaptado al perfil del paciente. El documento debe ser útil, comprensible y apto para ser entregado directamente al paciente o su familia.

PRINCIPIOS:
- Tono empático, cercano y no alarmista. Normaliza sin minimizar.
- Segunda persona singular con tratamiento de usted.
- Basado en evidencia pero expresado en términos comprensibles.
- No genera alarma innecesaria ni fomenta automedicación.
- No incluye lenguaje estigmatizante.
- Puntuación: punto, coma, punto y coma, dos puntos, paréntesis, comillas dobles (""). Sin guiones largos ni comillas angulares.

NIVEL DE LECTURA:
- Básico: frases cortas, sin tecnicismos o explicados inmediatamente, ejemplos concretos de la vida cotidiana.
- Medio: adulto estándar, algunos términos técnicos explicados entre paréntesis.
- Alto: puede incluir vocabulario más técnico con breves aclaraciones.

TIPOS DE DOCUMENTO:
- Psicoeducación general: qué es el trastorno/situación, cómo se manifiesta, qué lo causa, cómo evoluciona.
- Sobre el tratamiento: cómo funciona el medicamento o la terapia, qué esperar, efectos adversos frecuentes y cómo manejarlos, importancia de la adherencia.
- Estrategias prácticas: técnicas, hábitos y herramientas que el paciente puede aplicar en su día a día.
- Para la familia: cómo entender lo que le ocurre al familiar, cómo ayudar sin sobreproteger, señales de alerta.

FORMATO DE SALIDA (markdown limpio):
- # para el título del documento
- ## para secciones
- **texto** para términos clave o ideas importantes
- Listas con - cuando sean útiles
- Sin bloques de código ni separadores horizontales

EXTENSIÓN:
- Breve: 300-450 palabras
- Estándar: 500-750 palabras
- Detallado: 800-1100 palabras

Si el contexto del paciente incluye preocupaciones específicas, preguntas concretas o características relevantes, incorpóralas en el documento de forma natural — sin mencionar que fueron proporcionadas.

RESPONDE ÚNICAMENTE con el documento en markdown. Sin texto adicional fuera del documento.`;

export async function POST(req: NextRequest) {
  const { tema, tipo, nivel, contexto, extension } = await req.json();

  if (!tema?.trim()) {
    return NextResponse.json({ error: "Tema vacío" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key no configurada" }, { status: 500 });
  }

  const contenido = [
    `Tema: ${tema.trim()}`,
    `Tipo de documento: ${tipo}`,
    `Nivel de lectura: ${nivel}`,
    `Extensión: ${extension}`,
    contexto?.trim() ? `Contexto del paciente: ${contexto.trim()}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      temperature: 0.4,
      system: PROMPT_SISTEMA,
      messages: [{ role: "user", content: contenido }],
    });

    const documento = (message.content[0] as { type: string; text: string }).text.trim();

    return NextResponse.json({ documento });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Error Anthropic:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

"use client";

import { useState } from "react";
import { BookOpen, Copy, Check, Loader2, RotateCcw } from "lucide-react";
import Link from "next/link";

const TIPOS = [
  "Psicoeducación general",
  "Sobre el tratamiento",
  "Estrategias prácticas",
  "Para la familia",
];

const NIVELES = ["Básico", "Medio", "Alto"] as const;
const EXTENSIONES = ["Breve", "Estándar", "Detallado"] as const;

function renderInline(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function DocRenderer({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  const listItems: string[] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key} className="my-2 space-y-1.5 pl-1">
          {listItems.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-slate-700 leading-relaxed">
              <span className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
            </li>
          ))}
        </ul>
      );
      listItems.length = 0;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("# ")) {
      flushList(`list-${i}`);
      elements.push(
        <h1 key={`h1-${i}`} className="text-xl font-bold text-slate-900 mt-2 mb-4 leading-snug">
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith("## ")) {
      flushList(`list-${i}`);
      elements.push(
        <h2 key={`h2-${i}`} className="text-sm font-semibold text-slate-800 mt-5 mb-2 uppercase tracking-wide">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("- ")) {
      listItems.push(line.slice(2));
    } else if (line.trim() === "") {
      flushList(`list-${i}`);
    } else {
      flushList(`list-${i}`);
      elements.push(
        <p
          key={`p-${i}`}
          className="text-slate-700 leading-relaxed mb-2"
          dangerouslySetInnerHTML={{ __html: renderInline(line) }}
        />
      );
    }
  }
  flushList("list-end");

  return <div className="prose-sm max-w-none">{elements}</div>;
}

export default function PsicoeducacionPage() {
  const [tema, setTema] = useState("");
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [nivel, setNivel] = useState<(typeof NIVELES)[number]>("Medio");
  const [extension, setExtension] = useState<(typeof EXTENSIONES)[number]>("Estándar");
  const [contexto, setContexto] = useState("");

  const [documento, setDocumento] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const generar = async () => {
    if (!tema.trim()) return;
    setLoading(true);
    setError(null);
    setDocumento("");
    try {
      const res = await fetch("/api/generar-psicoeducacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema: tema.trim(), tipo, nivel, contexto, extension }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error desconocido");
      setDocumento(data.documento);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const copiar = async () => {
    if (!documento) return;
    const plain = documento
      .replace(/^#{1,3} /gm, "")
      .replace(/\*\*(.+?)\*\*/g, "$1");
    await navigator.clipboard.writeText(plain);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const reiniciar = () => {
    setDocumento("");
    setError(null);
    setTema("");
    setContexto("");
    setTipo(TIPOS[0]);
    setNivel("Medio");
    setExtension("Estándar");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2.5">
              <BookOpen className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Generador de Psicoeducación</h1>
              <p className="text-sm text-slate-500">
                Documentos personalizados para entregar al paciente o familia
              </p>
            </div>
          </div>
          <Link
            href="/recursos-psicoeducacion"
            className="text-xs text-blue-600 hover:text-blue-800 underline underline-offset-2"
          >
            Biblioteca de PDFs
          </Link>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">

          {/* Formulario */}
          <div className="w-full shrink-0 lg:w-72 xl:w-80">
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-5">

              {/* Tema */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                  Tema <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  placeholder="Ej: Trastorno de pánico, Sertralina, TDAH..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  onKeyDown={(e) => { if (e.key === "Enter") generar(); }}
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                  Tipo de documento
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  {TIPOS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Nivel */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                  Nivel de lectura
                </label>
                <div className="flex gap-2">
                  {NIVELES.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNivel(n)}
                      className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                        nivel === n
                          ? "border-blue-500 bg-blue-600 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300 hover:text-blue-700"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extensión */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                  Extensión
                </label>
                <div className="flex gap-2">
                  {EXTENSIONES.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setExtension(ex)}
                      className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                        extension === ex
                          ? "border-blue-500 bg-blue-600 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300 hover:text-blue-700"
                      }`}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contexto */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                  Contexto del paciente{" "}
                  <span className="font-normal normal-case text-slate-400">(opcional)</span>
                </label>
                <textarea
                  value={contexto}
                  onChange={(e) => setContexto(e.target.value)}
                  rows={4}
                  placeholder="Ej: Tiene miedo de volverse dependiente. Primer episodio depresivo. 68 años, vive sola..."
                  className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Botón */}
              <button
                onClick={generar}
                disabled={!tema.trim() || loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generando...
                  </span>
                ) : (
                  "Generar documento"
                )}
              </button>
            </div>
          </div>

          {/* Resultado */}
          <div className="min-w-0 flex-1">
            {!documento && !loading && !error && (
              <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
                <div>
                  <BookOpen className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                  <p className="text-sm text-slate-400">
                    El documento generado aparecerá aquí
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                <p className="text-sm font-medium text-red-700">Error: {error}</p>
              </div>
            )}

            {loading && (
              <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white">
                <div className="text-center">
                  <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-blue-400" />
                  <p className="text-xs text-slate-400">Generando documento...</p>
                </div>
              </div>
            )}

            {documento && !loading && (
              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-medium text-slate-600">{tipo}</span>
                    <span>·</span>
                    <span>Nivel {nivel}</span>
                    <span>·</span>
                    <span>{extension}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={reiniciar}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Nuevo
                    </button>
                    <button
                      onClick={copiar}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        copiado
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {copiado ? (
                        <>
                          <Check className="h-3 w-3" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copiar texto
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="px-6 py-6">
                  <DocRenderer text={documento} />
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

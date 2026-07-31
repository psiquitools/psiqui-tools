"use client";

import { useState } from "react";
import { ClipboardCheck, Clipboard, Plus, X, Sparkles } from "lucide-react";

const DOMINIOS_DEFAULT = [
  { id: "estado_animo", nombre: "Estado de ánimo / afectividad" },
  { id: "ansiedad", nombre: "Ansiedad" },
  { id: "sueno", nombre: "Sueño" },
  { id: "apetito", nombre: "Apetito / peso" },
  { id: "funcionalidad", nombre: "Funcionalidad" },
  { id: "conducta", nombre: "Conducta" },
  { id: "ideacion", nombre: "Ideación autolítica / riesgo" },
  { id: "adherencia", nombre: "Adherencia y efectos adversos" },
];

type EstadoFarmaco = "sin_cambios" | "ajuste" | "retirar";

type Farmaco = {
  id: string;
  nombre: string;
  dosisActual: string;
  pauta: string;
  esNuevo: boolean;
  estado: EstadoFarmaco;
  dosisNueva: string;
};

type Resultado = {
  nota: string;
  tratamiento: string | null;
};

export default function ConsultaSeguimiento() {
  const [dominios, setDominios] = useState<Record<string, string>>(
    Object.fromEntries(DOMINIOS_DEFAULT.map((d) => [d.id, ""]))
  );
  const [dominiosExtra, setDominiosExtra] = useState<{ id: string; nombre: string; texto: string }[]>([]);
  const [nuevoDominio, setNuevoDominio] = useState("");

  const [farmacos, setFarmacos] = useState<Farmaco[]>([]);
  const [addNombre, setAddNombre] = useState("");
  const [addDosis, setAddDosis] = useState("");
  const [addPauta, setAddPauta] = useState("");
  const [addEsNuevo, setAddEsNuevo] = useState(false);

  const [copiadoPauta, setCopiadoPauta] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [copiadoNota, setCopiadoNota] = useState(false);
  const [copiadoTrat, setCopiadoTrat] = useState(false);

  function setDominio(id: string, valor: string) {
    setDominios((prev) => ({ ...prev, [id]: valor }));
  }

  function setDominioExtra(id: string, valor: string) {
    setDominiosExtra((prev) =>
      prev.map((d) => (d.id === id ? { ...d, texto: valor } : d))
    );
  }

  function añadirDominio() {
    if (!nuevoDominio.trim()) return;
    setDominiosExtra((prev) => [
      ...prev,
      { id: `extra_${Date.now()}`, nombre: nuevoDominio.trim(), texto: "" },
    ]);
    setNuevoDominio("");
  }

  function eliminarDominioExtra(id: string) {
    setDominiosExtra((prev) => prev.filter((d) => d.id !== id));
  }

  function añadirFarmaco() {
    if (!addNombre.trim()) return;
    setFarmacos((prev) => [
      ...prev,
      {
        id: `f_${Date.now()}`,
        nombre: addNombre.trim(),
        dosisActual: addDosis.trim(),
        pauta: addPauta.trim(),
        esNuevo: addEsNuevo,
        estado: "sin_cambios",
        dosisNueva: "",
      },
    ]);
    setAddNombre("");
    setAddDosis("");
    setAddPauta("");
    setAddEsNuevo(false);
  }

  const textoPauta = farmacos
    .filter((f) => f.estado !== "retirar")
    .map((f) => [f.nombre, f.dosisActual, f.pauta].filter(Boolean).join(" "))
    .join("\n");

  function actualizarFarmaco(id: string, cambios: Partial<Farmaco>) {
    setFarmacos((prev) => prev.map((f) => (f.id === id ? { ...f, ...cambios } : f)));
  }

  function eliminarFarmaco(id: string) {
    setFarmacos((prev) => prev.filter((f) => f.id !== id));
  }

  async function generar() {
    // Incluir fármaco pendiente en el formulario si existe
    const farmacoPendiente: Farmaco | null = addNombre.trim()
      ? {
          id: `f_${Date.now()}`,
          nombre: addNombre.trim(),
          dosisActual: addDosis.trim(),
          pauta: addPauta.trim(),
          esNuevo: addEsNuevo,
          estado: "sin_cambios",
          dosisNueva: "",
        }
      : null;

    if (farmacoPendiente) {
      setFarmacos((prev) => [...prev, farmacoPendiente]);
      setAddNombre("");
      setAddDosis("");
      setAddPauta("");
      setAddEsNuevo(false);
    }

    const farmacosEfectivos = farmacoPendiente ? [...farmacos, farmacoPendiente] : farmacos;

    const dominiosConTexto = [
      ...DOMINIOS_DEFAULT
        .filter((d) => dominios[d.id]?.trim())
        .map((d) => ({ nombre: d.nombre, texto: dominios[d.id] })),
      ...dominiosExtra
        .filter((d) => d.texto.trim())
        .map((d) => ({ nombre: d.nombre, texto: d.texto })),
    ];

    if (dominiosConTexto.length === 0 && farmacosEfectivos.length === 0) return;

    setLoading(true);
    setError(null);
    setResultado(null);

    const bloques: string[] = [];

    if (dominiosConTexto.length > 0) {
      bloques.push(
        "DOMINIOS CLÍNICOS:\n" +
        dominiosConTexto.map((d) => `${d.nombre}: ${d.texto}`).join("\n")
      );
    }

    if (farmacosEfectivos.length > 0) {
      bloques.push(
        "TRATAMIENTO:\n" +
        farmacosEfectivos.map((f) => {
          if (f.esNuevo) return `NUEVO: ${f.nombre}${f.dosisActual ? ` ${f.dosisActual}` : ""}`;
          if (f.estado === "retirar") return `RETIRAR: ${f.nombre}${f.dosisActual ? ` ${f.dosisActual}` : ""}`;
          if (f.estado === "ajuste") return `AJUSTE: ${f.nombre} ${f.dosisActual} → ${f.dosisNueva || "?"}`;
          return `SIN CAMBIOS: ${f.nombre}${f.dosisActual ? ` ${f.dosisActual}` : ""}`;
        }).join("\n")
      );
    }

    try {
      const res = await fetch("/api/estructurar-seguimiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenido: bloques.join("\n\n") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error desconocido");
      setResultado(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al conectar con la IA");
    } finally {
      setLoading(false);
    }
  }

  async function copiarPauta() {
    if (!textoPauta) return;
    await navigator.clipboard.writeText(textoPauta);
    setCopiadoPauta(true);
    setTimeout(() => setCopiadoPauta(false), 2000);
  }

  async function copiarNota() {
    if (!resultado?.nota) return;
    await navigator.clipboard.writeText(resultado.nota);
    setCopiadoNota(true);
    setTimeout(() => setCopiadoNota(false), 2000);
  }

  async function copiarTrat() {
    if (!resultado?.tratamiento) return;
    await navigator.clipboard.writeText(resultado.tratamiento);
    setCopiadoTrat(true);
    setTimeout(() => setCopiadoTrat(false), 2000);
  }

  const hayContenido =
    DOMINIOS_DEFAULT.some((d) => dominios[d.id]?.trim()) ||
    dominiosExtra.some((d) => d.texto.trim()) ||
    farmacos.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-5 py-12 md:py-16">

        {/* Header */}
        <div className="mb-8 border-b border-slate-200 pb-6">
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-slate-400">
            Herramienta clínica
          </p>
          <h1 className="text-xl font-semibold text-slate-800">Consulta de Seguimiento</h1>
          <p className="mt-1 text-sm text-slate-500">
            Registra los dominios explorados y genera la nota clínica con IA.
          </p>
        </div>

        {/* Columnas: dominios + tratamiento */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[3fr_2fr]">

        {/* Bloque 1: Dominios clínicos */}
        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Dominios clínicos
          </h2>
          <div className="flex flex-col gap-3">
            {DOMINIOS_DEFAULT.map((d) => (
              <div key={d.id} className="rounded-lg bg-white ring-1 ring-slate-200">
                <label className="block px-4 pt-3 text-xs font-semibold text-slate-500">
                  {d.nombre}
                </label>
                <textarea
                  value={dominios[d.id]}
                  onChange={(e) => setDominio(d.id, e.target.value)}
                  rows={2}
                  placeholder="…"
                  className="w-full resize-y bg-transparent px-4 pb-3 pt-1.5 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none"
                />
              </div>
            ))}

            {dominiosExtra.map((d) => (
              <div key={d.id} className="rounded-lg bg-white ring-1 ring-slate-200">
                <div className="flex items-center justify-between px-4 pt-3">
                  <label className="text-xs font-semibold text-slate-500">{d.nombre}</label>
                  <button
                    onClick={() => eliminarDominioExtra(d.id)}
                    className="text-slate-300 transition-colors hover:text-slate-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <textarea
                  value={d.texto}
                  onChange={(e) => setDominioExtra(d.id, e.target.value)}
                  rows={2}
                  placeholder="…"
                  className="w-full resize-y bg-transparent px-4 pb-3 pt-1.5 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none"
                />
              </div>
            ))}

            <div className="flex gap-2">
              <input
                value={nuevoDominio}
                onChange={(e) => setNuevoDominio(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && añadirDominio()}
                placeholder="Añadir dominio personalizado…"
                className="flex-1 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
              <button
                onClick={añadirDominio}
                disabled={!nuevoDominio.trim()}
                className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-slate-400 transition-colors hover:border-slate-400 hover:text-slate-600 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bloque 2: Tratamiento */}
        <div className="mb-10">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Tratamiento
          </h2>

          {farmacos.length > 0 && (
            <div className="mb-3 flex flex-col gap-2">
              {farmacos.map((f) => (
                <div key={f.id} className="rounded-lg bg-white ring-1 ring-slate-200">
                  <div className="flex items-start gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">{f.nombre}</span>
                        {f.dosisActual && (
                          <span className="text-sm text-slate-400">{f.dosisActual}</span>
                        )}
                        {f.pauta && (
                          <span className="font-mono text-sm text-slate-500">{f.pauta}</span>
                        )}
                        {f.esNuevo && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            Nuevo
                          </span>
                        )}
                      </div>

                      {!f.esNuevo && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {(["sin_cambios", "ajuste", "retirar"] as EstadoFarmaco[]).map((estado) => (
                            <button
                              key={estado}
                              onClick={() => actualizarFarmaco(f.id, { estado })}
                              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${f.estado === estado
                                  ? estado === "retirar"
                                    ? "bg-red-100 text-red-700"
                                    : estado === "ajuste"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-slate-800 text-white"
                                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                }`}
                            >
                              {estado === "sin_cambios"
                                ? "Sin cambios"
                                : estado === "ajuste"
                                  ? "Ajustar"
                                  : "Retirar"}
                            </button>
                          ))}
                        </div>
                      )}

                      {f.estado === "ajuste" && !f.esNuevo && (
                        <input
                          value={f.dosisNueva}
                          onChange={(e) => actualizarFarmaco(f.id, { dosisNueva: e.target.value })}
                          placeholder="Nueva dosis"
                          className="mt-2 w-40 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                        />
                      )}
                    </div>

                    <button
                      onClick={() => eliminarFarmaco(f.id)}
                      className="mt-0.5 shrink-0 text-slate-300 transition-colors hover:text-slate-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Formulario añadir fármaco */}
          <div className="rounded-lg bg-white ring-1 ring-slate-200 px-4 py-3">
            <p className="mb-2 text-xs font-semibold text-slate-400">Añadir fármaco</p>
            <div className="flex flex-wrap items-end gap-2">
              <input
                value={addNombre}
                onChange={(e) => setAddNombre(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && añadirFarmaco()}
                placeholder="Nombre"
                className="min-w-32 flex-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
              <input
                value={addDosis}
                onChange={(e) => setAddDosis(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && añadirFarmaco()}
                placeholder={addEsNuevo ? "Dosis" : "Dosis"}
                className="w-24 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
              <input
                value={addPauta}
                onChange={(e) => setAddPauta(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && añadirFarmaco()}
                placeholder="Pauta"
                className="w-36 rounded-md border border-slate-200 px-3 py-1.5 font-mono text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
              <button
                onClick={añadirFarmaco}
                disabled={!addNombre.trim()}
                className="rounded-md bg-slate-800 px-3 py-1.5 text-white transition-colors hover:bg-slate-700 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <label className="mt-2 flex w-fit cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={addEsNuevo}
                onChange={(e) => setAddEsNuevo(e.target.checked)}
                className="accent-slate-800"
              />
              <span className="text-xs text-slate-500">Fármaco nuevo (no estaba en el tratamiento previo)</span>
            </label>
          </div>
        </div>

        </div> {/* fin grid columnas */}

        {/* Botón generar */}
        <button
          onClick={generar}
          disabled={loading || !hayContenido}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Sparkles className="h-4 w-4" />
          {loading ? "Generando nota…" : "Generar nota de seguimiento"}
        </button>

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            <X className="h-4 w-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Resultado */}
        {resultado && (
          <div className="mt-6 flex flex-col gap-4">
            <div className="rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Nota de seguimiento
                </p>
                <button
                  onClick={copiarNota}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${copiadoNota
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  {copiadoNota ? (
                    <><ClipboardCheck className="h-3.5 w-3.5" />Copiado</>
                  ) : (
                    <><Clipboard className="h-3.5 w-3.5" />Copiar</>
                  )}
                </button>
              </div>
              <div className="px-5 py-4">
                <p className="font-mono text-sm leading-relaxed text-slate-700">
                  {resultado.nota}
                </p>
              </div>
            </div>

            {textoPauta && (
              <div className="rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Pauta de tomas
                  </p>
                  <button
                    onClick={copiarPauta}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${copiadoPauta
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                  >
                    {copiadoPauta ? (
                      <><ClipboardCheck className="h-3.5 w-3.5" />Copiado</>
                    ) : (
                      <><Clipboard className="h-3.5 w-3.5" />Copiar</>
                    )}
                  </button>
                </div>
                <div className="px-5 py-4">
                  <p className="font-mono text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                    {textoPauta}
                  </p>
                </div>
              </div>
            )}

            {resultado.tratamiento && (
              <div className="rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Nota de tratamiento
                  </p>
                  <button
                    onClick={copiarTrat}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${copiadoTrat
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                  >
                    {copiadoTrat ? (
                      <><ClipboardCheck className="h-3.5 w-3.5" />Copiado</>
                    ) : (
                      <><Clipboard className="h-3.5 w-3.5" />Copiar</>
                    )}
                  </button>
                </div>
                <div className="px-5 py-4">
                  <p className="font-mono text-sm leading-relaxed text-slate-700">
                    {resultado.tratamiento}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

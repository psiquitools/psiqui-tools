"use client";

import { useState } from "react";
import { MessageSquare, Send, CheckCircle, AlertCircle } from "lucide-react";

const CATEGORIAS = [
  "Comentario o sugerencia",
  "Error o recomendación en herramienta",
  "Recomendación de herramienta nueva",
  "Otros",
];

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xykvpzwo";

const ES_NUEVA_HERRAMIENTA = "Recomendación de herramienta nueva";

export default function FeedbackSection() {
  const [categoria, setCategoria] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tituloHerramienta, setTituloHerramienta] = useState("");
  const [descripcionHerramienta, setDescripcionHerramienta] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "exito" | "error">("idle");

  const esNuevaHerramienta = categoria === ES_NUEVA_HERRAMIENTA;

  function handleCategoria(valor: string) {
    setCategoria(valor);
    if (valor !== ES_NUEVA_HERRAMIENTA) {
      setTituloHerramienta("");
      setDescripcionHerramienta("");
    }
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!categoria) return;
    if (esNuevaHerramienta && !tituloHerramienta.trim()) return;
    if (!esNuevaHerramienta && !mensaje.trim()) return;
    setEstado("enviando");
    try {
      const mensajeFinal = esNuevaHerramienta
        ? `Herramienta sugerida: ${tituloHerramienta.trim()}${descripcionHerramienta.trim() ? `\n\nDescripción: ${descripcionHerramienta.trim()}` : ""}`
        : mensaje.trim();
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ categoria, mensaje: mensajeFinal }),
      });
      setEstado(res.ok ? "exito" : "error");
    } catch {
      setEstado("error");
    }
  }

  return (
    <section className="mx-auto mt-20 max-w-2xl">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <div className="mb-7 flex items-center gap-3">
          <div className="rounded-xl bg-slate-50 p-2.5">
            <MessageSquare className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-900">
              Comentarios y sugerencias
            </h2>
            <p className="text-sm text-slate-400">
              Ayúdanos a mejorar estas herramientas
            </p>
          </div>
        </div>

        {estado === "exito" ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle className="h-10 w-10 text-emerald-500" />
            <p className="font-semibold tracking-tight text-slate-900">¡Gracias por tu comentario!</p>
            <p className="text-sm text-slate-400">Lo revisaremos pronto.</p>
            <button
              onClick={() => { setCategoria(""); setMensaje(""); setEstado("idle"); }}
              className="mt-2 text-sm text-slate-400 underline hover:text-slate-600"
            >
              Enviar otro comentario
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Tipo de comentario
              </label>
              <select
                value={categoria}
                onChange={(e) => handleCategoria(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100"
              >
                <option value="">Selecciona una categoría</option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {esNuevaHerramienta && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Título de herramienta <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={tituloHerramienta}
                    onChange={(e) => setTituloHerramienta(e.target.value)}
                    required
                    placeholder="Ej: Calculadora de dosis pediátricas"
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-300 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Descripción de herramienta
                  </label>
                  <textarea
                    value={descripcionHerramienta}
                    onChange={(e) => setDescripcionHerramienta(e.target.value)}
                    rows={3}
                    placeholder="¿Para qué serviría? ¿Qué problema resolvería?"
                    className="w-full resize-none rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-300 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </>
            )}

            {!esNuevaHerramienta && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Mensaje
                </label>
                <textarea
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  required
                  rows={4}
                  placeholder="Describe tu comentario, sugerencia o el problema encontrado..."
                  className="w-full resize-none rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-300 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100"
                />
              </div>
            )}

            {estado === "error" && (
              <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                No se pudo enviar el mensaje. Intenta de nuevo.
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-slate-400">
                Tu mensaje es procesado por Formspree. No se usan cookies de seguimiento.
              </p>
              <button
                type="submit"
                disabled={estado === "enviando" || !categoria || (esNuevaHerramienta ? !tituloHerramienta.trim() : !mensaje.trim())}
                className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
                {estado === "enviando" ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

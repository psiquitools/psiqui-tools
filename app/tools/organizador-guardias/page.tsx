"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertCircle,
  Settings,
  Calendar,
  X,
  ArrowLeft,
  CalendarX,
  Wand2,
  Undo2,
} from "lucide-react";
import Link from "next/link";

type Restriccion = {
  espaciadoMinDias?: number;
  aceptaDobletes?: boolean;
};

type Vacacion = { id: string; inicio: string; fin: string };

type Residente = {
  id: string;
  nombre: string;
  anio: number;
  guardiasmes: number;
  restriccion?: Restriccion;
};

type Asignacion = {
  [fecha: string]: string | null;
};

type Bloqueo = {
  [residenteId: string]: string[];
};

type AppState = {
  residentes: Residente[];
  asignaciones: Asignacion;
  bloqueos: Bloqueo;
  vacaciones: { [residenteId: string]: Vacacion[] };
  superFestivos: string[];
  festivosPersonalizados: string[];
};

const ESTADO_INICIAL: AppState = {
  residentes: [],
  asignaciones: {},
  bloqueos: {},
  vacaciones: {},
  superFestivos: [],
  festivosPersonalizados: [],
};

const DIAS_SEMANA = ["L", "M", "X", "J", "V", "S", "D"];
const DIAS_SEMANA_LARGO = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const COLORES_RESIDENTE = [
  "#1D4ED8","#0F6E56","#A32D2D","#BA7517","#6D28D9",
  "#0E7490","#BE123C","#15803D","#7C3AED","#B45309",
];

function getId() { return Math.random().toString(36).slice(2, 9); }
function fechaStr(anio: number, mes: number, dia: number) {
  return `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}
function diasEnMes(anio: number, mes: number) { return new Date(anio, mes + 1, 0).getDate(); }
function primerDiaSemana(anio: number, mes: number) {
  const d = new Date(anio, mes, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

export default function OrganizadorGuardiasPage() {
  const [tab, setTab] = useState<"config" | "mes">("mes");
  const [estado, setEstado] = useState<AppState>(ESTADO_INICIAL);
  const [mesActual, setMesActual] = useState(() => {
    const now = new Date();
    return { anio: now.getFullYear(), mes: now.getMonth() };
  });
  const [residenteSeleccionado, setResidenteSeleccionado] = useState<string | null>(null);
  const [modoBloqueo, setModoBloqueo] = useState(false);
  const [diaVisualizando, setDiaVisualizando] = useState<string | null>(null);
  const [restriccionesAbiertas, setRestriccionesAbiertas] = useState<Set<string>>(new Set());
  const [disponibilidadAbierta, setDisponibilidadAbierta] = useState<Set<string>>(new Set());
  const [bloqueoInputs, setBloqueoInputs] = useState<Record<string, { mes: string; texto: string }>>({});
  const [vacacionInputs, setVacacionInputs] = useState<Record<string, { inicio: string; fin: string }>>({});
  const [historial, setHistorial] = useState<Asignacion[]>([]);
  const calRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("psiqui_guardias");
      if (raw) setEstado(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("psiqui_guardias", JSON.stringify(estado)); } catch {}
  }, [estado]);

  const colorResidente = (id: string) => {
    const idx = estado.residentes.findIndex((r) => r.id === id);
    return COLORES_RESIDENTE[idx % COLORES_RESIDENTE.length];
  };

  const esPostGuardiaDelResidente = (resId: string, fecha: string): boolean => {
    const add = (f: string, n: number) => {
      const d = new Date(f + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10);
    };
    const dow = (f: string) => new Date(f + "T12:00:00").getDay(); // 0=Dom,1=Lun…5=Vie,6=Sáb

    const ayer = add(fecha, -1);
    // Cualquier guardia ayer → hoy bloqueado (no se puede hacer guardia dos días seguidos)
    if (estado.asignaciones[ayer] === resId) return true;

    const anteayer = add(fecha, -2);
    // Regla sábado: si hace 2 días era Sáb → hoy (lunes) también es el libra
    if (dow(anteayer) === 6 && estado.asignaciones[anteayer] === resId) return true;

    return false;
  };

  const esBloqueado = (resId: string, fecha: string): boolean => {
    if ((estado.bloqueos[resId] || []).includes(fecha)) return true;
    return (estado.vacaciones?.[resId] || []).some(v => fecha >= v.inicio && fecha <= v.fin);
  };

  const violaEspaciado = (resId: string, fecha: string): string | null => {
    const res = estado.residentes.find(r => r.id === resId);
    const minDias = res?.restriccion?.espaciadoMinDias;
    if (!minDias || minDias <= 1) return null;
    const centro = new Date(fecha + "T12:00:00");
    for (let offset = -(minDias - 1); offset <= (minDias - 1); offset++) {
      if (offset === 0) continue;
      const d = new Date(centro);
      d.setDate(d.getDate() + offset);
      const f = d.toISOString().slice(0, 10);
      if (estado.asignaciones[f] === resId) {
        return `Guardia el ${f} (${Math.abs(offset)}d de margen, mínimo ${minDias}d)`;
      }
    }
    return null;
  };

  const esPuenteContext = (f1: string, libre: string, f2: string): boolean =>
    [f1, libre, f2].some(f =>
      estado.superFestivos.includes(f) || estado.festivosPersonalizados.includes(f)
    );

  const violaDoblete = (resId: string, fecha: string): string | null => {
    const res = estado.residentes.find(r => r.id === resId);
    if (res?.restriccion?.aceptaDobletes) return null;

    const centro = new Date(fecha + "T12:00:00");

    // ¿Guardia 2 días ANTES? → fecha sería la segunda del doblete
    const d1 = new Date(centro); d1.setDate(d1.getDate() - 2);
    const f1 = d1.toISOString().slice(0, 10);
    const lib1 = new Date(centro); lib1.setDate(lib1.getDate() - 1);
    if (estado.asignaciones[f1] === resId && !esPuenteContext(f1, lib1.toISOString().slice(0, 10), fecha))
      return `Doblete: guardia el ${f1}`;

    // ¿Guardia 2 días DESPUÉS? → fecha sería la primera del doblete
    const d2 = new Date(centro); d2.setDate(d2.getDate() + 2);
    const f2 = d2.toISOString().slice(0, 10);
    const lib2 = new Date(centro); lib2.setDate(lib2.getDate() + 1);
    if (estado.asignaciones[f2] === resId && !esPuenteContext(fecha, lib2.toISOString().slice(0, 10), f2))
      return `Doblete: guardia el ${f2}`;

    return null;
  };

  // Comprueba si asignar `fecha` crearía una guardia consecutiva con un día ya asignado
  // (el día siguiente, o el lunes si fecha es sábado, ya tienen guardia de este residente)
  const creaGuardiaConsecutiva = (resId: string, fecha: string): boolean => {
    const add = (f: string, n: number) => {
      const d = new Date(f + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10);
    };
    if (estado.asignaciones[add(fecha, 1)] === resId) return true;
    // Sábado: el lunes sería su libra — si ya tiene guardia el lunes, tampoco se puede
    if (new Date(fecha + "T12:00:00").getDay() === 6 && estado.asignaciones[add(fecha, 2)] === resId) return true;
    return false;
  };

  const conflictoAsignacion = (resId: string, fecha: string): string | null => {
    if (esPostGuardiaDelResidente(resId, fecha)) return "Post-guardia";
    if (creaGuardiaConsecutiva(resId, fecha)) return "Post-guardia (día siguiente ya asignado)";
    if (esBloqueado(resId, fecha)) return "Día bloqueado";
    const esp = violaEspaciado(resId, fecha);
    if (esp) return `Espaciado insuf.: ${esp}`;
    const dob = violaDoblete(resId, fecha);
    if (dob) return dob;
    return null;
  };

  const guardiasEnMes = (resId: string, anio: number, mes: number) => {
    const prefix = `${anio}-${String(mes + 1).padStart(2, "0")}`;
    return Object.entries(estado.asignaciones).filter(
      ([f, id]) => f.startsWith(prefix) && id === resId
    ).length;
  };

  const agregarResidente = () => {
    const nuevo: Residente = { id: getId(), nombre: "", anio: 2, guardiasmes: 5 };
    setEstado((s) => ({ ...s, residentes: [...s.residentes, nuevo] }));
  };

  const actualizarResidente = (id: string, campo: keyof Residente, valor: unknown) => {
    setEstado((s) => ({
      ...s,
      residentes: s.residentes.map((r) => (r.id === id ? { ...r, [campo]: valor } : r)),
    }));
  };

  const eliminarResidente = (id: string) => {
    setEstado((s) => ({ ...s, residentes: s.residentes.filter((r) => r.id !== id) }));
  };

  const actualizarRestriccion = (id: string, campo: keyof Restriccion, valor: unknown) => {
    setEstado((s) => ({
      ...s,
      residentes: s.residentes.map((r) =>
        r.id === id ? { ...r, restriccion: { ...r.restriccion, [campo]: valor } } : r
      ),
    }));
  };

  const toggleRestriccion = (id: string) => {
    setRestriccionesAbiertas(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleDisponibilidad = (id: string) => {
    setDisponibilidadAbierta(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        if (!bloqueoInputs[id]) {
          const m = mesActual;
          setBloqueoInputs(b => ({ ...b, [id]: { mes: `${m.anio}-${String(m.mes + 1).padStart(2, "0")}`, texto: "" } }));
        }
      }
      return next;
    });
  };

  const aplicarBloqueosTexto = (resId: string) => {
    const inp = bloqueoInputs[resId];
    if (!inp?.texto.trim()) return;
    const [anio, mesNum] = inp.mes.split("-").map(Number);
    const maxDia = new Date(anio, mesNum, 0).getDate();
    const fechas: string[] = [];
    inp.texto.split(/[,;\s]+/).forEach(token => {
      const rango = token.match(/^(\d{1,2})-(\d{1,2})$/);
      if (rango) {
        const ini = Math.max(1, parseInt(rango[1]));
        const fin = Math.min(maxDia, parseInt(rango[2]));
        for (let d = ini; d <= fin; d++) fechas.push(fechaStr(anio, mesNum - 1, d));
      } else {
        const d = parseInt(token);
        if (d >= 1 && d <= maxDia) fechas.push(fechaStr(anio, mesNum - 1, d));
      }
    });
    setEstado(s => {
      const actuales = s.bloqueos[resId] || [];
      const merged = [...new Set([...actuales, ...fechas])];
      return { ...s, bloqueos: { ...s.bloqueos, [resId]: merged } };
    });
    setBloqueoInputs(b => ({ ...b, [resId]: { ...b[resId], texto: "" } }));
  };

  const quitarBloqueo = (resId: string, fecha: string) => {
    setEstado(s => ({ ...s, bloqueos: { ...s.bloqueos, [resId]: (s.bloqueos[resId] || []).filter(f => f !== fecha) } }));
  };

  const limpiarBloqueosDelMes = (resId: string, mes: string) => {
    setEstado(s => ({ ...s, bloqueos: { ...s.bloqueos, [resId]: (s.bloqueos[resId] || []).filter(f => !f.startsWith(mes)) } }));
  };

  const agregarVacacion = (resId: string) => {
    const inp = vacacionInputs[resId];
    if (!inp?.inicio || !inp?.fin || inp.inicio > inp.fin) return;
    const nueva: Vacacion = { id: getId(), inicio: inp.inicio, fin: inp.fin };
    setEstado(s => ({ ...s, vacaciones: { ...s.vacaciones, [resId]: [...(s.vacaciones?.[resId] || []), nueva] } }));
    setVacacionInputs(v => ({ ...v, [resId]: { inicio: "", fin: "" } }));
  };

  const eliminarVacacion = (resId: string, vacId: string) => {
    setEstado(s => ({ ...s, vacaciones: { ...s.vacaciones, [resId]: (s.vacaciones?.[resId] || []).filter(v => v.id !== vacId) } }));
  };

  const toggleFestivo = (fecha: string, tipo: "super" | "normal") => {
    setEstado((s) => {
      if (tipo === "super") {
        const tiene = s.superFestivos.includes(fecha);
        return { ...s, superFestivos: tiene ? s.superFestivos.filter((f) => f !== fecha) : [...s.superFestivos, fecha] };
      } else {
        const tiene = s.festivosPersonalizados.includes(fecha);
        return { ...s, festivosPersonalizados: tiene ? s.festivosPersonalizados.filter((f) => f !== fecha) : [...s.festivosPersonalizados, fecha] };
      }
    });
  };

  const guardarHistorial = () =>
    setHistorial(h => [...h.slice(-19), { ...estado.asignaciones }]);

  const deshacer = () => {
    setHistorial(h => {
      if (h.length === 0) return h;
      const anterior = h[h.length - 1];
      setEstado(s => ({ ...s, asignaciones: anterior }));
      return h.slice(0, -1);
    });
  };

  const asignarDia = (fecha: string) => {
    if (modoBloqueo && residenteSeleccionado) {
      setEstado((s) => {
        const bloqueos = { ...s.bloqueos };
        const lista = bloqueos[residenteSeleccionado] || [];
        bloqueos[residenteSeleccionado] = lista.includes(fecha)
          ? lista.filter((f) => f !== fecha)
          : [...lista, fecha];
        return { ...s, bloqueos };
      });
      return;
    }
    if (!residenteSeleccionado) { setDiaVisualizando(fecha); return; }
    const actual = estado.asignaciones[fecha];
    if (actual === residenteSeleccionado) {
      guardarHistorial();
      setEstado((s) => ({ ...s, asignaciones: { ...s.asignaciones, [fecha]: null } }));
    } else {
      const conflicto = conflictoAsignacion(residenteSeleccionado, fecha);
      if (conflicto && !confirm(`⚠️ ${conflicto}. ¿Asignar igualmente?`)) return;
      guardarHistorial();
      setEstado((s) => ({ ...s, asignaciones: { ...s.asignaciones, [fecha]: residenteSeleccionado } }));
    }
  };

  const exportarImagen = async () => {
    if (!calRef.current) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(calRef.current, { scale: 2, backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `guardias-${MESES[mesActual.mes]}-${mesActual.anio}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("Instala html2canvas: npm install html2canvas");
    }
  };

  const renderCalendario = () => {
    const { anio, mes } = mesActual;
    const total = diasEnMes(anio, mes);
    const primero = primerDiaSemana(anio, mes);
    const celdas: (number | null)[] = Array(primero).fill(null);
    for (let i = 1; i <= total; i++) celdas.push(i);
    while (celdas.length % 7 !== 0) celdas.push(null);

    return (
      <div ref={calRef} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
          <span className="font-semibold">Guardias de Psiquiatría · {MESES[mes]} {anio}</span>
          <span className="text-slate-400 text-xs">Hospital del Henares</span>
        </div>
        <div className="grid grid-cols-7 border-b border-slate-200">
          {DIAS_SEMANA.map((d, i) => (
            <div key={d} className={`text-center text-xs font-semibold py-2 ${i >= 5 ? "text-red-500" : "text-slate-500"}`}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {celdas.map((dia, idx) => {
            if (!dia) return <div key={idx} className="border-r border-b border-slate-100 min-h-[68px]" />;
            const fecha = fechaStr(anio, mes, dia);
            const resId = estado.asignaciones[fecha] || null;
            const res = estado.residentes.find((r) => r.id === resId);
            const isSuperFestivo = estado.superFestivos.includes(fecha);
            const isFestivo = estado.festivosPersonalizados.includes(fecha);
            const isWeekend = idx % 7 >= 5;
            const isBloqueadoParaSeleccionado = residenteSeleccionado ? esBloqueado(residenteSeleccionado, fecha) : false;
            const hayConflicto = residenteSeleccionado && !resId ? conflictoAsignacion(residenteSeleccionado, fecha) : null;
            const violacionAsignado = resId ? violaEspaciado(resId, fecha) : null;
            const esDobleteAsignado = resId && (() => {
              const res2 = estado.residentes.find(r => r.id === resId);
              if (res2?.restriccion?.aceptaDobletes) return false;
              const off = (n: number) => { const d = new Date(fecha + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
              if (estado.asignaciones[off(-2)] === resId && !esPuenteContext(off(-2), off(-1), fecha)) return true;
              if (estado.asignaciones[off(2)] === resId && !esPuenteContext(fecha, off(1), off(2))) return true;
              return false;
            })();
            const bgColor = isSuperFestivo ? "bg-red-50" : isFestivo ? "bg-orange-50" : isWeekend ? "bg-slate-50" : "bg-white";
            const nAsignables = !resId && estado.residentes.length > 0
              ? estado.residentes.filter(r => {
                  const c = conflictoAsignacion(r.id, fecha);
                  return c === null || c.startsWith("Doblete");
                }).length
              : null;
            return (
              <div key={fecha} onClick={() => asignarDia(fecha)}
                className={`border-r border-b border-slate-100 min-h-[68px] p-1.5 cursor-pointer hover:bg-blue-50 transition-colors relative ${bgColor}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold ${isSuperFestivo ? "text-red-700" : isFestivo ? "text-orange-700" : isWeekend ? "text-red-500" : "text-slate-600"}`}>{dia}</span>
                  {isSuperFestivo && <span className="text-[9px] text-red-600 font-bold">★</span>}
                  {isFestivo && !isSuperFestivo && <span className="text-[9px] text-orange-500">◆</span>}
                </div>
                {res && resId && (
                  <div className="rounded text-white text-[10px] font-semibold px-1.5 py-0.5 truncate flex items-center gap-0.5"
                    style={{ backgroundColor: colorResidente(resId) }}>
                    {esDobleteAsignado && <span title="Doblete">⚠</span>}
                    R{res.anio} {res.nombre.split(" ")[0] || "—"}
                  </div>
                )}
                {isBloqueadoParaSeleccionado && (
                  <div className="absolute inset-0 bg-slate-300 bg-opacity-50 flex items-center justify-center pointer-events-none">
                    <X className="w-4 h-4 text-slate-600" />
                  </div>
                )}
                {hayConflicto && <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />}
                {violacionAsignado && <div className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-orange-400 rounded-full" title={violacionAsignado} />}
                {nAsignables !== null && (
                  <div className={`absolute bottom-1 right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 text-[9px] font-bold ${
                    nAsignables === 0 ? "bg-red-200 text-red-800" :
                    nAsignables === 1 ? "bg-red-100 text-red-700" :
                    nAsignables <= 3  ? "bg-amber-100 text-amber-700" :
                                        "bg-slate-100 text-slate-500"
                  }`}>
                    {nAsignables}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="px-4 py-2 border-t border-slate-100 flex flex-wrap gap-3 bg-white">
          {[...estado.residentes].sort((a, b) => b.anio - a.anio).map((r) => {
            const n = guardiasEnMes(r.id, mesActual.anio, mesActual.mes);
            return (
              <div key={r.id} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colorResidente(r.id) }} />
                <span className="text-[10px] text-slate-600">R{r.anio} {r.nombre.split(" ")[0] || "—"} ({n}/{r.guardiasmes})</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderConfig = () => (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Residentes del servicio</h3>
          <button onClick={agregarResidente}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Añadir
          </button>
        </div>
        {estado.residentes.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-6">Añade los residentes del servicio para empezar</p>
        )}
        <div className="space-y-2">
          {[...estado.residentes].sort((a, b) => b.anio - a.anio).map((r) => {
            const abierto = restriccionesAbiertas.has(r.id);
            const tieneRestriccion = !!(r.restriccion?.espaciadoMinDias || r.restriccion?.aceptaDobletes);
            const disponAbierto = disponibilidadAbierta.has(r.id);
            const tieneDisponibilidad = (estado.bloqueos[r.id]?.length ?? 0) > 0 || (estado.vacaciones?.[r.id]?.length ?? 0) > 0;
            const bInp = bloqueoInputs[r.id] ?? { mes: `${mesActual.anio}-${String(mesActual.mes + 1).padStart(2, "0")}`, texto: "" };
            const vInp = vacacionInputs[r.id] ?? { inicio: "", fin: "" };
            const bloqueosDelMes = (estado.bloqueos[r.id] || []).filter(f => f.startsWith(bInp.mes)).sort();
            return (
              <div key={r.id} className={`rounded-lg border transition-colors ${tieneRestriccion ? "border-amber-200 bg-amber-50" : "border-transparent bg-slate-50"}`}>
                {/* Fila principal */}
                <div className="flex items-center gap-3 p-3">
                  <div className="w-3 h-8 rounded-sm flex-shrink-0" style={{ backgroundColor: colorResidente(r.id) }} />
                  <input className="flex-1 text-sm bg-transparent outline-none text-slate-800 font-medium placeholder:text-slate-400"
                    value={r.nombre} onChange={(e) => actualizarResidente(r.id, "nombre", e.target.value)}
                    placeholder="Nombre del residente" />
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs text-slate-500">R</span>
                    <select value={r.anio} onChange={(e) => actualizarResidente(r.id, "anio", Number(e.target.value))}
                      className="text-xs border border-slate-200 rounded px-1 py-0.5 bg-white text-slate-700">
                      {[1,2,3,4,5].map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs text-slate-500">G/mes</span>
                    <input type="number" min={1} max={8} value={r.guardiasmes}
                      onChange={(e) => actualizarResidente(r.id, "guardiasmes", Number(e.target.value))}
                      className="w-10 text-xs border border-slate-200 rounded px-1 py-0.5 bg-white text-center text-slate-700" />
                  </div>
                  <button onClick={() => toggleRestriccion(r.id)}
                    title="Restricciones individuales"
                    className={`flex-shrink-0 transition-colors ${tieneRestriccion ? "text-amber-600 hover:text-amber-800" : "text-slate-300 hover:text-slate-500"}`}>
                    <AlertCircle className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleDisponibilidad(r.id)}
                    title="Bloqueos y vacaciones"
                    className={`flex-shrink-0 transition-colors ${tieneDisponibilidad ? "text-sky-600 hover:text-sky-800" : "text-slate-300 hover:text-slate-500"}`}>
                    <CalendarX className="w-4 h-4" />
                  </button>
                  <button onClick={() => eliminarResidente(r.id)} className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {/* Panel restricciones */}
                {disponAbierto && (
                  <div className="px-4 pb-4 border-t border-sky-200 pt-3 space-y-4">
                    <p className="text-[10px] font-semibold text-sky-700 uppercase tracking-wide">Bloqueos y vacaciones</p>

                    {/* — Bloqueos manuales — */}
                    <div>
                      <p className="text-xs font-medium text-slate-700 mb-2">Bloqueos manuales</p>
                      <div className="flex gap-2 items-center mb-2">
                        <input type="month"
                          value={bInp.mes}
                          onChange={e => setBloqueoInputs(b => ({ ...b, [r.id]: { ...b[r.id] ?? bInp, mes: e.target.value } }))}
                          className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700" />
                        <input
                          value={bInp.texto}
                          onChange={e => setBloqueoInputs(b => ({ ...b, [r.id]: { ...b[r.id] ?? bInp, texto: e.target.value } }))}
                          onKeyDown={e => e.key === "Enter" && aplicarBloqueosTexto(r.id)}
                          placeholder="3, 7, 12-15, 22…"
                          className="flex-1 text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700 placeholder:text-slate-400" />
                        <button onClick={() => aplicarBloqueosTexto(r.id)}
                          className="px-2.5 py-1 text-xs bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex-shrink-0">
                          Añadir
                        </button>
                      </div>
                      {bloqueosDelMes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {bloqueosDelMes.map(f => (
                            <span key={f} className="inline-flex items-center gap-1 text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                              {parseInt(f.split("-")[2])}
                              <button onClick={() => quitarBloqueo(r.id, f)} className="hover:text-sky-900">×</button>
                            </span>
                          ))}
                          <button onClick={() => limpiarBloqueosDelMes(r.id, bInp.mes)}
                            className="text-[10px] text-slate-400 hover:text-red-500 ml-1 transition-colors">
                            Limpiar mes
                          </button>
                        </div>
                      )}
                      <p className="text-[10px] text-slate-400">Escribe días del mes o rangos (ej: 3, 7, 12-15). Enter o botón Añadir.</p>
                    </div>

                    {/* — Vacaciones — */}
                    <div>
                      <p className="text-xs font-medium text-slate-700 mb-2">Períodos de vacaciones</p>
                      <div className="flex gap-2 items-center mb-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500">Del</span>
                          <input type="date"
                            value={vInp.inicio}
                            onChange={e => setVacacionInputs(v => ({ ...v, [r.id]: { ...v[r.id] ?? vInp, inicio: e.target.value } }))}
                            className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700" />
                          <span className="text-[10px] text-slate-500">al</span>
                          <input type="date"
                            value={vInp.fin}
                            min={vInp.inicio}
                            onChange={e => setVacacionInputs(v => ({ ...v, [r.id]: { ...v[r.id] ?? vInp, fin: e.target.value } }))}
                            className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700" />
                        </div>
                        <button onClick={() => agregarVacacion(r.id)}
                          disabled={!vInp.inicio || !vInp.fin || vInp.inicio > vInp.fin}
                          className="px-2.5 py-1 text-xs bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
                          + Añadir
                        </button>
                      </div>
                      {(estado.vacaciones?.[r.id] || []).length > 0 && (
                        <div className="space-y-1">
                          {(estado.vacaciones[r.id] || []).map(v => (
                            <div key={v.id} className="flex items-center justify-between bg-sky-50 rounded-lg px-3 py-1.5">
                              <span className="text-xs text-sky-800">
                                {new Date(v.inicio + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                                {" — "}
                                {new Date(v.fin + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                              <button onClick={() => eliminarVacacion(r.id, v.id)} className="text-sky-400 hover:text-red-500 transition-colors">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {abierto && (
                  <div className="px-4 pb-3 border-t border-amber-200 pt-2.5 space-y-3">
                    <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">Restricciones individuales</p>
                    <div className="flex flex-wrap gap-4 items-end">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Espaciado mínimo entre guardias</label>
                        <div className="flex items-center gap-1.5">
                          <input type="number" min={0} max={30}
                            value={r.restriccion?.espaciadoMinDias ?? ""}
                            placeholder="—"
                            onChange={(e) => actualizarRestriccion(r.id, "espaciadoMinDias", e.target.value === "" ? undefined : Number(e.target.value))}
                            className="w-14 text-xs border border-slate-200 rounded px-2 py-1 bg-white text-center text-slate-700" />
                          <span className="text-xs text-slate-500">días</span>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox"
                          checked={r.restriccion?.aceptaDobletes ?? false}
                          onChange={(e) => actualizarRestriccion(r.id, "aceptaDobletes", e.target.checked || undefined)}
                          className="w-3.5 h-3.5 accent-purple-600" />
                        <span className="text-xs text-slate-700">Acepta dobletes voluntariamente</span>
                      </label>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Por defecto nadie puede hacer un doblete (guardia · libre · guardia) salvo en puentes o si aquí se marca la excepción.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-1">Superfestivos del año</h3>
        <p className="text-xs text-slate-400 mb-4">Se eligen por jerarquía (R5 primero) al inicio del año.</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "24 dic", fecha: `${mesActual.anio}-12-24` },
            { label: "25 dic", fecha: `${mesActual.anio}-12-25` },
            { label: "31 dic", fecha: `${mesActual.anio}-12-31` },
            { label: "1 ene", fecha: `${mesActual.anio + 1}-01-01` },
            { label: "6 ene", fecha: `${mesActual.anio + 1}-01-06` },
          ].map(({ label, fecha }) => {
            const activo = estado.superFestivos.includes(fecha);
            return (
              <button key={fecha} onClick={() => toggleFestivo(fecha, "super")}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                  activo ? "bg-red-600 text-white border-red-600" : "bg-white text-slate-600 border-slate-300 hover:border-red-400"}`}>
                ★ {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const autocompletar = () => {
    if (estado.residentes.length === 0) return;
    if (!confirm("¿Autocompletar los días sin asignar este mes? Solo se rellenarán los días vacíos respetando todas las restricciones.")) return;

    const { anio, mes } = mesActual;
    const total = diasEnMes(anio, mes);
    const prefix = `${anio}-${String(mes + 1).padStart(2, "0")}`;

    const add = (f: string, n: number): string => {
      const d = new Date(f + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10);
    };
    const dowOf = (f: string) => new Date(f + "T12:00:00").getDay();

    // Un intento greedy con un orden de residentes dado
    const intentoGreedy = (ordenResidentes: Residente[]): { asigs: Asignacion; sinCandidatos: number } => {
      const asigs: Asignacion = { ...estado.asignaciones };

      const postGuardia = (resId: string, fecha: string): boolean => {
        if (asigs[add(fecha, -1)] === resId) return true;
        if (dowOf(add(fecha, -2)) === 6 && asigs[add(fecha, -2)] === resId) return true;
        return false;
      };
      const consecutiva = (resId: string, fecha: string): boolean => {
        if (asigs[add(fecha, 1)] === resId) return true;
        if (dowOf(fecha) === 6 && asigs[add(fecha, 2)] === resId) return true;
        return false;
      };
      const espaciado = (resId: string, fecha: string): boolean => {
        const res = ordenResidentes.find(r => r.id === resId);
        const minDias = res?.restriccion?.espaciadoMinDias;
        if (!minDias || minDias <= 1) return false;
        const centro = new Date(fecha + "T12:00:00");
        for (let offset = -(minDias - 1); offset <= (minDias - 1); offset++) {
          if (offset === 0) continue;
          const d = new Date(centro); d.setDate(d.getDate() + offset);
          if (asigs[d.toISOString().slice(0, 10)] === resId) return true;
        }
        return false;
      };
      const hardConflict = (resId: string, fecha: string): boolean =>
        postGuardia(resId, fecha) || consecutiva(resId, fecha) || esBloqueado(resId, fecha) || espaciado(resId, fecha);
      const guardiasLocales = (resId: string) =>
        Object.entries(asigs).filter(([f, r]) => f.startsWith(prefix) && r === resId).length;

      // Cuenta guardias de un día de la semana concreto este mes
      const countDow = (resId: string, targetDow: number) =>
        Object.entries(asigs).filter(([f, r]) =>
          r === resId && f.startsWith(prefix) && new Date(f + "T12:00:00").getDay() === targetDow
        ).length;
      // Cuenta guardias premium (sáb/dom/festivo) este mes
      const countPremium = (resId: string) =>
        Object.entries(asigs).filter(([f, r]) => {
          if (r !== resId || !f.startsWith(prefix)) return false;
          const d = new Date(f + "T12:00:00").getDay();
          return d === 0 || d === 6 || estado.superFestivos.includes(f) || estado.festivosPersonalizados.includes(f);
        }).length;

      // Puntuación compuesta (menor = más prioritario)
      // Prioridad: 1) evitar doblete  2) equidad total  3) distribución días/premium
      const score = (resId: string, fecha: string): number => {
        const fd = dowOf(fecha);
        const isPremium = fd === 0 || fd === 6
          || estado.superFestivos.includes(fecha) || estado.festivosPersonalizados.includes(fecha);
        let s = guardiasLocales(resId) * 100;
        // Doblete: penalización dominante — siempre peor que cualquier otra consideración
        if (dobletOn(asigs, resId, fecha)) s += 800;
        // Distribución días de la semana y premium (peso secundario)
        s += countDow(resId, fd) * 30;
        if (fd === 4) s += countDow(resId, 4) * 30;  // jueves: peso total 60
        if (fd === 5) s += countDow(resId, 5) * 30;  // viernes: peso total 60
        if (isPremium) s += countPremium(resId) * 40;
        return s;
      };

      let sinCandidatos = 0;
      for (let dia = 1; dia <= total; dia++) {
        const fecha = fechaStr(anio, mes, dia);
        if (asigs[fecha]) continue;

        const candidatos = ordenResidentes.filter(
          r => !hardConflict(r.id, fecha) && guardiasLocales(r.id) < r.guardiasmes
        );
        if (candidatos.length === 0) { sinCandidatos++; continue; }

        // Ordenar por puntuación compuesta; desempate aleatorio entre los igualados
        candidatos.sort((a, b) => score(a.id, fecha) - score(b.id, fecha));
        const minScore = score(candidatos[0].id, fecha);
        const empatados = candidatos.filter(r => score(r.id, fecha) === minScore);
        asigs[fecha] = empatados[Math.floor(Math.random() * empatados.length)].id;
      }
      return { asigs, sinCandidatos };
    };

    // Helper de conflicto parametrizado en un objeto asigs externo (para reparación)
    const hardConflictOn = (a: Asignacion, resId: string, fecha: string): boolean => {
      if (a[add(fecha, -1)] === resId) return true;
      if (dowOf(add(fecha, -2)) === 6 && a[add(fecha, -2)] === resId) return true;
      if (a[add(fecha, 1)] === resId) return true;
      if (dowOf(fecha) === 6 && a[add(fecha, 2)] === resId) return true;
      if (esBloqueado(resId, fecha)) return true;
      const res = estado.residentes.find(r => r.id === resId);
      const minDias = res?.restriccion?.espaciadoMinDias;
      if (minDias && minDias > 1) {
        const centro = new Date(fecha + "T12:00:00");
        for (let o = -(minDias - 1); o <= (minDias - 1); o++) {
          if (o === 0) continue;
          const d = new Date(centro); d.setDate(d.getDate() + o);
          if (a[d.toISOString().slice(0, 10)] === resId) return true;
        }
      }
      return false;
    };
    const glOn = (a: Asignacion, resId: string) =>
      Object.entries(a).filter(([f, r]) => f.startsWith(prefix) && r === resId).length;
    const dobletOn = (a: Asignacion, resId: string, fecha: string): boolean => {
      const res = estado.residentes.find(r => r.id === resId);
      if (res?.restriccion?.aceptaDobletes) return false;
      const mk2 = (n: number) => { const d = new Date(fecha + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
      return a[mk2(-2)] === resId || a[mk2(2)] === resId;
    };
    const candsOn = (a: Asignacion, fecha: string) =>
      estado.residentes.filter(r => !hardConflictOn(a, r.id, fecha) && glOn(a, r.id) < r.guardiasmes);

    // Fase de reparación: para cada día sin cubrir, busca en TODO el mes un día M
    // donde el residente actual (Y) puede hacer D si le cedemos M a alguien con hueco (X).
    const reparar = (baseAsigs: Asignacion): Asignacion => {
      const rep = { ...baseAsigs };

      for (let dia = 1; dia <= total; dia++) {
        const fecha = fechaStr(anio, mes, dia); // día D sin cubrir
        if (rep[fecha]) continue;
        if (candsOn(rep, fecha).length > 0) continue;

        // Residentes con guardias de menos este mes (los X candidatos a recibir el día M)
        const conHueco = estado.residentes
          .filter(r => glOn(rep, r.id) < r.guardiasmes)
          .sort((a, b) => glOn(rep, a.id) - glOn(rep, b.id));

        // Dos pasadas: primero sin crear dobletes, luego permitiéndolos si no hay opción
        let fixed = false;
        for (let permitirDoblete = 0; permitirDoblete <= 1 && !fixed; permitirDoblete++) {
          for (let mDia = 1; mDia <= total && !fixed; mDia++) {
            const mFecha = fechaStr(anio, mes, mDia);
            const yId = rep[mFecha];
            if (!yId || mFecha === fecha) continue;

            const trial = { ...rep, [mFecha]: null };

            // ¿Y puede hacer D (sin conflicto duro)?
            if (hardConflictOn(trial, yId, fecha)) continue;
            // En primera pasada, rechazar si crea doblete
            if (!permitirDoblete && dobletOn(trial, yId, fecha)) continue;
            // Y quedaría bajo cuota al ceder M
            if (glOn(trial, yId) >= estado.residentes.find(r => r.id === yId)!.guardiasmes) continue;

            // ¿Algún X con hueco puede hacer M sin conflicto duro?
            const xCands = conHueco.filter(x =>
              x.id !== yId &&
              !hardConflictOn(trial, x.id, mFecha) &&
              (permitirDoblete || !dobletOn(trial, x.id, mFecha))
            );
            if (xCands.length === 0) continue;

            rep[mFecha] = xCands[0].id;
            rep[fecha] = yId;
            fixed = true;
          }
        }
      }
      return rep;
    };

    // Intenta resolver dobletes en fin de semana intercambiando Sáb↔Dom
    const fixWeekendDobletes = (baseAsigs: Asignacion): Asignacion => {
      const rep = { ...baseAsigs };
      const hasDob = (a: Asignacion, resId: string, fecha: string): boolean => {
        const res = estado.residentes.find(r => r.id === resId);
        if (res?.restriccion?.aceptaDobletes) return false;
        const off = (n: number) => add(fecha, n);
        if (a[off(-2)] === resId && !esPuenteContext(off(-2), off(-1), fecha)) return true;
        if (a[off(2)] === resId && !esPuenteContext(fecha, off(1), off(2))) return true;
        return false;
      };
      for (let dia = 1; dia <= total; dia++) {
        const satFecha = fechaStr(anio, mes, dia);
        if (dowOf(satFecha) !== 6) continue;
        const sunFecha = add(satFecha, 1);
        const satId = rep[satFecha];
        const sunId = rep[sunFecha];
        if (!satId || !sunId || satId === sunId) continue;

        const dobsAntes =
          (hasDob(rep, satId, satFecha) ? 1 : 0) +
          (hasDob(rep, sunId, sunFecha) ? 1 : 0);
        if (dobsAntes === 0) continue;

        // Probar swap Sáb↔Dom
        const trial = { ...rep, [satFecha]: sunId, [sunFecha]: satId };
        if (hardConflictOn(trial, sunId, satFecha)) continue;
        if (hardConflictOn(trial, satId, sunFecha)) continue;

        const dobsDespues =
          (hasDob(trial, sunId, satFecha) ? 1 : 0) +
          (hasDob(trial, satId, sunFecha) ? 1 : 0);

        if (dobsDespues < dobsAntes) {
          rep[satFecha] = sunId;
          rep[sunFecha] = satId;
        }
      }
      return rep;
    };

    // Ejecutar hasta 40 intentos con orden aleatorio; quedarse con el mejor
    const MAX_INTENTOS = 40;
    let mejor = { asigs: { ...estado.asignaciones }, sinCandidatos: Infinity };

    for (let i = 0; i < MAX_INTENTOS; i++) {
      const orden = [...estado.residentes].sort(() => Math.random() - 0.5);
      const resultado = intentoGreedy(orden);
      if (resultado.sinCandidatos < mejor.sinCandidatos) mejor = resultado;
      if (mejor.sinCandidatos === 0) break;
    }

    // Si quedan días sin cubrir, aplicar fase de reparación
    if (mejor.sinCandidatos > 0) {
      const reparado = reparar(mejor.asigs);
      const sinTrasReparar = Array.from({ length: total }, (_, i) => fechaStr(anio, mes, i + 1))
        .filter(f => !reparado[f]).length;
      if (sinTrasReparar < mejor.sinCandidatos) {
        mejor = { asigs: reparado, sinCandidatos: sinTrasReparar };
      }
    }

    // Fase final: intentar resolver dobletes en fin de semana con swap Sáb↔Dom
    mejor.asigs = fixWeekendDobletes(mejor.asigs);

    guardarHistorial();
    setEstado(s => ({ ...s, asignaciones: mejor.asigs }));

    if (mejor.sinCandidatos > 0) {
      alert(`Autocompletado: ${mejor.sinCandidatos} día(s) sin candidatos incluso tras reparación — asígnalos manualmente.`);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">psiqui.tools</span>
          </Link>
          <span className="text-sm font-semibold text-slate-700">Organizador de Guardias</span>
        </div>
      </div>
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-sm">
          {[
            { id: "config", label: "Configuración", icon: Settings },
            { id: "mes", label: "Calendario", icon: Calendar },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id as typeof tab)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === id ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {tab === "mes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <button onClick={() => setMesActual((m) => { const d = new Date(m.anio, m.mes - 1, 1); return { anio: d.getFullYear(), mes: d.getMonth() }; })}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <span className="font-semibold text-slate-800 min-w-[160px] text-center">{MESES[mesActual.mes]} {mesActual.anio}</span>
                <button onClick={() => setMesActual((m) => { const d = new Date(m.anio, m.mes + 1, 1); return { anio: d.getFullYear(), mes: d.getMonth() }; })}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={deshacer} disabled={historial.length === 0}
                  title="Deshacer último cambio"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <Undo2 className="w-4 h-4" />
                  {historial.length > 0 && <span className="text-[11px] text-slate-400">{historial.length}</span>}
                </button>
                <button onClick={autocompletar} disabled={estado.residentes.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <Wand2 className="w-4 h-4" />Autocompletar
                </button>
                <button onClick={exportarImagen}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
                  <Download className="w-4 h-4" />Exportar imagen
                </button>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-medium text-slate-700">Asignar guardia a:</span>
                <button onClick={() => setModoBloqueo((v) => !v)}
                  className={`ml-auto text-xs px-3 py-1 rounded-full border transition-all ${
                    modoBloqueo ? "bg-red-100 border-red-300 text-red-700 font-medium" : "border-slate-200 text-slate-500 hover:border-slate-400"}`}>
                  {modoBloqueo ? "✗ Modo bloqueo activo" : "Marcar bloqueos"}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setResidenteSeleccionado(null); setModoBloqueo(false); }}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    !residenteSeleccionado ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-500 hover:border-slate-400"}`}>
                  Ninguno
                </button>
                {[...estado.residentes].sort((a, b) => b.anio - a.anio).map((r) => {
                  const n = guardiasEnMes(r.id, mesActual.anio, mesActual.mes);
                  const activo = residenteSeleccionado === r.id;
                  const completo = n >= r.guardiasmes;
                  return (
                    <button key={r.id} onClick={() => setResidenteSeleccionado(activo ? null : r.id)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-all flex items-center gap-1.5 ${
                        activo ? "text-white border-transparent shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"}`}
                      style={activo ? { backgroundColor: colorResidente(r.id), borderColor: colorResidente(r.id) } : {}}>
                      <span>R{r.anio} {r.nombre.split(" ")[0] || "—"}</span>
                      <span className={`${activo ? "opacity-70 text-white" : completo ? "text-green-600 font-semibold" : "text-slate-400"}`}>
                        {n}/{r.guardiasmes}
                      </span>
                      {completo && <span className={activo ? "opacity-70" : "text-green-500"}>✓</span>}
                    </button>
                  );
                })}
              </div>
              {modoBloqueo && residenteSeleccionado && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  Modo bloqueo: clic en un día para marcarlo como no disponible para {estado.residentes.find(r => r.id === residenteSeleccionado)?.nombre}
                </div>
              )}
            </div>
            {estado.residentes.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-sm">
                <Settings className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Añade los residentes en la pestaña <strong>Configuración</strong> para empezar</p>
              </div>
            ) : renderCalendario()}
          </div>
        )}

        {tab === "config" && renderConfig()}

        <div className="flex items-center gap-2 text-xs text-slate-400 pb-4">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Los datos se guardan en este navegador. No se transmite ninguna información.</span>
        </div>
      </div>

      {/* ── Modal: candidatos para un día ── */}
      {diaVisualizando && (() => {
        const fecha = diaVisualizando;
        const d = new Date(fecha + "T12:00:00");
        const etiquetaDia = d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
        const isSuperFestivo = estado.superFestivos.includes(fecha);
        const isFestivo = estado.festivosPersonalizados.includes(fecha);
        const resAsignadoId = estado.asignaciones[fecha] ?? null;
        const resAsignado = estado.residentes.find(r => r.id === resAsignadoId);

        type EstadoCandidato = "disponible" | "cuota-completa" | "doblete" | "espaciado" | "post-guardia" | "bloqueado";
        type Candidato = {
          res: Residente;
          estado: EstadoCandidato;
          n: number;
          razon?: string;
        };

        const candidatos: Candidato[] = estado.residentes.map((res): Candidato => {
          const n = guardiasEnMes(res.id, mesActual.anio, mesActual.mes);
          if (esPostGuardiaDelResidente(res.id, fecha))
            return { res, estado: "post-guardia", n, razon: "Guardia el día anterior" };
          if (creaGuardiaConsecutiva(res.id, fecha))
            return { res, estado: "post-guardia", n, razon: "Guardia el día siguiente" };
          if (esBloqueado(res.id, fecha))
            return { res, estado: "bloqueado", n, razon: "Día bloqueado" };
          const esp = violaEspaciado(res.id, fecha);
          if (esp)
            return { res, estado: "espaciado", n, razon: esp };
          const dob = violaDoblete(res.id, fecha);
          if (dob)
            return { res, estado: "doblete", n, razon: dob };
          if (n >= res.guardiasmes)
            return { res, estado: "cuota-completa", n };
          return { res, estado: "disponible", n };
        });

        const orden: Record<EstadoCandidato, number> = {
          disponible: 0, "cuota-completa": 1, doblete: 2, espaciado: 3, "post-guardia": 4, bloqueado: 5,
        };
        const sorted = [...candidatos].sort((a, b) => {
          if (orden[a.estado] !== orden[b.estado]) return orden[a.estado] - orden[b.estado];
          return a.n - b.n; // dentro del mismo estado, menos guardias primero
        });

        const asignarDesdeModal = (resId: string) => {
          const conflicto = conflictoAsignacion(resId, fecha);
          if (conflicto && !confirm(`⚠️ ${conflicto}. ¿Asignar igualmente?`)) return;
          guardarHistorial();
          setEstado(s => ({ ...s, asignaciones: { ...s.asignaciones, [fecha]: resId } }));
          setDiaVisualizando(null);
        };

        const desasignar = () => {
          guardarHistorial();
          setEstado(s => ({ ...s, asignaciones: { ...s.asignaciones, [fecha]: null } }));
          setDiaVisualizando(null);
        };

        const badgeEstado = (c: Candidato) => {
          if (c.res.id === resAsignadoId)
            return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Asignado</span>;
          if (c.estado === "disponible")
            return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Disponible</span>;
          if (c.estado === "cuota-completa")
            return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Cuota completa</span>;
          if (c.estado === "doblete")
            return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Doblete</span>;
          if (c.estado === "espaciado")
            return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">Espaciado</span>;
          if (c.estado === "post-guardia")
            return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Post-guardia</span>;
          return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Bloqueado</span>;
        };

        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0"
            onClick={() => setDiaVisualizando(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="px-5 pt-5 pb-4 border-b border-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-slate-900 capitalize">{etiquetaDia}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      {isSuperFestivo && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">★ Superfestivo</span>}
                      {isFestivo && !isSuperFestivo && <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">◆ Festivo</span>}
                      {resAsignado
                        ? <span className="text-xs text-slate-500">Asignado: <span className="font-medium text-slate-700">{resAsignado.nombre}</span></span>
                        : <span className="text-xs text-slate-400">Sin asignar</span>}
                    </div>
                  </div>
                  <button onClick={() => setDiaVisualizando(null)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Lista de candidatos */}
              <div className="px-3 py-3 max-h-[60vh] overflow-y-auto space-y-1.5">
                {sorted.map(c => {
                  const estaAsignado = c.res.id === resAsignadoId;
                  const noDisponible = c.estado === "post-guardia" || c.estado === "bloqueado" || c.estado === "espaciado";
                  const esDoblete = c.estado === "doblete";
                  return (
                    <button key={c.res.id}
                      onClick={() => estaAsignado ? desasignar() : asignarDesdeModal(c.res.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left group ${
                        estaAsignado
                          ? "border-blue-200 bg-blue-50 hover:bg-blue-100"
                          : noDisponible
                          ? "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
                          : esDoblete
                          ? "border-amber-200 bg-amber-50 hover:border-amber-400 hover:bg-amber-100"
                          : "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50"
                      }`}>
                      {/* Color dot */}
                      <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: colorResidente(c.res.id) }} />
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-slate-800 block truncate">
                          {c.res.nombre || "Sin nombre"}
                        </span>
                        <span className="text-xs text-slate-500">
                          R{c.res.anio} · {c.n}/{c.res.guardiasmes} guardias
                          {c.razon && <> · <span className="text-red-500">{c.razon}</span></>}
                        </span>
                      </div>
                      {/* Badge estado */}
                      <div className="shrink-0">{badgeEstado(c)}</div>
                    </button>
                  );
                })}
              </div>

              <div className="px-4 py-3 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-400">Toca para asignar · Los marcados en ámbar (doblete) piden confirmación · Toca al asignado para quitarlo</p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

"use client";

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Plus, FileDown, Shield, Trash2, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';

// ─── Types ─────────────────────────────────────────────────────────────────────

type EpisodeType   = 'mania' | 'hipomania' | 'depresion' | 'mixto';
type Severity      = 'leve' | 'moderada' | 'grave';
type TreatmentType =
  | 'psicoterapia' | 'antidepresivos' | 'litio'
  | 'antipsicóticos' | 'carbamazepina' | 'otro';

type Compliance = 'si' | 'no' | 'erratico' | 'dudoso';

interface MoodEpisode {
  id: string;
  type: EpisodeType;
  startDate: string;
  endDate: string;
  severity: Severity;
  hospitalized: boolean;
  notes?: string;
}

interface TreatmentPeriod {
  id: string;
  type: TreatmentType;
  customName?: string;
  specificDrugs?: string;
  compliance?: Compliance;
  startDate: string;
  endDate: string | null;
}

interface LifeEvent {
  id: string;
  date: string;
  description: string;
}

// ─── Chart layout constants ─────────────────────────────────────────────────────

const LP = 112;
const RP = 28;
const UW = 70;
const YH = 22;
const AH = 18;
const TH = 17;
const SH = 21;
const EH = 30;

function computeY(numTx: number) {
  const yearTop  = 8;
  const ageTop   = yearTop + YH;
  const treatTop = ageTop  + AH;
  const treatBot = treatTop + numTx * TH;
  const maniaTop = treatBot + 6;
  const baseline = maniaTop + 3 * SH;
  const deprBot  = baseline + 3 * SH;
  const evTop    = deprBot  + 6;
  const evBot    = evTop    + EH;
  const totalH   = evBot    + 22;
  return { yearTop, ageTop, treatTop, treatBot, maniaTop, baseline, deprBot, evTop, evBot, totalH };
}

// ─── Treatment config ──────────────────────────────────────────────────────────

const TDEFS: Record<TreatmentType, { label: string; style: string }> = {
  psicoterapia:     { label: 'Psicoterapia',   style: 'wavy'    },
  antidepresivos:   { label: 'Antidepresivos', style: 'solid'   },
  litio:            { label: 'Litio',           style: 'dashed'  },
  'antipsicóticos': { label: 'Antipsicóticos',  style: 'dotted'  },
  carbamazepina:    { label: 'Carbamazepina',   style: 'dashdot' },
  otro:             { label: 'Otro',            style: 'thin'    },
};

const TORDER: TreatmentType[] = [
  'psicoterapia', 'antidepresivos', 'litio', 'antipsicóticos', 'carbamazepina', 'otro',
];

// ─── Utilities ──────────────────────────────────────────────────────────────────

function ym2dec(ym: string): number {
  const [y, m] = ym.split('-').map(Number);
  return y + (m - 0.5) / 12;
}

function wavyPath(x1: number, x2: number, cy: number, amp = 3, wl = 10): string {
  if (x2 <= x1 + 1) return `M${x1},${cy} L${x2},${cy}`;
  const steps = Math.max(4, Math.round((x2 - x1) * 4 / wl));
  let d = `M${x1.toFixed(1)},${cy}`;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = x1 + t * (x2 - x1);
    const y = cy + amp * Math.sin(t * (x2 - x1) / wl * 2 * Math.PI);
    d += ` L${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return d;
}

function treatLine(type: TreatmentType, x1: number, x2: number, cy: number, key: string) {
  if (x2 <= x1) return null;
  const s = '#1e293b';
  switch (TDEFS[type].style) {
    case 'wavy':
      return <path key={key} d={wavyPath(x1, x2, cy)} fill="none" strokeWidth="1.8" stroke={s} />;
    case 'solid':
      return <line key={key} x1={x1} y1={cy} x2={x2} y2={cy} strokeWidth="4" stroke={s} />;
    case 'dashed':
      return <line key={key} x1={x1} y1={cy} x2={x2} y2={cy} strokeWidth="2" strokeDasharray="7 4" stroke={s} />;
    case 'dotted':
      return <line key={key} x1={x1} y1={cy} x2={x2} y2={cy} strokeWidth="3" strokeDasharray="1.5 5" strokeLinecap="round" stroke={s} />;
    case 'dashdot':
      return <line key={key} x1={x1} y1={cy} x2={x2} y2={cy} strokeWidth="2" strokeDasharray="9 3 2 3" stroke={s} />;
    default:
      return <line key={key} x1={x1} y1={cy} x2={x2} y2={cy} strokeWidth="1.2" strokeDasharray="4 3" stroke={s} />;
  }
}

// ─── Sample data (basado en Kaplan & Sadock Fig. 6-1) ──────────────────────────

const SAMPLE_EPISODES: MoodEpisode[] = [
  { id: 's1', type: 'depresion', startDate: '1974-04', endDate: '1974-10', severity: 'moderada', hospitalized: false, notes: 'Inicio de la depresión tras la muerte del padre' },
  { id: 's2', type: 'mania',     startDate: '1975-07', endDate: '1976-02', severity: 'grave',    hospitalized: true,  notes: 'Cambio rápido de ciclo inducido por antidepresivos' },
  { id: 's3', type: 'depresion', startDate: '1976-05', endDate: '1977-01', severity: 'leve',     hospitalized: false },
  { id: 's4', type: 'depresion', startDate: '1977-04', endDate: '1977-10', severity: 'leve',     hospitalized: false },
  { id: 's5', type: 'depresion', startDate: '1977-11', endDate: '1978-04', severity: 'leve',     hospitalized: false },
  { id: 's6', type: 'depresion', startDate: '1978-07', endDate: '1978-12', severity: 'leve',     hospitalized: false },
  { id: 's7', type: 'mania',     startDate: '1979-03', endDate: '1979-09', severity: 'moderada', hospitalized: false, notes: 'Inicio del episodio en el 1er aniversario de la muerte del padre' },
  { id: 's8', type: 'mania',     startDate: '1980-02', endDate: '1980-07', severity: 'grave',    hospitalized: true,  notes: 'Manía subsecuente a la interrupción del litio' },
  { id: 's9', type: 'depresion', startDate: '1981-04', endDate: '1982-01', severity: 'moderada', hospitalized: false, notes: 'Tratamiento de la depresión con carbamazepina' },
];

const SAMPLE_TREATMENTS: TreatmentPeriod[] = [
  { id: 'st1', type: 'psicoterapia',   startDate: '1974-02', endDate: '1976-07' },
  { id: 'st2', type: 'psicoterapia',   startDate: '1978-02', endDate: '1978-11' },
  { id: 'st3', type: 'antidepresivos',  startDate: '1974-04', endDate: '1975-06' },
  { id: 'st4', type: 'litio',          startDate: '1975-09', endDate: null },
  { id: 'st5', type: 'antipsicóticos', startDate: '1975-08', endDate: '1976-05' },
  { id: 'st6', type: 'antipsicóticos', startDate: '1979-03', endDate: null },
  { id: 'st7', type: 'carbamazepina',  startDate: '1981-02', endDate: null },
];

const SAMPLE_EVENTS: LifeEvent[] = [
  { id: 'se1', date: '1974-01', description: '20 de enero: Fallecimiento del padre' },
  { id: 'se2', date: '1975-05', description: 'Intento de suicidio' },
  { id: 'se3', date: '1977-07', description: 'Resolución de la distimia en psicoterapia' },
  { id: 'se4', date: '1979-03', description: 'Inicio del episodio en el primer aniversario de la muerte del padre' },
  { id: 'se5', date: '1980-02', description: 'Manía subsecuente a la interrupción del litio' },
];

// ─── Shared input classes ───────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 ' +
  'placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200';

const selectCls =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 ' +
  'focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200';

// ─── Main component ─────────────────────────────────────────────────────────────

export default function GraficoVidaPsiquiatricaPage() {
  const svgRef = useRef<SVGSVGElement>(null);

  const [episodes,   setEpisodes]   = useState<MoodEpisode[]>(SAMPLE_EPISODES);
  const [treatments, setTreatments] = useState<TreatmentPeriod[]>(SAMPLE_TREATMENTS);
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>(SAMPLE_EVENTS);
  const [birthYear,  setBirthYear]  = useState(1939);

  const [isOpen,    setIsOpen]    = useState(false);
  const [activeTab, setActiveTab] = useState<'episodio' | 'tratamiento' | 'evento'>('episodio');

  const [epForm, setEpForm] = useState({
    type: 'depresion' as EpisodeType,
    startDate: '', endDate: '',
    severity: 'moderada' as Severity,
    hospitalized: false,
    notes: '',
  });
  const [txForm, setTxForm] = useState({
    type: 'litio' as TreatmentType,
    customName: '',
    specificDrugs: '',
    compliance: '' as '' | Compliance,
    startDate: '', endDate: '',
    ongoing: false,
  });
  const [evForm, setEvForm] = useState({ date: '', description: '' });

  // ── Chart dimensions ──────────────────────────────────────────────────────────

  const { startYear, endYear } = useMemo(() => {
    const all: number[] = [];
    episodes.forEach(e => {
      all.push(Math.floor(ym2dec(e.startDate)));
      all.push(Math.floor(ym2dec(e.endDate)));
    });
    treatments.forEach(t => {
      all.push(Math.floor(ym2dec(t.startDate)));
      if (t.endDate) all.push(Math.floor(ym2dec(t.endDate)));
    });
    lifeEvents.forEach(e => all.push(Math.floor(ym2dec(e.date))));
    if (!all.length) {
      const cy = new Date().getFullYear();
      return { startYear: cy - 5, endYear: cy + 2 };
    }
    return { startYear: Math.min(...all) - 1, endYear: Math.max(...all) + 2 };
  }, [episodes, treatments, lifeEvents]);

  const activeTxTypes = useMemo(
    () => TORDER.filter(t => treatments.some(tx => tx.type === t)),
    [treatments]
  );
  const numTxRows  = Math.max(1, activeTxTypes.length);
  const Y          = useMemo(() => computeY(numTxRows), [numTxRows]);
  const totalYears = endYear - startYear;
  const svgW       = LP + totalYears * UW + RP;

  const years = useMemo(
    () => Array.from({ length: totalYears }, (_, i) => startYear + i),
    [startYear, totalYears]
  );

  const dateToX = useCallback(
    (ym: string) => LP + (ym2dec(ym) - startYear) * UW,
    [startYear]
  );

  const sortedEvents = useMemo(
    () => [...lifeEvents].sort((a, b) => a.date.localeCompare(b.date)),
    [lifeEvents]
  );

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const addEpisode = () => {
    if (!epForm.startDate || !epForm.endDate) return;
    setEpisodes(p => [...p, { id: crypto.randomUUID(), ...epForm }]);
    setEpForm({ type: 'depresion', startDate: '', endDate: '', severity: 'moderada', hospitalized: false, notes: '' });
    setIsOpen(false);
  };

  const addTreatment = () => {
    if (!txForm.startDate) return;
    setTreatments(p => [...p, {
      id: crypto.randomUUID(),
      type: txForm.type,
      customName: txForm.customName || undefined,
      specificDrugs: txForm.specificDrugs || undefined,
      compliance: txForm.compliance || undefined,
      startDate: txForm.startDate,
      endDate: txForm.ongoing ? null : (txForm.endDate || null),
    }]);
    setTxForm({ type: 'litio', customName: '', specificDrugs: '', compliance: '', startDate: '', endDate: '', ongoing: false });
    setIsOpen(false);
  };

  const addEvent = () => {
    if (!evForm.date || !evForm.description) return;
    setLifeEvents(p => [...p, { id: crypto.randomUUID(), ...evForm }]);
    setEvForm({ date: '', description: '' });
    setIsOpen(false);
  };

  const clearAll = () => {
    if (confirm('¿Eliminar todos los datos del gráfico?')) {
      setEpisodes([]);
      setTreatments([]);
      setLifeEvents([]);
    }
  };

  // ── PDF export ────────────────────────────────────────────────────────────────

  const exportPDF = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const img  = new window.Image();
    img.onload = () => {
      const scale  = 2;
      const vb     = svg.viewBox.baseVal;
      const canvas = document.createElement('canvas');
      canvas.width  = vb.width  * scale;
      canvas.height = vb.height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const imgData = canvas.toDataURL('image/png');
      const ratio   = vb.height / vb.width;
      const pdf     = new jsPDF('l', 'mm', 'a4');
      const pW = 287, pH = 200;
      let dW = pW - 20, dH = dW * ratio;
      if (dH > pH - 30) { dH = pH - 30; dW = dH / ratio; }

      pdf.setFontSize(13); pdf.setTextColor(30, 41, 59); pdf.setFont('helvetica', 'bold');
      pdf.text('Gráfico de Vida Psiquiátrica', 10, 10);
      pdf.setFontSize(7); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(120);
      pdf.text(`Generado: ${new Date().toLocaleDateString('es-MX')} — psiqui.tools`, 10, 15);
      pdf.addImage(imgData, 'PNG', 10, 18, dW, dH);

      let y = 18 + dH + 7;
      if (sortedEvents.length) {
        pdf.setFontSize(8); pdf.setTextColor(30, 41, 59); pdf.setFont('helvetica', 'bold');
        pdf.text('Acontecimientos vitales:', 10, y); y += 5;
        pdf.setFont('helvetica', 'normal');
        sortedEvents.forEach((ev, i) => {
          const lbl = String.fromCharCode(97 + i);
          pdf.text(`${lbl}. ${ev.date}: ${ev.description}`, 12, y);
          y += 4.5;
        });
      }
      pdf.setFontSize(6.5); pdf.setTextColor(160);
      pdf.text('Herramienta de uso exclusivo para profesionales sanitarios. No contiene datos personales identificativos.', 10, pH - 2);
      window.open(pdf.output('bloburl'), '_blank');
    };
    img.src = url;
  };

  // ─── SVG chart ─────────────────────────────────────────────────────────────────

  const chart = (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${svgW} ${Y.totalH}`}
      width={svgW}
      height={Y.totalH}
      style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", display: 'block' }}
    >
      <defs>
        <pattern id="lc-hatch" patternUnits="userSpaceOnUse" width="6" height="6">
          <line x1="0" y1="6" x2="6" y2="0" stroke="#475569" strokeWidth="1.5" />
        </pattern>
      </defs>

      <rect x="0" y="0" width={svgW} height={Y.totalH} fill="white" />
      <rect x={LP} y={Y.treatTop} width={totalYears * UW} height={numTxRows * TH} fill="#f8fafc" />
      <rect x={LP} y={Y.maniaTop} width={totalYears * UW} height={3 * SH}         fill="#f9fafb" />
      <rect x={LP} y={Y.baseline} width={totalYears * UW} height={3 * SH}         fill="#f9fafb" />
      <rect x={LP} y={Y.evTop}    width={totalYears * UW} height={EH}             fill="#f8fafc" />

      {years.map(yr => {
        const x = LP + (yr - startYear) * UW;
        return <line key={`g${yr}`} x1={x} y1={Y.yearTop} x2={x} y2={Y.evBot} stroke="#e2e8f0" strokeWidth="0.5" />;
      })}

      {years.map(yr => (
        <text key={`yr${yr}`} x={LP + (yr - startYear + 0.5) * UW} y={Y.yearTop + 15}
          textAnchor="middle" fontSize="10" fontWeight="600" fill="#334155">{yr}</text>
      ))}
      {years.map(yr => (
        <text key={`ag${yr}`} x={LP + (yr - startYear + 0.5) * UW} y={Y.ageTop + 13}
          textAnchor="middle" fontSize="8.5" fill="#64748b">{yr - birthYear}</text>
      ))}

      <text x={LP - 5} y={Y.yearTop + 15} textAnchor="end" fontSize="9" fontWeight="600" fill="#334155">Año</text>
      <text x={LP - 5} y={Y.ageTop  + 13} textAnchor="end" fontSize="9"                 fill="#64748b">Edad</text>

      {/* Tratamientos */}
      <text transform={`translate(7, ${Y.treatTop + numTxRows * TH / 2}) rotate(-90)`}
        textAnchor="middle" fontSize="8" fontWeight="600" fill="#334155">Tratamientos</text>

      {activeTxTypes.map((tType, rowIdx) => {
        const rowY    = Y.treatTop + rowIdx * TH;
        const centerY = rowY + TH / 2;
        const periods = treatments.filter(t => t.type === tType);
        return (
          <React.Fragment key={tType}>
            {rowIdx > 0 && (
              <line x1={LP} y1={rowY} x2={LP + totalYears * UW} y2={rowY} stroke="#e2e8f0" strokeWidth="0.5" />
            )}
            <text x={LP - 5} y={centerY + 3.5} textAnchor="end" fontSize="7.5" fill="#475569">
              {TDEFS[tType].label}
            </text>
            {periods.map(p => {
              const x1 = dateToX(p.startDate);
              const x2 = p.endDate
                ? Math.min(dateToX(p.endDate), LP + totalYears * UW - 2)
                : LP + totalYears * UW - 2;
              return treatLine(tType, x1, x2, centerY, `tx-${p.id}`);
            })}
          </React.Fragment>
        );
      })}

      {activeTxTypes.length === 0 && (
        <text x={LP + 8} y={Y.treatTop + TH / 2 + 4} fontSize="8.5" fill="#94a3b8">
          Sin tratamientos registrados
        </text>
      )}
      <rect x={LP} y={Y.treatTop} width={totalYears * UW} height={numTxRows * TH} fill="none" stroke="#cbd5e1" strokeWidth="0.8" />

      {/* Manía */}
      <text transform={`translate(7, ${Y.maniaTop + 3 * SH / 2}) rotate(-90)`}
        textAnchor="middle" fontSize="8" fontWeight="600" fill="#334155">Manía</text>
      <text x={LP - 5} y={Y.maniaTop + SH * 0.5 + 3.5} textAnchor="end" fontSize="7.5" fill="#64748b">Grave</text>
      <text x={LP - 5} y={Y.maniaTop + SH * 1.5 + 3.5} textAnchor="end" fontSize="7.5" fill="#64748b">Moder.</text>
      <text x={LP - 5} y={Y.maniaTop + SH * 2.5 + 3.5} textAnchor="end" fontSize="7.5" fill="#64748b">Leve</text>
      <line x1={LP} y1={Y.maniaTop + SH}     x2={LP + totalYears * UW} y2={Y.maniaTop + SH}     stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3 3" />
      <line x1={LP} y1={Y.maniaTop + 2 * SH} x2={LP + totalYears * UW} y2={Y.maniaTop + 2 * SH} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3 3" />

      {episodes
        .filter(e => e.type === 'mania' || e.type === 'hipomania' || e.type === 'mixto')
        .map(ep => {
          const x1 = dateToX(ep.startDate);
          const x2 = dateToX(ep.endDate);
          if (x2 <= x1 + 0.5) return null;
          const offsets: Record<Severity, number> = { grave: 0, moderada: SH, leve: 2 * SH };
          const barTop = Y.maniaTop + offsets[ep.severity];
          return (
            <rect key={ep.id} x={x1} y={barTop} width={x2 - x1} height={Y.baseline - barTop}
              fill={ep.hospitalized ? 'url(#lc-hatch)' : '#94a3b8'}
              stroke="#475569" strokeWidth="0.8" opacity={0.88} />
          );
        })}
      <rect x={LP} y={Y.maniaTop} width={totalYears * UW} height={3 * SH} fill="none" stroke="#cbd5e1" strokeWidth="0.8" />

      {/* Eutimia baseline */}
      <line x1={LP} y1={Y.baseline} x2={LP + totalYears * UW} y2={Y.baseline} stroke="#1e293b" strokeWidth="1.8" />

      {/* Depresión */}
      <text transform={`translate(7, ${Y.baseline + 3 * SH / 2}) rotate(-90)`}
        textAnchor="middle" fontSize="8" fontWeight="600" fill="#334155">Depresión</text>
      <text x={LP - 5} y={Y.baseline + SH * 0.5 + 3.5} textAnchor="end" fontSize="7.5" fill="#64748b">Leve</text>
      <text x={LP - 5} y={Y.baseline + SH * 1.5 + 3.5} textAnchor="end" fontSize="7.5" fill="#64748b">Moder.</text>
      <text x={LP - 5} y={Y.baseline + SH * 2.5 + 3.5} textAnchor="end" fontSize="7.5" fill="#64748b">Grave</text>
      <line x1={LP} y1={Y.baseline + SH}     x2={LP + totalYears * UW} y2={Y.baseline + SH}     stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3 3" />
      <line x1={LP} y1={Y.baseline + 2 * SH} x2={LP + totalYears * UW} y2={Y.baseline + 2 * SH} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3 3" />

      {episodes.filter(e => e.type === 'depresion').map(ep => {
        const x1 = dateToX(ep.startDate);
        const x2 = dateToX(ep.endDate);
        if (x2 <= x1 + 0.5) return null;
        const heights: Record<Severity, number> = { leve: SH, moderada: 2 * SH, grave: 3 * SH };
        return (
          <rect key={ep.id} x={x1} y={Y.baseline} width={x2 - x1} height={heights[ep.severity]}
            fill={ep.hospitalized ? 'url(#lc-hatch)' : '#94a3b8'}
            stroke="#475569" strokeWidth="0.8" opacity={0.88} />
        );
      })}
      <rect x={LP} y={Y.baseline} width={totalYears * UW} height={3 * SH} fill="none" stroke="#cbd5e1" strokeWidth="0.8" />

      {/* Acontecimientos vitales */}
      <text transform={`translate(7, ${Y.evTop + EH / 2}) rotate(-90)`}
        textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#334155">Acontec.</text>
      <rect x={LP} y={Y.evTop} width={totalYears * UW} height={EH} fill="none" stroke="#cbd5e1" strokeWidth="0.8" />

      {sortedEvents.map((ev, idx) => {
        const lbl  = String.fromCharCode(97 + idx);
        const x    = dateToX(ev.date);
        const triH = 10, triW = 7;
        const topY = Y.evTop + 4;
        return (
          <g key={ev.id}>
            <polygon points={`${x},${topY} ${x - triW / 2},${topY + triH} ${x + triW / 2},${topY + triH}`} fill="#334155" />
            <text x={x} y={topY + triH + 10} textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#1e293b">{lbl}</text>
          </g>
        );
      })}

      {/* Leyenda */}
      <rect x={LP} y={Y.evBot + 6} width={11} height={8} fill="url(#lc-hatch)" stroke="#475569" strokeWidth="0.5" />
      <text x={LP + 15} y={Y.evBot + 13} fontSize="7.5" fill="#64748b">El sombreado indica hospitalización</text>
    </svg>
  );

  // ─── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Nav */}
      <div className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
            Volver a psiqui.tools
          </Link>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-6 space-y-5">

        {/* Aviso de privacidad */}
        <div className="bg-slate-800 text-white rounded-lg p-3 flex items-start gap-3">
          <Shield className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-300" />
          <p className="text-xs text-slate-300">
            Esta herramienta funciona localmente en su dispositivo. No se almacena ni transmite
            información clínica. Use identificadores anónimos y evite datos personales identificativos.
          </p>
        </div>

        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Gráfico de Vida Psiquiátrica</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Registro cronológico de episodios, tratamientos y acontecimientos vitales
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700"
            >
              <Plus className="w-4 h-4" /> Añadir
            </button>
            <button
              onClick={exportPDF}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50"
            >
              <FileDown className="w-4 h-4" /> PDF
            </button>
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-100 bg-white text-red-600 text-sm font-medium hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" /> Limpiar
            </button>
          </div>
        </div>

        {/* Gráfico */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <span className="text-sm font-semibold text-slate-700">Life Chart — Gráfico de Vida Psiquiátrica</span>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Año de nacimiento:</span>
              <input
                type="number"
                value={birthYear}
                onChange={e => setBirthYear(Number(e.target.value))}
                className="w-16 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700 text-center focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
          <div className="overflow-x-auto p-4 pb-6">{chart}</div>
        </div>

        {/* Lista de acontecimientos */}
        {sortedEvents.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Acontecimientos vitales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-6">
              {sortedEvents.map((ev, i) => (
                <div key={ev.id} className="flex items-start gap-2">
                  <span className="text-xs font-bold text-slate-600 shrink-0 mt-0.5 w-4">
                    {String.fromCharCode(97 + i)}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-slate-400">{ev.date} — </span>
                    <span className="text-xs text-slate-700">{ev.description}</span>
                  </div>
                  <button onClick={() => setLifeEvents(p => p.filter(e => e.id !== ev.id))}
                    className="text-slate-300 hover:text-red-500 shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de episodios */}
        {episodes.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Episodios registrados</h3>
            <div className="divide-y divide-slate-50">
              {[...episodes].sort((a, b) => a.startDate.localeCompare(b.startDate)).map(ep => (
                <div key={ep.id} className="flex items-center gap-3 py-1.5 text-xs">
                  <div className={`w-2 h-2 rounded-sm shrink-0 ${ep.type === 'depresion' ? 'bg-slate-400' : 'bg-slate-700'}`} />
                  <span className="text-slate-400 font-mono tabular-nums">{ep.startDate} → {ep.endDate}</span>
                  <span className="font-medium text-slate-700 capitalize">{ep.type}</span>
                  <span className="text-slate-400">({ep.severity})</span>
                  {ep.hospitalized && <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Hosp.</span>}
                  {ep.notes && <span className="text-slate-400 truncate max-w-xs">{ep.notes}</span>}
                  <button className="ml-auto text-slate-300 hover:text-red-500 shrink-0"
                    onClick={() => setEpisodes(p => p.filter(e => e.id !== ep.id))}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de tratamientos */}
        {treatments.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Tratamientos registrados</h3>
            <div className="divide-y divide-slate-50">
              {[...treatments].sort((a, b) => a.startDate.localeCompare(b.startDate)).map(tx => {
                const complianceLabel: Record<Compliance, string> = { si: 'Sí', no: 'No', erratico: 'Errático', dudoso: 'Dudoso' };
                const complianceCls: Record<Compliance, string> = {
                  si:       'bg-emerald-50 text-emerald-700',
                  no:       'bg-red-50 text-red-700',
                  erratico: 'bg-amber-50 text-amber-700',
                  dudoso:   'bg-slate-100 text-slate-600',
                };
                return (
                  <div key={tx.id} className="flex flex-wrap items-center gap-2 py-1.5 text-xs border-b border-slate-50 last:border-0">
                    <div className="w-2 h-2 rounded-sm shrink-0 bg-slate-500" />
                    <span className="font-medium text-slate-700">{TDEFS[tx.type].label}</span>
                    {tx.customName && <span className="text-slate-500">({tx.customName})</span>}
                    {tx.specificDrugs && <span className="text-slate-500 italic">{tx.specificDrugs}</span>}
                    <span className="text-slate-400 font-mono tabular-nums">
                      {tx.startDate} → {tx.endDate ?? 'actual'}
                    </span>
                    {tx.compliance && (
                      <span className={`px-1.5 py-0.5 rounded font-medium ${complianceCls[tx.compliance]}`}>
                        Cumplimiento: {complianceLabel[tx.compliance]}
                      </span>
                    )}
                    <button className="ml-auto text-slate-300 hover:text-red-500 shrink-0"
                      onClick={() => setTreatments(p => p.filter(t => t.id !== tx.id))}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800">Añadir al gráfico</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              {(['episodio', 'tratamiento', 'evento'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 text-xs font-medium transition-colors capitalize ${
                    activeTab === tab
                      ? 'border-b-2 border-slate-800 text-slate-800'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab === 'evento' ? 'Evento vital' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-4">

              {/* Tab: Episodio */}
              {activeTab === 'episodio' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-slate-700">Tipo</label>
                      <select className={selectCls} value={epForm.type}
                        onChange={e => setEpForm({ ...epForm, type: e.target.value as EpisodeType })}>
                        <option value="depresion">Depresión</option>
                        <option value="mania">Manía</option>
                        <option value="hipomania">Hipomanía</option>
                        <option value="mixto">Mixto</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-slate-700">Severidad</label>
                      <select className={selectCls} value={epForm.severity}
                        onChange={e => setEpForm({ ...epForm, severity: e.target.value as Severity })}>
                        <option value="leve">Leve</option>
                        <option value="moderada">Moderada</option>
                        <option value="grave">Grave</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-slate-700">Inicio (mes)</label>
                      <input type="month" className={inputCls} value={epForm.startDate}
                        onChange={e => setEpForm({ ...epForm, startDate: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-slate-700">Fin (mes)</label>
                      <input type="month" className={inputCls} value={epForm.endDate}
                        onChange={e => setEpForm({ ...epForm, endDate: e.target.value })} />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={epForm.hospitalized}
                      onChange={e => setEpForm({ ...epForm, hospitalized: e.target.checked })}
                      className="rounded border-slate-300" />
                    <span className="text-xs text-slate-700">Ingreso hospitalario durante el episodio</span>
                  </label>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700">Notas clínicas (opcional)</label>
                    <textarea rows={2} className={inputCls} placeholder="Precipitantes, contexto..."
                      value={epForm.notes} onChange={e => setEpForm({ ...epForm, notes: e.target.value })} />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => setIsOpen(false)}
                      className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
                      Cancelar
                    </button>
                    <button onClick={addEpisode} disabled={!epForm.startDate || !epForm.endDate}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed">
                      Añadir
                    </button>
                  </div>
                </>
              )}

              {/* Tab: Tratamiento */}
              {activeTab === 'tratamiento' && (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700">Tipo de tratamiento</label>
                    <select className={selectCls} value={txForm.type}
                      onChange={e => setTxForm({ ...txForm, type: e.target.value as TreatmentType })}>
                      {TORDER.map(t => <option key={t} value={t}>{TDEFS[t].label}</option>)}
                    </select>
                  </div>
                  {txForm.type === 'otro' && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-slate-700">Nombre</label>
                      <input className={inputCls} placeholder="Ej: Valproato" value={txForm.customName}
                        onChange={e => setTxForm({ ...txForm, customName: e.target.value })} />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700">
                      {txForm.type === 'psicoterapia' ? 'Modalidad / técnica' : 'Fármaco(s) específico(s)'}
                      <span className="ml-1 text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <input
                      className={inputCls}
                      placeholder={txForm.type === 'psicoterapia' ? 'Ej: TCC, Psicodinámica' : 'Ej: Sertralina 50 mg'}
                      value={txForm.specificDrugs}
                      onChange={e => setTxForm({ ...txForm, specificDrugs: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700">Cumplimiento terapéutico</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {(['si', 'no', 'erratico', 'dudoso'] as const).map(val => {
                        const labels: Record<Compliance, string> = { si: 'Sí', no: 'No', erratico: 'Errático', dudoso: 'Dudoso' };
                        const active = txForm.compliance === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setTxForm({ ...txForm, compliance: active ? '' : val })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              active
                                ? 'bg-slate-800 text-white'
                                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {labels[val]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-slate-700">Inicio</label>
                      <input type="month" className={inputCls} value={txForm.startDate}
                        onChange={e => setTxForm({ ...txForm, startDate: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-slate-700">Fin</label>
                      <input type="month" className={inputCls} value={txForm.endDate}
                        disabled={txForm.ongoing}
                        onChange={e => setTxForm({ ...txForm, endDate: e.target.value })} />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={txForm.ongoing}
                      onChange={e => setTxForm({ ...txForm, ongoing: e.target.checked })}
                      className="rounded border-slate-300" />
                    <span className="text-xs text-slate-700">Actualmente vigente</span>
                  </label>
                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => setIsOpen(false)}
                      className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
                      Cancelar
                    </button>
                    <button onClick={addTreatment} disabled={!txForm.startDate}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed">
                      Añadir
                    </button>
                  </div>
                </>
              )}

              {/* Tab: Evento vital */}
              {activeTab === 'evento' && (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700">Fecha</label>
                    <input type="month" className={inputCls} value={evForm.date}
                      onChange={e => setEvForm({ ...evForm, date: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700">Descripción del evento</label>
                    <textarea rows={3} className={inputCls} placeholder="Ej: Fallecimiento de familiar cercano"
                      value={evForm.description}
                      onChange={e => setEvForm({ ...evForm, description: e.target.value })} />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => setIsOpen(false)}
                      className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
                      Cancelar
                    </button>
                    <button onClick={addEvent} disabled={!evForm.date || !evForm.description}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed">
                      Añadir
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

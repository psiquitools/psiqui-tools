"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
    Pill,
    Copy,
    Check,
    AlertCircle,
    ArrowLeft,
    FileText,
    RotateCcw,
} from "lucide-react";

// ─── TIPOS ───────────────────────────────────────────────────────────────────

type Velocidad = "rapida" | "estandar" | "lenta";

type Indicacion = {
    id: string;
    nombre: string;
    dosisInicialEstandar: number;
    dosisInicialLenta: number;
    dosisObjetivo: number;
    dosisMaxima: number;
    notas?: string;
};

type Farmaco = {
    id: string;
    nombre: string;
    marcaEspana: string;
    familia: string;
    presentaciones: number[];   // mg disponibles
    indicaciones: Indicacion[];
    momentoToma: string;        // mañana / noche / etc.
    efectosAdversosInicio: string[];
    tiempoRespuesta: string;
    notasGenerales?: string;
};

// ─── DATOS DE FÁRMACOS ───────────────────────────────────────────────────────

const FARMACOS: Farmaco[] = [
    // ─── ISRS ───
    {
        id: "sertralina",
        nombre: "Sertralina",
        marcaEspana: "Besitran®, Aremis®",
        familia: "ISRS",
        presentaciones: [50, 100],
        momentoToma: "1 vez al día, preferiblemente por la mañana con o sin alimentos",
        efectosAdversosInicio: [
            "Náuseas y molestias gastrointestinales",
            "Cefalea",
            "Insomnio o somnolencia",
            "Disminución de la libido",
        ],
        tiempoRespuesta: "Inicio del efecto terapéutico a las 2-4 semanas; respuesta máxima a las 6-8 semanas",
        indicaciones: [
            { id: "depresion", nombre: "Trastorno depresivo mayor", dosisInicialEstandar: 50, dosisInicialLenta: 25, dosisObjetivo: 100, dosisMaxima: 200 },
            { id: "tag", nombre: "Trastorno de ansiedad generalizada", dosisInicialEstandar: 50, dosisInicialLenta: 25, dosisObjetivo: 100, dosisMaxima: 200 },
            { id: "toc", nombre: "Trastorno obsesivo-compulsivo", dosisInicialEstandar: 50, dosisInicialLenta: 25, dosisObjetivo: 150, dosisMaxima: 200, notas: "En TOC suelen requerirse dosis más altas" },
            { id: "panico", nombre: "Trastorno de pánico", dosisInicialEstandar: 25, dosisInicialLenta: 12.5, dosisObjetivo: 100, dosisMaxima: 200, notas: "Iniciar a dosis baja por riesgo de exacerbación inicial de la ansiedad" },
            { id: "tept", nombre: "Trastorno de estrés postraumático", dosisInicialEstandar: 25, dosisInicialLenta: 25, dosisObjetivo: 100, dosisMaxima: 200 },
        ],
    },
    {
        id: "escitalopram",
        nombre: "Escitalopram",
        marcaEspana: "Esertia®, Cipralex®",
        familia: "ISRS",
        presentaciones: [5, 10, 15, 20],
        momentoToma: "1 vez al día, mañana o noche según tolerancia",
        efectosAdversosInicio: [
            "Náuseas",
            "Cefalea",
            "Insomnio o somnolencia",
            "Sudoración",
            "Disfunción sexual",
        ],
        tiempoRespuesta: "Inicio del efecto terapéutico a las 2-4 semanas; respuesta máxima a las 6-8 semanas",
        notasGenerales: "Dosis máxima de 20 mg/día en mayores de 65 años o insuficiencia hepática.",
        indicaciones: [
            { id: "depresion", nombre: "Trastorno depresivo mayor", dosisInicialEstandar: 10, dosisInicialLenta: 5, dosisObjetivo: 10, dosisMaxima: 20 },
            { id: "tag", nombre: "Trastorno de ansiedad generalizada", dosisInicialEstandar: 10, dosisInicialLenta: 5, dosisObjetivo: 10, dosisMaxima: 20 },
            { id: "toc", nombre: "Trastorno obsesivo-compulsivo", dosisInicialEstandar: 10, dosisInicialLenta: 5, dosisObjetivo: 20, dosisMaxima: 20 },
            { id: "panico", nombre: "Trastorno de pánico", dosisInicialEstandar: 5, dosisInicialLenta: 5, dosisObjetivo: 10, dosisMaxima: 20, notas: "Iniciar a 5 mg/día por riesgo de exacerbación inicial" },
            { id: "tas", nombre: "Trastorno de ansiedad social", dosisInicialEstandar: 10, dosisInicialLenta: 5, dosisObjetivo: 10, dosisMaxima: 20 },
        ],
    },
    {
        id: "fluoxetina",
        nombre: "Fluoxetina",
        marcaEspana: "Prozac®, Adofen®",
        familia: "ISRS",
        presentaciones: [20],
        momentoToma: "1 vez al día por la mañana (efecto activador)",
        efectosAdversosInicio: [
            "Náuseas",
            "Cefalea",
            "Insomnio",
            "Activación/inquietud",
            "Disfunción sexual",
        ],
        tiempoRespuesta: "Inicio del efecto terapéutico a las 2-4 semanas; respuesta máxima a las 6-8 semanas",
        notasGenerales: "Vida media muy larga — el síndrome de retirada es muy raro. Útil en pacientes incumplidores.",
        indicaciones: [
            { id: "depresion", nombre: "Trastorno depresivo mayor", dosisInicialEstandar: 20, dosisInicialLenta: 10, dosisObjetivo: 20, dosisMaxima: 60 },
            { id: "toc", nombre: "Trastorno obsesivo-compulsivo", dosisInicialEstandar: 20, dosisInicialLenta: 20, dosisObjetivo: 60, dosisMaxima: 80, notas: "TOC requiere dosis altas" },
            { id: "bulimia", nombre: "Bulimia nerviosa", dosisInicialEstandar: 60, dosisInicialLenta: 20, dosisObjetivo: 60, dosisMaxima: 80 },
        ],
    },
    {
        id: "paroxetina",
        nombre: "Paroxetina",
        marcaEspana: "Seroxat®, Frosinor®",
        familia: "ISRS",
        presentaciones: [20],
        momentoToma: "1 vez al día por la mañana",
        efectosAdversosInicio: [
            "Sedación (más sedante que otros ISRS)",
            "Náuseas",
            "Sequedad de boca",
            "Estreñimiento",
            "Disfunción sexual",
            "Aumento de peso",
        ],
        tiempoRespuesta: "Inicio del efecto terapéutico a las 2-4 semanas; respuesta máxima a las 6-8 semanas",
        notasGenerales: "Síndrome de retirada más intenso que otros ISRS — retirada gradual obligatoria. Evitar en embarazo.",
        indicaciones: [
            { id: "depresion", nombre: "Trastorno depresivo mayor", dosisInicialEstandar: 20, dosisInicialLenta: 10, dosisObjetivo: 20, dosisMaxima: 50 },
            { id: "tag", nombre: "Trastorno de ansiedad generalizada", dosisInicialEstandar: 20, dosisInicialLenta: 10, dosisObjetivo: 20, dosisMaxima: 50 },
            { id: "toc", nombre: "Trastorno obsesivo-compulsivo", dosisInicialEstandar: 20, dosisInicialLenta: 10, dosisObjetivo: 40, dosisMaxima: 60 },
            { id: "panico", nombre: "Trastorno de pánico", dosisInicialEstandar: 10, dosisInicialLenta: 10, dosisObjetivo: 40, dosisMaxima: 60 },
        ],
    },
    {
        id: "citalopram",
        nombre: "Citalopram",
        marcaEspana: "Prisdal®, Seropram®",
        familia: "ISRS",
        presentaciones: [10, 20, 30],
        momentoToma: "1 vez al día, mañana o noche según tolerancia",
        efectosAdversosInicio: [
            "Náuseas",
            "Cefalea",
            "Sudoración",
            "Insomnio o somnolencia",
        ],
        tiempoRespuesta: "Inicio del efecto terapéutico a las 2-4 semanas; respuesta máxima a las 6-8 semanas",
        notasGenerales: "Dosis máxima de 20 mg/día en mayores de 65 años o insuficiencia hepática. Vigilar QT a dosis altas.",
        indicaciones: [
            { id: "depresion", nombre: "Trastorno depresivo mayor", dosisInicialEstandar: 20, dosisInicialLenta: 10, dosisObjetivo: 20, dosisMaxima: 40 },
            { id: "panico", nombre: "Trastorno de pánico", dosisInicialEstandar: 10, dosisInicialLenta: 10, dosisObjetivo: 20, dosisMaxima: 40 },
        ],
    },
    // ─── IRSN ───
    {
        id: "venlafaxina",
        nombre: "Venlafaxina retard",
        marcaEspana: "Vandral®, Dobupal®",
        familia: "IRSN",
        presentaciones: [37.5, 75, 150, 225],
        momentoToma: "1 vez al día por la mañana con alimentos",
        efectosAdversosInicio: [
            "Náuseas (frecuente al inicio)",
            "Cefalea",
            "Sudoración",
            "Insomnio",
            "Aumento de tensión arterial a dosis altas",
            "Disfunción sexual",
        ],
        tiempoRespuesta: "Inicio del efecto terapéutico a las 2-4 semanas; respuesta máxima a las 6-8 semanas",
        notasGenerales: "Monitorizar tensión arterial, especialmente a dosis > 150 mg/día. Síndrome de retirada intenso — discontinuar de forma gradual.",
        indicaciones: [
            { id: "depresion", nombre: "Trastorno depresivo mayor", dosisInicialEstandar: 75, dosisInicialLenta: 37.5, dosisObjetivo: 150, dosisMaxima: 375 },
            { id: "tag", nombre: "Trastorno de ansiedad generalizada", dosisInicialEstandar: 75, dosisInicialLenta: 37.5, dosisObjetivo: 75, dosisMaxima: 225 },
            { id: "tas", nombre: "Trastorno de ansiedad social", dosisInicialEstandar: 75, dosisInicialLenta: 37.5, dosisObjetivo: 75, dosisMaxima: 225 },
            { id: "panico", nombre: "Trastorno de pánico", dosisInicialEstandar: 37.5, dosisInicialLenta: 37.5, dosisObjetivo: 75, dosisMaxima: 225 },
        ],
    },
    {
        id: "duloxetina",
        nombre: "Duloxetina",
        marcaEspana: "Cymbalta®, Xeristar®",
        familia: "IRSN",
        presentaciones: [30, 60],
        momentoToma: "1 vez al día por la mañana, con o sin alimentos",
        efectosAdversosInicio: [
            "Náuseas (muy frecuente al inicio)",
            "Sequedad de boca",
            "Cefalea",
            "Somnolencia o insomnio",
            "Estreñimiento",
        ],
        tiempoRespuesta: "Inicio del efecto terapéutico a las 2-4 semanas; respuesta máxima a las 6-8 semanas",
        notasGenerales: "Indicación adicional en dolor neuropático y fibromialgia. Vigilar transaminasas.",
        indicaciones: [
            { id: "depresion", nombre: "Trastorno depresivo mayor", dosisInicialEstandar: 30, dosisInicialLenta: 30, dosisObjetivo: 60, dosisMaxima: 120 },
            { id: "tag", nombre: "Trastorno de ansiedad generalizada", dosisInicialEstandar: 30, dosisInicialLenta: 30, dosisObjetivo: 60, dosisMaxima: 120 },
            { id: "dolor", nombre: "Dolor neuropático diabético", dosisInicialEstandar: 60, dosisInicialLenta: 30, dosisObjetivo: 60, dosisMaxima: 120 },
        ],
    },
    // ─── OTROS ANTIDEPRESIVOS ───
    {
        id: "mirtazapina",
        nombre: "Mirtazapina",
        marcaEspana: "Rexer®",
        familia: "Otros antidepresivos",
        presentaciones: [15, 30, 45],
        momentoToma: "1 vez al día por la noche (efecto sedante)",
        efectosAdversosInicio: [
            "Sedación marcada (más intensa a dosis bajas)",
            "Aumento de apetito y peso",
            "Sequedad de boca",
            "Estreñimiento",
        ],
        tiempoRespuesta: "Inicio del efecto sedante desde el primer día; efecto antidepresivo a las 2-4 semanas",
        notasGenerales: "Util en pacientes con insomnio o pérdida de peso. Mínima disfunción sexual.",
        indicaciones: [
            { id: "depresion", nombre: "Trastorno depresivo mayor", dosisInicialEstandar: 15, dosisInicialLenta: 15, dosisObjetivo: 30, dosisMaxima: 45, notas: "Dosis bajas (15 mg) son más sedantes que dosis altas" },
        ],
    },
    {
        id: "trazodona",
        nombre: "Trazodona",
        marcaEspana: "Deprax®",
        familia: "Otros antidepresivos",
        presentaciones: [100],
        momentoToma: "1 vez al día por la noche (efecto sedante)",
        efectosAdversosInicio: [
            "Sedación",
            "Mareo / hipotensión ortostática",
            "Sequedad de boca",
            "Cefalea",
            "Priapismo (raro pero importante en varones)",
        ],
        tiempoRespuesta: "Efecto sedante inmediato; efecto antidepresivo a las 2-4 semanas",
        notasGenerales: "Uso frecuente off-label como hipnótico a dosis bajas (50-100 mg).",
        indicaciones: [
            { id: "depresion", nombre: "Trastorno depresivo mayor", dosisInicialEstandar: 100, dosisInicialLenta: 50, dosisObjetivo: 200, dosisMaxima: 400 },
            { id: "insomnio", nombre: "Insomnio (off-label)", dosisInicialEstandar: 50, dosisInicialLenta: 25, dosisObjetivo: 100, dosisMaxima: 150 },
        ],
    },
    {
        id: "bupropion",
        nombre: "Bupropión XR",
        marcaEspana: "Elontril®, Zyntabac®",
        familia: "Otros antidepresivos",
        presentaciones: [150, 300],
        momentoToma: "1 vez al día por la mañana",
        efectosAdversosInicio: [
            "Insomnio (frecuente)",
            "Cefalea",
            "Sequedad de boca",
            "Náuseas",
            "Reducción del umbral convulsivo",
        ],
        tiempoRespuesta: "Inicio del efecto a las 2-4 semanas; respuesta máxima a las 6-8 semanas",
        notasGenerales: "Contraindicado si epilepsia o trastorno de la conducta alimentaria. Mínima disfunción sexual.",
        indicaciones: [
            { id: "depresion", nombre: "Trastorno depresivo mayor", dosisInicialEstandar: 150, dosisInicialLenta: 150, dosisObjetivo: 300, dosisMaxima: 300 },
            { id: "tabaquismo", nombre: "Deshabituación tabáquica", dosisInicialEstandar: 150, dosisInicialLenta: 150, dosisObjetivo: 300, dosisMaxima: 300 },
        ],
    },
    // ─── ANTIPSICÓTICOS ───
    {
        id: "olanzapina",
        nombre: "Olanzapina",
        marcaEspana: "Zyprexa®",
        familia: "Antipsicótico atípico",
        presentaciones: [2.5, 5, 7.5, 10, 15, 20],
        momentoToma: "1 vez al día por la noche (efecto sedante)",
        efectosAdversosInicio: [
            "Sedación",
            "Aumento de apetito y peso",
            "Alteraciones metabólicas (glucemia, lípidos)",
            "Hipotensión ortostática",
        ],
        tiempoRespuesta: "Efecto sedante y conductual en días; efecto antipsicótico en 2-4 semanas",
        notasGenerales: "Monitorización metabólica: peso, perímetro abdominal, glucemia, lípidos. Alta carga metabólica.",
        indicaciones: [
            { id: "psicosis", nombre: "Episodio psicótico / esquizofrenia", dosisInicialEstandar: 10, dosisInicialLenta: 5, dosisObjetivo: 10, dosisMaxima: 20 },
            { id: "mania", nombre: "Episodio maníaco", dosisInicialEstandar: 15, dosisInicialLenta: 10, dosisObjetivo: 15, dosisMaxima: 20 },
        ],
    },
    {
        id: "risperidona",
        nombre: "Risperidona",
        marcaEspana: "Risperdal®",
        familia: "Antipsicótico atípico",
        presentaciones: [0.5, 1, 2, 3, 4, 6],
        momentoToma: "1-2 veces al día",
        efectosAdversosInicio: [
            "Sedación (moderada)",
            "Hipotensión ortostática inicial",
            "Síntomas extrapiramidales a dosis > 4 mg/día",
            "Hiperprolactinemia",
            "Aumento de peso",
        ],
        tiempoRespuesta: "Efecto conductual en días; efecto antipsicótico en 2-4 semanas",
        notasGenerales: "Mayor riesgo de SEP que otros atípicos a dosis > 4 mg/día. Vigilar prolactina.",
        indicaciones: [
            { id: "psicosis", nombre: "Episodio psicótico / esquizofrenia", dosisInicialEstandar: 2, dosisInicialLenta: 1, dosisObjetivo: 4, dosisMaxima: 8 },
            { id: "mania", nombre: "Episodio maníaco", dosisInicialEstandar: 2, dosisInicialLenta: 1, dosisObjetivo: 4, dosisMaxima: 6 },
        ],
    },
    {
        id: "quetiapina",
        nombre: "Quetiapina retard",
        marcaEspana: "Seroquel Prolong®",
        familia: "Antipsicótico atípico",
        presentaciones: [50, 150, 200, 300, 400],
        momentoToma: "1 vez al día por la noche (efecto sedante)",
        efectosAdversosInicio: [
            "Sedación marcada (especialmente al inicio)",
            "Hipotensión ortostática",
            "Mareo",
            "Sequedad de boca",
            "Aumento de peso",
        ],
        tiempoRespuesta: "Efecto sedante inmediato; efecto antipsicótico en 2-4 semanas",
        notasGenerales: "Carga metabólica moderada-alta. Uso off-label a dosis bajas (25-100 mg) como sedante/hipnótico, lo que no es lo ideal.",
        indicaciones: [
            { id: "psicosis", nombre: "Episodio psicótico / esquizofrenia", dosisInicialEstandar: 300, dosisInicialLenta: 150, dosisObjetivo: 600, dosisMaxima: 800 },
            { id: "mania", nombre: "Episodio maníaco", dosisInicialEstandar: 300, dosisInicialLenta: 200, dosisObjetivo: 600, dosisMaxima: 800 },
            { id: "depresion-bipolar", nombre: "Depresión bipolar", dosisInicialEstandar: 50, dosisInicialLenta: 50, dosisObjetivo: 300, dosisMaxima: 600 },
        ],
    },
    {
        id: "aripiprazol",
        nombre: "Aripiprazol",
        marcaEspana: "Abilify®",
        familia: "Antipsicótico atípico",
        presentaciones: [5, 10, 15, 20, 30],
        momentoToma: "1 vez al día por la mañana",
        efectosAdversosInicio: [
            "Activación / inquietud (frecuente)",
            "Acatisia",
            "Insomnio",
            "Náuseas",
            "Cefalea",
        ],
        tiempoRespuesta: "Efecto antipsicótico en 1-2 semanas; respuesta completa en 4-6 semanas",
        notasGenerales: "Baja carga metabólica. Frecuente acatisia al inicio — informar al paciente.",
        indicaciones: [
            { id: "psicosis", nombre: "Episodio psicótico / esquizofrenia", dosisInicialEstandar: 10, dosisInicialLenta: 5, dosisObjetivo: 15, dosisMaxima: 30 },
            { id: "mania", nombre: "Episodio maníaco", dosisInicialEstandar: 15, dosisInicialLenta: 10, dosisObjetivo: 15, dosisMaxima: 30 },
        ],
    },
    // ─── ESTABILIZADORES ───
    {
        id: "litio",
        nombre: "Litio",
        marcaEspana: "Plenur®",
        familia: "Estabilizador del ánimo",
        presentaciones: [400],
        momentoToma: "1-2 veces al día con alimentos",
        efectosAdversosInicio: [
            "Temblor fino",
            "Polidipsia / poliuria",
            "Náuseas",
            "Diarrea",
            "Aumento de peso",
            "Acné",
        ],
        tiempoRespuesta: "Efecto antimaníaco en 1-2 semanas; efecto profiláctico completo en 6-12 meses",
        notasGenerales: "Requiere monitorización analítica: niveles plasmáticos (objetivo 0.6-1.0 mEq/L), función renal, TSH, calcio. Margen terapéutico estrecho.",
        indicaciones: [
            { id: "mania", nombre: "Episodio maníaco agudo", dosisInicialEstandar: 800, dosisInicialLenta: 400, dosisObjetivo: 1200, dosisMaxima: 1800 },
            { id: "mantenimiento", nombre: "Mantenimiento trastorno bipolar", dosisInicialEstandar: 400, dosisInicialLenta: 400, dosisObjetivo: 800, dosisMaxima: 1200 },
        ],
    },
    {
        id: "valproato",
        nombre: "Ácido valproico",
        marcaEspana: "Depakine®",
        familia: "Estabilizador del ánimo",
        presentaciones: [200, 300, 500],
        momentoToma: "2-3 veces al día con alimentos",
        efectosAdversosInicio: [
            "Sedación",
            "Náuseas",
            "Temblor",
            "Aumento de peso",
            "Alopecia",
        ],
        tiempoRespuesta: "Efecto antimaníaco en 3-7 días",
        notasGenerales: "Contraindicado en mujeres en edad fértil sin doble método anticonceptivo (teratogenia alta). Monitorización: niveles plasmáticos (50-100 µg/mL), función hepática, hemograma.",
        indicaciones: [
            { id: "mania", nombre: "Episodio maníaco agudo", dosisInicialEstandar: 500, dosisInicialLenta: 250, dosisObjetivo: 1000, dosisMaxima: 2500 },
            { id: "mantenimiento", nombre: "Mantenimiento trastorno bipolar", dosisInicialEstandar: 500, dosisInicialLenta: 500, dosisObjetivo: 1000, dosisMaxima: 2000 },
        ],
    },
    {
        id: "lamotrigina",
        nombre: "Lamotrigina",
        marcaEspana: "Crisomet®, Labileno®",
        familia: "Estabilizador del ánimo",
        presentaciones: [25, 50, 100, 200],
        momentoToma: "1 vez al día",
        efectosAdversosInicio: [
            "Exantema (vigilar — riesgo de Stevens-Johnson)",
            "Cefalea",
            "Mareo",
            "Náuseas",
            "Diplopía",
        ],
        tiempoRespuesta: "Efecto antidepresivo a las 6-8 semanas",
        notasGenerales: "OBLIGADA titulación lenta por riesgo de exantema grave (Stevens-Johnson). Si el paciente toma valproato, reducir la dosis de lamotrigina a la mitad. Si toma carbamazepina, duplicarla.",
        indicaciones: [
            { id: "depresion-bipolar", nombre: "Depresión bipolar / mantenimiento", dosisInicialEstandar: 25, dosisInicialLenta: 25, dosisObjetivo: 200, dosisMaxima: 400, notas: "Titulación obligatoria muy lenta — ver pauta especial" },
        ],
    },
];

const VELOCIDAD_CONFIG: Record<Velocidad, { label: string; descripcion: string }> = {
    rapida: { label: "Rápida", descripcion: "Para urgencia clínica o pacientes sin sensibilidad GI" },
    estandar: { label: "Estándar", descripcion: "Pauta habitual recomendada" },
    lenta: { label: "Lenta", descripcion: "Ancianos, alta sensibilidad GI o antecedentes de mala tolerancia" },
};

// ─── GENERADOR DE PAUTA ──────────────────────────────────────────────────────

type Paso = {
    desde: number; // día desde
    hasta: number | null; // día hasta (null = mantener)
    dosis: number;
    descripcion: string;
};

function generarPasos(
    farmaco: Farmaco,
    indicacion: Indicacion,
    velocidad: Velocidad
): Paso[] {
    // Caso especial lamotrigina: pauta estándar obligatoria
    if (farmaco.id === "lamotrigina") {
        return [
            { desde: 1, hasta: 14, dosis: 25, descripcion: "Semanas 1-2: 25 mg/día" },
            { desde: 15, hasta: 28, dosis: 50, descripcion: "Semanas 3-4: 50 mg/día" },
            { desde: 29, hasta: 35, dosis: 100, descripcion: "Semana 5: 100 mg/día" },
            { desde: 36, hasta: null, dosis: 200, descripcion: "Semana 6 en adelante: 200 mg/día (ajustar según respuesta clínica)" },
        ];
    }

    const inicial = velocidad === "lenta" ? indicacion.dosisInicialLenta : indicacion.dosisInicialEstandar;
    const objetivo = indicacion.dosisObjetivo;

    // Si la dosis inicial ya es la objetivo, no hace falta titular
    if (inicial >= objetivo) {
        return [
            { desde: 1, hasta: null, dosis: inicial, descripcion: `Desde el día 1: ${formatDosis(inicial)} mg/día` },
        ];
    }

    // Intervalo de titulación según velocidad
    const intervaloDias: Record<Velocidad, number> = {
        rapida: 4,
        estandar: 7,
        lenta: 14,
    };
    const dias = intervaloDias[velocidad];

    // Calcular pasos intermedios
    const pasos: Paso[] = [];
    const presentaciones = [...farmaco.presentaciones].sort((a, b) => a - b);

    let dosisActual = inicial;
    let diaActual = 1;

    while (dosisActual < objetivo) {
        const diaFin = diaActual + dias - 1;
        pasos.push({
            desde: diaActual,
            hasta: diaFin,
            dosis: dosisActual,
            descripcion: `Días ${diaActual}-${diaFin}: ${formatDosis(dosisActual)} mg/día`,
        });

        // Siguiente dosis: la siguiente presentación posible que sea > dosisActual
        const siguiente = presentaciones.find((p) => p > dosisActual) ?? null;
        if (siguiente === null || siguiente > objetivo) {
            dosisActual = objetivo;
        } else {
            dosisActual = siguiente;
        }
        diaActual = diaFin + 1;
    }

    // Último paso: dosis objetivo en mantenimiento
    pasos.push({
        desde: diaActual,
        hasta: null,
        dosis: objetivo,
        descripcion: `Día ${diaActual} en adelante: ${formatDosis(objetivo)} mg/día (dosis objetivo)`,
    });

    return pasos;
}

function formatDosis(d: number): string {
    return d % 1 === 0 ? d.toString() : d.toFixed(1);
}

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export default function GeneradorPautaPage() {
    const [farmacoId, setFarmacoId] = useState<string>("sertralina");
    const [indicacionId, setIndicacionId] = useState<string>("depresion");
    const [velocidad, setVelocidad] = useState<Velocidad>("estandar");
    const [copied, setCopied] = useState(false);

    const farmaco = FARMACOS.find((f) => f.id === farmacoId)!;
    const indicacion = farmaco.indicaciones.find((i) => i.id === indicacionId) ?? farmaco.indicaciones[0];

    // Si cambia el fármaco, ajustar la indicación al primer disponible
    const handleFarmacoChange = (nuevoId: string) => {
        const nuevo = FARMACOS.find((f) => f.id === nuevoId)!;
        setFarmacoId(nuevoId);
        if (!nuevo.indicaciones.find((i) => i.id === indicacionId)) {
            setIndicacionId(nuevo.indicaciones[0].id);
        }
    };

    const pasos = useMemo(
        () => generarPasos(farmaco, indicacion, velocidad),
        [farmaco, indicacion, velocidad]
    );

    const textoInforme = useMemo(() => {
        const lines: string[] = [
            `Se inicia tratamiento con ${farmaco.nombre.toLowerCase()} con la siguiente pauta de titulación:`,
            "",
            ...pasos.map((p) => `• ${p.descripcion}`),
            "",
            `Dosis objetivo de mantenimiento: ${formatDosis(indicacion.dosisObjetivo)} mg/día (máxima recomendada: ${formatDosis(indicacion.dosisMaxima)} mg/día).`,
            `Posología: ${farmaco.momentoToma}.`,
            "",
            `Se informa al paciente de que el efecto terapéutico esperado se inicia a las 2-4 semanas de alcanzar la dosis diana, con respuesta clínica máxima a las 6-8 semanas. Posibles efectos adversos al inicio: ${farmaco.efectosAdversosInicio.slice(0, 3).join(", ").toLowerCase()} — habitualmente transitorios en los primeros 7-14 días.`,
            "",
            `Se cita en consulta en 2-4 semanas para reevaluación de tolerancia y respuesta clínica.`,
        ];

        if (indicacion.notas) {
            lines.push("");
            lines.push(`Nota: ${indicacion.notas}.`);
        }
        if (farmaco.notasGenerales) {
            lines.push("");
            lines.push(`Consideraciones: ${farmaco.notasGenerales}`);
        }

        return lines.join("\n");
    }, [farmaco, indicacion, pasos]);

    const copyTexto = () => {
        navigator.clipboard.writeText(textoInforme);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const reset = () => {
        setVelocidad("estandar");
    };

    // Agrupar fármacos por familia
    const farmacosPorFamilia = useMemo(() => {
        const grupos: Record<string, Farmaco[]> = {};
        FARMACOS.forEach((f) => {
            if (!grupos[f.familia]) grupos[f.familia] = [];
            grupos[f.familia].push(f);
        });
        return grupos;
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Volver */}
                <Link
                    href="/tools/calculadoras-clinicas"
                    className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Calculadoras Clínicas
                </Link>

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Pill className="w-7 h-7 text-slate-700" />
                    <div>
                        <h1 className="text-2xl font-semibold">Generador de pauta terapéutica</h1>
                        <p className="text-sm text-slate-600">
                            Pauta de titulación práctica para informe clínico
                        </p>
                    </div>
                </div>

                {/* Configuración */}
                <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">

                    {/* Fármaco */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Fármaco</label>
                        <select
                            value={farmacoId}
                            onChange={(e) => handleFarmacoChange(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
                        >
                            {Object.entries(farmacosPorFamilia).map(([familia, farmacos]) => (
                                <optgroup key={familia} label={familia}>
                                    {farmacos.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.nombre} ({f.marcaEspana})
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                        <p className="text-xs text-slate-400 pt-1">
                            Presentaciones: {farmaco.presentaciones.join(", ")} mg
                        </p>
                    </div>

                    {/* Indicación */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Indicación</label>
                        <select
                            value={indicacionId}
                            onChange={(e) => setIndicacionId(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
                        >
                            {farmaco.indicaciones.map((i) => (
                                <option key={i.id} value={i.id}>
                                    {i.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Velocidad */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Velocidad de titulación</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {(["rapida", "estandar", "lenta"] as Velocidad[]).map((v) => {
                                const config = VELOCIDAD_CONFIG[v];
                                const selected = velocidad === v;
                                return (
                                    <button
                                        key={v}
                                        onClick={() => setVelocidad(v)}
                                        className={`text-left p-3 rounded-lg border text-sm transition-colors ${selected
                                                ? "bg-slate-800 text-white border-slate-800"
                                                : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                                            }`}
                                    >
                                        <div className="font-semibold mb-1">{config.label}</div>
                                        <div className={`text-xs ${selected ? "text-slate-300" : "text-slate-500"
                                            }`}>
                                            {config.descripcion}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </div>

                {/* Resumen */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Dosis inicial</p>
                            <p className="text-lg font-bold">
                                {formatDosis(velocidad === "lenta" ? indicacion.dosisInicialLenta : indicacion.dosisInicialEstandar)} mg
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Dosis objetivo</p>
                            <p className="text-lg font-bold">{formatDosis(indicacion.dosisObjetivo)} mg</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Dosis máxima</p>
                            <p className="text-lg font-bold">{formatDosis(indicacion.dosisMaxima)} mg</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Pasos de titulación</p>
                            <p className="text-lg font-bold">{pasos.length}</p>
                        </div>
                    </div>
                </div>

                {/* Tabla de pasos */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Pauta de titulación</h3>
                    <div className="space-y-2">
                        {pasos.map((p, idx) => (
                            <div
                                key={idx}
                                className={`px-4 py-3 rounded-lg border text-sm ${p.hasta === null
                                        ? "bg-slate-50 border-slate-300 font-medium"
                                        : "bg-white border-slate-200"
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-700">
                                        {p.descripcion}
                                    </span>
                                    {p.hasta === null && (
                                        <span className="text-xs bg-slate-800 text-white px-2 py-0.5 rounded">
                                            Mantenimiento
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Texto para informe */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-500" />
                            <h3 className="text-sm font-medium text-slate-700">
                                Texto para informe clínico
                            </h3>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={reset}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 hover:bg-slate-100 rounded transition-colors"
                            >
                                <RotateCcw className="w-3 h-3" />
                                Restablecer
                            </button>
                            <button
                                onClick={copyTexto}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-800 text-white hover:bg-slate-700 rounded transition-colors"
                            >
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                Copiar texto
                            </button>
                        </div>
                    </div>
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans bg-slate-50 rounded p-3 leading-relaxed max-h-96 overflow-y-auto">
                        {textoInforme}
                    </pre>
                </div>

                {/* Nota */}
                <div className="flex items-start gap-2 text-xs text-slate-600">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                        Pauta orientativa basada en fichas técnicas (AEMPS) y guías clínicas españolas. Ajustar según
                        edad, comorbilidades, función renal/hepática y respuesta clínica. No sustituye el criterio médico profesional.
                    </span>
                </div>

            </div>
        </div>
    );
}
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
    dosisMinima: number;
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
            { id: "depresion", nombre: "Trastorno depresivo mayor", dosisMinima: 50, dosisInicialEstandar: 50, dosisInicialLenta: 25, dosisObjetivo: 100, dosisMaxima: 200 },
            { id: "tag", nombre: "Trastorno de ansiedad generalizada", dosisMinima: 50, dosisInicialEstandar: 50, dosisInicialLenta: 25, dosisObjetivo: 100, dosisMaxima: 200 },
            { id: "toc", nombre: "Trastorno obsesivo-compulsivo", dosisMinima: 100, dosisInicialEstandar: 50, dosisInicialLenta: 25, dosisObjetivo: 150, dosisMaxima: 200, notas: "En TOC suelen requerirse dosis más altas" },
            { id: "panico", nombre: "Trastorno de pánico", dosisMinima: 25, dosisInicialEstandar: 25, dosisInicialLenta: 12.5, dosisObjetivo: 100, dosisMaxima: 200, notas: "Iniciar a dosis baja por riesgo de exacerbación inicial de la ansiedad" },
            { id: "tept", nombre: "Trastorno de estrés postraumático", dosisMinima: 50, dosisInicialEstandar: 25, dosisInicialLenta: 25, dosisObjetivo: 100, dosisMaxima: 200 },
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
            { id: "depresion", nombre: "Trastorno depresivo mayor", dosisMinima: 10, dosisInicialEstandar: 10, dosisInicialLenta: 5, dosisObjetivo: 10, dosisMaxima: 20 },
            { id: "tag", nombre: "Trastorno de ansiedad generalizada", dosisMinima: 10, dosisInicialEstandar: 10, dosisInicialLenta: 5, dosisObjetivo: 10, dosisMaxima: 20 },
            { id: "toc", nombre: "Trastorno obsesivo-compulsivo", dosisMinima: 10, dosisInicialEstandar: 10, dosisInicialLenta: 5, dosisObjetivo: 20, dosisMaxima: 20 },
            { id: "panico", nombre: "Trastorno de pánico", dosisMinima: 5, dosisInicialEstandar: 5, dosisInicialLenta: 5, dosisObjetivo: 10, dosisMaxima: 20, notas: "Iniciar a 5 mg/día por riesgo de exacerbación inicial" },
            { id: "tas", nombre: "Trastorno de ansiedad social", dosisMinima: 10, dosisInicialEstandar: 10, dosisInicialLenta: 5, dosisObjetivo: 10, dosisMaxima: 20 },
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
            { id: "depresion", nombre: "Trastorno depresivo mayor", dosisMinima: 20, dosisInicialEstandar: 20, dosisInicialLenta: 10, dosisObjetivo: 20, dosisMaxima: 60 },
            { id: "toc", nombre: "Trastorno obsesivo-compulsivo", dosisMinima: 40, dosisInicialEstandar: 20, dosisInicialLenta: 20, dosisObjetivo: 60, dosisMaxima: 80, notas: "TOC requiere dosis altas" },
            { id: "bulimia", nombre: "Bulimia nerviosa", dosisMinima: 60, dosisInicialEstandar: 60, dosisInicialLenta: 20, dosisObjetivo: 60, dosisMaxima: 80 },
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
            { id: "depresion", nombre: "Trastorno depresivo mayor", dosisMinima: 20, dosisInicialEstandar: 20, dosisInicialLenta: 10, dosisObjetivo: 20, dosisMaxima: 50 },
            { id: "tag", nombre: "Trastorno de ansiedad generalizada", dosisMinima: 20, dosisInicialEstandar: 20, dosisInicialLenta: 10, dosisObjetivo: 20, dosisMaxima: 50 },
            { id: "toc", nombre: "Trastorno obsesivo-compulsivo", dosisMinima: 20, dosisInicialEstandar: 20, dosisInicialLenta: 10, dosisObjetivo: 40, dosisMaxima: 60 },
            { id: "panico", nombre: "Trastorno de pánico", dosisMinima: 10, dosisInicialEstandar: 10, dosisInicialLenta: 10, dosisObjetivo: 40, dosisMaxima: 60 },
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
            { id: "depresion", nombre: "Trastorno depresivo mayor", dosisMinima: 20, dosisInicialEstandar: 20, dosisInicialLenta: 10, dosisObjetivo: 20, dosisMaxima: 40 },
            { id: "panico", nombre: "Trastorno de pánico", dosisMinima: 10, dosisInicialEstandar: 10, dosisInicialLenta: 10, dosisObjetivo: 20, dosisMaxima: 40 },
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
            { id: "depresion", nombre: "Trastorno depresivo mayor", dosisMinima: 75, dosisInicialEstandar: 75, dosisInicialLenta: 37.5, dosisObjetivo: 150, dosisMaxima: 375 },
            { id: "tag", nombre: "Trastorno de ansiedad generalizada", dosisMinima: 75, dosisInicialEstandar: 75, dosisInicialLenta: 37.5, dosisObjetivo: 75, dosisMaxima: 225 },
            { id: "tas", nombre: "Trastorno de ansiedad social", dosisMinima: 75, dosisInicialEstandar: 75, dosisInicialLenta: 37.5, dosisObjetivo: 75, dosisMaxima: 225 },
            { id: "panico", nombre: "Trastorno de pánico", dosisMinima: 37.5, dosisInicialEstandar: 37.5, dosisInicialLenta: 37.5, dosisObjetivo: 75, dosisMaxima: 225 },
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
            { id: "depresion", nombre: "Trastorno depresivo mayor", dosisMinima: 60, dosisInicialEstandar: 30, dosisInicialLenta: 30, dosisObjetivo: 60, dosisMaxima: 120 },
            { id: "tag", nombre: "Trastorno de ansiedad generalizada", dosisMinima: 60, dosisInicialEstandar: 30, dosisInicialLenta: 30, dosisObjetivo: 60, dosisMaxima: 120 },
            { id: "dolor", nombre: "Dolor neuropático", dosisMinima: 60, dosisInicialEstandar: 60, dosisInicialLenta: 30, dosisObjetivo: 60, dosisMaxima: 120 },
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
            { id: "depresion", nombre: "Trastorno depresivo mayor", dosisMinima: 15, dosisInicialEstandar: 15, dosisInicialLenta: 15, dosisObjetivo: 30, dosisMaxima: 45, notas: "Dosis bajas (15 mg) son más sedantes que dosis altas" },
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
            { id: "depresion", nombre: "Trastorno depresivo mayor", dosisMinima: 150, dosisInicialEstandar: 100, dosisInicialLenta: 50, dosisObjetivo: 200, dosisMaxima: 400 },
            { id: "insomnio", nombre: "Insomnio (off-label)", dosisMinima: 50, dosisInicialEstandar: 50, dosisInicialLenta: 25, dosisObjetivo: 100, dosisMaxima: 150 },
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
            { id: "depresion", nombre: "Trastorno depresivo mayor", dosisMinima: 150, dosisInicialEstandar: 150, dosisInicialLenta: 150, dosisObjetivo: 300, dosisMaxima: 300 },
            { id: "tabaquismo", nombre: "Deshabituación tabáquica", dosisMinima: 150, dosisInicialEstandar: 150, dosisInicialLenta: 150, dosisObjetivo: 300, dosisMaxima: 300 },
            { id: "potenciacion", nombre: "Potenciación en depresión resistente", dosisMinima: 150, dosisInicialEstandar: 150, dosisInicialLenta: 150, dosisObjetivo: 300, dosisMaxima: 300, notas: "Combinado con ISRS/IRSN; útil cuando hay fatiga, disfunción sexual o bajo ánimo sin ansiedad predominante" },
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
            { id: "psicosis", nombre: "Episodio psicótico / esquizofrenia", dosisMinima: 5, dosisInicialEstandar: 10, dosisInicialLenta: 5, dosisObjetivo: 10, dosisMaxima: 20 },
            { id: "mania", nombre: "Episodio maníaco", dosisMinima: 10, dosisInicialEstandar: 15, dosisInicialLenta: 10, dosisObjetivo: 15, dosisMaxima: 20 },
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
            { id: "psicosis", nombre: "Episodio psicótico / esquizofrenia", dosisMinima: 2, dosisInicialEstandar: 2, dosisInicialLenta: 1, dosisObjetivo: 4, dosisMaxima: 8 },
            { id: "mania", nombre: "Episodio maníaco", dosisMinima: 2, dosisInicialEstandar: 2, dosisInicialLenta: 1, dosisObjetivo: 4, dosisMaxima: 6 },
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
            { id: "psicosis", nombre: "Episodio psicótico / esquizofrenia", dosisMinima: 300, dosisInicialEstandar: 300, dosisInicialLenta: 150, dosisObjetivo: 600, dosisMaxima: 800 },
            { id: "mania", nombre: "Episodio maníaco", dosisMinima: 400, dosisInicialEstandar: 300, dosisInicialLenta: 200, dosisObjetivo: 600, dosisMaxima: 800 },
            { id: "depresion-bipolar", nombre: "Depresión bipolar", dosisMinima: 50, dosisInicialEstandar: 50, dosisInicialLenta: 50, dosisObjetivo: 300, dosisMaxima: 600 },
            { id: "potenciacion", nombre: "Potenciación en depresión mayor", dosisMinima: 50, dosisInicialEstandar: 50, dosisInicialLenta: 50, dosisObjetivo: 150, dosisMaxima: 300, notas: "A dosis bajas (50-300 mg) como potenciador antidepresivo; mayor sedación que con otros potenciadores" },
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
            { id: "psicosis", nombre: "Episodio psicótico / esquizofrenia", dosisMinima: 10, dosisInicialEstandar: 10, dosisInicialLenta: 5, dosisObjetivo: 15, dosisMaxima: 30 },
            { id: "mania", nombre: "Episodio maníaco", dosisMinima: 10, dosisInicialEstandar: 15, dosisInicialLenta: 10, dosisObjetivo: 15, dosisMaxima: 30 },
            { id: "potenciacion", nombre: "Potenciación en depresión mayor", dosisMinima: 2, dosisInicialEstandar: 2, dosisInicialLenta: 2, dosisObjetivo: 5, dosisMaxima: 15, notas: "A dosis muy bajas (2-10 mg); iniciar con 2 mg y ajustar; frecuente acatisia incluso a dosis bajas" },
        ],
    },
    {
        id: "brexpiprazol",
        nombre: "Brexpiprazol",
        marcaEspana: "Rxulti®",
        familia: "Antipsicótico atípico",
        presentaciones: [0.5, 1, 2, 3, 4],
        momentoToma: "1 vez al día, con o sin alimentos",
        efectosAdversosInicio: [
            "Acatisia (menos frecuente que aripiprazol)",
            "Aumento de peso moderado",
            "Somnolencia",
            "Cefalea",
            "Náuseas",
        ],
        tiempoRespuesta: "Efecto potenciador en 2-4 semanas; efecto antipsicótico completo en 4-6 semanas",
        notasGenerales: "Agonista parcial D2/D3 y 5HT1A. Menos acatisia que aripiprazol. En potenciación usar la dosis mínima eficaz.",
        indicaciones: [
            { id: "potenciacion", nombre: "Potenciación en depresión mayor", dosisMinima: 1, dosisInicialEstandar: 0.5, dosisInicialLenta: 0.5, dosisObjetivo: 2, dosisMaxima: 3, notas: "Titulación gradual al combinar con antidepresivos; rango habitual 1-3 mg/día" },
            { id: "psicosis", nombre: "Esquizofrenia", dosisMinima: 2, dosisInicialEstandar: 1, dosisInicialLenta: 1, dosisObjetivo: 4, dosisMaxima: 4 },
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
            { id: "mania", nombre: "Episodio maníaco agudo", dosisMinima: 800, dosisInicialEstandar: 800, dosisInicialLenta: 400, dosisObjetivo: 1200, dosisMaxima: 1800, notas: "Guiar por niveles plasmáticos (objetivo 0.8-1.2 mEq/L en agudo)" },
            { id: "mantenimiento", nombre: "Mantenimiento trastorno bipolar", dosisMinima: 400, dosisInicialEstandar: 400, dosisInicialLenta: 400, dosisObjetivo: 800, dosisMaxima: 1200, notas: "Guiar por niveles plasmáticos (objetivo 0.6-0.8 mEq/L en mantenimiento)" },
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
            { id: "mania", nombre: "Episodio maníaco agudo", dosisMinima: 750, dosisInicialEstandar: 500, dosisInicialLenta: 250, dosisObjetivo: 1000, dosisMaxima: 2500, notas: "Guiar por niveles plasmáticos (50-100 µg/mL)" },
            { id: "mantenimiento", nombre: "Mantenimiento trastorno bipolar", dosisMinima: 500, dosisInicialEstandar: 500, dosisInicialLenta: 500, dosisObjetivo: 1000, dosisMaxima: 2000 },
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
            { id: "depresion-bipolar", nombre: "Depresión bipolar / mantenimiento", dosisMinima: 100, dosisInicialEstandar: 25, dosisInicialLenta: 25, dosisObjetivo: 200, dosisMaxima: 400, notas: "Titulación obligatoria muy lenta — ver pauta especial" },
        ],
    },
    // ─── ANTICONVULSIVANTES / ANSIOLÍTICOS ───
    {
        id: "pregabalina",
        nombre: "Pregabalina",
        marcaEspana: "Lyrica®",
        familia: "Anticonvulsivante / ansiolítico",
        presentaciones: [75, 150, 300, 600],
        momentoToma: "2 veces al día, con o sin alimentos",
        efectosAdversosInicio: [
            "Somnolencia (muy frecuente al inicio)",
            "Mareo / vértigo",
            "Edema periférico",
            "Aumento de peso",
            "Ataxia o incoordinación",
            "Visión borrosa",
        ],
        tiempoRespuesta: "Efecto ansiolítico en 1-2 semanas; efecto analgésico en 1-2 semanas",
        notasGenerales: "Dividir la dosis total en 2 tomas diarias. Ajuste obligatorio en insuficiencia renal. Riesgo de dependencia con uso prolongado — retirada gradual obligatoria.",
        indicaciones: [
            { id: "tag", nombre: "Trastorno de ansiedad generalizada", dosisMinima: 150, dosisInicialEstandar: 75, dosisInicialLenta: 75, dosisObjetivo: 300, dosisMaxima: 600 },
            { id: "dolor", nombre: "Dolor neuropático", dosisMinima: 150, dosisInicialEstandar: 150, dosisInicialLenta: 75, dosisObjetivo: 300, dosisMaxima: 600, notas: "Mayor efectividad a dosis ≥ 300 mg/día; ajustar según respuesta y tolerancia" },
            { id: "fibromialgia", nombre: "Fibromialgia", dosisMinima: 150, dosisInicialEstandar: 75, dosisInicialLenta: 75, dosisObjetivo: 300, dosisMaxima: 450 },
        ],
    },
    {
        id: "gabapentina",
        nombre: "Gabapentina",
        marcaEspana: "Neurontin®",
        familia: "Anticonvulsivante / ansiolítico",
        presentaciones: [300, 400, 600, 800],
        momentoToma: "3 veces al día (mañana, mediodía y noche), con o sin alimentos",
        efectosAdversosInicio: [
            "Somnolencia (muy frecuente al inicio)",
            "Mareo / vértigo",
            "Ataxia",
            "Fatiga",
            "Visión borrosa",
            "Edema periférico",
        ],
        tiempoRespuesta: "Efecto analgésico en 1-2 semanas",
        notasGenerales: "Administrar en 3 tomas diarias. La dosis indicada es la DOSIS TOTAL diaria. Ajuste en insuficiencia renal. Titulación clásica: 300 mg/noche → 300 mg BID → 300 mg TID, luego incrementos semanales.",
        indicaciones: [
            { id: "dolor", nombre: "Dolor neuropático", dosisMinima: 1200, dosisInicialEstandar: 300, dosisInicialLenta: 300, dosisObjetivo: 1800, dosisMaxima: 3600, notas: "Pauta fija de titulación semanal — ver tabla" },
            { id: "tag", nombre: "Ansiedad (off-label)", dosisMinima: 900, dosisInicialEstandar: 300, dosisInicialLenta: 300, dosisObjetivo: 1200, dosisMaxima: 2400, notas: "Uso off-label; pauta fija de titulación semanal — ver tabla" },
        ],
    },
    // ─── BENZODIACEPINAS ───
    {
        id: "diazepam",
        nombre: "Diazepam",
        marcaEspana: "Valium®",
        familia: "Benzodiacepina",
        presentaciones: [2, 5, 10],
        momentoToma: "1-2 veces al día (mañana y noche), con o sin alimentos",
        efectosAdversosInicio: [
            "Somnolencia y sedación",
            "Deterioro cognitivo y de la memoria",
            "Tolerancia con uso prolongado",
            "Dependencia física",
            "Síndrome de retirada al suspender",
        ],
        tiempoRespuesta: "Efecto ansiolítico inmediato (30-60 minutos vía oral)",
        notasGenerales: "Vida media muy larga (20-100 h) con metabolito activo nordazepam. Uso limitado a corto plazo (≤4 semanas). Retirada siempre gradual. Evitar en hepatopatía, apnea del sueño y adultos mayores.",
        indicaciones: [
            { id: "ansiedad", nombre: "Ansiedad (corto plazo)", dosisMinima: 5, dosisInicialEstandar: 5, dosisInicialLenta: 2, dosisObjetivo: 10, dosisMaxima: 30, notas: "Máximo 4 semanas; siempre con plan de retirada gradual" },
        ],
    },
    {
        id: "clonazepam",
        nombre: "Clonazepam",
        marcaEspana: "Rivotril®",
        familia: "Benzodiacepina",
        presentaciones: [0.5, 1, 2],
        momentoToma: "1-2 veces al día (o dosis única nocturna para insomnio)",
        efectosAdversosInicio: [
            "Somnolencia y sedación",
            "Ataxia",
            "Deterioro cognitivo",
            "Dependencia con uso prolongado",
            "Síndrome de retirada al suspender",
        ],
        tiempoRespuesta: "Efecto ansiolítico en pocas horas",
        notasGenerales: "Vida media larga (20-50 h). Uso limitado a corto plazo salvo epilepsia. Retirada gradual obligatoria — nunca de forma brusca.",
        indicaciones: [
            { id: "panico", nombre: "Trastorno de pánico (corto plazo)", dosisMinima: 0.5, dosisInicialEstandar: 0.5, dosisInicialLenta: 0.25, dosisObjetivo: 1, dosisMaxima: 4, notas: "Idealmente como puente hasta efecto del ISRS; usar el menor tiempo posible" },
            { id: "ansiedad", nombre: "Trastorno de ansiedad (corto plazo)", dosisMinima: 0.5, dosisInicialEstandar: 0.5, dosisInicialLenta: 0.25, dosisObjetivo: 1, dosisMaxima: 4 },
            { id: "insomnio", nombre: "Insomnio asociado a ansiedad", dosisMinima: 0.5, dosisInicialEstandar: 0.5, dosisInicialLenta: 0.5, dosisObjetivo: 1, dosisMaxima: 2, notas: "Dosis única nocturna; máximo 4 semanas" },
        ],
    },
    {
        id: "lorazepam",
        nombre: "Lorazepam",
        marcaEspana: "Orfidal®, Ativan®",
        familia: "Benzodiacepina",
        presentaciones: [0.5, 1, 2.5],
        momentoToma: "1-2 veces al día (o nocturno para insomnio)",
        efectosAdversosInicio: [
            "Somnolencia y sedación",
            "Amnesia anterógrada",
            "Dependencia con uso prolongado",
            "Síndrome de retirada al suspender",
        ],
        tiempoRespuesta: "Efecto ansiolítico rápido (15-30 min oral; inmediato sublingual)",
        notasGenerales: "Vida media intermedia (10-20 h). Sin metabolitos activos — preferible en hepatopatía y adultos mayores. Puede usarse sublingual para acción más rápida. Uso máximo 4 semanas.",
        indicaciones: [
            { id: "ansiedad", nombre: "Ansiedad aguda / crisis de ansiedad", dosisMinima: 0.5, dosisInicialEstandar: 1, dosisInicialLenta: 0.5, dosisObjetivo: 1, dosisMaxima: 4, notas: "Puede usarse sublingual para mayor rapidez de acción" },
            { id: "insomnio", nombre: "Insomnio (corto plazo)", dosisMinima: 0.5, dosisInicialEstandar: 1, dosisInicialLenta: 0.5, dosisObjetivo: 1, dosisMaxima: 2.5, notas: "Dosis única nocturna; máximo 4 semanas" },
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

    // Caso especial gabapentina: titulación por pasos fijos (TID)
    if (farmaco.id === "gabapentina") {
        const d = velocidad === "rapida" ? 3 : velocidad === "lenta" ? 14 : 7;
        const obj = indicacion.dosisObjetivo;
        return [
            { desde: 1,       hasta: d,     dosis: 300, descripcion: `Días 1-${d}: 300 mg/día (dosis única nocturna)` },
            { desde: d+1,     hasta: d*2,   dosis: 600, descripcion: `Días ${d+1}-${d*2}: 600 mg/día (mañana y noche)` },
            { desde: d*2+1,   hasta: d*3,   dosis: 900, descripcion: `Días ${d*2+1}-${d*3}: 900 mg/día (3 veces al día)` },
            { desde: d*3+1,   hasta: null,  dosis: obj, descripcion: `Día ${d*3+1} en adelante: ${formatDosis(obj)} mg/día dosis total (3 veces al día)` },
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

// Describe una dosis en términos de comprimidos concretos
function describeDosisTablets(dosis: number, presentaciones: number[]): string {
    const fd = formatDosis;
    const desc = [...presentaciones].sort((a, b) => b - a); // descendente
    const asc  = [...presentaciones].sort((a, b) => a - b); // ascendente

    // 1 comprimido entero
    for (const p of desc)
        if (Math.abs(dosis - p) < 0.01) return `UN comprimido entero de ${fd(p)} mg`;
    // 2 comprimidos enteros
    for (const p of desc)
        if (Math.abs(dosis - 2 * p) < 0.01) return `DOS comprimidos enteros de ${fd(p)} mg`;
    // medio comprimido
    for (const p of asc)
        if (Math.abs(dosis - p / 2) < 0.01) return `MEDIO comprimido de ${fd(p)} mg`;
    // 1 comprimido y medio
    for (const p of asc)
        if (Math.abs(dosis - p * 1.5) < 0.01) return `UN comprimido y MEDIO de ${fd(p)} mg`;
    // 3 comprimidos
    for (const p of desc)
        if (Math.abs(dosis - 3 * p) < 0.01) return `TRES comprimidos enteros de ${fd(p)} mg`;
    // 4 comprimidos
    for (const p of desc)
        if (Math.abs(dosis - 4 * p) < 0.01) return `CUATRO comprimidos enteros de ${fd(p)} mg`;

    return `${fd(dosis)} mg`;
}

// Extrae el momento de toma de forma breve
function extractMomento(momentoToma: string): string {
    const t = momentoToma.toLowerCase();
    const manana = t.includes("mañana");
    const noche  = t.includes("noche");
    const conAlimentos = t.includes("con alimentos") && !t.includes("con o sin");

    let cuando = "";
    if (manana && noche)  cuando = "por la mañana o por la noche";
    else if (manana)      cuando = "por la mañana";
    else if (noche)       cuando = "por la noche";
    else                  cuando = "una vez al día";

    if (conAlimentos) cuando += ", con alimentos";
    return cuando;
}

// Formatea la duración de un paso en lenguaje natural
function formatDuracion(dias: number): string {
    if (dias === 7)       return "durante una semana";
    if (dias % 7 === 0)  return `durante ${dias / 7} semanas`;
    return `durante ${dias} días`;
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
        const momento = extractMomento(farmaco.momentoToma);

        // Genera una frase por cada paso de la pauta
        const frases = pasos.map((paso, i) => {
            const tablet = describeDosisTablets(paso.dosis, farmaco.presentaciones);
            const esMantenimiento = paso.hasta === null;
            const duracion = esMantenimiento
                ? ""
                : formatDuracion(paso.hasta! - paso.desde + 1);

            if (i === 0) {
                return esMantenimiento
                    ? `Tomará ${tablet} ${momento} y mantener.`
                    : `Tomará ${tablet} ${momento} ${duracion}.`;
            }
            return esMantenimiento
                ? `Posteriormente, ${tablet} ${momento} y mantener.`
                : `Posteriormente, ${tablet} ${momento} ${duracion}.`;
        });

        const pauta = `${farmaco.nombre}. ${frases.join(" ")}`;

        const lines: string[] = [pauta];

        if (indicacion.notas) {
            lines.push("", `Nota: ${indicacion.notas}.`);
        }
        if (farmaco.notasGenerales) {
            lines.push("", `Consideraciones: ${farmaco.notasGenerales}`);
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
                    Volver a Herramientas Farmacológicas
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
                            <p className="text-xs text-slate-500 mb-1">Dosis mínima eficaz</p>
                            <p className="text-lg font-bold">{formatDosis(indicacion.dosisMinima)} mg</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Dosis objetivo</p>
                            <p className="text-lg font-bold">{formatDosis(indicacion.dosisObjetivo)} mg</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Dosis máxima</p>
                            <p className="text-lg font-bold">{formatDosis(indicacion.dosisMaxima)} mg</p>
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
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
    Pill,
    Copy,
    Check,
    AlertCircle,
    AlertTriangle,
    XCircle,
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
    presentaciones: number[];   // mg disponibles (tabletas reales)
    presentacionesVirtuales?: number[];  // escalones intermedios alcanzables partiendo o combinando tabletas
    indicaciones: Indicacion[];
    momentoToma: string;        // mañana / noche / etc.
    efectosAdversosInicio: string[];
    tiempoRespuesta: string;
    contraindicacionesAbsolutas: string[];
    contraindicacionesRelativas: string[];
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
        contraindicacionesAbsolutas: [
            "IMAOs (síndrome serotoninérgico potencialmente mortal; respetar lavado de 14 días)",
            "Pimozida (inhibición CYP2D6 → riesgo de arritmias)",
            "Hipersensibilidad conocida a sertralina",
        ],
        contraindicacionesRelativas: [
            "Epilepsia no controlada",
            "Hepatopatía grave (reducir dosis)",
            "Embarazo, especialmente tercer trimestre (hipertensión pulmonar persistente neonatal)",
            "Anticoagulantes orales o AINEs (aumento del riesgo de sangrado)",
            "Litio u otros serotoninérgicos (riesgo de síndrome serotoninérgico)",
        ],
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
        contraindicacionesAbsolutas: [
            "IMAOs (síndrome serotoninérgico)",
            "Síndrome de QT largo congénito o QTc > 500 ms",
            "Pimozida (riesgo de arritmias graves)",
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Hipopotasemia o hipomagnesemia (riesgo adicional de prolongación QT)",
            "Cardiopatía con tendencia a arritmias",
            "Hepatopatía (dosis máxima 10 mg/día)",
            "Mayores de 65 años (dosis máxima 10–20 mg/día)",
            "Embarazo tercer trimestre (hipertensión pulmonar persistente neonatal)",
        ],
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
        presentacionesVirtuales: [40],  // 2 × 20 mg
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
        contraindicacionesAbsolutas: [
            "IMAOs (respetar lavado de 5 semanas tras suspender fluoxetina por su vida media larga)",
            "Tioridazina y pimozida (inhibición CYP2D6 → arritmias graves)",
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Epilepsia (puede reducir el umbral convulsivo)",
            "Hepatopatía (reducir frecuencia de dosificación)",
            "Trastorno bipolar sin estabilizador (riesgo de viraje maníaco)",
            "Tamoxifeno (inhibición CYP2D6 → reducción de eficacia del tamoxifeno)",
        ],
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
        presentaciones: [10, 20],
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
        contraindicacionesAbsolutas: [
            "IMAOs (síndrome serotoninérgico)",
            "Tioridazina y pimozida",
            "Embarazo (malformaciones cardíacas en primer trimestre; síndrome de abstinencia neonatal)",
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Hepatopatía o insuficiencia renal grave (reducir dosis)",
            "Adultos mayores (alta carga anticolinérgica; usar con precaución)",
            "Epilepsia",
            "Glaucoma de ángulo cerrado",
            "Anticoagulantes orales o AINEs (aumento del riesgo de sangrado)",
        ],
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
        contraindicacionesAbsolutas: [
            "IMAOs (síndrome serotoninérgico)",
            "Síndrome de QT largo congénito o QTc > 500 ms",
            "Pimozida",
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Hipopotasemia o hipomagnesemia (riesgo adicional de prolongación QT)",
            "Cardiopatía con tendencia a arritmias",
            "Hepatopatía (dosis máxima 20 mg/día)",
            "Mayores de 65 años (dosis máxima 20 mg/día)",
        ],
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
        contraindicacionesAbsolutas: [
            "IMAOs (síndrome serotoninérgico)",
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Hipertensión arterial no controlada (monitorizar PA, especialmente a dosis > 150 mg/día)",
            "Cardiopatía (vigilar QT y frecuencia cardíaca)",
            "Glaucoma de ángulo cerrado",
            "Epilepsia",
            "Hepatopatía o insuficiencia renal grave (reducir dosis)",
            "AINEs o anticoagulantes (aumento del riesgo de sangrado)",
        ],
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
        contraindicacionesAbsolutas: [
            "IMAOs (síndrome serotoninérgico)",
            "Glaucoma de ángulo cerrado",
            "Hepatopatía significativa (contraindicación de ficha técnica)",
            "Insuficiencia renal grave (ClCr < 30 mL/min)",
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Hipertensión arterial no controlada",
            "Epilepsia",
            "Cardiopatía",
            "AINEs o anticoagulantes (aumento del riesgo de sangrado)",
        ],
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
        contraindicacionesAbsolutas: [
            "IMAOs (síndrome serotoninérgico)",
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Epilepsia",
            "Hepatopatía (monitorizar transaminasas; reducir dosis si alteración)",
            "Insuficiencia renal (reducir dosis)",
            "Glaucoma de ángulo cerrado",
            "Hipertrofia prostática / retención urinaria (actividad anticolinérgica moderada)",
            "Hipotensión arterial (puede empeorarla)",
        ],
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
        presentacionesVirtuales: [150],  // 1½ × 100 mg (comprimido divisible)
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
        contraindicacionesAbsolutas: [
            "IMAOs (período de lavado necesario)",
            "Priapismo previo relacionado con trazodona (en varones)",
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Cardiopatía con riesgo de arritmias (vigilar QT)",
            "Hepatopatía o insuficiencia renal grave",
            "Hipotensión arterial (puede empeorarla significativamente)",
            "Antihipertensivos (potenciación del efecto hipotensor)",
        ],
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
        contraindicacionesAbsolutas: [
            "Epilepsia o cualquier condición que reduzca el umbral convulsivo (TCE, tumor SNC)",
            "Trastorno de la conducta alimentaria activo (bulimia o anorexia nerviosa)",
            "Abstinencia súbita de alcohol o benzodiacepinas en curso",
            "IMAOs (intervalo mínimo de 14 días)",
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Hepatopatía grave (dosis máxima 150 mg/día)",
            "Antecedentes de traumatismo craneoencefálico",
            "Embarazo y lactancia",
            "Fármacos que reducen el umbral convulsivo (antipsicóticos, antimaláricos, tramadol)",
        ],
        indicaciones: [
            { id: "depresion", nombre: "Trastorno depresivo mayor", dosisMinima: 150, dosisInicialEstandar: 150, dosisInicialLenta: 150, dosisObjetivo: 300, dosisMaxima: 300 },
            { id: "tabaquismo", nombre: "Deshabituación tabáquica", dosisMinima: 150, dosisInicialEstandar: 150, dosisInicialLenta: 150, dosisObjetivo: 300, dosisMaxima: 300 },
            { id: "potenciacion", nombre: "Potenciación en depresión resistente", dosisMinima: 150, dosisInicialEstandar: 150, dosisInicialLenta: 150, dosisObjetivo: 300, dosisMaxima: 300, notas: "Combinado con ISRS/IRSN; útil cuando hay fatiga, disfunción sexual o bajo ánimo sin ansiedad predominante" },
        ],
    },
    {
        id: "vortioxetina",
        nombre: "Vortioxetina",
        marcaEspana: "Brintellix®",
        familia: "Otros antidepresivos",
        presentaciones: [5, 10, 15, 20],
        momentoToma: "1 vez al día, con o sin alimentos",
        efectosAdversosInicio: [
            "Náuseas (muy frecuentes al inicio; suelen remitir en 1-2 semanas)",
            "Vómitos",
            "Cefalea",
            "Mareo",
            "Disfunción sexual (menor que con ISRS)",
        ],
        tiempoRespuesta: "Inicio del efecto a las 2-4 semanas; respuesta máxima a las 6-8 semanas",
        notasGenerales: "Perfil multimodal: inhibición de recaptación de serotonina + agonismo/antagonismo sobre receptores 5-HT. Efecto favorable sobre cognición. Menor disfunción sexual que ISRS. Las náuseas iniciales suelen remitir en 1-2 semanas.",
        contraindicacionesAbsolutas: [
            "IMAOs (síndrome serotoninérgico)",
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Epilepsia",
            "Embarazo y lactancia (datos limitados)",
            "Anticoagulantes orales o AINEs (aumento del riesgo de sangrado)",
            "Hepatopatía grave",
        ],
        indicaciones: [
            { id: "depresion", nombre: "Trastorno depresivo mayor", dosisMinima: 10, dosisInicialEstandar: 10, dosisInicialLenta: 5, dosisObjetivo: 20, dosisMaxima: 20, notas: "Iniciar con 10 mg; si buena tolerancia, aumentar a 20 mg tras ≥2 semanas; puede bajarse a 5 mg/día si mala tolerancia" },
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
        contraindicacionesAbsolutas: [
            "Glaucoma de ángulo cerrado",
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Diabetes mellitus o síndrome metabólico (alta carga metabólica — monitorización estricta)",
            "Dislipemia previa",
            "Adultos mayores con demencia (aumento de mortalidad y riesgo de ACV)",
            "Epilepsia",
            "Enfermedad de Parkinson (puede empeorar los síntomas motores)",
            "Hepatopatía grave",
        ],
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
        contraindicacionesAbsolutas: [
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Adultos mayores con demencia (aumento de mortalidad y riesgo de ACV)",
            "Enfermedad de Parkinson (puede exacerbar los síntomas)",
            "Epilepsia",
            "Cardiopatía (vigilar QT a dosis > 4 mg/día)",
            "Insuficiencia renal o hepática (reducir dosis)",
            "Tumores prolactino-dependientes (hiperprolactinemia)",
        ],
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
        presentacionesVirtuales: [500],  // 200 + 300 mg
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
        contraindicacionesAbsolutas: [
            "Inhibidores potentes de CYP3A4 (ketoconazol, ritonavir, claritromicina — aumentan niveles de quetiapina hasta niveles tóxicos)",
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Adultos mayores con demencia (aumento de mortalidad)",
            "Cardiopatía con riesgo de prolongación QT",
            "Diabetes o síndrome metabólico (carga metabólica moderada-alta)",
            "Hipotiroidismo (puede empeorar la función tiroidea)",
            "Epilepsia",
            "Cataratas (se recomienda revisión oftalmológica periódica)",
        ],
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
        contraindicacionesAbsolutas: [
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Epilepsia",
            "Enfermedad cardiovascular (riesgo bajo de prolongación QT, pero presente)",
            "Trastornos del control de impulsos (ludopatía, hipersexualidad — puede exacerbarlos; informar al paciente)",
            "Adultos mayores con demencia",
        ],
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
        contraindicacionesAbsolutas: [
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Epilepsia",
            "Adultos mayores con demencia",
            "Trastornos del control de impulsos (ludopatía, hipersexualidad — informar al paciente)",
        ],
        indicaciones: [
            { id: "potenciacion", nombre: "Potenciación en depresión mayor", dosisMinima: 1, dosisInicialEstandar: 0.5, dosisInicialLenta: 0.5, dosisObjetivo: 2, dosisMaxima: 3, notas: "Titulación gradual al combinar con antidepresivos; rango habitual 1-3 mg/día" },
            { id: "psicosis", nombre: "Esquizofrenia", dosisMinima: 2, dosisInicialEstandar: 1, dosisInicialLenta: 1, dosisObjetivo: 4, dosisMaxima: 4 },
        ],
    },
    {
        id: "paliperidona",
        nombre: "Paliperidona XR",
        marcaEspana: "Invega®",
        familia: "Antipsicótico atípico",
        presentaciones: [3, 6, 9, 12],
        momentoToma: "1 vez al día por la mañana; tragar entero — nunca partir ni masticar",
        efectosAdversosInicio: [
            "Hiperprolactinemia (elevada — mayor que la mayoría de atípicos)",
            "Síntomas extrapiramidales a dosis altas",
            "Sedación moderada",
            "Aumento de peso",
            "Prolongación del intervalo QT",
        ],
        tiempoRespuesta: "Efecto conductual en días; efecto antipsicótico en 2-4 semanas",
        notasGenerales: "Metabolito activo de la risperidona. Comprimido de matriz OROS: el envoltorio vacío se elimina por heces de forma normal — informar al paciente. Nunca partir ni masticar. También disponible como LAI mensual (Xeplion®) y trimestral (Trevicta®).",
        contraindicacionesAbsolutas: [
            "Hipersensibilidad a paliperidona o a risperidona",
            "QT largo congénito",
        ],
        contraindicacionesRelativas: [
            "Tumores prolactino-dependientes (hiperprolactinemia marcada)",
            "Enfermedad de Parkinson (puede exacerbar síntomas)",
            "Demencia con cuerpos de Lewy",
            "Adultos mayores con demencia (aumento de mortalidad y riesgo de ACV)",
            "Cardiopatía (vigilar QT)",
            "Epilepsia",
            "Insuficiencia renal grave (ajuste de dosis obligatorio según ClCr)",
        ],
        indicaciones: [
            { id: "psicosis", nombre: "Episodio psicótico / esquizofrenia", dosisMinima: 3, dosisInicialEstandar: 6, dosisInicialLenta: 3, dosisObjetivo: 6, dosisMaxima: 12 },
            { id: "mania", nombre: "Trastorno esquizoafectivo / manía", dosisMinima: 6, dosisInicialEstandar: 6, dosisInicialLenta: 3, dosisObjetivo: 9, dosisMaxima: 12 },
        ],
    },
    // ─── ANTIPSICÓTICOS TÍPICOS (FGA) ───
    {
        id: "haloperidol",
        nombre: "Haloperidol",
        marcaEspana: "Haloperidol Kern Pharma®",
        familia: "Antipsicótico típico (FGA)",
        presentaciones: [0.5, 1, 2, 5, 10],
        momentoToma: "1-2 veces al día; toma principal por la noche",
        efectosAdversosInicio: [
            "Síntomas extrapiramidales (acatisia, parkinsonismo, distonía aguda)",
            "Hiperprolactinemia",
            "Sedación moderada",
            "Prolongación del intervalo QT",
            "Hipotensión ortostática",
        ],
        tiempoRespuesta: "Efecto conductual en horas-días; efecto antipsicótico en 2-4 semanas",
        notasGenerales: "Mayor riesgo de SEP que los atípicos. Vigilar QT. Referencia para equivalencias de clorpromazina: 2 mg haloperidol ≈ 100 mg CPZ. También disponible en solución oral (gotas) y presentación depot.",
        contraindicacionesAbsolutas: [
            "Enfermedad de Parkinson y parkinsonismos",
            "Demencia con cuerpos de Lewy",
            "Estado de coma o depresión grave del SNC",
            "Síndrome de QT largo congénito",
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Epilepsia (reduce el umbral convulsivo)",
            "Cardiopatía (vigilar QT; evitar combinar con otros fármacos que prolonguen el QT)",
            "Adultos mayores (mayor riesgo de SEP, caídas y ACV)",
            "Hepatopatía grave",
            "Embarazo tercer trimestre (SEP neonatal transitorio)",
            "Feocromocitoma",
        ],
        indicaciones: [
            { id: "psicosis", nombre: "Episodio psicótico / esquizofrenia", dosisMinima: 2, dosisInicialEstandar: 5, dosisInicialLenta: 2, dosisObjetivo: 10, dosisMaxima: 20 },
            { id: "mania", nombre: "Episodio maníaco", dosisMinima: 5, dosisInicialEstandar: 5, dosisInicialLenta: 2, dosisObjetivo: 10, dosisMaxima: 20 },
            { id: "tics", nombre: "Síndrome de Tourette / tics", dosisMinima: 0.5, dosisInicialEstandar: 0.5, dosisInicialLenta: 0.5, dosisObjetivo: 2, dosisMaxima: 10, notas: "Iniciar con dosis muy bajas y titular de forma muy gradual" },
        ],
    },
    {
        id: "clorpromazina",
        nombre: "Clorpromazina",
        marcaEspana: "Largactil®",
        familia: "Antipsicótico típico (FGA)",
        presentaciones: [25, 100],
        presentacionesVirtuales: [50, 150, 200],  // ½ × 100, 1½ × 100, 2 × 100 mg
        momentoToma: "2-3 veces al día; toma principal por la noche",
        efectosAdversosInicio: [
            "Sedación intensa",
            "Hipotensión ortostática (frecuente)",
            "Síntomas extrapiramidales",
            "Fotosensibilidad (protección solar obligatoria)",
            "Aumento de peso",
        ],
        tiempoRespuesta: "Efecto sedante inmediato; efecto antipsicótico en 2-4 semanas",
        notasGenerales: "Compuesto de referencia para cálculo de equivalencias (100 mg CPZ = 1 unidad). Alta carga anticolinérgica y sedante. Evitar en adultos mayores. Informar sobre fotosensibilidad.",
        contraindicacionesAbsolutas: [
            "Estado de coma o depresión grave del SNC",
            "Feocromocitoma",
            "Agranulocitosis previa por fenotiazinas",
            "Hipersensibilidad conocida a fenotiazinas",
        ],
        contraindicacionesRelativas: [
            "Epilepsia (reduce significativamente el umbral convulsivo)",
            "Adultos mayores (alta carga sedante e hipotensora; riesgo elevado de caídas)",
            "Glaucoma de ángulo cerrado",
            "Hipertrofia prostática / retención urinaria",
            "Cardiopatía (hipotensión ortostática, prolongación QT)",
            "Hepatopatía",
            "Exposición solar sin protección (fotosensibilidad grave — usar protector solar)",
        ],
        indicaciones: [
            { id: "psicosis", nombre: "Episodio psicótico / esquizofrenia", dosisMinima: 75, dosisInicialEstandar: 75, dosisInicialLenta: 25, dosisObjetivo: 300, dosisMaxima: 600 },
            { id: "mania", nombre: "Episodio maníaco / agitación", dosisMinima: 75, dosisInicialEstandar: 100, dosisInicialLenta: 25, dosisObjetivo: 300, dosisMaxima: 600 },
        ],
    },
    {
        id: "zuclopentixol",
        nombre: "Zuclopentixol",
        marcaEspana: "Clopixol®",
        familia: "Antipsicótico típico (FGA)",
        presentaciones: [2, 10, 25],
        momentoToma: "2-3 veces al día; toma principal por la noche",
        efectosAdversosInicio: [
            "Síntomas extrapiramidales (acatisia, parkinsonismo)",
            "Sedación",
            "Hiperprolactinemia",
            "Aumento de peso",
            "Sequedad de boca",
        ],
        tiempoRespuesta: "Efecto conductual en 1-3 días; efecto antipsicótico en 2-4 semanas",
        notasGenerales: "También disponible en formulaciones depot: acetato (Clopixol Acufase®, acción 2-3 días) y decanoato (acción 2-4 semanas). Considerar LAI para pacientes con problemas de adherencia.",
        contraindicacionesAbsolutas: [
            "Enfermedad de Parkinson y parkinsonismos",
            "Demencia con cuerpos de Lewy",
            "Estado de coma o depresión grave del SNC",
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Epilepsia",
            "Cardiopatía (vigilar QT)",
            "Adultos mayores (mayor riesgo de SEP y caídas)",
            "Hepatopatía grave",
            "Feocromocitoma",
        ],
        indicaciones: [
            { id: "psicosis", nombre: "Episodio psicótico / esquizofrenia", dosisMinima: 10, dosisInicialEstandar: 10, dosisInicialLenta: 2, dosisObjetivo: 25, dosisMaxima: 75 },
            { id: "mania", nombre: "Episodio maníaco / agitación", dosisMinima: 10, dosisInicialEstandar: 20, dosisInicialLenta: 10, dosisObjetivo: 25, dosisMaxima: 50 },
        ],
    },
    {
        id: "levomepromazina",
        nombre: "Levomepromazina",
        marcaEspana: "Sinogan®",
        familia: "Antipsicótico típico (FGA)",
        presentaciones: [25, 100],
        momentoToma: "2-3 veces al día; toma principal por la noche (muy sedante)",
        efectosAdversosInicio: [
            "Sedación muy intensa",
            "Hipotensión ortostática grave (especialmente al inicio)",
            "Síntomas extrapiramidales (menos frecuentes que otros FGA)",
            "Aumento de peso",
            "Sequedad de boca y estreñimiento",
        ],
        tiempoRespuesta: "Efecto sedante inmediato; efecto antipsicótico en 2-4 semanas",
        notasGenerales: "Uno de los antipsicóticos más sedantes disponibles. Vigilar hipotensión ortostática — recomendar levantarse despacio. Uso habitual en psicosis refractaria, agitación y cuidados paliativos.",
        contraindicacionesAbsolutas: [
            "Estado de coma o depresión grave del SNC",
            "Feocromocitoma",
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Adultos mayores (sedación extrema e hipotensión ortostática grave; riesgo muy elevado de caídas)",
            "Cardiopatía (hipotensión marcada)",
            "Epilepsia",
            "Hepatopatía o insuficiencia renal",
            "Glaucoma de ángulo cerrado",
            "Hipertrofia prostática",
        ],
        indicaciones: [
            { id: "psicosis", nombre: "Psicosis refractaria / agitación intensa", dosisMinima: 25, dosisInicialEstandar: 25, dosisInicialLenta: 25, dosisObjetivo: 100, dosisMaxima: 300 },
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
        contraindicacionesAbsolutas: [
            "Insuficiencia renal grave (acumulación tóxica inevitable)",
            "Deshidratación severa o deplección de sodio",
            "Embarazo primer trimestre (malformación de Ebstein)",
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Diuréticos tiazídicos, AINEs e IECAs/ARA-II (aumentan niveles de litio — riesgo de intoxicación)",
            "Dieta baja en sodio (aumenta reabsorción renal de litio)",
            "Insuficiencia renal leve-moderada (ajustar dosis; monitorizar con mayor frecuencia)",
            "Hipotiroidismo (vigilar TSH; el litio puede empeorar la función tiroidea)",
            "Embarazo segundo y tercer trimestre (valorar riesgo-beneficio con especialista)",
            "Cardiopatía con trastornos del ritmo",
        ],
        indicaciones: [
            { id: "mania", nombre: "Episodio maníaco agudo", dosisMinima: 400, dosisInicialEstandar: 400, dosisInicialLenta: 400, dosisObjetivo: 800, dosisMaxima: 1800, notas: "Guiar por niveles plasmáticos (objetivo 0.8-1.2 mEq/L en agudo). Ajuste posterior a la dosis inicial según niveles a los 5-7 días — no por escalones fijos." },
            { id: "mantenimiento", nombre: "Mantenimiento trastorno bipolar", dosisMinima: 400, dosisInicialEstandar: 400, dosisInicialLenta: 400, dosisObjetivo: 800, dosisMaxima: 1200, notas: "Guiar por niveles plasmáticos (objetivo 0.6-0.8 mEq/L en mantenimiento)" },
        ],
    },
    {
        id: "valproato",
        nombre: "Ácido valproico",
        marcaEspana: "Depakine®",
        familia: "Estabilizador del ánimo",
        presentaciones: [200, 300, 500],
        presentacionesVirtuales: [700],  // 200 + 500 mg
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
        contraindicacionesAbsolutas: [
            "Hepatopatía grave o hepatitis activa",
            "Mujeres en edad fértil sin doble método anticonceptivo asegurado (síndrome fetal por valproato — teratogenia grave)",
            "Porfiria hepática",
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Coagulopatías (puede inhibir la agregación plaquetaria)",
            "Lactancia (presente en leche materna)",
            "Pancreatitis previa por valproato",
        ],
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
        contraindicacionesAbsolutas: [
            "Hipersensibilidad conocida (especialmente si hubo síndrome de Stevens-Johnson o NET previos con lamotrigina)",
        ],
        contraindicacionesRelativas: [
            "Embarazo primer trimestre (riesgo de fisura palatina — valorar riesgo-beneficio)",
            "Hepatopatía grave (reducir dosis)",
            "Meningitis aséptica previa relacionada con lamotrigina",
            "Combinación con valproato (duplicar tiempo de titulación y reducir dosis a la mitad)",
            "Combinación con carbamazepina u otros inductores enzimáticos (doblar la dosis)",
        ],
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
        contraindicacionesAbsolutas: [
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Antecedente de dependencia a sustancias (pregabalina tiene potencial de abuso reconocido — sujeta a control desde 2019)",
            "Insuficiencia renal (ajuste de dosis obligatorio según ClCr)",
            "Embarazo y lactancia",
            "Combinación con opioides o depresores del SNC (depresión respiratoria aditiva)",
            "Adultos mayores (mayor riesgo de mareo, sedación y caídas)",
        ],
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
        contraindicacionesAbsolutas: [
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Antecedente de dependencia a sustancias (potencial de abuso — vigilar)",
            "Insuficiencia renal (ajuste de dosis obligatorio según ClCr)",
            "Combinación con opioides (depresión respiratoria aditiva; especialmente en EPOC o apnea del sueño)",
            "Adultos mayores (sedación, ataxia, riesgo elevado de caídas)",
        ],
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
        contraindicacionesAbsolutas: [
            "Miastenia gravis",
            "Apnea del sueño grave",
            "Insuficiencia respiratoria grave",
            "Hepatopatía grave (insuficiencia hepática)",
            "Hipersensibilidad conocida a benzodiacepinas",
        ],
        contraindicacionesRelativas: [
            "Antecedente de dependencia a alcohol u otras sustancias",
            "EPOC o insuficiencia respiratoria leve-moderada",
            "Adultos mayores (sedación prolongada por vida media muy larga; riesgo elevado de caídas y deterioro cognitivo)",
            "Depresión mayor (puede empeorar la inhibición psicomotora)",
            "Embarazo tercer trimestre (síndrome del bebé hipotónico)",
        ],
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
        contraindicacionesAbsolutas: [
            "Miastenia gravis",
            "Apnea del sueño grave",
            "Insuficiencia respiratoria grave",
            "Hipersensibilidad conocida a benzodiacepinas",
        ],
        contraindicacionesRelativas: [
            "Antecedente de dependencia a alcohol u otras sustancias",
            "Adultos mayores (sedación, ataxia, riesgo de caídas)",
            "Hepatopatía (preferir lorazepam en hepatopatía significativa)",
            "Depresión mayor",
            "Embarazo (síndrome de abstinencia neonatal)",
        ],
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
        contraindicacionesAbsolutas: [
            "Miastenia gravis",
            "Apnea del sueño grave",
            "Insuficiencia respiratoria grave",
            "Hipersensibilidad conocida a benzodiacepinas",
        ],
        contraindicacionesRelativas: [
            "Antecedente de dependencia a alcohol u otras sustancias",
            "Adultos mayores (aunque preferible a diazepam por vida media más corta y sin metabolitos activos)",
            "Depresión mayor",
            "Embarazo (síndrome de abstinencia neonatal; evitar en primer trimestre)",
        ],
        indicaciones: [
            { id: "ansiedad", nombre: "Ansiedad aguda / crisis de ansiedad", dosisMinima: 0.5, dosisInicialEstandar: 1, dosisInicialLenta: 0.5, dosisObjetivo: 1, dosisMaxima: 4, notas: "Puede usarse sublingual para mayor rapidez de acción" },
            { id: "insomnio", nombre: "Insomnio (corto plazo)", dosisMinima: 0.5, dosisInicialEstandar: 1, dosisInicialLenta: 0.5, dosisObjetivo: 1, dosisMaxima: 2.5, notas: "Dosis única nocturna; máximo 4 semanas" },
        ],
    },
    {
        id: "clorazepato",
        nombre: "Clorazepato dipotásico",
        marcaEspana: "Tranxilium®",
        familia: "Benzodiacepina",
        presentaciones: [5, 10, 15],
        momentoToma: "2-3 veces al día, con o sin alimentos",
        efectosAdversosInicio: [
            "Somnolencia y sedación",
            "Deterioro cognitivo y de la memoria",
            "Tolerancia con uso prolongado",
            "Dependencia física",
            "Síndrome de retirada al suspender",
        ],
        tiempoRespuesta: "Efecto ansiolítico en 30-60 minutos (profármaco — se convierte en nordiazepam en el estómago)",
        notasGenerales: "Profármaco que se convierte en nordiazepam (mismo metabolito activo que el diazepam). Vida media muy larga (30-100 h). Uso limitado a corto plazo (≤4 semanas). Retirada siempre gradual. Evitar en hepatopatía grave, apnea del sueño y adultos mayores.",
        contraindicacionesAbsolutas: [
            "Miastenia gravis",
            "Apnea del sueño grave",
            "Insuficiencia respiratoria grave",
            "Hepatopatía grave (insuficiencia hepática)",
            "Hipersensibilidad conocida a benzodiacepinas",
        ],
        contraindicacionesRelativas: [
            "Antecedente de dependencia a alcohol u otras sustancias",
            "EPOC o insuficiencia respiratoria leve-moderada",
            "Adultos mayores (sedación prolongada por vida media muy larga; riesgo elevado de caídas y deterioro cognitivo)",
            "Depresión mayor",
            "Embarazo tercer trimestre (síndrome del bebé hipotónico)",
        ],
        indicaciones: [
            { id: "ansiedad", nombre: "Ansiedad (corto plazo)", dosisMinima: 5, dosisInicialEstandar: 10, dosisInicialLenta: 5, dosisObjetivo: 15, dosisMaxima: 45, notas: "Dividir en 2-3 tomas al día; máximo 4 semanas; siempre con plan de retirada gradual" },
        ],
    },
    // ─── ESTIMULANTES (TDAH) ───
    {
        id: "metil-ir",
        nombre: "Metilfenidato IR",
        marcaEspana: "Ritalin®, Rubifen®",
        familia: "Estimulante (TDAH)",
        presentaciones: [5, 10, 20],
        momentoToma: "2-3 veces al día: mañana, mediodía y tarde (última toma antes de las 17h); tomar con o antes de las comidas",
        efectosAdversosInicio: [
            "Disminución del apetito y pérdida de peso",
            "Insomnio de conciliación",
            "Cefalea",
            "Irritabilidad o rebote emocional al final del efecto",
            "Elevación de frecuencia cardíaca y tensión arterial",
            "Dolor abdominal",
        ],
        tiempoRespuesta: "Efecto en 30-60 min; duración 4-5 horas por dosis",
        notasGenerales: "Liberación inmediata: duración ~4-5h — requiere 2-3 tomas diarias. La dosis del generador es la DOSIS TOTAL diaria (dividir en tomas, ej: 30 mg/día = 10 mg mañana + 10 mg mediodía + 10 mg tarde). Última toma no después de las 17h para evitar insomnio.",
        contraindicacionesAbsolutas: [
            "Cardiopatía estructural significativa o arritmias graves",
            "Hipertiroidismo o tirotoxicosis",
            "IMAOs (crisis hipertensiva)",
            "Feocromocitoma",
            "Antecedente de dependencia a estimulantes",
            "Glaucoma",
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Hipertensión arterial (monitorizar PA antes y durante el tratamiento)",
            "Tics o síndrome de Tourette (puede exacerbarlos — valorar riesgo-beneficio)",
            "Epilepsia no controlada",
            "Ansiedad intensa o agitación (puede empeorarla)",
            "Trastorno bipolar no estabilizado (riesgo de viraje maníaco)",
            "Embarazo y lactancia",
        ],
        indicaciones: [
            { id: "tdah", nombre: "TDAH niños y adolescentes", dosisMinima: 5, dosisInicialEstandar: 10, dosisInicialLenta: 5, dosisObjetivo: 30, dosisMaxima: 60, notas: "Dosis total diaria — dividir en 2-3 tomas; ajuste semanal; última toma antes de las 17h" },
            { id: "tdah-adulto", nombre: "TDAH adultos", dosisMinima: 10, dosisInicialEstandar: 10, dosisInicialLenta: 5, dosisObjetivo: 40, dosisMaxima: 80, notas: "Dosis total diaria — dividir en 2-3 tomas; algunos adultos requieren dosis más altas" },
        ],
    },
    {
        id: "metil-oros",
        nombre: "Metilfenidato OROS 22/78",
        marcaEspana: "Concerta®",
        familia: "Estimulante (TDAH)",
        presentaciones: [18, 27, 36, 54],
        momentoToma: "1 vez al día por la mañana; tragar entero — nunca partir, masticar ni triturar",
        efectosAdversosInicio: [
            "Disminución del apetito y pérdida de peso",
            "Insomnio (menos frecuente que IR)",
            "Cefalea",
            "Irritabilidad",
            "Elevación de frecuencia cardíaca y tensión arterial",
        ],
        tiempoRespuesta: "Efecto en 1-2h; duración 10-12 horas (22% liberación inmediata + 78% liberación prolongada)",
        notasGenerales: "Sistema OROS de liberación osmótica. El envoltorio vacío e intacto puede aparecer en heces — informar al paciente, es normal. Duración 10-12h: permite cobertura escolar y actividades de tarde. Titulación semanal habitual.",
        contraindicacionesAbsolutas: [
            "Cardiopatía estructural significativa o arritmias graves",
            "Hipertiroidismo o tirotoxicosis",
            "IMAOs (crisis hipertensiva)",
            "Feocromocitoma",
            "Antecedente de dependencia a estimulantes",
            "Glaucoma",
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Hipertensión arterial (monitorizar PA)",
            "Tics o síndrome de Tourette",
            "Epilepsia no controlada",
            "Ansiedad intensa o agitación",
            "Trastorno bipolar no estabilizado",
            "Embarazo y lactancia",
        ],
        indicaciones: [
            { id: "tdah", nombre: "TDAH niños (≥6 años) y adolescentes", dosisMinima: 18, dosisInicialEstandar: 18, dosisInicialLenta: 18, dosisObjetivo: 36, dosisMaxima: 54, notas: "Titulación semanal: 18 → 36 → 54 mg; evaluar respuesta y tolerabilidad cada semana" },
            { id: "tdah-adulto", nombre: "TDAH adultos", dosisMinima: 18, dosisInicialEstandar: 18, dosisInicialLenta: 18, dosisObjetivo: 36, dosisMaxima: 54 },
        ],
    },
    {
        id: "metil-medikinet",
        nombre: "Metilfenidato LP 50/50",
        marcaEspana: "Medikinet®",
        familia: "Estimulante (TDAH)",
        presentaciones: [5, 10, 20, 30, 40, 50, 60],
        momentoToma: "1 vez al día con el desayuno; la cápsula puede abrirse y mezclarse con alimentos blandos sin masticar las microesferas",
        efectosAdversosInicio: [
            "Disminución del apetito y pérdida de peso",
            "Insomnio",
            "Cefalea",
            "Irritabilidad",
            "Elevación de frecuencia cardíaca y tensión arterial",
        ],
        tiempoRespuesta: "Efecto en 30-60 min; duración 6-8 horas (50% liberación inmediata + 50% liberación prolongada)",
        notasGenerales: "Perfil bimodal 50/50: inicio de acción rápido + segunda fase que prolonga el efecto. Administrar siempre con el desayuno. La cápsula puede abrirse y mezclarse — nunca masticar las microesferas.",
        contraindicacionesAbsolutas: [
            "Cardiopatía estructural significativa o arritmias graves",
            "Hipertiroidismo o tirotoxicosis",
            "IMAOs (crisis hipertensiva)",
            "Feocromocitoma",
            "Antecedente de dependencia a estimulantes",
            "Glaucoma",
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Hipertensión arterial (monitorizar PA)",
            "Tics o síndrome de Tourette",
            "Epilepsia no controlada",
            "Ansiedad intensa o agitación",
            "Trastorno bipolar no estabilizado",
            "Embarazo y lactancia",
        ],
        indicaciones: [
            { id: "tdah", nombre: "TDAH niños (≥6 años) y adolescentes", dosisMinima: 10, dosisInicialEstandar: 10, dosisInicialLenta: 5, dosisObjetivo: 30, dosisMaxima: 60, notas: "Ajuste semanal; tomar siempre con el desayuno" },
            { id: "tdah-adulto", nombre: "TDAH adultos", dosisMinima: 10, dosisInicialEstandar: 20, dosisInicialLenta: 10, dosisObjetivo: 40, dosisMaxima: 80 },
        ],
    },
    {
        id: "metil-equasym",
        nombre: "Metilfenidato LP 30/70",
        marcaEspana: "Equasym®",
        familia: "Estimulante (TDAH)",
        presentaciones: [10, 20, 30],
        momentoToma: "1 vez al día 30 min antes del desayuno o con el desayuno; la cápsula puede abrirse y mezclarse con alimentos blandos",
        efectosAdversosInicio: [
            "Disminución del apetito y pérdida de peso",
            "Insomnio",
            "Cefalea",
            "Irritabilidad",
            "Elevación de frecuencia cardíaca y tensión arterial",
        ],
        tiempoRespuesta: "Efecto en 30-60 min; duración ~8 horas (30% liberación inmediata + 70% liberación prolongada)",
        notasGenerales: "Perfil bimodal 30/70: inicio de acción rápido con liberación predominantemente prolongada. Duración ~8h. La cápsula puede abrirse — nunca masticar las microesferas. Presentaciones máximas de 30 mg.",
        contraindicacionesAbsolutas: [
            "Cardiopatía estructural significativa o arritmias graves",
            "Hipertiroidismo o tirotoxicosis",
            "IMAOs (crisis hipertensiva)",
            "Feocromocitoma",
            "Antecedente de dependencia a estimulantes",
            "Glaucoma",
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Hipertensión arterial (monitorizar PA)",
            "Tics o síndrome de Tourette",
            "Epilepsia no controlada",
            "Ansiedad intensa o agitación",
            "Trastorno bipolar no estabilizado",
            "Embarazo y lactancia",
        ],
        indicaciones: [
            { id: "tdah", nombre: "TDAH niños (≥6 años) y adolescentes", dosisMinima: 10, dosisInicialEstandar: 10, dosisInicialLenta: 10, dosisObjetivo: 20, dosisMaxima: 30, notas: "Presentaciones hasta 30 mg/día; para dosis mayores usar otra formulación" },
        ],
    },
    {
        id: "lisdexanfetamina",
        nombre: "Lisdexanfetamina",
        marcaEspana: "Elvanse®",
        familia: "Estimulante (TDAH)",
        presentaciones: [20, 30, 40, 50, 60, 70],
        momentoToma: "1 vez al día por la mañana, con o sin alimentos; la cápsula puede abrirse y disolverse en agua",
        efectosAdversosInicio: [
            "Disminución marcada del apetito y pérdida de peso",
            "Insomnio",
            "Boca seca",
            "Cefalea",
            "Irritabilidad",
            "Elevación de frecuencia cardíaca y tensión arterial",
            "Ansiedad",
        ],
        tiempoRespuesta: "Efecto en 1-2h; duración 13-14 horas (profármaco de dexanfetamina)",
        notasGenerales: "Profármaco: se convierte en dexanfetamina activa en sangre — el proceso de conversión reduce el potencial de abuso por inhalación o inyección. Mayor duración que metilfenidato. La cápsula puede abrirse y disolverse en agua. También indicada en trastorno por atracón (BED) en adultos.",
        contraindicacionesAbsolutas: [
            "Cardiopatía estructural significativa o arritmias graves",
            "Hipertiroidismo o tirotoxicosis",
            "IMAOs (crisis hipertensiva potencialmente mortal)",
            "Feocromocitoma",
            "Antecedente de dependencia a estimulantes o anfetaminas",
            "Anorexia nerviosa activa",
            "Glaucoma",
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Hipertensión arterial (monitorizar PA)",
            "Tics o síndrome de Tourette",
            "Epilepsia no controlada",
            "Ansiedad intensa o agitación",
            "Trastorno bipolar no estabilizado (riesgo de viraje maníaco)",
            "Embarazo y lactancia",
        ],
        indicaciones: [
            { id: "tdah", nombre: "TDAH niños (≥6 años) y adolescentes", dosisMinima: 20, dosisInicialEstandar: 30, dosisInicialLenta: 20, dosisObjetivo: 50, dosisMaxima: 70, notas: "Ajuste mensual habitual; evaluar respuesta y tolerabilidad" },
            { id: "tdah-adulto", nombre: "TDAH adultos", dosisMinima: 20, dosisInicialEstandar: 30, dosisInicialLenta: 20, dosisObjetivo: 50, dosisMaxima: 70 },
            { id: "atracones", nombre: "Trastorno por atracón (BED)", dosisMinima: 50, dosisInicialEstandar: 30, dosisInicialLenta: 30, dosisObjetivo: 50, dosisMaxima: 70, notas: "Dosis mínima eficaz en BED: 50 mg/día; ajustar según respuesta hasta 70 mg si necesario" },
        ],
    },
    // ─── NO ESTIMULANTE (TDAH) ───
    {
        id: "atomoxetina",
        nombre: "Atomoxetina",
        marcaEspana: "Strattera®",
        familia: "No estimulante (TDAH)",
        presentaciones: [10, 18, 25, 40, 60, 80, 100],
        momentoToma: "1 vez al día (o dividida en 2 tomas si hay efectos GI); tomar con o sin alimentos",
        efectosAdversosInicio: [
            "Náuseas y dolor abdominal (frecuentes al inicio; mejorar tomando con alimentos)",
            "Disminución del apetito",
            "Somnolencia o insomnio",
            "Elevación de frecuencia cardíaca y tensión arterial",
            "Irritabilidad inicial (primeras semanas)",
        ],
        tiempoRespuesta: "Efecto completo a las 4-6 semanas — no tiene efecto inmediato como los estimulantes",
        notasGenerales: "Inhibidor selectivo de la recaptación de norepinefrina — NO es un estimulante. Sin potencial de abuso. Efecto a las 4-6 semanas. Preferible a estimulantes en: dependencia a sustancias, tics significativos, ansiedad comórbida importante. Monitorizar PA, FC y transaminasas.",
        contraindicacionesAbsolutas: [
            "IMAOs (hipersensibilidad adrenérgica grave)",
            "Glaucoma de ángulo cerrado",
            "Cardiopatía estructural significativa o arritmias graves",
            "Feocromocitoma",
            "Hipersensibilidad conocida",
        ],
        contraindicacionesRelativas: [
            "Hipertensión arterial (monitorizar PA y FC)",
            "Hepatopatía (vigilar transaminasas; raro: hepatotoxicidad grave — suspender si ictericia o elevación marcada)",
            "Epilepsia",
            "Trastorno bipolar sin estabilizador (puede precipitar manía)",
            "Embarazo y lactancia",
        ],
        indicaciones: [
            { id: "tdah", nombre: "TDAH niños (≥6 años) y adolescentes", dosisMinima: 40, dosisInicialEstandar: 40, dosisInicialLenta: 18, dosisObjetivo: 60, dosisMaxima: 100, notas: "Iniciar a 0.5 mg/kg/día; objetivo 1.2 mg/kg/día; evaluar respuesta a las 4-6 semanas" },
            { id: "tdah-adulto", nombre: "TDAH adultos", dosisMinima: 40, dosisInicialEstandar: 40, dosisInicialLenta: 25, dosisObjetivo: 80, dosisMaxima: 100, notas: "Iniciar 40 mg/día; tras 4 semanas sin respuesta suficiente, aumentar a 80-100 mg/día" },
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

    // Caso especial litio: ajuste guiado por niveles plasmáticos, no por escalones fijos
    if (farmaco.id === "litio") {
        const nivelObjetivo = indicacion.id === "mania" ? "0.8–1.2 mEq/L" : "0.6–0.8 mEq/L";
        // Rápida (ingreso hospitalario): iniciar directamente a 800 mg/día con controles frecuentes
        if (velocidad === "rapida") {
            return [
                { desde: 1, hasta: null, dosis: 800, descripcion: `Desde el día 1: 800 mg/día (2 comp de 400 mg) — controlar niveles cada 3-5 días y ajustar hasta alcanzar objetivo ${nivelObjetivo}` },
            ];
        }
        // Estándar y lenta: iniciar a 400 mg/día y subir a los 7 o 14 días
        const diasPrimerEscalon = velocidad === "lenta" ? 14 : 7;
        return [
            { desde: 1, hasta: diasPrimerEscalon, dosis: 400, descripcion: `Días 1-${diasPrimerEscalon}: 400 mg/día (1 comp de 400 mg)` },
            { desde: diasPrimerEscalon + 1, hasta: null, dosis: 800, descripcion: `Día ${diasPrimerEscalon + 1} en adelante: 800 mg/día — ajustar según niveles plasmáticos cada 5-7 días (objetivo ${nivelObjetivo})` },
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
    const presentaciones = [...farmaco.presentaciones, ...(farmaco.presentacionesVirtuales ?? [])].sort((a, b) => a - b);

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
    // combinación de dos tamaños distintos (ej. 200 mg + 300 mg)
    for (let i = 0; i < asc.length; i++)
        for (let j = i + 1; j < asc.length; j++)
            if (Math.abs(dosis - asc[i] - asc[j]) < 0.01)
                return `UN comprimido de ${fd(asc[i])} mg + UN comprimido de ${fd(asc[j])} mg`;

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
    const [aviso, setAviso] = useState(true);
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

            {/* Aviso legal */}
            {aviso && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <h2 className="text-base font-semibold text-slate-800">Aviso importante</h2>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Esta herramienta tiene <strong>fines orientativos y educativos</strong>.
                            La información proporcionada puede contener errores o no reflejar
                            las particularidades clínicas de cada paciente.
                        </p>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            <strong>No sustituye en ningún caso el criterio clínico del profesional sanitario.</strong>{" "}
                            La responsabilidad de cualquier decisión terapéutica recae
                            exclusivamente en el médico prescriptor.
                        </p>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Verifique siempre la información con fuentes oficiales y la ficha
                            técnica del medicamento antes de prescribir.
                        </p>
                        <div className="flex flex-col gap-2 pt-1">
                            <button
                                onClick={() => setAviso(false)}
                                className="w-full rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
                            >
                                Entendido, continuar
                            </button>
                            <Link
                                href="/tools/calculadoras-clinicas"
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors text-center"
                            >
                                Salir de la herramienta
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Pill className="w-7 h-7 text-slate-700" />
                    <div>
                        <h1 className="text-2xl font-semibold">Generador de pauta terapéutica</h1>
                        <p className="text-sm text-slate-600">
                            Pauta de titulación recomendada para informe clínico
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

                {/* Contraindicaciones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2.5">
                            <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                            <p className="text-sm font-semibold text-red-800">Contraindicaciones absolutas</p>
                        </div>
                        {farmaco.contraindicacionesAbsolutas.length === 0 ? (
                            <p className="text-xs text-red-500 italic">Ninguna registrada</p>
                        ) : (
                            <ul className="space-y-1.5">
                                {farmaco.contraindicacionesAbsolutas.map((c, i) => (
                                    <li key={i} className="text-xs text-red-700 flex items-start gap-2">
                                        <span className="text-red-400 shrink-0 mt-0.5">✕</span>
                                        {c}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <p className="text-sm font-semibold text-amber-800">Precauciones y contraindicaciones relativas</p>
                        </div>
                        {farmaco.contraindicacionesRelativas.length === 0 ? (
                            <p className="text-xs text-amber-500 italic">Ninguna registrada</p>
                        ) : (
                            <ul className="space-y-1.5">
                                {farmaco.contraindicacionesRelativas.map((c, i) => (
                                    <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
                                        <span className="text-amber-400 shrink-0 mt-0.5">⚠</span>
                                        {c}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Tabla de pasos */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Pauta de titulación recomendada</h3>
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
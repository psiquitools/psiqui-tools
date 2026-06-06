"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Check, X, Share2 } from "lucide-react";

/* ===================== TIPOS ===================== */

type Diagnostico = {
  nombre: string;
  alias?: string[];
  pistas: string[];
};

/* ===================== DATOS ===================== */

const DIAGNOSTICOS: Diagnostico[] = [
  {
    nombre: "Trastorno Depresivo Mayor",
    alias: ["Depresión Mayor", "TDM", "Episodio Depresivo Mayor"],
    pistas: [
      "Trastorno del estado de ánimo. Más prevalente en mujeres (ratio ~2:1). Inicio frecuente en la adultez joven. Alta tasa de recurrencia a lo largo de la vida.",
      "Curso episódico. Duración mínima de cada episodio: 2 semanas. A lo largo de la vida no hay episodios maníacos ni hipomaníacos.",
      "Síntomas cardinales: estado de ánimo deprimido la mayor parte del día casi todos los días y/o pérdida marcada de interés o placer en actividades habitualmente placenteras.",
      "Síntomas acompañantes posibles: alteraciones del sueño, del apetito o el peso, fatiga, dificultad de concentración, sentimientos de inutilidad o culpa excesiva, agitación o enlentecimiento psicomotriz.",
      "Criterio A: 5 o más síntomas durante el mismo período de 2 semanas, incluyendo al menos uno de los dos síntomas cardinales.",
      "Puede presentarse con características psicóticas, melancólicas, atípicas o catatónicas. Si hay antecedente de episodio maníaco o hipomaníaco, el diagnóstico cambia.",
    ],
  },
  {
    nombre: "Trastorno Bipolar I",
    alias: ["Bipolar tipo I", "TAB I", "TB-I"],
    pistas: [
      "Trastorno del estado de ánimo. Prevalencia vital ~1%. Distribución similar en hombres y mujeres. Inicio frecuente en la segunda o tercera década.",
      "Curso episódico con alta tasa de recurrencia. Alto riesgo de hospitalización y de cronicidad.",
      "Definido por la presencia de al menos un episodio maníaco de duración mínima de 7 días (o cualquier duración si requiere hospitalización o hay características psicóticas).",
      "El episodio maníaco incluye ánimo elevado/expansivo o irritable con aumento anómalo de energía o actividad, acompañado de: disminución de necesidad de sueño, grandiosidad, habla acelerada, fuga de ideas, distractibilidad, conductas de riesgo.",
      "Los síntomas del episodio maníaco causan deterioro funcional marcado, requieren hospitalización o se acompañan de características psicóticas.",
      "Los episodios depresivos son frecuentes pero no son necesarios para el diagnóstico. Se distingue del tipo II por la presencia de manía completa.",
    ],
  },
  {
    nombre: "Trastorno Bipolar II",
    alias: ["Bipolar tipo II", "TAB II", "TB-II"],
    pistas: [
      "Trastorno del estado de ánimo. Prevalencia vital ~1.1%. Algo más frecuente en mujeres. Alta comorbilidad con ansiedad y trastornos de la personalidad.",
      "Curso episódico con alta tasa de recurrencia. Los períodos depresivos predominan sobre los hipomaníacos en términos de duración.",
      "Requiere la presencia de al menos un episodio hipomaníaco y al menos un episodio depresivo mayor a lo largo de la vida.",
      "El episodio hipomaníaco dura al menos 4 días consecutivos y comparte síntomas con la manía, pero es de menor intensidad.",
      "A diferencia de la manía, el episodio hipomaníaco no causa deterioro funcional marcado, no requiere hospitalización y no hay características psicóticas.",
      "Criterio excluyente: NUNCA ha habido un episodio maníaco completo. Si aparece manía plena, el diagnóstico cambia a tipo I.",
    ],
  },
  {
    nombre: "Trastorno Depresivo Persistente",
    alias: ["Distimia", "Trastorno Distímico"],
    pistas: [
      "Trastorno del estado de ánimo de curso crónico. Prevalencia ~2%. Más frecuente en mujeres. Inicio habitualmente insidioso en la infancia, adolescencia o adultez temprana.",
      "El paciente a menudo describe el estado de ánimo deprimido como parte de su carácter: 'siempre he sido así', 'es mi forma de ser'.",
      "Estado de ánimo deprimido la mayor parte del día, la mayoría de los días, durante al menos 2 años (1 año en niños y adolescentes).",
      "Síntomas acompañantes: al menos 2 de estos: alteraciones del apetito, del sueño, baja energía o fatiga, baja autoestima, dificultad de concentración o para decidir, desesperanza.",
      "Durante el período de 2 años, el individuo nunca ha estado sin síntomas más de 2 meses consecutivos.",
      "Puede coexistir con episodios depresivos mayores (denominado 'doble depresión'). Se excluye si hay antecedente de manía, hipomanía o ciclotimia.",
    ],
  },
  {
    nombre: "Ciclotimia",
    alias: ["Trastorno Ciclotímico"],
    pistas: [
      "Trastorno del estado de ánimo de curso crónico. Prevalencia ~0.4-1%. Similar en hombres y mujeres. Inicio en la adolescencia o adultez temprana.",
      "Considerado una forma más leve y subumbral de trastorno bipolar. Tasa de conversión a bipolar I o II estimada en 15-50%.",
      "Presencia de numerosos períodos con síntomas hipomaníacos que no cumplen criterios completos de episodio hipomaníaco.",
      "Alternados con numerosos períodos con síntomas depresivos que no cumplen criterios para un episodio depresivo mayor. Duración mínima: 2 años.",
      "Durante los 2 años, el individuo no ha estado sin síntomas durante más de 2 meses consecutivos.",
      "Los síntomas no son lo suficientemente graves ni duraderos para cumplir criterios de ningún episodio del estado de ánimo definido.",
    ],
  },
  {
    nombre: "Trastorno de Ansiedad Generalizada",
    alias: ["TAG", "Ansiedad Generalizada"],
    pistas: [
      "Trastorno de ansiedad. Prevalencia vital ~5.7%. Más frecuente en mujeres. Puede iniciarse a cualquier edad.",
      "Curso crónico y fluctuante. Alta comorbilidad con trastorno depresivo mayor y otros trastornos de ansiedad.",
      "Ansiedad y preocupación excesivas por múltiples áreas (trabajo, salud, finanzas, familia), presentes la mayor parte del tiempo.",
      "La preocupación es difícil de controlar y se extiende a múltiples temas, no limitada a una sola situación.",
      "Síntomas físicos acompañantes: inquietud, fatiga fácil, dificultad de concentración, irritabilidad, tensión muscular, alteraciones del sueño. El DSM-5-TR exige al menos 3 de estos 6 síntomas; la CIE-11 no establece un umbral numérico.",
      "Criterio de duración: al menos 6 meses en ambos sistemas. Los síntomas causan malestar clínico significativo o deterioro funcional.",
    ],
  },
  {
    nombre: "Trastorno de Pánico",
    alias: ["Trastorno de Angustia", "Pánico"],
    pistas: [
      "Trastorno de ansiedad. Prevalencia ~2-3%. Más frecuente en mujeres. Inicio típico en la adultez joven.",
      "Ataques recurrentes e inesperados de miedo o malestar intenso que alcanzan su pico en minutos.",
      "Síntomas físicos durante el ataque: palpitaciones, sudoración, temblor, disnea, sensación de ahogo, dolor torácico, náuseas, mareo, parestesias, escalofríos o sofocos.",
      "Síntomas cognitivos durante el ataque: desrealización o despersonalización, miedo a perder el control o a volverse loco, miedo a morir.",
      "Al menos un ataque ha sido seguido de 1 mes o más de preocupación persistente por sufrir más ataques, o de cambio desadaptativo del comportamiento.",
      "Criterio clave: los ataques son inesperados (no situacionales), aunque con el tiempo pueden también aparecer ataques situacionales.",
    ],
  },
  {
    nombre: "Agorafobia",
    alias: [],
    pistas: [
      "Trastorno de ansiedad. Prevalencia ~1.7%. Más frecuente en mujeres (ratio ~2:1). Curso crónico si no se trata.",
      "Miedo o ansiedad marcados ante al menos 2 de los siguientes tipos de situaciones: transporte público, espacios abiertos, espacios cerrados, filas o multitudes, fuera de casa solo.",
      "El temor surge porque la persona piensa que escapar sería difícil o que no podría recibir ayuda si aparecieran síntomas incapacitantes.",
      "Las situaciones temidas se evitan, se afrontan solo con ansiedad intensa, o se requiere compañía de otra persona.",
      "El miedo es desproporcionado al peligro real y persiste al menos 6 meses. Causa malestar o deterioro funcional significativo.",
      "Puede diagnosticarse con o sin trastorno de pánico concurrente. Cuando coexisten, ambos se codifican por separado.",
    ],
  },
  {
    nombre: "Fobia Social",
    alias: ["Trastorno de Ansiedad Social"],
    pistas: [
      "Trastorno de ansiedad. Prevalencia vital ~12%. Inicio típico en la adolescencia (edad media ~13 años). Curso crónico.",
      "Alta comorbilidad con trastorno depresivo mayor y uso nocivo de alcohol, frecuentemente como automedicación.",
      "Miedo o ansiedad marcados ante situaciones sociales en las que el individuo puede ser observado o evaluado por otros.",
      "El temor es a actuar de modo humillante o embarazoso, ser rechazado o mostrar síntomas visibles de ansiedad (rubor, voz temblorosa, sudoración).",
      "Las situaciones sociales casi siempre provocan miedo o ansiedad intensa y se evitan o se soportan con gran malestar. Duración: al menos 6 meses.",
      "Puede ser específico de actuación en público o generalizado (la mayoría de las interacciones sociales). El miedo central es a la evaluación negativa de los demás.",
    ],
  },
  {
    nombre: "Trastorno de Estrés Postraumático",
    alias: ["TEPT", "PTSD"],
    pistas: [
      "Trastorno relacionado con traumas. Prevalencia vital ~6.8%. Más frecuente en mujeres. Alta comorbilidad con depresión, ansiedad y uso de sustancias.",
      "Aparece tras exposición a muerte, lesión grave o violencia sexual, real o amenazada, de forma directa, como testigo, por conocimiento de que ocurrió a un ser querido, o por exposición repetida a detalles del trauma.",
      "Síntomas de reexperimentación: recuerdos intrusivos involuntarios, pesadillas, flashbacks (reacciones disociativas), malestar intenso o reacciones fisiológicas ante recordatorios del trauma.",
      "Síntomas de evitación: evitación activa de pensamientos o sentimientos relacionados con el trauma, y de personas, lugares o situaciones que los recuerden.",
      "Hiperactivación: hipervigilancia, respuesta de sobresalto exagerada, irritabilidad o agresividad, dificultad de concentración, alteraciones del sueño. Duración mínima: 1 mes.",
      "Diferencia clave entre sistemas: el DSM-5-TR añade un 4.º clúster (alteraciones cognitivas y del estado de ánimo: amnesia disociativa, creencias negativas, culpa, embotamiento, anhedonia) que la CIE-11 NO incluye en el TEPT simple — esos rasgos, junto con la disregulación afectiva y las alteraciones de la identidad, configuran en la CIE-11 el TEPT Complejo (6B41), entidad diagnóstica separada.",
    ],
  },
  {
    nombre: "Trastorno Obsesivo-Compulsivo",
    alias: ["TOC", "OCD"],
    pistas: [
      "Trastorno obsesivo-compulsivo y relacionados. Prevalencia vital ~1-2%. Similar en hombres y mujeres. Inicio típico en la adolescencia o adultez temprana.",
      "Curso crónico y fluctuante. Alta comorbilidad con depresión mayor, ansiedad y trastornos de tics.",
      "Presencia de obsesiones, compulsiones o ambas. Las obsesiones son pensamientos, impulsos o imágenes recurrentes, no deseados, que generan ansiedad o malestar marcados.",
      "Las compulsiones son comportamientos repetitivos (lavado, comprobación, orden) o actos mentales (contar, rezar, repetir palabras) realizados para neutralizar el malestar de las obsesiones.",
      "Las obsesiones o compulsiones consumen más de 1 hora al día, o causan malestar o deterioro funcional significativo.",
      "Insight variable: puede ser bueno (reconoce que sus creencias son probablemente falsas), escaso o ausente. El individuo reconoce las obsesiones como propias, a diferencia del pensamiento delirante.",
    ],
  },
  {
    nombre: "Esquizofrenia",
    alias: [],
    pistas: [
      "Trastorno psicótico. Prevalencia ~1%. Distribución similar en hombres y mujeres, aunque el inicio es más temprano en varones (15-25 vs. 25-35 años).",
      "Curso crónico. La mayoría de pacientes experimenta síntomas residuales entre episodios y deterioro funcional a lo largo del tiempo.",
      "Síntomas positivos: alucinaciones (más frecuentes auditivas), delirios, pensamiento o comportamiento desorganizado, catatonía.",
      "Síntomas negativos: aplanamiento afectivo, alogia, abulia, anhedonia, asocialidad. Son los que más se relacionan con el deterioro funcional.",
      "Criterio A: al menos 2 síntomas durante 1 mes, siendo al menos uno: alucinaciones, delirios o discurso desorganizado.",
      "Diferencia clave entre sistemas: el DSM-5-TR exige al menos 6 meses de signos continuos del trastorno (incluyendo fases prodrómicas y residuales) con deterioro del nivel funcional previo. La CIE-11 no establece este criterio de duración prolongada; solo requiere que los síntomas activos hayan estado presentes la mayor parte del tiempo durante al menos 1 mes.",
    ],
  },
  {
    nombre: "Trastorno Esquizoafectivo",
    alias: [],
    pistas: [
      "Trastorno del espectro psicótico. Prevalencia ~0.3%. Algo más frecuente en mujeres. Evolución intermedia entre esquizofrenia y trastorno bipolar.",
      "Combina de forma persistente características de esquizofrenia y de trastornos del estado de ánimo.",
      "Criterio A: en el mismo período de enfermedad coexisten síntomas del criterio A de esquizofrenia Y un episodio mayor del estado de ánimo (maníaco o depresivo mayor).",
      "Criterio clave: delirios o alucinaciones presentes durante al menos 2 semanas en ausencia de un episodio mayor del estado de ánimo, en algún momento de la enfermedad.",
      "Los síntomas del estado de ánimo están presentes durante la mayor parte de la duración total de las fases activa y residual.",
      "Subtipos: tipo bipolar (incluye episodios maníacos) y tipo depresivo (solo episodios depresivos mayores).",
    ],
  },
  {
    nombre: "Trastorno Delirante",
    alias: [],
    pistas: [
      "Trastorno psicótico. Prevalencia ~0.2%. Inicio típico en la mediana edad o más tarde. Algo más frecuente en mujeres.",
      "Funcionamiento global relativamente conservado. Fuera del impacto del delirio, el comportamiento no es claramente desorganizado ni extravagante.",
      "Presencia de uno o más delirios de duración de al menos 1 mes, sin que estén presentes otros síntomas del criterio A de esquizofrenia.",
      "Tipos de delirio: erotomaníaco, de grandiosidad, celotípico, persecutorio (el más frecuente), somático, mixto o sin especificar.",
      "Si hay alucinaciones, son breves y directamente relacionadas con el tema del delirio, no prominentes ni independientes.",
      "El insight suele estar ausente o muy limitado. Los pacientes raramente consultan de forma espontánea; habitualmente son traídos por familiares.",
    ],
  },
  {
    nombre: "Psicosis Breve",
    alias: ["Trastorno Psicótico Breve", "Trastorno Psicótico Agudo y Transitorio", "TPAT"],
    pistas: [
      "Trastorno psicótico poco frecuente. Más común en mujeres. Inicio típico en la adultez joven o mediana edad. Sin período prodrómico identificable.",
      "Inicio súbito de síntomas psicóticos floridos (el DSM-5-TR no exige inicio en menos de 2 semanas; la CIE-11 sí: en el Trastorno Psicótico Agudo y Transitorio el inicio debe ser brusco, en menos de 2 semanas).",
      "Al menos uno de los siguientes síntomas: delirios, alucinaciones, discurso desorganizado, comportamiento gravemente desorganizado o catatónico.",
      "Duración máxima del episodio: menos de 1 mes en el DSM-5-TR. La CIE-11 permite hasta 3 meses para su equivalente (Trastorno Psicótico Agudo y Transitorio, 6A23).",
      "Recuperación funcional completa al nivel premórbido al término del episodio en ambos sistemas.",
      "Puede asociarse o no a un estresor marcado. El DSM-5-TR contempla un especificador de inicio posparto. Se distingue de la esquizofrenia por la corta duración y la recuperación completa.",
    ],
  },
  {
    nombre: "Trastorno por Déficit de Atención e Hiperactividad",
    alias: ["TDAH", "ADHD", "Déficit de Atención e Hiperactividad"],
    pistas: [
      "Trastorno del neurodesarrollo. Prevalencia ~5% en niños, ~2.5% en adultos. Más diagnosticado en varones, aunque las diferencias en prevalencia real son menores.",
      "Los síntomas deben estar presentes antes de los 12 años de edad y manifestarse en al menos dos contextos diferentes.",
      "Patrón persistente de inatención y/o hiperactividad-impulsividad que interfiere con el funcionamiento o el desarrollo.",
      "Inatención: errores por descuido, dificultad para mantener la atención, parece no escuchar, no sigue instrucciones, dificultad para organizar tareas, pierde objetos, se distrae fácilmente, olvidos frecuentes.",
      "Hiperactividad-impulsividad: inquietud, abandona el asiento, corre o trepa en situaciones inapropiadas, habla en exceso, responde antes de terminar la pregunta, dificultad para esperar, interrumpe.",
      "Presentaciones: predominio inatento, predominio hiperactivo-impulsivo y combinado. Se requieren 6 síntomas por dimensión (5 en adultos ≥17 años).",
    ],
  },
  {
    nombre: "Trastorno del Espectro Autista",
    alias: ["TEA", "Autismo"],
    pistas: [
      "Trastorno del neurodesarrollo. Prevalencia ~1-2%. Aproximadamente 4 veces más diagnosticado en varones.",
      "Los síntomas están presentes desde el período de desarrollo temprano, aunque pueden no manifestarse plenamente hasta que las demandas sociales superan las capacidades.",
      "Deficiencias persistentes en la comunicación e interacción social en múltiples contextos: déficits en reciprocidad socioemocional, en comunicación no verbal y en el desarrollo y mantenimiento de relaciones.",
      "Patrones restrictivos y repetitivos de comportamiento, intereses o actividades: estereotipias motoras o del habla, insistencia en la invariabilidad, intereses muy restringidos e intensos, hiper o hiporreactividad sensorial.",
      "Los síntomas causan deterioro funcionalmente significativo. No se explican mejor por discapacidad intelectual ni por retraso global del desarrollo.",
      "El nivel de gravedad se especifica según el apoyo necesario (nivel 1, 2 o 3) tanto en comunicación social como en comportamientos restrictivos.",
    ],
  },
  {
    nombre: "Trastorno de Tourette",
    alias: ["Síndrome de Tourette", "Tourette"],
    pistas: [
      "Trastorno de tics. Prevalencia ~0.3-0.9%. Mucho más frecuente en varones (ratio 3-4:1). Inicio obligatoriamente en la infancia.",
      "Los tics son movimientos o vocalizaciones súbitos, rápidos, recurrentes y no rítmicos.",
      "A lo largo de la evolución del trastorno han estado presentes múltiples tics motores y al menos un tic vocal.",
      "Los tics motores y los tics vocales no tienen que ocurrir simultáneamente.",
      "Los tics han estado presentes durante más de 1 año desde el inicio del primer tic.",
      "El inicio es antes de los 18 años. Alta comorbilidad con TDAH (~50% de los casos) y TOC (~25-30%).",
    ],
  },
  {
    nombre: "Trastorno Límite de la Personalidad",
    alias: ["TLP", "Borderline", "Trastorno de Personalidad Límite", "BPD"],
    pistas: [
      "Trastorno de la personalidad. Prevalencia ~1.6-5.9%. Marcadamente más frecuente en mujeres en muestras clínicas (ratio ~3:1). El DSM-5-TR lo incluye en el grupo B; la CIE-11 emplea un modelo dimensional y lo captura mediante el especificador de patrón límite (6D11.5) sobre el diagnóstico de trastorno de la personalidad.",
      "Patrón general de inestabilidad en las relaciones interpersonales, la autoimagen y los afectos, con impulsividad marcada, desde la adultez temprana.",
      "Esfuerzos desesperados para evitar el abandono real o imaginado. Relaciones inestables e intensas que oscilan entre idealización extrema y devaluación.",
      "Alteración de la identidad: autoimagen o sentido del yo marcadamente inestables. Impulsividad en al menos dos áreas autodestructivas (gasto, sexo, sustancias, conducción, atracones).",
      "Comportamientos, intentos o amenazas suicidas recurrentes, o conductas autolesivas. Inestabilidad afectiva debida a una reactividad del estado de ánimo muy intensa y breve.",
      "Sensación crónica de vacío. Ira intensa o dificultad para controlarla. Ideación paranoide transitoria o síntomas disociativos graves relacionados con el estrés.",
    ],
  },
  {
    nombre: "Trastorno Antisocial de la Personalidad",
    alias: ["TASP", "Trastorno Disocial de la Personalidad"],
    pistas: [
      "Trastorno de la personalidad. Prevalencia ~3% en varones, ~1% en mujeres. Muy prevalente en contextos forenses y penitenciarios. El DSM-5-TR lo clasifica en el grupo B; la CIE-11 emplea un modelo dimensional con el especificador de patrón disocial (6D11.2).",
      "Patrón general de desprecio y violación de los derechos de los demás, que comienza desde los 15 años y persiste en la adultez.",
      "Incumplimiento repetido de normas sociales y legales; engaño y manipulación para beneficio o placer propios; impulsividad o incapacidad para planificar el futuro.",
      "Irritabilidad y agresividad recurrentes; despreocupación imprudente por la seguridad propia o ajena; irresponsabilidad persistente (laboral, económica).",
      "Ausencia de remordimiento: indiferencia o racionalización del daño causado a otras personas.",
      "Diferencia clave: en el DSM-5-TR se exige que el individuo tenga al menos 18 años Y haya cumplido criterios de Trastorno de Conducta con inicio antes de los 15 años. La CIE-11 no requiere antecedente de Trastorno de Conducta en la infancia para el diagnóstico en adultos.",
    ],
  },
  {
    nombre: "Trastorno Narcisista de la Personalidad",
    alias: ["TNP"],
    pistas: [
      "Trastorno de la personalidad. Prevalencia ~0.5-1%. Más frecuente en varones. Alta comorbilidad con trastornos del estado de ánimo. Presente como categoría en el DSM-5-TR (grupo B); la CIE-11 no incluye un especificador de patrón narcisista: las características de grandiosidad y explotación se capturan dentro del dominio de disocialidad del modelo dimensional.",
      "Patrón de grandiosidad, necesidad de admiración y falta de empatía, desde la adultez temprana.",
      "Sentido exagerado de autoimportancia; expectativa de ser reconocido como superior sin logros que lo justifiquen; preocupación por fantasías de éxito ilimitado, poder o belleza.",
      "Cree ser 'especial' y solo puede relacionarse con personas de alto estatus. Necesita admiración excesiva. Sentido de privilegio: expectativas de trato favorable.",
      "Explotación interpersonal; falta de empatía; envidia de los demás o creencia de que le envidian. Actitudes arrogantes o soberbias.",
      "La presentación puede ser manifiesta (dominante, autopromocionada) o encubierta (hipersensibilidad a la crítica, retirada resentida y callada).",
    ],
  },
  {
    nombre: "Trastorno Paranoide de la Personalidad",
    alias: ["TPP"],
    pistas: [
      "Trastorno de la personalidad. Prevalencia estimada ~2-4%. Algo más frecuente en varones. Presente como categoría en el DSM-5-TR (grupo A); la CIE-11 no incluye un especificador de patrón paranoide: la desconfianza y suspicacia pervasivas se capturan dentro del dominio de afectividad negativa y detachment del modelo dimensional.",
      "Desconfianza y suspicacia generalizadas e injustificadas hacia los demás, interpretando sus intenciones como maliciosas, desde la adultez temprana.",
      "Sospecha, sin base suficiente, de que los demás le explotan, le hacen daño o le engañan.",
      "Preocupación por dudas no justificadas sobre la lealtad de amigos o socios. Gran reticencia a confiar porque teme que la información sea usada en su contra.",
      "Interpreta comentarios benignos como ataques; guarda rencor durante largo tiempo; reacciona con ira ante lo que percibe como agresiones o humillaciones.",
      "Sospecha injustificada y recurrente de infidelidad en la pareja. Los síntomas son egosintónicos: los vive como respuesta justificada a un entorno hostil, no como problema propio.",
    ],
  },
  {
    nombre: "Anorexia Nerviosa",
    alias: ["AN"],
    pistas: [
      "Trastorno de la conducta alimentaria. Prevalencia vital ~0.9% en mujeres, ~0.3% en varones. Inicio típico en la adolescencia. Uno de los trastornos mentales con mayor mortalidad.",
      "La mortalidad se debe a complicaciones médicas de la desnutrición (arritmias, fallo orgánico) y al suicidio.",
      "Restricción persistente de la ingesta energética que conduce a un peso corporal significativamente bajo para la edad, el sexo y la salud física.",
      "Miedo intenso a ganar peso o a convertirse en obeso/a, o conductas persistentes que interfieren con el aumento de peso, incluso con peso muy bajo.",
      "Alteración de la percepción del peso o la silueta; influencia excesiva del peso en la autoevaluación; falta de reconocimiento de la gravedad del bajo peso actual.",
      "Subtipos: restrictivo (sin atracones ni purgas en los últimos 3 meses) y compulsivo/purgativo. Gravedad especificada según IMC.",
    ],
  },
  {
    nombre: "Bulimia Nerviosa",
    alias: ["BN"],
    pistas: [
      "Trastorno de la conducta alimentaria. Prevalencia vital ~1-3%. Marcadamente más frecuente en mujeres. Inicio típico en la adolescencia tardía o adultez temprana.",
      "A diferencia de la anorexia, el peso suele estar en el rango normal o ligeramente elevado.",
      "Episodios recurrentes de atracones: ingestión en un período corto (habitualmente 2 horas) de una cantidad de alimentos muy superior a la habitual, con sensación de pérdida de control.",
      "Comportamientos compensatorios inapropiados y recurrentes para evitar el aumento de peso: vómito autoinducido, laxantes o diuréticos, ayuno, ejercicio excesivo.",
      "Los atracones y comportamientos compensatorios ocurren al menos una vez a la semana durante 3 meses.",
      "La autoevaluación está excesivamente influenciada por el peso y la silueta. No se produce exclusivamente durante episodios de anorexia nerviosa.",
    ],
  },
  {
    nombre: "Trastorno de Insomnio",
    alias: ["Insomnio Crónico", "Insomnio"],
    pistas: [
      "Trastorno del sueño-vigilia. Prevalencia ~6-10%. Más frecuente en mujeres y personas de mayor edad. Factor de riesgo para trastornos del estado de ánimo.",
      "Insatisfacción con la cantidad o calidad del sueño con quejas de: dificultad para conciliar el sueño, despertares frecuentes nocturnos, o despertar precoz sin poder volver a dormir.",
      "Produce malestar clínicamente significativo o deterioro en el funcionamiento diario (laboral, social, rendimiento).",
      "El problema se presenta al menos 3 noches a la semana durante al menos 3 meses.",
      "Ocurre a pesar de que existen condiciones adecuadas para dormir (entorno y tiempo disponible suficientes).",
      "No se explica mejor por otro trastorno del sueño (apnea, síndrome de piernas inquietas, trastorno circadiano) ni por sustancias o medicamentos.",
    ],
  },
  {
    nombre: "Narcolepsia",
    alias: [],
    pistas: [
      "Trastorno del sueño-vigilia. Prevalencia ~0.02-0.04%. Similar en hombres y mujeres. Inicio típico en la adolescencia o adultez temprana.",
      "Necesidad imperiosa de dormir o períodos de adormecimiento que se producen dentro del mismo día, múltiples veces a la semana, durante al menos 3 meses.",
      "Se requiere al menos uno de: cataplejía; hipocretina-1 en LCR ≤110 pg/mL; o latencia REM ≤8 min en polisomnografía + test de latencias múltiples del sueño.",
      "La cataplejía es la pérdida súbita bilateral del tono muscular voluntario con conciencia preservada, desencadenada típicamente por emociones positivas intensas (risa, sorpresa).",
      "Fenómenos acompañantes: alucinaciones hipnagógicas (al inicio del sueño), hipnopómpicas (al despertar) y parálisis del sueño.",
      "Etiología más frecuente: déficit de hipocretina/orexina por pérdida de neuronas hipocretinérgicas del hipotálamo lateral, posiblemente autoinmune.",
    ],
  },
  {
    nombre: "Tricotilomanía",
    alias: ["Trastorno de Arrancamiento de Cabello"],
    pistas: [
      "Trastorno obsesivo-compulsivo y relacionados. Prevalencia ~1-2%. Mucho más frecuente en mujeres en muestras clínicas.",
      "Inicio típico en la infancia tardía o adolescencia. Curso crónico sin tratamiento. Alta comorbilidad con TOC y trastornos del estado de ánimo.",
      "Arrancamiento recurrente del propio cabello que lleva a pérdida capilar visible.",
      "El individuo realiza intentos repetidos de reducir o dejar de arrancarse el cabello.",
      "El comportamiento causa malestar clínicamente significativo o deterioro en el funcionamiento social o laboral.",
      "No se debe a una afección dermatológica ni a otro trastorno mental (como el trastorno dismórfico corporal, donde la motivación es eliminar un defecto percibido en la apariencia).",
    ],
  },
  {
    nombre: "Trastorno de Conversión",
    alias: ["Trastorno de Síntomas Neurológicos Funcionales", "Trastorno Disociativo de Síntomas Neurológicos"],
    pistas: [
      "Clasificación diferente según el sistema: el DSM-5-TR lo ubica en el capítulo de trastornos de síntomas somáticos y relacionados (F44); la CIE-11 lo clasifica en los trastornos disociativos como Trastorno Disociativo de Síntomas Neurológicos (6B60). Frecuente en contextos neurológicos y de urgencias. Más diagnosticado en mujeres.",
      "Alta comorbilidad con trastornos de ansiedad y trastornos depresivos.",
      "Uno o más síntomas de alteración de la función motora voluntaria o sensitiva: debilidad o parálisis, movimientos anómalos (temblor, distonía), trastorno de la marcha, síntomas sensitivos.",
      "Puede incluir ataques epilépticos no epilépticos (crisis psicógenas), síntomas de voz (afonía, disartria) o síntomas visuales.",
      "Los hallazgos clínicos aportan evidencia de incompatibilidad con enfermedades neurológicas reconocidas: signo de Hoover, variabilidad del síntoma, respuesta a la distracción.",
      "Es un diagnóstico positivo, no de exclusión: la incompatibilidad neurológica debe confirmarse. No se explica mejor por otra enfermedad médica o mental.",
    ],
  },
  {
    nombre: "Trastorno de Ajuste",
    alias: [],
    pistas: [
      "Trastorno relacionado con traumas y factores de estrés. Prevalencia alta en contextos clínicos (5-20% en psiquiatría de enlace y atención primaria).",
      "Síntomas emocionales o conductuales en respuesta a un estresante identificable, de cualquier naturaleza.",
      "El inicio de los síntomas se produce dentro de los 3 meses siguientes al inicio del estresante.",
      "Los síntomas son clínicamente significativos: malestar desproporcionado a la gravedad del estresante (considerando el contexto cultural), o deterioro funcional significativo.",
      "Los síntomas no representan duelo normal y no cumplen criterios de otro trastorno mental específico.",
      "Una vez que el estresante termina, los síntomas no persisten más de 6 meses. Subtipos: con estado de ánimo depresivo, con ansiedad, mixto, con alteración del comportamiento.",
    ],
  },
  {
    nombre: "Trastorno Disfórico Premenstrual",
    alias: ["TDPM", "PMDD"],
    pistas: [
      "Trastorno depresivo. Prevalencia ~1.8-5.8% de mujeres en edad fértil. Mayor riesgo en mujeres con historia personal o familiar de depresión.",
      "Síntomas que aparecen de forma consistente en la fase lútea (semana antes de la menstruación) y remiten en los días siguientes al inicio de la menstruación.",
      "Síntomas emocionales en la última semana premenstrual: labilidad afectiva marcada, irritabilidad o ira intensa, disforia (tristeza, desesperanza, pensamientos de autodesaprobación), ansiedad o sensación de estar al límite.",
      "Al menos uno de los síntomas debe ser: labilidad afectiva marcada, irritabilidad o disforia marcadas, o ansiedad marcada.",
      "Síntomas adicionales posibles: dificultad de concentración, letargo, cambios de apetito, hipersomnia o insomnio, síntomas físicos (mastalgia, distensión, hinchazón).",
      "Los síntomas se deben confirmar con registros diarios prospectivos durante al menos 2 ciclos. Causan deterioro funcional significativo y no se explican por exacerbación de otro trastorno.",
    ],
  },
  {
    nombre: "Trastorno Esquizotípico de la Personalidad",
    alias: ["Trastorno Esquizotípico", "Trastorno Esquizotípico (Personalidad)"],
    pistas: [
      "Clasificación diferente según el sistema: el DSM-5-TR lo incluye en el capítulo de trastornos de la personalidad (grupo A) Y en el espectro de la esquizofrenia; la CIE-11 lo clasifica únicamente como trastorno del espectro de la esquizofrenia (6A22), no como trastorno de la personalidad. Prevalencia ~3%. Similar en hombres y mujeres.",
      "Relacionado genéticamente con la esquizofrenia (más frecuente en familiares de primer grado de personas con esquizofrenia).",
      "Patrón de deficiencias sociales e interpersonales marcadas con malestar agudo por las relaciones cercanas, distorsiones cognitivas o perceptivas y conductas excéntricas.",
      "Ideas de referencia (sin delirios formales); pensamiento mágico; experiencias perceptivas inusuales; pensamiento y lenguaje raros (vago, metafórico, elaborado).",
      "Desconfianza o ideación paranoide; afecto inapropiado o constreñido; comportamiento o apariencia raros o excéntricos; falta de amigos íntimos.",
      "A diferencia de la esquizofrenia, los síntomas psicóticos francos (delirios, alucinaciones) están ausentes o son muy breves. No se produce exclusivamente durante el curso de un trastorno psicótico.",
    ],
  },
  {
    nombre: "Trastorno de Acumulación",
    alias: ["Síndrome de Diógenes (parcial)", "Hoarding"],
    pistas: [
      "Trastorno obsesivo-compulsivo y relacionados. Prevalencia ~2-6%. Algo más frecuente en varones. Inicio en la infancia o adolescencia, pero suele diagnosticarse en la mediana edad.",
      "Dificultad persistente para deshacerse o separarse de posesiones, independientemente de su valor real.",
      "Esta dificultad se debe a una necesidad percibida de guardar los objetos y al malestar asociado a deshacerse de ellos.",
      "La dificultad para descartar posesiones produce la acumulación de artículos que abarrotan y desordenan áreas del hogar hasta el punto de comprometer su uso previsto.",
      "Los síntomas causan malestar clínicamente significativo o deterioro en el funcionamiento social, laboral u otras áreas.",
      "El comportamiento no se explica por los síntomas de otro trastorno mental (p. ej., obsesiones en el TOC, déficit energético en la depresión, pérdida de motivación en la esquizofrenia).",
    ],
  },
  {
    nombre: "Trastorno de Despersonalización / Desrealización",
    alias: ["Trastorno Disociativo de Despersonalización", "Despersonalización"],
    pistas: [
      "Trastorno disociativo. Prevalencia ~1-2%. Similar en hombres y mujeres. Inicio típico en la adolescencia o adultez temprana.",
      "Episodios persistentes o recurrentes del fenómeno, que pueden durar desde minutos hasta años.",
      "Experiencias de despersonalización: sensación de ser un observador externo de los propios pensamientos, sentimientos, sensaciones o cuerpo; sensación de irrealidad o de estar como en un sueño.",
      "Experiencias de desrealización: sensación de irrealidad del entorno (el mundo se percibe irreal, distante, artificial, onírico).",
      "Criterio clave: durante los episodios, la evaluación de la realidad se mantiene intacta. El individuo sabe que lo que experimenta no es literalmente real.",
      "Los síntomas causan malestar clínico significativo o deterioro funcional. No se explican por sustancias, otra afección médica ni otro trastorno mental.",
    ],
  },
];

/* ===================== LÓGICA ===================== */

const MAX_INTENTOS = 6;

function getDiagnosticoDelDia(): { diagnostico: Diagnostico; numero: number } {
  const hoy = new Date();
  const referencia = new Date(2025, 0, 1);
  const diasTranscurridos = Math.floor(
    (hoy.getTime() - referencia.getTime()) / (1000 * 60 * 60 * 24)
  );
  const indice = ((diasTranscurridos % DIAGNOSTICOS.length) + DIAGNOSTICOS.length) % DIAGNOSTICOS.length;
  return { diagnostico: DIAGNOSTICOS[indice], numero: diasTranscurridos + 1 };
}

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

function esCorrecto(intento: string, diagnostico: Diagnostico): boolean {
  const n = normalizar(intento);
  if (normalizar(diagnostico.nombre) === n) return true;
  return (diagnostico.alias ?? []).some((a) => normalizar(a) === n);
}

const TODOS_LOS_NOMBRES = DIAGNOSTICOS.flatMap((d) => [
  d.nombre,
  ...(d.alias ?? []),
]);

/* ===================== COMPONENTE ===================== */

export default function DSMdle() {
  const [montado, setMontado] = useState(false);
  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(null);
  const [numero, setNumero] = useState(0);
  const [intentos, setIntentos] = useState<string[]>([]);
  const [ganado, setGanado] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [input, setInput] = useState("");
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [compartido, setCompartido] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sugerenciasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { diagnostico: d, numero: n } = getDiagnosticoDelDia();
    setDiagnostico(d);
    setNumero(n);

    const guardado = localStorage.getItem(`dsmdle-${n}`);
    if (guardado) {
      try {
        const estado = JSON.parse(guardado);
        setIntentos(estado.intentos ?? []);
        setGanado(estado.ganado ?? false);
        setGameOver(estado.gameOver ?? false);
      } catch {
        // ignore
      }
    }

    setMontado(true);
  }, []);

  useEffect(() => {
    if (!montado || !diagnostico) return;
    if (intentos.length > 0 || ganado || gameOver) {
      localStorage.setItem(
        `dsmdle-${numero}`,
        JSON.stringify({ intentos, ganado, gameOver })
      );
    }
  }, [intentos, ganado, gameOver, montado, numero, diagnostico]);

  useEffect(() => {
    const cerrar = (e: MouseEvent) => {
      if (
        sugerenciasRef.current &&
        !sugerenciasRef.current.contains(e.target as Node)
      ) {
        setSugerencias([]);
      }
    };
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, []);

  const handleInput = useCallback((value: string) => {
    setInput(value);
    if (value.length < 2) {
      setSugerencias([]);
      return;
    }
    const nv = normalizar(value);
    const filtradas = TODOS_LOS_NOMBRES.filter((d) =>
      normalizar(d).includes(nv)
    ).slice(0, 6);
    setSugerencias(filtradas);
  }, []);

  const adivinar = useCallback(() => {
    if (!diagnostico || !input.trim() || ganado || gameOver) return;
    const trimmed = input.trim();
    const correcto = esCorrecto(trimmed, diagnostico);
    const nuevos = [...intentos, trimmed];
    setIntentos(nuevos);
    setInput("");
    setSugerencias([]);

    if (correcto) {
      setGanado(true);
    } else if (nuevos.length >= MAX_INTENTOS) {
      setGameOver(true);
    }
  }, [diagnostico, input, intentos, ganado, gameOver]);

  const compartir = useCallback(async () => {
    if (!diagnostico) return;
    const emojis = intentos
      .map((_, i) => {
        if (ganado && i === intentos.length - 1) return "🟢";
        return "🔴";
      })
      .join("");
    const blancos = "⬛".repeat(MAX_INTENTOS - intentos.length);
    const resumen = ganado
      ? `DSMdle #${numero} 🧠\n✅ Adiviné en ${intentos.length}/${MAX_INTENTOS}\n${emojis}${blancos}\npsiqui.tools/tools/dsmdle`
      : `DSMdle #${numero} 🧠\n❌ No lo adiviné\n${emojis}\npsiqui.tools/tools/dsmdle`;
    await navigator.clipboard.writeText(resumen);
    setCompartido(true);
    setTimeout(() => setCompartido(false), 2000);
  }, [diagnostico, intentos, ganado, numero]);

  if (!montado || !diagnostico) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-600 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const pistasVisibles = ganado || gameOver
    ? MAX_INTENTOS
    : Math.min(intentos.length + 1, MAX_INTENTOS);

  const finished = ganado || gameOver;
  const intentosFallidos = ganado
    ? intentos.slice(0, -1)
    : intentos;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/60">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-300 text-sm flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <div className="text-center">
            <div className="font-bold text-base tracking-tight">
              DSM<span className="text-indigo-400">dle</span>
            </div>
            <div className="text-xs text-slate-500">#{numero}</div>
          </div>
          <div className="text-sm text-slate-500 w-16 text-right">
            {!finished
              ? `${MAX_INTENTOS - intentos.length} restante${MAX_INTENTOS - intentos.length !== 1 ? "s" : ""}`
              : ""}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-3">

        {/* Instrucciones (solo al inicio) */}
        {intentos.length === 0 && !finished && (
          <p className="text-xs text-slate-500 text-center pb-1">
            Adivina el diagnóstico a partir de las pistas clínicas. Con cada intento fallido se revela una nueva pista.
          </p>
        )}

        {/* Pistas */}
        <div className="space-y-2">
          {Array.from({ length: MAX_INTENTOS }).map((_, i) => {
            const revelada = i < pistasVisibles;
            return (
              <div
                key={i}
                className={`rounded-lg px-4 py-3 border transition-all duration-300 ${
                  revelada
                    ? "bg-slate-800 border-slate-600"
                    : "bg-slate-800/20 border-slate-800"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`text-xs font-bold shrink-0 mt-0.5 w-4 ${
                      revelada ? "text-indigo-400" : "text-slate-700"
                    }`}
                  >
                    {i + 1}
                  </span>
                  {revelada ? (
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {diagnostico.pistas[i]}
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-700">
                      <Lock className="w-3.5 h-3.5" />
                      <span className="text-sm">Pista {i + 1}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Intentos fallidos */}
        {intentosFallidos.length > 0 && (
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-wider mb-2">
              Intentos incorrectos
            </p>
            <div className="flex flex-wrap gap-2">
              {intentosFallidos.map((intento, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/60 border border-red-900/60 rounded-full text-sm text-red-400"
                >
                  <X className="w-3 h-3 shrink-0" />
                  {intento}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        {!finished && (
          <div className="relative" ref={sugerenciasRef}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") adivinar();
                if (e.key === "Escape") setSugerencias([]);
              }}
              placeholder="Escribe un diagnóstico DSM-5..."
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoComplete="off"
              spellCheck={false}
            />
            {sugerencias.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg overflow-hidden z-20 shadow-2xl">
                {sugerencias.map((s) => (
                  <button
                    key={s}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setInput(s);
                      setSugerencias([]);
                      inputRef.current?.focus();
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 transition-colors border-b border-slate-700/50 last:border-0"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!finished && (
          <button
            onClick={adivinar}
            disabled={!input.trim()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm font-semibold transition-all"
          >
            Adivinar
          </button>
        )}

        {/* Estado final */}
        {finished && (
          <div
            className={`rounded-xl p-6 text-center border ${
              ganado
                ? "bg-emerald-950/60 border-emerald-800"
                : "bg-red-950/60 border-red-900"
            }`}
          >
            {ganado ? (
              <>
                <div className="w-12 h-12 bg-emerald-900/60 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-lg font-bold text-emerald-300 mb-1">
                  ¡Correcto!
                </p>
                <p className="text-sm text-emerald-600 mb-1">
                  {intentos.length === 1
                    ? "Adivinado con solo 1 pista"
                    : `Adivinado en ${intentos.length} de ${MAX_INTENTOS} intentos`}
                </p>
                <p className="text-base font-semibold text-white mb-5">
                  {diagnostico.nombre}
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-3">
                  <X className="w-6 h-6 text-red-400" />
                </div>
                <p className="text-lg font-bold text-red-300 mb-1">
                  Sin más intentos
                </p>
                <p className="text-xs text-slate-500 mb-1">Era:</p>
                <p className="text-xl font-bold text-white mb-5">
                  {diagnostico.nombre}
                </p>
              </>
            )}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={compartir}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  compartido
                    ? "bg-emerald-700 text-white"
                    : "bg-white text-slate-900 hover:bg-slate-100"
                }`}
              >
                {compartido ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                {compartido ? "¡Copiado!" : "Compartir resultado"}
              </button>
              <p className="text-xs text-slate-600">
                Vuelve mañana para un nuevo diagnóstico
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

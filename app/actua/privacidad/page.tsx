import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad — Actua",
  description: "Política de privacidad de la aplicación Actua",
  robots: "noindex",
};

const secciones = [
  {
    titulo: "¿Quién es el responsable?",
    contenido:
      "Actua es una aplicación desarrollada por Juan Manuel Ferreyro Meza, médico residente de psiquiatría. Para cualquier consulta relacionada con tu privacidad, puedes escribir a: psiqui.tools@gmail.com",
  },
  {
    titulo: "¿Qué información guarda Actua?",
    contenido:
      "Actua guarda únicamente la información que tú introduces en la aplicación: tu nombre, tu estado de ánimo diario, las actividades que completas cada día, tus respuestas a los cuestionarios PHQ-9 y GAD-7, las actividades de autocuidado que registras, y tus preferencias de notificaciones.",
  },
  {
    titulo: "¿Dónde se guarda esa información?",
    contenido:
      "Toda la información se guarda exclusivamente en tu dispositivo. Actua no tiene servidores propios, no crea cuentas de usuario y no envía ningún dato a internet. Nadie más —ni el desarrollador, ni terceros— tiene acceso a lo que registras en la aplicación.",
  },
  {
    titulo: "¿Comparte Actua mis datos con alguien?",
    contenido:
      "No. Actua no comparte, vende ni transmite ningún dato personal a terceros.",
  },
  {
    titulo: "¿Usa Actua servicios de análisis o publicidad?",
    contenido:
      "No. Actua no incorpora herramientas de analítica, publicidad ni seguimiento de ningún tipo.",
  },
  {
    titulo: "Notificaciones",
    contenido:
      "Si activas los recordatorios, Actua programa notificaciones locales en tu dispositivo. Estas notificaciones no implican ningún envío de datos a servidores externos.",
  },
  {
    titulo: "¿Cómo puedo eliminar mis datos?",
    contenido:
      "Puedes eliminar toda la información guardada por Actua desinstalando la aplicación de tu dispositivo. Al desinstalarla, todos los datos se borran de forma permanente.",
  },
  {
    titulo: "Cambios en esta política",
    contenido:
      "Si en el futuro se realizaran cambios relevantes en el funcionamiento de la app que afecten a la privacidad, esta política se actualizará y se indicará la nueva fecha en el encabezado.",
  },
];

export default function PrivacidadActua() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">

        {/* Encabezado */}
        <div className="mb-12 border-b border-slate-200 pb-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-slate-400">
            Actua
          </p>
          <h1 className="mb-3 text-2xl font-semibold text-slate-800">
            Política de privacidad
          </h1>
          <p className="text-sm text-slate-400">Última actualización: junio de 2026</p>
        </div>

        {/* Secciones */}
        <div className="space-y-10">
          {secciones.map((seccion) => (
            <section key={seccion.titulo}>
              <h2 className="mb-2 text-sm font-semibold text-slate-800">
                {seccion.titulo}
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">
                {seccion.contenido}
              </p>
            </section>
          ))}
        </div>

        {/* Contacto */}
        <div className="mt-12 border-t border-slate-200 pt-8">
          <p className="mb-1 text-sm font-semibold text-slate-800">Contacto</p>
          <a
            href="mailto:psiqui.tools@gmail.com"
            className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            psiqui.tools@gmail.com
          </a>
        </div>

      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Calendar,
    Plus,
    Trash2,
    Edit2,
    FileDown,
    ArrowLeft,
    History,
    AlignLeft,
} from "lucide-react";
import jsPDF from "jspdf";

/* ===================== TIPOS ===================== */

interface ClinicalEvent {
    id: string;
    date: string;
    description: string;
}

/* ===================== COMPONENTE ===================== */

export default function OrganizadorAntecedentesPage() {
    const [events, setEvents] = useState<ClinicalEvent[]>([]);
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);

    /* ===================== LÓGICA ===================== */

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !description.trim()) return;

        if (editingId) {
            setEvents((prev) =>
                prev.map((ev) =>
                    ev.id === editingId ? { ...ev, date, description } : ev
                )
            );
            setEditingId(null);
        } else {
            setEvents((prev) => [
                ...prev,
                { id: crypto.randomUUID(), date, description },
            ]);
        }
        resetForm();
    };

    const resetForm = () => {
        setDate("");
        setDescription("");
        setEditingId(null);
    };

    const handleEdit = (event: ClinicalEvent) => {
        setDate(event.date);
        setDescription(event.description);
        setEditingId(event.id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = (id: string) => {
        if (confirm("¿Eliminar este evento?")) {
            setEvents((prev) => prev.filter((ev) => ev.id !== id));
            if (editingId === id) resetForm();
        }
    };

    /* ===================== ORDEN ===================== */

    const sortedEvents = [...events].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    /* ===================== PDF ===================== */

    const generatePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 20;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(30, 41, 59);
        doc.text("Antecedentes Psiquiátricos", 20, y);

        y += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Generado el ${new Date().toLocaleDateString()}`, 20, y);

        y += 14;

        const chronological = [...events].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        chronological.forEach((event) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(30, 41, 59);
            doc.text(new Date(event.date).toLocaleDateString(), 20, y);

            y += 6;

            doc.setFont("helvetica", "normal");
            doc.setTextColor(51, 65, 85);
            const lines = doc.splitTextToSize(event.description, pageWidth - 40);
            doc.text(lines, 20, y);

            y += lines.length * 6 + 6;
        });

        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("psiqui.tools", 20, 290);

        window.open(doc.output("bloburl"), "_blank");
    };

    /* ===================== UI ===================== */

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">

                {/* Volver */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a psiqui.tools
                </Link>

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-800">
                            Organizador de Antecedentes Psiquiátricos
                        </h1>
                        <p className="text-sm text-slate-600">
                            Línea de tiempo clínica estructurada
                        </p>
                    </div>

                    <button
                        onClick={generatePDF}
                        disabled={events.length === 0}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                        <FileDown className="w-4 h-4" />
                        Exportar PDF
                    </button>
                </div>

                {/* Contenido */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Formulario */}
                    <div className="md:col-span-1">
                        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Plus className="w-5 h-5 text-emerald-600" />
                                {editingId ? "Editar evento" : "Nuevo evento"}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Fecha</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            required
                                            className="w-full pl-10 pr-3 py-2 border rounded-lg bg-slate-50"
                                        />
                                        <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Descripción
                                    </label>
                                    <textarea
                                        rows={6}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                        className="w-full border rounded-lg p-2 bg-slate-50 resize-none"
                                        placeholder="Urgencias, ingresos, tratamientos, evolución..."
                                    />
                                </div>

                                <div className="flex gap-2">
                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="flex-1 border rounded-lg py-2"
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        className="flex-1 bg-slate-800 text-white rounded-lg py-2"
                                    >
                                        {editingId ? "Actualizar" : "Añadir"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Línea de tiempo */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <History className="w-5 h-5 text-slate-500" />
                                Línea de tiempo
                            </h2>
                            <span className="text-xs bg-slate-200 px-2 py-1 rounded-full">
                                {events.length} registros
                            </span>
                        </div>

                        {sortedEvents.length === 0 ? (
                            <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
                                <AlignLeft className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                <p className="text-slate-500 text-sm">
                                    Aún no hay eventos registrados
                                </p>
                            </div>
                        ) : (
                            sortedEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="bg-white border border-slate-200 rounded-xl p-5"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-semibold bg-slate-100 px-2 py-1 rounded">
                                            {new Date(event.date).toLocaleDateString()}
                                        </span>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(event)}>
                                                <Edit2 className="w-4 h-4 text-blue-600" />
                                            </button>
                                            <button onClick={() => handleDelete(event.id)}>
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                        {event.description}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
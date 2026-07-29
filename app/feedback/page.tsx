import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FeedbackSection from "../components/FeedbackSection";

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-5 py-10">
        <Link
          href="/prueba"
          className="mb-10 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <FeedbackSection />
      </div>
    </div>
  );
}

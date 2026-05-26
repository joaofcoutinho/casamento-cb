import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import Divisor from "@/components/Divisor";

export const metadata: Metadata = {
  title: "Presença Confirmada — Cynthia & Benhur",
  description: "Sua inscrição para o casamento foi registrada.",
};

// Página de confirmação independente. O fluxo principal do formulário exibe a
// confirmação inline; esta rota serve como página de agradecimento acessível
// diretamente (ex.: link no e-mail de confirmação).
export default function ConfirmacaoPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-noir px-6 py-20 text-center text-white">
      <div className="pointer-events-none absolute inset-4 border border-white/20 sm:inset-6" />
      <FadeIn className="relative flex max-w-xl flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl text-noir">
          ✓
        </div>
        <p className="overline-claro mt-6">Inscrição registrada</p>
        <h1 className="mt-4 font-titulo text-4xl leading-tight sm:text-7xl">
          Sua presença está confirmada
        </h1>
        <div className="mt-7">
          <Divisor claro />
        </div>
        <p className="mt-7 font-sans text-sm leading-relaxed text-white/75 sm:text-base">
          Obrigado por confirmar sua presença no casamento de Cynthia e Benhur.
          Você receberá um e-mail de confirmação com o resumo da inscrição.
          Guarde-o como comprovante — a entrada é exclusiva para convidados
          confirmados, mediante apresentação da pulseira.
        </p>

        <div className="mt-9 w-full border-l-4 border-white bg-white/5 p-5 text-left">
          <p className="font-sans text-sm text-white/80">
            <strong className="text-white">Lembre-se:</strong> a cerimônia
            começa às 20h. Os portões abrem a partir das 18:30h — recomendamos
            chegada antecipada para maior conforto e tranquilidade.
          </p>
        </div>

        <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/cotas" className="btn-claro w-full sm:w-auto">
            Enviar um presente
          </Link>
          <Link href="/" className="btn-contorno-claro w-full sm:w-auto">
            Voltar ao início
          </Link>
        </div>
      </FadeIn>
    </main>
  );
}

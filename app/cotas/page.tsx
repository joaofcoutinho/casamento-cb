import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import Divisor from "@/components/Divisor";
import CotasSelector from "@/components/CotasSelector";

export const metadata: Metadata = {
  title: "Presente de Casamento — Cynthia & Benhur",
  description: "Escolha uma cota e presenteie os noivos.",
};

export default function CotasPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Cabeçalho */}
      <header className="border-b border-neutral-800 bg-noir px-6 py-6 text-center">
        <Link
          href="/"
          className="font-titulo text-2xl tracking-wide text-white transition hover:opacity-70"
        >
          Cynthia &amp; Benhur
        </Link>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <FadeIn className="text-center">
          <p className="overline">Com carinho</p>
          <h1 className="mt-4 font-titulo text-4xl text-noir sm:text-7xl">
            Presente de Casamento
          </h1>
          <div className="mt-7">
            <Divisor />
          </div>
          <p className="mx-auto mt-6 max-w-xl font-sans text-sm leading-relaxed text-neutral-600 sm:text-base">
            Sua presença tornará este dia ainda mais especial. Caso deseje nos
            presentear, preparamos algumas opções de contribuição para o início
            da nossa nova história. Escolha uma ou mais cotas abaixo — cada
            gesto será recebido com imensa gratidão.
          </p>
        </FadeIn>

        <FadeIn className="mt-14">
          <div className="border border-neutral-200 bg-white p-7 shadow-sm sm:p-10">
            <CotasSelector />
          </div>
        </FadeIn>

        <FadeIn className="mt-14 text-center">
          <Link href="/" className="btn-contorno">
            Voltar ao início
          </Link>
        </FadeIn>
      </section>

      <footer className="bg-noir px-6 py-10 text-center">
        <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-white/40">
          Cynthia &amp; Benhur · 10 de Outubro de 2026
        </p>
      </footer>
    </main>
  );
}

import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import Divisor from "@/components/Divisor";
import InscricaoForm from "@/components/InscricaoForm";
import { COTAS } from "@/lib/cotas";

export default function HomePage() {
  return (
    <main className="bg-white">
      {/* ======================= HERO ======================= */}
      {/* Foto do casal nas proporções exatas (1537 x 1023), inteira e sem
          corte. Os nomes ficam sobrepostos na base, com leve overlay. */}
      <section className="bg-noir">
        <div className="relative mx-auto aspect-[1537/1023] w-full max-w-[1537px] overflow-hidden">
          {/* Foto */}
          <div
            className="absolute inset-0 bg-neutral-900 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url(/image-hero.jpeg)" }}
            role="img"
            aria-label="Cynthia e Benhur"
          />
          {/* Leve overlay na base, para legibilidade dos nomes */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
          {/* Nomes no rodapé do hero */}
          <div className="absolute inset-x-0 bottom-0 px-5 pb-5 text-center text-white sm:px-6 sm:pb-[5%]">
            <p className="overline-claro">O casamento de</p>
            <h1 className="mt-1.5 font-mileur leading-[0.95] sm:mt-2">
              <span className="block text-[clamp(2.5rem,9vw,10rem)]">
                Cynthia &amp; Benhur
              </span>
            </h1>
          </div>
        </div>
      </section>

      {/* ============== FAIXA PRETA — VERSÍCULO, DATA E CTA ============== */}
      <section className="bg-noir px-6 py-14 text-center text-white sm:py-16">
        <FadeIn className="mx-auto flex max-w-2xl flex-col items-center">
          <p className="max-w-md font-serif text-xl italic text-white/90 sm:text-2xl">
            “Portanto, o que Deus uniu, não o separe o homem.”
          </p>
          <p className="mt-2 font-sans text-[11px] uppercase tracking-[0.3em] text-white/60">
            Mateus 19:6
          </p>

          <p className="mt-7 border-y border-white/30 px-8 py-3 font-sans text-sm uppercase tracking-[0.3em]">
            10 de Outubro de 2026
          </p>

          <a href="#inscricao" className="btn-claro mt-8">
            Confirmar presença
          </a>
        </FadeIn>
      </section>

      {/* ==================== INFORMAÇÕES ==================== */}
      <section id="evento" className="mx-auto max-w-4xl px-6 py-16 sm:py-32">
        <FadeIn className="text-center">
          <p className="overline">A celebração</p>
          <h2 className="mt-4 font-titulo text-4xl text-noir sm:text-6xl">
            Como será o nosso grande dia
          </h2>
          <div className="mt-7">
            <Divisor />
          </div>
        </FadeIn>

        <div className="mt-12">
          {[
            {
              icone: (
                // Relógio — horário da cerimônia
                <>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3.5 2" />
                </>
              ),
              titulo: "A cerimônia começa às 20h",
              texto:
                "A cerimônia terá início às 20h. Recomendamos a chegada antecipada para maior conforto e tranquilidade. Os portões serão abertos a partir das 18:30h.",
            },
            {
              icone: (
                // Ampulheta — chegue com antecedência
                <>
                  <path d="M6 3h12" />
                  <path d="M6 21h12" />
                  <path d="M7 3v3.2a2 2 0 0 0 .6 1.4L12 12l4.4-4.4a2 2 0 0 0 .6-1.4V3" />
                  <path d="M7 21v-3.2a2 2 0 0 1 .6-1.4L12 12l4.4 4.4a2 2 0 0 1 .6 1.4V21" />
                </>
              ),
              titulo: "Chegue cedo — os portões serão fechados",
              texto:
                "Em horário determinado os portões serão fechados. Todos os convidados serão acomodados de forma organizada antes do fechamento.",
            },
            {
              icone: (
                // Cadeado — evento privado
                <>
                  <rect x="4" y="11" width="16" height="10" rx="2.5" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  <path d="M12 15v2" />
                </>
              ),
              titulo: "Evento privado",
              texto:
                "A entrada é exclusiva para convidados com inscrição confirmada. O acesso será feito mediante apresentação da pulseira de identificação.",
            },
            {
              icone: (
                // Calendário — prazo de inscrição
                <>
                  <rect x="3" y="5" width="18" height="16" rx="2.5" />
                  <path d="M3 10h18" />
                  <path d="M8 3v4" />
                  <path d="M16 3v4" />
                  <path d="m9.5 15 2 2 3.5-3.5" />
                </>
              ),
              titulo: "Inscrições encerram em 10/09",
              texto:
                "O cadastro de presença ficará disponível somente até 10 de setembro. Após essa data não será possível confirmar novos convidados.",
            },
          ].map((item, i) => (
            <FadeIn
              key={item.titulo}
              delay={i * 90}
              className="flex items-start gap-5 border-t border-neutral-200 py-8 last:border-b sm:gap-8"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-noir text-white sm:h-16 sm:w-16">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 sm:h-7 sm:w-7"
                  aria-hidden="true"
                >
                  {item.icone}
                </svg>
              </div>
              <div className="pt-1.5">
                <h3 className="font-titulo text-2xl text-noir sm:text-3xl">
                  {item.titulo}
                </h3>
                <p className="mt-2 font-sans text-sm leading-relaxed text-neutral-600 sm:text-base">
                  {item.texto}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ============== CHAMADA — VAGAS LIMITADAS ============== */}
      <section className="bg-noir px-6 py-16 text-center text-white sm:py-28">
        <FadeIn className="mx-auto max-w-2xl">
          <p className="overline-claro">Atenção</p>
          <p className="mt-6 font-titulo text-5xl leading-none sm:text-8xl">
            Vagas
            <br />
            limitadas
          </p>
          <div className="mt-8">
            <Divisor claro />
          </div>
          <p className="mx-auto mt-8 max-w-md font-sans text-base leading-relaxed text-white/70">
            Os lugares são limitados. Garanta sua presença e a de sua família
            realizando a confirmação antecipadamente.
          </p>
          <a href="#inscricao" className="btn-claro mt-10">
            Quero confirmar
          </a>
        </FadeIn>
      </section>

      {/* ==================== FORMULÁRIO ==================== */}
      <section id="inscricao" className="bg-cream px-6 py-16 sm:py-32">
        <FadeIn className="mb-14 text-center">
          <p className="overline">Confirmação de presença</p>
          <h2 className="mt-4 font-titulo text-4xl text-noir sm:text-6xl">
            Realize sua Confirmação
          </h2>
          <div className="mt-7">
            <Divisor />
          </div>
          <p className="mx-auto mt-6 max-w-xl font-sans text-sm leading-relaxed text-neutral-600 sm:text-base">
            Preencha os dados do responsável e adicione os acompanhantes da
            família. Ao final do cadastro, você receberá a confirmação por
            e-mail.
          </p>
        </FadeIn>

        <FadeIn>
          <div className="mx-auto max-w-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-12">
            <InscricaoForm />
          </div>
        </FadeIn>
      </section>

      {/* ============= PRESENTE — CTA NA PÁGINA PRINCIPAL ============= */}
      <section className="relative overflow-hidden bg-noir px-6 py-16 text-white sm:py-32">
        <div className="pointer-events-none absolute inset-4 border border-white/15 sm:inset-8" />
        <FadeIn className="relative mx-auto max-w-2xl text-center">
          <p className="overline-claro">Com carinho</p>
          <h2 className="mt-4 font-titulo text-4xl leading-tight sm:text-7xl">
            Presente de Casamento
          </h2>
          <div className="mt-7">
            <Divisor claro />
          </div>
          <p className="mx-auto mt-7 max-w-lg font-sans text-base leading-relaxed text-white/75">
            Sua presença tornará este dia ainda mais especial. Caso deseje nos
            presentear, preparamos algumas opções de contribuição para o início
            da nossa nova história.
          </p>

          {/* Vitrine das cotas disponíveis */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {COTAS.map((cota) => (
              <span
                key={cota.valor}
                className="border border-white/30 px-4 py-2 font-sans text-sm tracking-wide"
              >
                {cota.label}
              </span>
            ))}
          </div>

          <Link href="/cotas" className="btn-claro mt-10">
            Escolher um presente
          </Link>
          <p className="mt-4 font-sans text-xs text-white/50">
            Pagamento seguro via Mercado Pago
          </p>
        </FadeIn>
      </section>

      {/* ====================== RODAPÉ ====================== */}
      <footer className="border-t border-neutral-800 bg-noir px-6 py-16 text-center text-white">
        <p className="font-titulo text-4xl">Cynthia &amp; Benhur</p>
        <div className="mt-6">
          <Divisor claro />
        </div>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-10">
          <Link
            href="/cotas"
            className="font-sans text-xs uppercase tracking-[0.22em] text-white/70 transition hover:text-white"
          >
            Presentear os noivos
          </Link>
          <Link
            href="/admin"
            className="font-sans text-xs uppercase tracking-[0.22em] text-white/70 transition hover:text-white"
          >
            Área administrativa
          </Link>
        </div>
        <p className="mt-10 font-sans text-[11px] uppercase tracking-[0.25em] text-white/40">
          10 de Outubro de 2026 · Evento privado
        </p>
      </footer>
    </main>
  );
}

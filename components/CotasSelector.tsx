"use client";

import { useMemo, useState } from "react";
import { COTAS, formatarBRL } from "@/lib/cotas";

const MP_LINK =
  process.env.NEXT_PUBLIC_MP_LINK ||
  "https://link.mercadopago.com.br/cynthiaebenhur";

export default function CotasSelector() {
  // Quantidade selecionada de cada cota, indexada pelo valor da cota.
  const [quantidades, setQuantidades] = useState<Record<number, number>>(
    () => Object.fromEntries(COTAS.map((c) => [c.valor, 0]))
  );

  const total = useMemo(
    () =>
      COTAS.reduce((soma, c) => soma + c.valor * (quantidades[c.valor] || 0), 0),
    [quantidades]
  );

  const totalItens = useMemo(
    () => Object.values(quantidades).reduce((a, b) => a + b, 0),
    [quantidades]
  );

  function ajustar(valor: number, delta: number) {
    setQuantidades((q) => ({
      ...q,
      [valor]: Math.max(0, (q[valor] || 0) + delta),
    }));
  }

  function enviarPresente() {
    window.open(MP_LINK, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-px">
        {COTAS.map((cota) => {
          const qtd = quantidades[cota.valor] || 0;
          return (
            <div
              key={cota.valor}
              className="flex items-center justify-between border-b border-neutral-200 py-6 first:border-t"
            >
              <div>
                <p className="font-titulo text-2xl text-noir sm:text-3xl">
                  {cota.label}
                </p>
                <p className="font-sans text-xs uppercase tracking-[0.18em] text-neutral-400">
                  Cota de presente
                </p>
              </div>

              <div className="flex items-center gap-4">
                {qtd > 0 && (
                  <span className="hidden font-sans text-xs font-semibold text-noir sm:inline">
                    {formatarBRL(cota.valor * qtd)}
                  </span>
                )}
                <div className="flex items-center border border-neutral-300">
                  <button
                    type="button"
                    aria-label={`Remover uma cota de ${cota.label}`}
                    onClick={() => ajustar(cota.valor, -1)}
                    className="flex h-10 w-10 items-center justify-center text-xl text-noir transition hover:bg-noir hover:text-white disabled:opacity-30"
                    disabled={qtd === 0}
                  >
                    –
                  </button>
                  <span className="flex h-10 w-12 items-center justify-center font-sans text-sm text-noir">
                    {qtd}
                  </span>
                  <button
                    type="button"
                    aria-label={`Adicionar uma cota de ${cota.label}`}
                    onClick={() => ajustar(cota.valor, 1)}
                    className="flex h-10 w-10 items-center justify-center text-xl text-noir transition hover:bg-noir hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total dinâmico */}
      <div className="mt-10 flex items-end justify-between gap-4 border-t border-noir pt-6">
        <div>
          <p className="rotulo">Total do presente</p>
          <p className="mt-1 font-sans text-xs text-neutral-400">
            {totalItens} {totalItens === 1 ? "cota selecionada" : "cotas selecionadas"}
          </p>
        </div>
        <p className="font-titulo text-3xl text-noir sm:text-5xl">
          {formatarBRL(total)}
        </p>
      </div>

      <button
        type="button"
        onClick={enviarPresente}
        disabled={total === 0}
        className="btn-primario mt-8 w-full"
      >
        Enviar presente
      </button>
      <p className="mt-4 text-center font-sans text-xs text-neutral-400">
        Você será direcionado(a) ao Mercado Pago em uma nova aba para concluir
        com segurança. O valor de referência é {formatarBRL(total)}.
      </p>
    </div>
  );
}

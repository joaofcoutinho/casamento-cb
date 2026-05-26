"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Membro = {
  id: string;
  nome: string;
  documento: string;
  parentesco: string;
  ehCrianca: boolean;
  ocupaCadeira: boolean;
  isResponsavel: boolean;
};

type Ficha = {
  id: string;
  criadoEm: string;
  email: string;
  telefone: string;
  igreja: string;
  responsavel: string;
  totalMembros: number;
  membros: Membro[];
};

type Estatisticas = {
  totalInscritos: number;
  totalFamilias: number;
  porIgreja: { igreja: string; total: number }[];
  limiteVagas: number;
  vagasRestantes: number | null;
};

type DadosAdmin = { fichas: Ficha[]; estatisticas: Estatisticas };

export default function AdminDashboard() {
  const router = useRouter();
  const [dados, setDados] = useState<DadosAdmin | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [aba, setAba] = useState<"familia" | "igreja">("familia");
  const [busca, setBusca] = useState("");
  const [igrejaFiltro, setIgrejaFiltro] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin")
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/admin");
          return null;
        }
        if (!res.ok) throw new Error("Falha ao carregar os dados.");
        return res.json();
      })
      .then((json) => json && setDados(json))
      .catch((e) => setErro(e instanceof Error ? e.message : "Erro inesperado."))
      .finally(() => setCarregando(false));
  }, [router]);

  async function sair() {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "logout" }),
    });
    router.push("/admin");
    router.refresh();
  }

  // Filtra fichas pela busca (nome ou documento de qualquer membro/responsável).
  const fichasFiltradas = useMemo(() => {
    if (!dados) return [];
    const q = busca.trim().toLowerCase();
    if (!q) return dados.fichas;
    return dados.fichas.filter(
      (f) =>
        f.responsavel.toLowerCase().includes(q) ||
        f.igreja.toLowerCase().includes(q) ||
        f.membros.some(
          (m) =>
            m.nome.toLowerCase().includes(q) ||
            m.documento.toLowerCase().includes(q)
        )
    );
  }, [dados, busca]);

  // Agrupa as fichas filtradas por igreja.
  const porIgreja = useMemo(() => {
    const mapa = new Map<string, Ficha[]>();
    for (const f of fichasFiltradas) {
      if (!mapa.has(f.igreja)) mapa.set(f.igreja, []);
      mapa.get(f.igreja)!.push(f);
    }
    return Array.from(mapa.entries()).sort((a, b) =>
      a[0].localeCompare(b[0], "pt-BR")
    );
  }, [fichasFiltradas]);

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream">
        <p className="font-sans text-sm text-neutral-500">Carregando painel...</p>
      </main>
    );
  }

  if (erro || !dados) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream">
        <p className="font-sans text-sm text-red-600">{erro || "Sem dados."}</p>
      </main>
    );
  }

  const { estatisticas: est } = dados;

  return (
    <main className="min-h-screen bg-cream pb-24">
      {/* ===== Cabeçalho ===== */}
      <header className="nao-imprimir border-b border-neutral-200 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="overline">Painel administrativo</p>
            <h1 className="font-titulo text-2xl text-noir">Cynthia &amp; Benhur</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => window.print()}
              className="border border-noir px-4 py-2 font-sans text-xs uppercase tracking-[0.16em] text-noir transition hover:bg-noir hover:text-white"
            >
              Imprimir lista
            </button>
            <a
              href="/api/admin?formato=csv"
              className="border border-noir px-4 py-2 font-sans text-xs uppercase tracking-[0.16em] text-noir transition hover:bg-noir hover:text-white"
            >
              Exportar CSV
            </a>
            <button
              onClick={sair}
              className="bg-noir px-4 py-2 font-sans text-xs uppercase tracking-[0.16em] text-white transition hover:bg-neutral-700"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6">
        {/* ===== Estatísticas ===== */}
        <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <CardEstatistica rotulo="Total de inscritos" valor={est.totalInscritos} />
          <CardEstatistica rotulo="Total de famílias" valor={est.totalFamilias} />
          <CardEstatistica
            rotulo="Vagas restantes"
            valor={est.vagasRestantes ?? "—"}
            detalhe={est.limiteVagas > 0 ? `de ${est.limiteVagas}` : "sem limite"}
          />
          <CardEstatistica
            rotulo="Igrejas distintas"
            valor={est.porIgreja.length}
          />
        </section>

        {/* Inscritos por igreja (mini gráfico de barras) */}
        <section className="mt-4 border border-neutral-200 bg-white p-6">
          <p className="rotulo">Inscritos por igreja</p>
          <div className="mt-4 space-y-3">
            {est.porIgreja.map((ig) => {
              const max = est.porIgreja[0]?.total || 1;
              return (
                <div key={ig.igreja} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 truncate font-sans text-xs text-neutral-600 sm:w-48">
                    {ig.igreja}
                  </span>
                  <div className="h-3 flex-1 bg-neutral-200">
                    <div
                      className="h-full bg-noir"
                      style={{ width: `${(ig.total / max) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-sans text-xs text-noir">
                    {ig.total}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===== Busca + abas ===== */}
        <section className="nao-imprimir mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-px">
            <button
              onClick={() => setAba("familia")}
              className={`px-5 py-3 font-sans text-xs uppercase tracking-[0.16em] transition ${
                aba === "familia"
                  ? "bg-noir text-white"
                  : "bg-white text-neutral-500 hover:text-noir"
              }`}
            >
              Por família
            </button>
            <button
              onClick={() => setAba("igreja")}
              className={`px-5 py-3 font-sans text-xs uppercase tracking-[0.16em] transition ${
                aba === "igreja"
                  ? "bg-noir text-white"
                  : "bg-white text-neutral-500 hover:text-noir"
              }`}
            >
              Por igreja
            </button>
          </div>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou CPF/RG..."
            className="w-full border border-neutral-300 bg-white px-4 py-3 font-sans text-sm outline-none focus:border-black focus:ring-1 focus:ring-black sm:w-80"
          />
        </section>

        <p className="nao-imprimir mt-3 font-sans text-xs text-neutral-400">
          {fichasFiltradas.length} família(s) ·{" "}
          {fichasFiltradas.reduce((s, f) => s + f.totalMembros, 0)} inscrito(s)
          {busca && " encontrados"}
        </p>

        {/* ===== Conteúdo ===== */}
        <div className="area-impressao mt-6">
          {aba === "familia" ? (
            <div className="space-y-4">
              {fichasFiltradas.map((f) => (
                <FichaFamilia key={f.id} ficha={f} />
              ))}
              {fichasFiltradas.length === 0 && <Vazio />}
            </div>
          ) : (
            <div className="space-y-10">
              {/* Filtro lateral de igrejas */}
              <div className="nao-imprimir flex flex-wrap gap-2">
                <BotaoIgreja
                  ativo={igrejaFiltro === null}
                  onClick={() => setIgrejaFiltro(null)}
                  label="Todas"
                />
                {porIgreja.map(([igreja, lista]) => (
                  <BotaoIgreja
                    key={igreja}
                    ativo={igrejaFiltro === igreja}
                    onClick={() => setIgrejaFiltro(igreja)}
                    label={`${igreja} (${lista.reduce(
                      (s, f) => s + f.totalMembros,
                      0
                    )})`}
                  />
                ))}
              </div>

              {porIgreja
                .filter(([igreja]) => !igrejaFiltro || igreja === igrejaFiltro)
                .map(([igreja, lista]) => (
                  <div key={igreja}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b-2 border-noir pb-2">
                      <h2 className="font-titulo text-2xl text-noir">{igreja}</h2>
                      <span className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                        {lista.reduce((s, f) => s + f.totalMembros, 0)} inscritos
                        · {lista.length} famílias
                      </span>
                    </div>
                    <div className="mt-4 space-y-4">
                      {lista.map((f) => (
                        <FichaFamilia key={f.id} ficha={f} />
                      ))}
                    </div>
                  </div>
                ))}
              {porIgreja.length === 0 && <Vazio />}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
function CardEstatistica({
  rotulo,
  valor,
  detalhe,
}: {
  rotulo: string;
  valor: number | string;
  detalhe?: string;
}) {
  return (
    <div className="border border-neutral-200 bg-white p-5">
      <p className="font-sans text-[11px] uppercase tracking-[0.16em] text-neutral-500">
        {rotulo}
      </p>
      <p className="mt-2 font-titulo text-4xl text-noir">{valor}</p>
      {detalhe && (
        <p className="font-sans text-xs text-neutral-400">{detalhe}</p>
      )}
    </div>
  );
}

function BotaoIgreja({
  ativo,
  onClick,
  label,
}: {
  ativo: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`border px-3 py-2 font-sans text-xs transition ${
        ativo
          ? "border-noir bg-noir text-white"
          : "border-neutral-300 bg-white text-neutral-600 hover:border-noir"
      }`}
    >
      {label}
    </button>
  );
}

function FichaFamilia({ ficha }: { ficha: Ficha }) {
  return (
    <article className="border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-titulo text-xl text-noir">{ficha.responsavel}</h3>
          <p className="font-sans text-xs text-neutral-500">
            {ficha.igreja} · {ficha.email} · {ficha.telefone}
          </p>
        </div>
        <span className="bg-noir px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
          Confirmado
        </span>
      </div>

      {/* Rolagem horizontal da tabela em telas estreitas */}
      <div className="mt-4 -mx-1 overflow-x-auto px-1">
       <table className="w-full min-w-[420px] border-collapse text-left">
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="py-2 font-sans text-[11px] uppercase tracking-[0.14em] text-neutral-400">
              Nome
            </th>
            <th className="py-2 font-sans text-[11px] uppercase tracking-[0.14em] text-neutral-400">
              Parentesco
            </th>
            <th className="py-2 font-sans text-[11px] uppercase tracking-[0.14em] text-neutral-400">
              Documento
            </th>
            <th className="py-2 font-sans text-[11px] uppercase tracking-[0.14em] text-neutral-400">
              Acomodação
            </th>
          </tr>
        </thead>
        <tbody>
          {ficha.membros.map((m) => (
            <tr key={m.id} className="border-b border-neutral-100 last:border-0">
              <td className="py-2 font-sans text-sm text-noir">
                {m.nome}
                {m.isResponsavel && (
                  <span className="ml-2 border border-neutral-300 px-1.5 py-0.5 font-sans text-[10px] uppercase tracking-wide text-neutral-600">
                    responsável
                  </span>
                )}
              </td>
              <td className="py-2 font-sans text-sm text-neutral-600">
                {m.parentesco}
              </td>
              <td className="py-2 font-sans text-sm text-neutral-600">
                {m.documento}
              </td>
              <td className="py-2 font-sans text-sm text-neutral-600">
                {m.ehCrianca ? "Criança de colo" : "Ocupa cadeira"}
              </td>
            </tr>
          ))}
        </tbody>
       </table>
      </div>

      <p className="mt-3 font-sans text-xs text-neutral-400">
        {ficha.totalMembros} {ficha.totalMembros === 1 ? "pessoa" : "pessoas"} ·
        Cadastro em {new Date(ficha.criadoEm).toLocaleDateString("pt-BR")}
      </p>
    </article>
  );
}

function Vazio() {
  return (
    <p className="border border-dashed border-neutral-300 bg-white px-6 py-12 text-center font-sans text-sm text-neutral-400">
      Nenhuma inscrição encontrada.
    </p>
  );
}

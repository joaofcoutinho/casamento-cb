"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IGREJAS } from "@/lib/igrejas";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
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
  igrejaGrupo: string;
  igrejaOutro: string | null;
  responsavel: string;
  responsavelDoc: string;
  totalMembros: number;
  totalConvidados: number;
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

type Ordem = "recente" | "nome" | "pessoas";

const ORDEM_GRUPOS = [...IGREJAS];

// ---------------------------------------------------------------------------
export default function AdminDashboard() {
  const router = useRouter();
  const [dados, setDados] = useState<DadosAdmin | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [busca, setBusca] = useState("");
  const [grupoFiltro, setGrupoFiltro] = useState<string | null>(null);
  const [ordem, setOrdem] = useState<Ordem>("recente");
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const [familiasAbertas, setFamiliasAbertas] = useState<Record<string, boolean>>({});
  const [gruposFechados, setGruposFechados] = useState<Record<string, boolean>>({});

  // ----- Carregamento --------------------------------------------------------
  async function carregar() {
    try {
      const res = await fetch("/api/admin", { cache: "no-store" });
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      if (!res.ok) throw new Error("Falha ao carregar os dados.");
      setDados((await res.json()) as DadosAdmin);
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- Ações ---------------------------------------------------------------
  async function sair() {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "logout" }),
    });
    router.push("/admin");
    router.refresh();
  }

  async function excluir(ficha: Ficha) {
    const confirmar = window.confirm(
      `Remover o cadastro de "${ficha.responsavel}" e ${ficha.totalMembros} pessoa(s)?\nEsta ação não pode ser desfeita.`
    );
    if (!confirmar) return;
    setExcluindo(ficha.id);
    try {
      const res = await fetch(
        `/api/admin?id=${encodeURIComponent(ficha.id)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.erro || "Não foi possível excluir.");
      }
      await carregar();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao excluir.");
    } finally {
      setExcluindo(null);
    }
  }

  function alternarFamilia(id: string) {
    setFamiliasAbertas((s) => ({ ...s, [id]: !s[id] }));
  }
  function alternarGrupo(g: string) {
    setGruposFechados((s) => ({ ...s, [g]: !s[g] }));
  }
  function expandirTodas(valor: boolean) {
    if (!dados) return;
    const map: Record<string, boolean> = {};
    for (const f of dados.fichas) map[f.id] = valor;
    setFamiliasAbertas(map);
  }
  function recolherTodos(valor: boolean) {
    const map: Record<string, boolean> = {};
    for (const g of ORDEM_GRUPOS) map[g] = valor;
    setGruposFechados(map);
  }

  // ----- Filtragem, ordenação, agrupamento ----------------------------------
  const fichasFiltradas = useMemo(() => {
    if (!dados) return [];
    const q = busca.trim().toLowerCase();
    const filtradas = dados.fichas.filter((f) => {
      if (grupoFiltro && f.igrejaGrupo !== grupoFiltro) return false;
      if (!q) return true;
      return (
        f.responsavel.toLowerCase().includes(q) ||
        f.igreja.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.telefone.toLowerCase().includes(q) ||
        f.responsavelDoc.toLowerCase().includes(q) ||
        f.membros.some(
          (m) =>
            m.nome.toLowerCase().includes(q) ||
            m.documento.toLowerCase().includes(q)
        )
      );
    });
    const ord = [...filtradas];
    if (ordem === "nome")
      ord.sort((a, b) => a.responsavel.localeCompare(b.responsavel, "pt-BR"));
    else if (ordem === "pessoas")
      ord.sort((a, b) => b.totalMembros - a.totalMembros);
    else
      ord.sort(
        (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
      );
    return ord;
  }, [dados, busca, grupoFiltro, ordem]);

  const grupos = useMemo(() => {
    const mapa = new Map<string, Ficha[]>();
    for (const f of fichasFiltradas) {
      if (!mapa.has(f.igrejaGrupo)) mapa.set(f.igrejaGrupo, []);
      mapa.get(f.igrejaGrupo)!.push(f);
    }
    return ORDEM_GRUPOS.filter((g) => mapa.has(g)).map((g) => ({
      grupo: g,
      fichas: mapa.get(g)!,
    }));
  }, [fichasFiltradas]);

  const contadores = useMemo(() => {
    const c: Record<string, { familias: number; pessoas: number }> = {};
    if (!dados) return c;
    for (const f of dados.fichas) {
      if (!c[f.igrejaGrupo]) c[f.igrejaGrupo] = { familias: 0, pessoas: 0 };
      c[f.igrejaGrupo].familias += 1;
      c[f.igrejaGrupo].pessoas += f.totalMembros;
    }
    return c;
  }, [dados]);

  // ----- Render --------------------------------------------------------------
  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream">
        <p className="font-sans text-sm text-neutral-500">Carregando painel…</p>
      </main>
    );
  }
  if (erro || !dados) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-6">
        <p className="font-sans text-sm text-red-600">{erro || "Sem dados."}</p>
      </main>
    );
  }

  const { estatisticas: est } = dados;
  const totalFiltrado = fichasFiltradas.reduce((s, f) => s + f.totalMembros, 0);
  const pctOcupacao =
    est.limiteVagas > 0
      ? Math.min(100, Math.round((est.totalInscritos / est.limiteVagas) * 100))
      : 0;

  return (
    <main className="min-h-screen bg-cream pb-24">
      {/* ============================ HEADER ============================ */}
      <header className="nao-imprimir border-b border-neutral-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="overline">Painel administrativo</p>
            <h1 className="truncate font-titulo text-xl text-noir sm:text-2xl">
              Cynthia &amp; Benhur
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/api/admin?formato=csv"
              className="inline-flex items-center gap-1.5 border border-noir px-3 py-2 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-noir transition hover:bg-noir hover:text-white"
            >
              <IconeDownload /> CSV
            </a>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 border border-noir px-3 py-2 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-noir transition hover:bg-noir hover:text-white"
            >
              <IconeImpressora /> Imprimir
            </button>
            <button
              onClick={sair}
              className="inline-flex items-center gap-1.5 bg-noir px-3 py-2 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-neutral-800"
            >
              <IconeSair /> Sair
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* ============================ STATS ============================ */}
        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <CardStat
            rotulo="Pessoas confirmadas"
            valor={est.totalInscritos}
            destaque
          />
          <CardStat rotulo="Famílias" valor={est.totalFamilias} />
          <CardStat
            rotulo="Igrejas presentes"
            valor={est.porIgreja.length}
          />
          {est.limiteVagas > 0 ? (
            <div className="border border-neutral-200 bg-white p-4 sm:p-5">
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500 sm:text-[11px]">
                Ocupação
              </p>
              <p className="mt-1.5 font-titulo text-3xl text-noir sm:text-4xl">
                {pctOcupacao}%
              </p>
              <div className="mt-2 h-1.5 w-full bg-neutral-200">
                <div
                  className="h-full bg-noir transition-all"
                  style={{ width: `${pctOcupacao}%` }}
                />
              </div>
              <p className="mt-1.5 font-sans text-[11px] text-neutral-400">
                {est.vagasRestantes} de {est.limiteVagas} vagas livres
              </p>
            </div>
          ) : (
            <CardStat rotulo="Limite de vagas" valor="—" detalhe="sem limite" />
          )}
        </section>

        {/* ============== BUSCA + AÇÕES ============== */}
        <section className="nao-imprimir mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, e-mail, telefone ou documento…"
              className="w-full border border-neutral-300 bg-white px-4 py-3 pl-11 font-sans text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
            />
            <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-neutral-400">
              <IconeBusca />
            </span>
            {busca && (
              <button
                onClick={() => setBusca("")}
                aria-label="Limpar busca"
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-neutral-400 hover:text-noir"
              >
                <IconeX />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <select
              value={ordem}
              onChange={(e) => setOrdem(e.target.value as Ordem)}
              className="flex-1 border border-neutral-300 bg-white px-3 py-3 font-sans text-xs uppercase tracking-[0.1em] text-noir outline-none focus:border-black sm:flex-none"
            >
              <option value="recente">Mais recentes</option>
              <option value="nome">Nome A–Z</option>
              <option value="pessoas">Mais pessoas</option>
            </select>
          </div>
        </section>

        {/* ===== Chips de igreja + atalhos ===== */}
        <section className="nao-imprimir mt-4 space-y-3">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            <ChipFiltro
              ativo={grupoFiltro === null}
              onClick={() => setGrupoFiltro(null)}
              label="Todas"
              total={est.totalFamilias}
            />
            {ORDEM_GRUPOS.filter((g) => contadores[g]).map((g) => (
              <ChipFiltro
                key={g}
                ativo={grupoFiltro === g}
                onClick={() => setGrupoFiltro(g)}
                label={g}
                total={contadores[g].familias}
                pessoas={contadores[g].pessoas}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <p className="font-sans text-neutral-500">
              <strong className="text-noir">{fichasFiltradas.length}</strong>{" "}
              família{fichasFiltradas.length === 1 ? "" : "s"} ·{" "}
              <strong className="text-noir">{totalFiltrado}</strong> pessoa
              {totalFiltrado === 1 ? "" : "s"}
              {(busca || grupoFiltro) && (
                <button
                  onClick={() => {
                    setBusca("");
                    setGrupoFiltro(null);
                  }}
                  className="ml-3 underline underline-offset-4 hover:text-noir"
                >
                  limpar
                </button>
              )}
            </p>
            <div className="flex gap-3 font-sans text-[11px] uppercase tracking-[0.14em] text-neutral-500">
              <button
                onClick={() => expandirTodas(true)}
                className="hover:text-noir"
              >
                Abrir convidados
              </button>
              <button
                onClick={() => expandirTodas(false)}
                className="hover:text-noir"
              >
                Fechar convidados
              </button>
              <button
                onClick={() => recolherTodos(true)}
                className="hidden hover:text-noir sm:inline"
              >
                Recolher grupos
              </button>
              <button
                onClick={() => recolherTodos(false)}
                className="hidden hover:text-noir sm:inline"
              >
                Expandir grupos
              </button>
            </div>
          </div>
        </section>

        {/* ============================ GRUPOS ============================ */}
        <section className="area-impressao mt-6 space-y-5">
          {grupos.map(({ grupo, fichas }) => {
            const fechado = !!gruposFechados[grupo];
            const totalPessoas = fichas.reduce(
              (s, f) => s + f.totalMembros,
              0
            );
            return (
              <div key={grupo} className="border border-noir bg-white">
                {/* Cabeçalho da igreja (sticky enquanto rola dentro do grupo) */}
                <button
                  onClick={() => alternarGrupo(grupo)}
                  className="sticky top-0 z-10 flex w-full items-center justify-between gap-3 bg-noir px-4 py-3 text-left text-white sm:px-5 sm:py-4"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center text-white/80 transition-transform ${
                        fechado ? "-rotate-90" : ""
                      }`}
                    >
                      <IconeChevron />
                    </span>
                    <span className="truncate font-titulo text-base sm:text-lg">
                      {grupo}
                    </span>
                  </span>
                  <span className="shrink-0 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 sm:text-[11px]">
                    {fichas.length}fam · {totalPessoas}pess
                  </span>
                </button>

                {!fechado && (
                  <ul className="divide-y divide-neutral-200">
                    {fichas.map((f) => (
                      <LinhaFamilia
                        key={f.id}
                        ficha={f}
                        aberta={!!familiasAbertas[f.id]}
                        onToggle={() => alternarFamilia(f.id)}
                        onExcluir={() => excluir(f)}
                        excluindo={excluindo === f.id}
                      />
                    ))}
                  </ul>
                )}
              </div>
            );
          })}

          {grupos.length === 0 && (
            <p className="border border-dashed border-neutral-300 bg-white px-6 py-12 text-center font-sans text-sm text-neutral-400">
              Nenhuma inscrição encontrada.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
function CardStat({
  rotulo,
  valor,
  detalhe,
  destaque,
}: {
  rotulo: string;
  valor: number | string;
  detalhe?: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`border p-4 sm:p-5 ${
        destaque ? "border-noir bg-noir text-white" : "border-neutral-200 bg-white"
      }`}
    >
      <p
        className={`font-sans text-[10px] font-semibold uppercase tracking-[0.14em] sm:text-[11px] ${
          destaque ? "text-white/70" : "text-neutral-500"
        }`}
      >
        {rotulo}
      </p>
      <p
        className={`mt-1.5 font-titulo text-3xl sm:text-4xl ${
          destaque ? "text-white" : "text-noir"
        }`}
      >
        {valor}
      </p>
      {detalhe && (
        <p
          className={`font-sans text-[11px] ${
            destaque ? "text-white/60" : "text-neutral-400"
          }`}
        >
          {detalhe}
        </p>
      )}
    </div>
  );
}

function ChipFiltro({
  ativo,
  onClick,
  label,
  total,
  pessoas,
}: {
  ativo: boolean;
  onClick: () => void;
  label: string;
  total: number;
  pessoas?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-2 border px-3 py-2 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] transition sm:text-xs ${
        ativo
          ? "border-noir bg-noir text-white"
          : "border-neutral-300 bg-white text-neutral-700 hover:border-noir"
      }`}
    >
      <span className="whitespace-nowrap">{label}</span>
      <span
        className={`inline-flex min-w-[22px] items-center justify-center px-1 text-[10px] ${
          ativo ? "bg-white/15 text-white" : "bg-neutral-100 text-neutral-500"
        }`}
      >
        {total}
        {pessoas !== undefined && pessoas !== total && `·${pessoas}`}
      </span>
    </button>
  );
}

// ---- Linha de família (densa, com expansão inline) ------------------------
function LinhaFamilia({
  ficha,
  aberta,
  onToggle,
  onExcluir,
  excluindo,
}: {
  ficha: Ficha;
  aberta: boolean;
  onToggle: () => void;
  onExcluir: () => void;
  excluindo: boolean;
}) {
  const convidados = ficha.membros.filter((m) => !m.isResponsavel);
  const igrejaExtra =
    ficha.igrejaGrupo === "Outros" && ficha.igrejaOutro
      ? ficha.igrejaOutro
      : null;

  return (
    <li className="bg-white">
      {/* Linha principal — clicável para expandir */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className="flex cursor-pointer items-start gap-3 px-4 py-3 transition hover:bg-neutral-50 sm:px-5"
      >
        {/* Chevron */}
        <span
          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center text-neutral-400 transition-transform ${
            aberta ? "rotate-90" : ""
          }`}
        >
          <IconeChevronDir />
        </span>

        {/* Dados principais */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <h4 className="font-titulo text-base text-noir sm:text-lg">
              {ficha.responsavel}
            </h4>
            {igrejaExtra && (
              <span className="font-sans text-[11px] uppercase tracking-[0.12em] text-neutral-500">
                {igrejaExtra}
              </span>
            )}
          </div>
          <p className="mt-0.5 font-sans text-xs text-neutral-500">
            <span>{ficha.responsavelDoc}</span>
            <span className="mx-2 text-neutral-300">·</span>
            <span>{ficha.telefone}</span>
            <span className="ml-2 hidden text-neutral-300 sm:inline">·</span>
            <span className="ml-2 hidden break-all sm:inline">{ficha.email}</span>
          </p>
          {/* email no mobile, em linha separada */}
          <p className="mt-0.5 break-all font-sans text-xs text-neutral-500 sm:hidden">
            {ficha.email}
          </p>
        </div>

        {/* Resumo + ações */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden text-right sm:block">
            <p className="font-titulo text-lg leading-none text-noir">
              {ficha.totalMembros}
            </p>
            <p className="font-sans text-[10px] uppercase tracking-[0.14em] text-neutral-400">
              {ficha.totalMembros === 1 ? "pessoa" : "pessoas"}
            </p>
          </div>
          <span className="bg-noir px-2 py-1 font-sans text-[10px] font-semibold tracking-wide text-white sm:hidden">
            {ficha.totalMembros}
          </span>
          {convidados.length > 0 && (
            <span className="hidden border border-neutral-300 px-2 py-1 font-sans text-[10px] uppercase tracking-[0.12em] text-neutral-600 sm:inline-block">
              +{convidados.length}
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExcluir();
            }}
            disabled={excluindo}
            aria-label="Excluir cadastro"
            className="inline-flex h-9 w-9 items-center justify-center border border-neutral-300 text-neutral-500 transition hover:border-red-600 hover:text-red-600 disabled:opacity-40"
          >
            {excluindo ? <IconeCarregando /> : <IconeLixeira />}
          </button>
        </div>
      </div>

      {/* Convidados (expandido) */}
      {aberta && (
        <div className="border-t border-neutral-100 bg-neutral-50/70 px-4 py-3 sm:pl-12 sm:pr-5">
          {convidados.length === 0 ? (
            <p className="font-sans text-xs italic text-neutral-500">
              Cadastro individual — sem acompanhantes.
            </p>
          ) : (
            <>
              <p className="mb-2 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Convidados ({convidados.length})
              </p>
              <ul className="divide-y divide-neutral-200">
                {convidados.map((m) => (
                  <li
                    key={m.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-sans text-sm font-medium text-noir">
                        {m.nome}
                      </p>
                      <p className="font-sans text-[11px] text-neutral-500">
                        {m.parentesco}
                        {m.ehCrianca && (
                          <span className="ml-2 inline-block border border-neutral-300 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-neutral-600">
                            Criança de colo
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="font-sans text-[11px] text-neutral-500">
                      {m.documento}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-3 font-sans text-[10px] uppercase tracking-[0.14em] text-neutral-400">
            Cadastrado em{" "}
            {new Date(ficha.criadoEm).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      )}
    </li>
  );
}

// --- Ícones (Lucide-style inline) ------------------------------------------
const svgBase = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.7",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function IconeBusca() {
  return (
    <svg {...svgBase} className="h-4 w-4" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
function IconeX() {
  return (
    <svg {...svgBase} className="h-4 w-4" aria-hidden="true">
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
}
function IconeDownload() {
  return (
    <svg {...svgBase} className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}
function IconeImpressora() {
  return (
    <svg {...svgBase} className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M6 9V4h12v5" />
      <rect x="4" y="9" width="16" height="8" rx="1.5" />
      <path d="M7 14h10v6H7z" />
    </svg>
  );
}
function IconeSair() {
  return (
    <svg {...svgBase} className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 17 5 12l5-5" />
      <path d="M5 12h11" />
    </svg>
  );
}
function IconeLixeira() {
  return (
    <svg {...svgBase} className="h-4 w-4" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}
function IconeCarregando() {
  return (
    <svg
      {...svgBase}
      className="h-4 w-4 animate-spin"
      aria-hidden="true"
      strokeWidth="2"
    >
      <path d="M21 12a9 9 0 1 1-6.2-8.55" />
    </svg>
  );
}
function IconeChevron() {
  return (
    <svg {...svgBase} className="h-4 w-4" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
function IconeChevronDir() {
  return (
    <svg {...svgBase} className="h-4 w-4" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

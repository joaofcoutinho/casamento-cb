"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Divisor from "@/components/Divisor";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "login", email, senha }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.erro || "Não foi possível entrar.");
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
      setCarregando(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-noir px-5 py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-3 border border-white/15 sm:inset-6 sm:border-white/20" />
      <div className="relative w-full max-w-sm">
        <div className="text-center">
          <p className="overline-claro">Área restrita</p>
          <h1 className="mt-4 font-titulo text-3xl text-white sm:text-5xl">
            Painel da Cíntia
          </h1>
          <div className="my-6 sm:my-7">
            <Divisor claro />
          </div>
          <p className="font-sans text-xs text-white/60">
            Gestão das confirmações do casamento.
          </p>
        </div>

        <form onSubmit={entrar} className="mt-10 space-y-5">
          {/* E-mail */}
          <div>
            <label
              htmlFor="email"
              className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-white/70"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
              className="mt-2 w-full border border-white/30 bg-white/5 px-4 py-3.5 font-sans text-base text-white outline-none transition placeholder:text-white/30 focus:border-white focus:bg-white/10"
              placeholder="seu@email.com"
            />
          </div>

          {/* Senha com olhinho */}
          <div>
            <label
              htmlFor="senha"
              className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-white/70"
            >
              Senha
            </label>
            <div className="relative mt-2">
              <input
                id="senha"
                type={mostrarSenha ? "text" : "password"}
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full border border-white/30 bg-white/5 px-4 py-3.5 pr-12 font-sans text-base text-white outline-none transition placeholder:text-white/30 focus:border-white focus:bg-white/10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((m) => !m)}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-white/60 transition hover:text-white"
              >
                {mostrarSenha ? <IconeOlhoFechado /> : <IconeOlho />}
              </button>
            </div>
          </div>

          {erro && (
            <p className="border-l-2 border-red-400 bg-red-500/10 px-3 py-2 font-sans text-xs font-medium text-red-300">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando || !email || !senha}
            className="btn-claro mt-2 w-full"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-10 text-center">
          <Link
            href="/"
            className="font-sans text-xs uppercase tracking-[0.18em] text-white/50 transition hover:text-white"
          >
            ← Voltar ao site
          </Link>
        </p>
      </div>
    </main>
  );
}

// --- Ícones (estilo Lucide, inline) ----------------------------------------
function IconeOlho() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconeOlhoFechado() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M9.88 5.09A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.1 4.07" />
      <path d="M6.61 6.61A17 17 0 0 0 2 12s3.5 7 10 7a10.9 10.9 0 0 0 5.39-1.39" />
      <path d="m2 2 20 20" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

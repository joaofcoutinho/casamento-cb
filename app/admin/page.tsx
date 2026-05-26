"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Divisor from "@/components/Divisor";

export default function AdminLoginPage() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
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
        body: JSON.stringify({ acao: "login", senha }),
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
    <main className="relative flex min-h-screen items-center justify-center bg-noir px-6 py-20">
      <div className="pointer-events-none absolute inset-4 border border-white/20 sm:inset-6" />
      <div className="relative w-full max-w-sm">
        <div className="text-center">
          <p className="overline-claro">Área restrita</p>
          <h1 className="mt-4 font-titulo text-4xl text-white sm:text-5xl">
            Painel da Cíntia
          </h1>
          <div className="my-7">
            <Divisor claro />
          </div>
          <p className="font-sans text-xs text-white/60">
            Gestão das inscrições do casamento.
          </p>
        </div>

        <form onSubmit={entrar} className="mt-12">
          <label className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
            Senha de acesso
          </label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoFocus
            className="mt-2 w-full border border-white/30 bg-white/5 px-4 py-3.5 font-sans text-base text-white outline-none transition focus:border-white focus:bg-white/10"
            placeholder="••••••••"
          />

          {erro && (
            <p className="mt-3 font-sans text-xs font-medium text-red-400">{erro}</p>
          )}

          <button
            type="submit"
            disabled={carregando || !senha}
            className="btn-claro mt-8 w-full"
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

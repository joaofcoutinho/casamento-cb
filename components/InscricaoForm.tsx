"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inscricaoSchema, type InscricaoInput } from "@/lib/validation";
import { IGREJAS } from "@/lib/igrejas";
import Divisor from "@/components/Divisor";

type MembroResumo = {
  nome: string;
  parentesco: string;
  documento: string;
  ehCrianca: boolean;
};

type Resumo = {
  nomeResponsavel: string;
  email: string;
  igreja: string;
  totalPessoas: number;
  membros: MembroResumo[];
};

export default function InscricaoForm() {
  const [enviando, setEnviando] = useState(false);
  const [erroServidor, setErroServidor] = useState<string | null>(null);
  const [resumo, setResumo] = useState<Resumo | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InscricaoInput>({
    resolver: zodResolver(inscricaoSchema),
    defaultValues: {
      nome: "",
      documento: "",
      email: "",
      telefone: "",
      igreja: undefined,
      igrejaOutro: "",
      membros: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "membros" });
  const igrejaSelecionada = watch("igreja");

  async function onSubmit(data: InscricaoInput) {
    setEnviando(true);
    setErroServidor(null);
    try {
      const res = await fetch("/api/inscricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.erro || "Não foi possível concluir a inscrição.");
      }
      setResumo(json.resumo as Resumo);
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } catch (err) {
      setErroServidor(
        err instanceof Error ? err.message : "Erro inesperado. Tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  }

  // ----- Tela de confirmação inline (sem redirect) --------------------------
  if (resumo) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-noir text-3xl text-white">
          ✓
        </div>
        <p className="overline mt-6">Inscrição confirmada</p>
        <h3 className="mt-3 font-titulo text-4xl text-noir sm:text-5xl">
          Presença garantida, {resumo.nomeResponsavel.split(" ")[0]}!
        </h3>
        <div className="mt-6">
          <Divisor />
        </div>
        <p className="mx-auto mt-6 max-w-md font-sans text-sm leading-relaxed text-neutral-600">
          Recebemos o cadastro da sua família. Em instantes você receberá um
          e-mail de confirmação em <strong>{resumo.email}</strong>.
        </p>

        <div className="mt-8 border border-neutral-200 bg-cream p-6 text-left">
          <p className="rotulo">Resumo dos inscritos · {resumo.igreja}</p>
          <ul className="mt-4 divide-y divide-neutral-200">
            {resumo.membros.map((m, i) => (
              <li key={i} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-sans text-sm font-medium text-noir">
                    {m.nome}
                  </p>
                  <p className="font-sans text-xs text-neutral-500">
                    {m.parentesco}
                    {m.ehCrianca ? " · Criança de colo (não ocupa cadeira)" : ""}
                  </p>
                </div>
                <span className="font-sans text-xs text-neutral-400">
                  {m.documento}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 inline-block bg-noir px-3 py-1.5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-white">
            Total: {resumo.totalPessoas}{" "}
            {resumo.totalPessoas === 1 ? "pessoa" : "pessoas"}
          </p>
        </div>

        <div className="mt-6 border-l-4 border-noir bg-cream p-5 text-left">
          <p className="font-sans text-sm text-neutral-700">
            <strong>Importante:</strong> você receberá um e-mail de confirmação.
            Guarde o print desta tela como comprovante de inscrição.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/cotas" className="btn-primario w-full sm:w-auto">
            Enviar um presente
          </Link>
          <Link href="/" className="btn-contorno w-full sm:w-auto">
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  // ----- Formulário ---------------------------------------------------------
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p className="overline">Responsável pela inscrição</p>
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="rotulo" htmlFor="nome">
            Nome completo
          </label>
          <input id="nome" className="campo" placeholder="Seu nome completo" {...register("nome")} />
          {errors.nome && <p className="erro">{errors.nome.message}</p>}
        </div>

        <div>
          <label className="rotulo" htmlFor="documento">
            CPF ou RG
          </label>
          <input id="documento" className="campo" placeholder="000.000.000-00" {...register("documento")} />
          {errors.documento && <p className="erro">{errors.documento.message}</p>}
        </div>

        <div>
          <label className="rotulo" htmlFor="telefone">
            Telefone / WhatsApp
          </label>
          <input id="telefone" className="campo" placeholder="(27) 99999-9999" {...register("telefone")} />
          {errors.telefone && <p className="erro">{errors.telefone.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="rotulo" htmlFor="email">
            E-mail (para receber a confirmação)
          </label>
          <input id="email" type="email" className="campo" placeholder="seu@email.com" {...register("email")} />
          {errors.email && <p className="erro">{errors.email.message}</p>}
        </div>

        <div className={igrejaSelecionada === "Outros" ? "" : "sm:col-span-2"}>
          <label className="rotulo" htmlFor="igreja">
            Igreja
          </label>
          <select id="igreja" className="campo" defaultValue="" {...register("igreja")}>
            <option value="" disabled>
              Selecione a sua igreja
            </option>
            {IGREJAS.map((ig) => (
              <option key={ig} value={ig}>
                {ig}
              </option>
            ))}
          </select>
          {errors.igreja && <p className="erro">{errors.igreja.message}</p>}
        </div>

        {/* Campo revelado dinamicamente quando "Outros" é selecionado */}
        {igrejaSelecionada === "Outros" && (
          <div>
            <label className="rotulo" htmlFor="igrejaOutro">
              Qual igreja?
            </label>
            <input
              id="igrejaOutro"
              className="campo"
              placeholder="Digite o nome da sua igreja"
              {...register("igrejaOutro")}
            />
            {errors.igrejaOutro && <p className="erro">{errors.igrejaOutro.message}</p>}
          </div>
        )}
      </div>

      {/* ----- Membros da família ----------------------------------------- */}
      <div className="mt-12 border-t border-neutral-200 pt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="overline">Membros da família</p>
          <button
            type="button"
            onClick={() =>
              append({ nome: "", parentesco: "Filho", documento: "", ehCrianca: false })
            }
            className="border-2 border-noir px-4 py-2 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-noir transition hover:bg-noir hover:text-white"
          >
            + Adicionar membro
          </button>
        </div>

        <p className="mt-4 font-sans text-xs leading-relaxed text-neutral-500">
          Cadastre cônjuge, filhos e demais acompanhantes. Crianças que ocupam
          cadeira devem ser cadastradas normalmente. Para crianças de colo (até
          2 anos), marque a opção correspondente — elas não ocupam cadeira, mas
          precisam constar na lista.
        </p>

        {fields.length === 0 && (
          <p className="mt-6 border border-dashed border-neutral-300 px-4 py-7 text-center font-sans text-sm text-neutral-400">
            Nenhum membro adicionado. Caso vá sozinho(a), pode prosseguir.
          </p>
        )}

        <div className="mt-6 space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="border border-neutral-300 bg-cream p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-noir">
                  Membro {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="font-sans text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500 underline underline-offset-4 hover:text-red-600"
                >
                  Remover
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="rotulo">Nome completo</label>
                  <input
                    className="campo"
                    placeholder="Nome do membro"
                    {...register(`membros.${index}.nome` as const)}
                  />
                  {errors.membros?.[index]?.nome && (
                    <p className="erro">{errors.membros[index]?.nome?.message}</p>
                  )}
                </div>

                <div>
                  <label className="rotulo">Parentesco</label>
                  <select
                    className="campo"
                    {...register(`membros.${index}.parentesco` as const)}
                  >
                    <option value="Cônjuge">Cônjuge</option>
                    <option value="Filho">Filho(a)</option>
                    <option value="Outro">Outro</option>
                  </select>
                  {errors.membros?.[index]?.parentesco && (
                    <p className="erro">{errors.membros[index]?.parentesco?.message}</p>
                  )}
                </div>

                <div>
                  <label className="rotulo">CPF ou RG</label>
                  <input
                    className="campo"
                    placeholder="Documento"
                    {...register(`membros.${index}.documento` as const)}
                  />
                  {errors.membros?.[index]?.documento && (
                    <p className="erro">{errors.membros[index]?.documento?.message}</p>
                  )}
                </div>

                <label className="flex items-start gap-3 sm:col-span-2">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-5 w-5 accent-noir"
                    {...register(`membros.${index}.ehCrianca` as const)}
                  />
                  <span className="font-sans text-sm text-neutral-700">
                    Criança de colo (até 2 anos) — não ocupará cadeira
                  </span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {erroServidor && (
        <div className="mt-8 border-l-4 border-red-600 bg-red-50 px-4 py-3">
          <p className="font-sans text-sm font-medium text-red-700">{erroServidor}</p>
        </div>
      )}

      <div className="mt-10 text-center">
        <button type="submit" disabled={enviando} className="btn-primario w-full">
          {enviando ? "Enviando..." : "Realizar confirmação"}
        </button>
        <p className="mt-4 font-sans text-xs text-neutral-500">
          Evento privado · Vagas limitadas · Inscrições encerram em 10/09
        </p>
      </div>
    </form>
  );
}

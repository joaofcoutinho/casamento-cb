import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inscricaoSchema } from "@/lib/validation";
import { nomeIgreja } from "@/lib/igrejas";
import { enviarEmailConfirmacao } from "@/lib/email";

export const runtime = "nodejs";

// POST /api/inscricao — cadastra uma família (responsável + membros).
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { erro: "Requisição inválida." },
      { status: 400 }
    );
  }

  // Validação com Zod
  const parsed = inscricaoSchema.safeParse(body);
  if (!parsed.success) {
    const primeiro = parsed.error.errors[0];
    return NextResponse.json(
      { erro: primeiro?.message || "Dados inválidos.", detalhes: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const dados = parsed.data;

  // Verifica o limite de vagas antes de gravar.
  const limite = Number(process.env.VAGAS_LIMITE || 0);
  if (limite > 0) {
    const inscritos = await prisma.membro.count();
    const novos = 1 + dados.membros.length;
    if (inscritos + novos > limite) {
      return NextResponse.json(
        {
          erro: "As vagas para o evento se esgotaram. Entre em contato com os noivos.",
        },
        { status: 409 }
      );
    }
  }

  // O responsável é registrado como um Membro com isResponsavel = true.
  const membrosParaCriar = [
    {
      nome: dados.nome,
      documento: dados.documento,
      parentesco: "Responsável",
      isResponsavel: true,
      ehCrianca: false,
      ocupaCadeira: true,
    },
    ...dados.membros.map((m) => ({
      nome: m.nome,
      documento: m.documento,
      parentesco: m.parentesco,
      isResponsavel: false,
      ehCrianca: m.ehCrianca,
      ocupaCadeira: !m.ehCrianca, // criança de colo não ocupa cadeira
    })),
  ];

  let familia;
  try {
    familia = await prisma.familia.create({
      data: {
        email: dados.email,
        telefone: dados.telefone,
        igreja: dados.igreja,
        igrejaOutro: dados.igreja === "Outros" ? dados.igrejaOutro : null,
        membros: { create: membrosParaCriar },
      },
      include: { membros: true },
    });
  } catch (err) {
    console.error("[inscricao] Erro ao gravar:", err);
    return NextResponse.json(
      { erro: "Não foi possível salvar a inscrição. Tente novamente." },
      { status: 500 }
    );
  }

  // Envio do e-mail de confirmação (não bloqueia o sucesso do cadastro).
  const resultadoEmail = await enviarEmailConfirmacao({
    email: dados.email,
    nomeResponsavel: dados.nome,
    telefone: dados.telefone,
    igreja: dados.igreja,
    igrejaOutro: dados.igrejaOutro,
    membros: familia.membros.map((m) => ({
      nome: m.nome,
      parentesco: m.parentesco,
      documento: m.documento,
      ehCrianca: m.ehCrianca,
    })),
  });

  return NextResponse.json(
    {
      ok: true,
      emailEnviado: resultadoEmail.enviado,
      resumo: {
        familiaId: familia.id,
        nomeResponsavel: dados.nome,
        email: dados.email,
        igreja: nomeIgreja(dados.igreja, dados.igrejaOutro),
        totalPessoas: familia.membros.length,
        membros: familia.membros.map((m) => ({
          nome: m.nome,
          parentesco: m.parentesco,
          documento: m.documento,
          ehCrianca: m.ehCrianca,
        })),
      },
    },
    { status: 201 }
  );
}

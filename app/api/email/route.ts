import { NextResponse } from "next/server";
import { z } from "zod";
import { enviarEmailConfirmacao } from "@/lib/email";

export const runtime = "nodejs";

const emailSchema = z.object({
  email: z.string().email(),
  nomeResponsavel: z.string().min(1),
  telefone: z.string().min(1),
  igreja: z.string().min(1),
  igrejaOutro: z.string().nullable().optional(),
  membros: z
    .array(
      z.object({
        nome: z.string(),
        parentesco: z.string(),
        documento: z.string(),
        ehCrianca: z.boolean(),
      })
    )
    .default([]),
});

// POST /api/email — reenvia (ou envia) o e-mail de confirmação de inscrição.
// O fluxo de cadastro já dispara o e-mail automaticamente; esta rota permite
// reenviá-lo manualmente, se necessário.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  const parsed = emailSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { erro: "Dados inválidos para envio de e-mail." },
      { status: 422 }
    );
  }

  const resultado = await enviarEmailConfirmacao(parsed.data);

  if (!resultado.enviado) {
    return NextResponse.json(
      { ok: false, motivo: resultado.motivo },
      { status: resultado.motivo === "sem-api-key" ? 200 : 502 }
    );
  }

  return NextResponse.json({ ok: true });
}

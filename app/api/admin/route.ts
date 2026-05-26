import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, gerarToken, senhaCorreta, validarToken } from "@/lib/auth";
import { nomeIgreja } from "@/lib/igrejas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Confere se a requisição traz um cookie de sessão válido.
function autenticado(): boolean {
  return validarToken(cookies().get(ADMIN_COOKIE)?.value);
}

// --- POST /api/admin — login e logout ---------------------------------------
export async function POST(req: Request) {
  let body: { acao?: string; senha?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  if (body.acao === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(ADMIN_COOKIE);
    return res;
  }

  // Login
  if (!body.senha || !senhaCorreta(body.senha)) {
    return NextResponse.json({ erro: "Senha incorreta." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, gerarToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 horas
  });
  return res;
}

// --- GET /api/admin — dados do painel ou exportação CSV ---------------------
export async function GET(req: Request) {
  if (!autenticado()) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const familias = await prisma.familia.findMany({
    orderBy: { criadoEm: "desc" },
    include: { membros: { orderBy: { isResponsavel: "desc" } } },
  });

  // Estrutura cada família com a igreja resolvida e o responsável destacado.
  const fichas = familias.map((f) => {
    const responsavel =
      f.membros.find((m) => m.isResponsavel) || f.membros[0] || null;
    return {
      id: f.id,
      criadoEm: f.criadoEm.toISOString(),
      email: f.email,
      telefone: f.telefone,
      igreja: nomeIgreja(f.igreja, f.igrejaOutro),
      responsavel: responsavel?.nome || "—",
      totalMembros: f.membros.length,
      membros: f.membros.map((m) => ({
        id: m.id,
        nome: m.nome,
        documento: m.documento,
        parentesco: m.parentesco,
        ehCrianca: m.ehCrianca,
        ocupaCadeira: m.ocupaCadeira,
        isResponsavel: m.isResponsavel,
      })),
    };
  });

  // Exportação CSV
  const url = new URL(req.url);
  if (url.searchParams.get("formato") === "csv") {
    const linhas: string[] = [
      "Familia;Responsavel;Igreja;Email;Telefone;Nome;Documento;Parentesco;Crianca de colo;Ocupa cadeira",
    ];
    const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    for (const f of fichas) {
      for (const m of f.membros) {
        linhas.push(
          [
            f.id,
            f.responsavel,
            f.igreja,
            f.email,
            f.telefone,
            m.nome,
            m.documento,
            m.parentesco,
            m.ehCrianca ? "Sim" : "Nao",
            m.ocupaCadeira ? "Sim" : "Nao",
          ]
            .map(esc)
            .join(";")
        );
      }
    }
    // BOM para que o Excel reconheça acentuação UTF-8.
    const csv = "﻿" + linhas.join("\r\n");
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="inscritos-cynthia-benhur.csv"',
      },
    });
  }

  // Estatísticas
  const totalInscritos = fichas.reduce((s, f) => s + f.totalMembros, 0);
  const porIgrejaMap = new Map<string, number>();
  for (const f of fichas) {
    porIgrejaMap.set(f.igreja, (porIgrejaMap.get(f.igreja) || 0) + f.totalMembros);
  }
  const porIgreja = Array.from(porIgrejaMap.entries())
    .map(([igreja, total]) => ({ igreja, total }))
    .sort((a, b) => b.total - a.total);

  const limite = Number(process.env.VAGAS_LIMITE || 0);

  return NextResponse.json({
    fichas,
    estatisticas: {
      totalInscritos,
      totalFamilias: fichas.length,
      porIgreja,
      limiteVagas: limite,
      vagasRestantes: limite > 0 ? Math.max(0, limite - totalInscritos) : null,
    },
  });
}

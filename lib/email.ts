import { Resend } from "resend";
import { nomeIgreja } from "./igrejas";

type MembroResumo = {
  nome: string;
  parentesco: string;
  documento: string;
  ehCrianca: boolean;
};

type ConfirmacaoParams = {
  email: string;
  nomeResponsavel: string;
  telefone: string;
  igreja: string;
  igrejaOutro?: string | null;
  membros: MembroResumo[];
};

// Envia o e-mail de confirmacao de cadastro. Caso a RESEND_API_KEY nao esteja
// configurada, a funcao apenas registra um aviso e segue sem erro — assim o
// cadastro nunca falha por causa do e-mail.
export async function enviarEmailConfirmacao(
  params: ConfirmacaoParams
): Promise<{ enviado: boolean; motivo?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY ausente — e-mail nao enviado.");
    return { enviado: false, motivo: "sem-api-key" };
  }

  const resend = new Resend(apiKey);
  const from = process.env.EMAIL_FROM || "Cynthia & Benhur <onboarding@resend.dev>";
  const igrejaFinal = nomeIgreja(params.igreja, params.igrejaOutro);

  const linhasMembros = params.membros
    .map(
      (m) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${m.nome}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${m.parentesco}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${m.documento}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${
            m.ehCrianca ? "Criança de colo" : "Ocupa cadeira"
          }</td>
        </tr>`
    )
    .join("");

  const html = `
  <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#ffffff;color:#0a0a0a;">
    <div style="background:#0a0a0a;color:#ffffff;padding:40px 32px;text-align:center;">
      <p style="letter-spacing:4px;font-size:12px;margin:0 0 8px;font-family:Arial,sans-serif;">CONVITE CONFIRMADO</p>
      <h1 style="font-size:34px;margin:0;font-weight:400;">Cynthia &amp; Benhur</h1>
      <div style="width:48px;height:1px;background:#c9a96e;margin:16px auto;"></div>
      <p style="margin:0;font-size:14px;color:#c9a96e;">Recebemos a sua confirmação de presença</p>
    </div>
    <div style="padding:32px;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;">
      <p>Olá, <strong>${params.nomeResponsavel}</strong>!</p>
      <p>
        Sua inscrição para o casamento foi registrada com sucesso. Este e-mail
        é o seu comprovante. Guarde-o — a entrada no evento é exclusiva para
        convidados confirmados, mediante apresentação da pulseira.
      </p>
      <p style="margin:24px 0 8px;"><strong>Resumo da inscrição</strong></p>
      <p style="margin:0;">Igreja: ${igrejaFinal}</p>
      <p style="margin:0 0 16px;">Telefone: ${params.telefone}</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#f5f5f5;text-align:left;">
            <th style="padding:8px 12px;">Nome</th>
            <th style="padding:8px 12px;">Parentesco</th>
            <th style="padding:8px 12px;">Documento</th>
            <th style="padding:8px 12px;">Acomodação</th>
          </tr>
        </thead>
        <tbody>${linhasMembros}</tbody>
      </table>
      <div style="background:#f5f5f5;border-left:3px solid #0a0a0a;padding:16px;margin:24px 0;">
        <p style="margin:0;"><strong>Lembre-se:</strong> a cerimônia começa às
        <strong>20h</strong>. Os portões abrem a partir das <strong>18:30h</strong> —
        recomendamos chegada antecipada para maior conforto e tranquilidade.</p>
      </div>
      <p style="color:#666;font-size:13px;">
        Com carinho,<br/>Cynthia &amp; Benhur
      </p>
    </div>
    <div style="background:#0a0a0a;color:#888;padding:20px;text-align:center;font-size:11px;font-family:Arial,sans-serif;">
      Evento privado — entrada somente com confirmação de cadastro e pulseira.
    </div>
  </div>`;

  try {
    await resend.emails.send({
      from,
      to: params.email,
      subject: "Presença confirmada — Casamento Cynthia & Benhur",
      html,
    });
    return { enviado: true };
  } catch (err) {
    console.error("[email] Falha ao enviar:", err);
    return { enviado: false, motivo: "erro-envio" };
  }
}

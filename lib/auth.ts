import crypto from "crypto";

// Autenticacao simples do painel admin baseada em cookie assinado.
// O token e um HMAC derivado da ADMIN_PASSWORD — sem necessidade de banco.

export const ADMIN_COOKIE = "admin_session";

function secret(): string {
  return process.env.ADMIN_PASSWORD || "senha-padrao-troque-me";
}

// Gera o token que sera gravado no cookie apos o login.
export function gerarToken(): string {
  return crypto.createHmac("sha256", secret()).update("admin-ok").digest("hex");
}

// Valida o token recebido do cookie (comparacao em tempo constante).
export function validarToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const esperado = gerarToken();
  if (token.length !== esperado.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(esperado));
  } catch {
    return false;
  }
}

// Confere a senha enviada no login.
export function senhaCorreta(senha: string): boolean {
  const esperada = process.env.ADMIN_PASSWORD || "";
  if (!esperada || senha.length !== esperada.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(senha), Buffer.from(esperada));
  } catch {
    return false;
  }
}

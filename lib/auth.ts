import crypto from "crypto";

// Autenticacao simples do painel admin baseada em cookie assinado.
// O token e um HMAC derivado da combinacao email+senha — sem necessidade
// de banco de dados.

export const ADMIN_COOKIE = "admin_session";

function secret(): string {
  const email = process.env.ADMIN_EMAIL || "";
  const senha = process.env.ADMIN_PASSWORD || "";
  return `${email}|${senha}` || "segredo-padrao-troque-me";
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

// Compara duas strings em tempo constante (evita timing attacks).
function igualSeguro(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

// Confere e-mail + senha contra as variaveis de ambiente.
export function loginCorreto(email: string, senha: string): boolean {
  const emailEsperado = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const senhaEsperada = process.env.ADMIN_PASSWORD || "";
  if (!emailEsperado || !senhaEsperada) return false;
  return (
    igualSeguro(email.trim().toLowerCase(), emailEsperado) &&
    igualSeguro(senha, senhaEsperada)
  );
}

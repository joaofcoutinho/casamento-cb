// Cotas de presente disponiveis na pagina /cotas.
export const COTAS = [
  { valor: 30, label: "R$ 30,00" },
  { valor: 50, label: "R$ 50,00" },
  { valor: 100, label: "R$ 100,00" },
  { valor: 500, label: "R$ 500,00" },
  { valor: 1000, label: "R$ 1.000,00" },
] as const;

export function formatarBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

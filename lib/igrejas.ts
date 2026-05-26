// Lista de igrejas disponiveis no select do formulario de inscricao.
export const IGREJAS = [
  "IEADV SÃO DIOGO",
  "IEADV SÃO PEDRO",
  "IEADV CENTRAL CARAPINA",
  "IEADV JARDIM TROPICAL",
  "IEADV DIAMANTINA",
  "IEADV ITABATÃ/BA",
  "IEADV GUARACIABA",
  "Outros",
] as const;

export type Igreja = (typeof IGREJAS)[number];

// Resolve o nome final da igreja (se "Outros", usa o texto livre informado).
export function nomeIgreja(igreja: string, igrejaOutro?: string | null): string {
  if (igreja === "Outros") {
    return igrejaOutro?.trim() || "Outros (não especificada)";
  }
  return igreja;
}

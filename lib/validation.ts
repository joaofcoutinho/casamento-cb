import { z } from "zod";
import { IGREJAS } from "./igrejas";

// --- Membro da familia (dependente) ------------------------------------------
export const membroSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, "Informe o nome completo do membro."),
  parentesco: z.enum(["Cônjuge", "Filho", "Outro"], {
    errorMap: () => ({ message: "Selecione o parentesco." }),
  }),
  documento: z
    .string()
    .trim()
    .min(5, "Informe um CPF ou RG válido."),
  ehCrianca: z.boolean().default(false), // crianca de colo (ate 2 anos)
});

export type MembroInput = z.infer<typeof membroSchema>;

// --- Inscricao completa ------------------------------------------------------
export const inscricaoSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(3, "Informe o nome completo do responsável."),
    documento: z
      .string()
      .trim()
      .min(5, "Informe um CPF ou RG válido."),
    email: z
      .string()
      .trim()
      .email("Informe um e-mail válido."),
    telefone: z
      .string()
      .trim()
      .min(8, "Informe um telefone/WhatsApp válido."),
    igreja: z.enum(IGREJAS, {
      errorMap: () => ({ message: "Selecione a sua igreja." }),
    }),
    igrejaOutro: z.string().trim().optional(),
    membros: z.array(membroSchema).default([]),
  })
  .refine(
    (data) =>
      data.igreja !== "Outros" ||
      (data.igrejaOutro && data.igrejaOutro.length >= 3),
    {
      message: "Informe o nome da sua igreja.",
      path: ["igrejaOutro"],
    }
  );

export type InscricaoInput = z.infer<typeof inscricaoSchema>;

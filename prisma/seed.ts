import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Popula o banco com famílias de teste para validar o painel administrativo.
async function main() {
  console.log("🌱 Limpando dados anteriores...");
  await prisma.membro.deleteMany();
  await prisma.familia.deleteMany();

  const familias = [
    {
      email: "joao.santos@exemplo.com",
      telefone: "(27) 99988-7766",
      igreja: "IEADV SÃO DIOGO",
      igrejaOutro: null,
      membros: [
        { nome: "João Carlos dos Santos", documento: "123.456.789-00", parentesco: "Responsável", isResponsavel: true, ehCrianca: false, ocupaCadeira: true },
        { nome: "Maria dos Santos", documento: "987.654.321-00", parentesco: "Cônjuge", isResponsavel: false, ehCrianca: false, ocupaCadeira: true },
        { nome: "Pedro dos Santos", documento: "111.222.333-44", parentesco: "Filho", isResponsavel: false, ehCrianca: false, ocupaCadeira: true },
        { nome: "Ana dos Santos", documento: "RG 55.666.777", parentesco: "Filho", isResponsavel: false, ehCrianca: true, ocupaCadeira: false },
      ],
    },
    {
      email: "claudia.lima@exemplo.com",
      telefone: "(27) 98877-6655",
      igreja: "IEADV CENTRAL CARAPINA",
      igrejaOutro: null,
      membros: [
        { nome: "Cláudia Regina Lima", documento: "222.333.444-55", parentesco: "Responsável", isResponsavel: true, ehCrianca: false, ocupaCadeira: true },
        { nome: "Roberto Lima", documento: "333.444.555-66", parentesco: "Cônjuge", isResponsavel: false, ehCrianca: false, ocupaCadeira: true },
      ],
    },
    {
      email: "fernanda.alves@exemplo.com",
      telefone: "(27) 99123-4567",
      igreja: "IEADV JARDIM TROPICAL",
      igrejaOutro: null,
      membros: [
        { nome: "Fernanda Alves", documento: "444.555.666-77", parentesco: "Responsável", isResponsavel: true, ehCrianca: false, ocupaCadeira: true },
      ],
    },
    {
      email: "marcos.pereira@exemplo.com",
      telefone: "(73) 99888-1122",
      igreja: "IEADV ITABATÃ/BA",
      igrejaOutro: null,
      membros: [
        { nome: "Marcos Pereira", documento: "555.666.777-88", parentesco: "Responsável", isResponsavel: true, ehCrianca: false, ocupaCadeira: true },
        { nome: "Juliana Pereira", documento: "666.777.888-99", parentesco: "Cônjuge", isResponsavel: false, ehCrianca: false, ocupaCadeira: true },
        { nome: "Lucas Pereira", documento: "777.888.999-00", parentesco: "Filho", isResponsavel: false, ehCrianca: false, ocupaCadeira: true },
      ],
    },
    {
      email: "patricia.gomes@exemplo.com",
      telefone: "(27) 99555-3344",
      igreja: "Outros",
      igrejaOutro: "Igreja Batista da Praia",
      membros: [
        { nome: "Patrícia Gomes", documento: "888.999.000-11", parentesco: "Responsável", isResponsavel: true, ehCrianca: false, ocupaCadeira: true },
        { nome: "Bruno Gomes", documento: "RG 12.345.678", parentesco: "Outro", isResponsavel: false, ehCrianca: false, ocupaCadeira: true },
      ],
    },
    {
      email: "sergio.diamantina@exemplo.com",
      telefone: "(27) 99777-8899",
      igreja: "IEADV DIAMANTINA",
      igrejaOutro: null,
      membros: [
        { nome: "Sérgio Nascimento", documento: "999.000.111-22", parentesco: "Responsável", isResponsavel: true, ehCrianca: false, ocupaCadeira: true },
        { nome: "Helena Nascimento", documento: "000.111.222-33", parentesco: "Cônjuge", isResponsavel: false, ehCrianca: false, ocupaCadeira: true },
        { nome: "Davi Nascimento", documento: "RG 88.777.666", parentesco: "Filho", isResponsavel: false, ehCrianca: true, ocupaCadeira: false },
      ],
    },
  ];

  for (const f of familias) {
    await prisma.familia.create({
      data: {
        email: f.email,
        telefone: f.telefone,
        igreja: f.igreja,
        igrejaOutro: f.igrejaOutro,
        membros: { create: f.membros },
      },
    });
    console.log(`✅ Família criada: ${f.membros[0].nome} (${f.membros.length} membros)`);
  }

  const totalFamilias = await prisma.familia.count();
  const totalMembros = await prisma.membro.count();
  console.log(`\n🎉 Seed concluído: ${totalFamilias} famílias, ${totalMembros} inscritos.`);
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

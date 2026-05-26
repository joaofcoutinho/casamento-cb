# Casamento — Cynthia & Benhur

Site de confirmação de presença para o casamento da Cynthia e do Benhur. Evento
privado, vagas limitadas. Construído com **Next.js 14 (App Router)**,
**TypeScript**, **Tailwind CSS** e **Prisma + PostgreSQL (Supabase)**.

## Funcionalidades

- **Landing page** editorial com hero, informações do evento e formulário de
  inscrição inline (sem redirecionamento).
- **Formulário de inscrição** com dados do responsável, membros de família
  dinâmicos e validação com Zod + React Hook Form.
- **Confirmação inline** com resumo dos inscritos e aviso para guardar o print.
- **E-mail de confirmação** automático via Resend (opcional).
- **Página de cotas** (`/cotas`) com seletor de quantidade, total dinâmico e
  link direto do Mercado Pago.
- **Painel administrativo** protegido por senha: fichas por família, fichas por
  igreja, busca, estatísticas, impressão e exportação CSV.

## Stack

| Camada       | Tecnologia                              |
| ------------ | --------------------------------------- |
| Framework    | Next.js 14 (App Router)                 |
| Linguagem    | TypeScript                              |
| Estilo       | Tailwind CSS                            |
| Banco        | Prisma ORM + PostgreSQL (Supabase)      |
| Formulários  | React Hook Form + Zod                   |
| E-mail       | Resend                                  |
| Pagamentos   | Link fixo do Mercado Pago (sem SDK)     |

## Estrutura de rotas

```
app/
├── page.tsx                  Landing page + formulário de inscrição
├── confirmacao/page.tsx      Página de agradecimento (independente)
├── cotas/page.tsx            Página de cotas / presentes
├── admin/
│   ├── page.tsx              Login administrativo
│   └── dashboard/page.tsx    Painel da Cíntia
└── api/
    ├── inscricao/route.ts    POST — cadastro de família
    ├── email/route.ts        POST — (re)envio do e-mail de confirmação
    └── admin/route.ts        GET (dados/CSV) + POST (login/logout)
```

## Pré-requisitos

- Node.js 18.18+ (recomendado 20+)
- Uma conta no [Supabase](https://supabase.com) (banco PostgreSQL gratuito)
- (Opcional) Uma conta no [Resend](https://resend.com) para envio de e-mails

## Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
#    Copie .env.example para .env.local e preencha os valores.
cp .env.example .env.local

# 3. Criar as tabelas no banco
npm run db:push

# 4. (Opcional) Popular com dados de teste
npm run db:seed

# 5. Rodar em desenvolvimento
npm run dev
```

Acesse <http://localhost:3000>.

## Configuração do banco (Supabase)

1. Crie um projeto em <https://supabase.com>.
2. Vá em **Project Settings → Database → Connection string**.
3. Preencha em `.env.local`:
   - `DATABASE_URL` — string de **Connection pooling** (porta `6543`), acrescente
     `?pgbouncer=true` ao final.
   - `DIRECT_URL` — string de conexão **direta** (porta `5432`). Usada pelo
     Prisma nas migrações.
4. Rode `npm run db:push` para criar as tabelas `Familia` e `Membro`.

> **Desenvolvimento local com SQLite (sem Supabase):** em
> `prisma/schema.prisma`, troque `provider = "postgresql"` por
> `provider = "sqlite"`, remova a linha `directUrl`, e defina
> `DATABASE_URL="file:./dev.db"` em `.env.local`. Depois rode `npm run db:push`.

## Variáveis de ambiente

| Variável               | Descrição                                                |
| ---------------------- | -------------------------------------------------------- |
| `DATABASE_URL`         | Conexão do banco (Supabase pooler, porta 6543).          |
| `DIRECT_URL`           | Conexão direta do banco (Supabase, porta 5432).          |
| `RESEND_API_KEY`       | Chave da API Resend. Vazio = e-mail desativado.          |
| `EMAIL_FROM`           | Remetente dos e-mails (domínio verificado no Resend).    |
| `EMAIL_NOIVOS`         | E-mail de contato dos noivos.                            |
| `ADMIN_PASSWORD`       | Senha de acesso ao painel administrativo.                |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site.                                     |
| `NEXT_PUBLIC_MP_LINK`  | Link fixo do Mercado Pago para a página de cotas.        |
| `VAGAS_LIMITE`         | Número máximo de inscritos (0 = sem limite).             |

## Painel administrativo

- Acesse `/admin` e informe a senha definida em `ADMIN_PASSWORD`.
- A sessão é mantida por um cookie assinado (HttpOnly), válido por 12 horas.
- No painel você encontra: estatísticas, fichas por família, fichas agrupadas
  por igreja, busca por nome/documento, impressão da lista e exportação CSV.

## Banco de dados

```prisma
model Familia {
  id          String   @id @default(cuid())
  criadoEm    DateTime @default(now())
  email       String
  telefone    String
  igreja      String
  igrejaOutro String?
  membros     Membro[]
}

model Membro {
  id            String  @id @default(cuid())
  nome          String
  documento     String
  parentesco    String
  ehCrianca     Boolean @default(false)
  ocupaCadeira  Boolean @default(true)
  isResponsavel Boolean @default(false)
  familia       Familia @relation(fields: [familiaId], references: [id])
  familiaId     String
}
```

> O campo `igreja` foi modelado em `Familia` (e não em `Membro`), pois é único
> por cadastro — informado pelo responsável. O responsável é gravado como um
> `Membro` com `isResponsavel = true`.

## Scripts

| Comando            | Ação                                          |
| ------------------ | --------------------------------------------- |
| `npm run dev`      | Servidor de desenvolvimento.                  |
| `npm run build`    | Build de produção (gera o Prisma Client).     |
| `npm run start`    | Sobe o build de produção.                     |
| `npm run db:push`  | Sincroniza o schema com o banco.              |
| `npm run db:seed`  | Popula o banco com dados de teste.            |
| `npm run db:studio`| Abre o Prisma Studio.                         |

## Deploy na Vercel

1. Suba o projeto para um repositório Git (GitHub, GitLab...).
2. Importe o repositório em <https://vercel.com>.
3. Em **Settings → Environment Variables**, cadastre todas as variáveis do
   `.env.example` com os valores de produção.
4. O comando de build (`prisma generate && next build`) já está configurado em
   `package.json`.
5. Após o primeiro deploy, rode `npm run db:push` localmente apontando para o
   banco de produção (ou use `prisma migrate deploy` num pipeline) para garantir
   que as tabelas existem.

## Personalização

- **Foto do casal:** coloque a imagem em `public/casal.jpg`.
- **Data, versículo e textos:** edite `app/page.tsx`.
- **Lista de igrejas:** edite `lib/igrejas.ts`.
- **Valores das cotas:** edite `lib/cotas.ts`.
- **Cores e tipografia:** edite `tailwind.config.ts` e `app/layout.tsx`.

---

Feito com carinho para a Cynthia e o Benhur. 💍

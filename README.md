# Lista de Tarefas

Um aplicativo de gerenciamento de tarefas construído com React, TypeScript, Supabase e Vercel.

## Funcionalidades

- Autenticação de usuários (email/senha e GitHub)
- Gerenciamento de tarefas (criar, editar, excluir)
- Categorização de tarefas
- Upload de anexos
- Filtros e pesquisa avançada
- Estatísticas e relatórios
- Interface responsiva e moderna

## Tecnologias Utilizadas

- Frontend:
  - React
  - TypeScript
  - Tailwind CSS
  - React Query
  - React Hook Form
  - Zod
  - Lucide React

- Backend:
  - Supabase (Banco de dados PostgreSQL)
  - Supabase Edge Functions (Deno)
  - Supabase Storage (Armazenamento de arquivos)
  - Supabase Auth (Autenticação)

- Deploy:
  - Vercel (Frontend)
  - Supabase (Backend)

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase
- Conta na Vercel (opcional, para deploy)

## Configuração do Ambiente

1. Clone o repositório:
\`\`\`bash
git clone https://github.com/seu-usuario/lista-tarefas.git
cd lista-tarefas
\`\`\`

2. Instale as dependências:
\`\`\`bash
npm install
# ou
yarn
\`\`\`

3. Configure as variáveis de ambiente:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Preencha as variáveis de ambiente no arquivo `.env.local`:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-do-supabase
\`\`\`

5. Execute as migrations do banco de dados:
\`\`\`bash
npx supabase db push
\`\`\`

6. Inicie o servidor de desenvolvimento:
\`\`\`bash
npm run dev
# ou
yarn dev
\`\`\`

7. Acesse o aplicativo em `http://localhost:3000`

## Estrutura do Projeto

\`\`\`
lista-tarefas/
├── src/
│   ├── app/              # Páginas e rotas
│   ├── components/       # Componentes React
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Configurações e utilitários
│   ├── styles/          # Estilos globais
│   └── types/           # Definições de tipos
├── supabase/
│   ├── functions/       # Edge Functions
│   ├── migrations/      # Migrations do banco de dados
│   └── seed/           # Dados iniciais
├── public/             # Arquivos estáticos
└── package.json
\`\`\`

## Deploy

### Frontend (Vercel)

1. Conecte seu repositório à Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push na branch main

### Backend (Supabase)

1. Execute as migrations no ambiente de produção:
\`\`\`bash
npx supabase db push --db-url=sua-url-do-banco
\`\`\`

2. Deploy das Edge Functions:
\`\`\`bash
npx supabase functions deploy
\`\`\`

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (\`git checkout -b feature/nova-feature\`)
3. Commit suas mudanças (\`git commit -m 'Adiciona nova feature'\`)
4. Push para a branch (\`git push origin feature/nova-feature\`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Autor

Seu Nome - [@seu-usuario](https://github.com/seu-usuario)

## Agradecimentos

- [Supabase](https://supabase.io/)
- [Vercel](https://vercel.com/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)

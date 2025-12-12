# 💪 Academia App - Frontend

Aplicativo web moderno para gestão de academia, desenvolvido com React, TypeScript e Vite. O sistema oferece interfaces diferenciadas para professores e alunos, com funcionalidades completas de gerenciamento de treinos, conquistas, ranking e muito mais.

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias](#-tecnologias)
- [Funcionalidades](#-funcionalidades)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Integração com Backend](#-integração-com-backend)
- [Membros do Grupo](#-membros-do-grupo)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

## 🎯 Sobre o Projeto

O **M** é uma solução completa para gestão de academias, permitindo que professores gerenciem alunos e treinos, enquanto os alunos acompanham seu progresso, completam treinos, desbloqueiam conquistas e competem em rankings.

### Principais Características

- 🔐 **Sistema de Autenticação**: Login separado para professores e alunos
- 👨‍🏫 **Dashboard do Professor**: Gerenciamento completo de alunos e treinos
- 👨‍🎓 **Dashboard do Aluno**: Acompanhamento de progresso e treinos
- 🏋️ **Sistema de Treinos**: Criação e acompanhamento de treinos personalizados
- 🏆 **Conquistas**: Sistema de gamificação com conquistas desbloqueáveis
- 📊 **Ranking**: Rankings mensais e totais para motivar os alunos
- 🎨 **Interface Moderna**: Design responsivo com Tailwind CSS
- 🌙 **Tema Escuro**: Suporte a tema escuro (preparado para implementação)

## 🛠️ Tecnologias

### Core
- **[React](https://react.dev/)** 19.2.0 - Biblioteca JavaScript para construção de interfaces
- **[TypeScript](https://www.typescriptlang.org/)** 5.9.3 - Superset JavaScript com tipagem estática
- **[Vite](https://vitejs.dev/)** 7.2.4 - Build tool e dev server ultra-rápido

### Estilização
- **[Tailwind CSS](https://tailwindcss.com/)** 4.1.17 - Framework CSS utility-first
- **[Lucide React](https://lucide.dev/)** 0.556.0 - Biblioteca de ícones

### Ferramentas de Desenvolvimento
- **[ESLint](https://eslint.org/)** 9.39.1 - Linter para JavaScript/TypeScript
- **[TypeScript ESLint](https://typescript-eslint.io/)** 8.46.4 - Linter específico para TypeScript

## ✨ Funcionalidades

### Para Professores 👨‍🏫

- ✅ Dashboard com visão geral dos alunos
- ✅ Listagem e busca de alunos
- ✅ Criação de novos alunos
- ✅ Visualização detalhada de cada aluno
- ✅ Criação e edição de planos de treino
- ✅ Visualização de informações médicas dos alunos
- ✅ Acompanhamento de progresso dos alunos
- ✅ Visualização de rankings

### Para Alunos 👨‍🎓

- ✅ Dashboard personalizado com estatísticas
- ✅ Visualização de treinos atribuídos
- ✅ Marcação de exercícios como completos
- ✅ Sistema de XP e níveis
- ✅ Streak de treinos consecutivos
- ✅ Visualização de conquistas desbloqueadas
- ✅ Rankings mensais e totais
- ✅ Configurações de perfil
- ✅ Troca de senha no primeiro acesso

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **[Node.js](https://nodejs.org/)** (versão 18 ou superior)
- **[npm](https://www.npmjs.com/)** ou **[yarn](https://yarnpkg.com/)** ou **[pnpm](https://pnpm.io/)**

## 🚀 Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/academia-app-frontend.git
   cd academia-app-frontend
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   ```

3. **Configure as variáveis de ambiente**
   
   Crie um arquivo `.env` na raiz do projeto:
   ```env
   # Modo da API (mock ou server)
   VITE_API_MODE=mock
   
   # URL do backend (apenas se VITE_API_MODE=server)
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   # ou
   yarn dev
   # ou
   pnpm dev
   ```

5. **Acesse a aplicação**
   
   Abra seu navegador em `http://localhost:5173` (ou a porta indicada no terminal)

## ⚙️ Configuração

### Modos de Operação

O aplicativo suporta dois modos de operação:

#### Modo Mock (Desenvolvimento)
```env
VITE_API_MODE=mock
```
- Usa dados mockados armazenados no localStorage
- Ideal para desenvolvimento sem backend
- Permite desenvolvimento e testes rápidos

#### Modo Servidor (Produção)
```env
VITE_API_MODE=server
VITE_API_URL=http://localhost:3000/api
```
- Conecta-se a um backend real
- Requer backend Node.js rodando
- Veja a seção [Integração com Backend](#-integração-com-backend) para mais detalhes

## 📜 Scripts Disponíveis

```bash
# Inicia o servidor de desenvolvimento
npm run dev

# Cria build de produção
npm run build

# Visualiza o build de produção localmente
npm run preview

# Executa o linter
npm run lint
```

## 📁 Estrutura do Projeto

```
academia-app-frontend/
├── public/                 # Arquivos estáticos públicos
├── src/
│   ├── api/               # Configuração e cliente da API
│   │   ├── client.ts     # Cliente HTTP
│   │   ├── config.ts     # Configurações e endpoints
│   │   └── index.ts      # Exportações da API
│   ├── components/        # Componentes React
│   │   ├── common/       # Componentes compartilhados
│   │   ├── student/      # Componentes do aluno
│   │   └── teacher/      # Componentes do professor
│   ├── data/             # Dados mockados
│   ├── screens/          # Telas principais
│   ├── styles/           # Estilos globais
│   ├── theme/            # Sistema de temas
│   ├── types/            # Definições TypeScript
│   ├── App.tsx           # Componente principal
│   └── main.tsx          # Ponto de entrada
├── .gitignore            # Arquivos ignorados pelo Git
├── index.html            # HTML principal
├── package.json          # Dependências e scripts
├── tsconfig.json         # Configuração TypeScript
├── vite.config.ts        # Configuração Vite
└── README.md             # Este arquivo
```

## 🔌 Integração com Backend

O frontend está preparado para se integrar com um backend Node.js. Para mais detalhes sobre a integração, endpoints esperados e exemplos de implementação, consulte o arquivo de documentação de integração (se disponível) ou a seção de API em `src/api/config.ts`.

### Endpoints Principais

- **Autenticação**: `/api/auth/login`, `/api/auth/logout`
- **Usuários**: `/api/users/me`
- **Alunos**: `/api/students`, `/api/students/:id`
- **Treinos**: `/api/workouts`, `/api/workouts/student/:studentId`
- **Conquistas**: `/api/achievements/user`
- **Ranking**: `/api/members/ranking/monthly`, `/api/members/ranking/total`

Para informações detalhadas sobre a estrutura de dados e exemplos de requisições, consulte os tipos definidos em `src/types/index.ts`.

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir com o projeto:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código

- Use TypeScript para todo o código
- Siga as convenções do ESLint configuradas
- Mantenha os componentes pequenos e focados
- Adicione comentários quando necessário
- Use nomes descritivos para variáveis e funções

## 📄 Licença

Este projeto está sob a licença especificada no arquivo `LICENSE`.

---

Desenvolvido com ❤️ para facilitar a gestão de academias

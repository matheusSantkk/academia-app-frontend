# Quick Start - Deploy Firebase

## Comandos Rápidos

### 1. Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login
```bash
firebase login
```

### 3. Inicializar Firebase (primeira vez)
```bash
cd academia-app-frontend
firebase init hosting
```
- Escolha seu projeto
- Public directory: `dist`
- Single-page app: `Yes`
- GitHub: `No`

### 4. Configurar variáveis de ambiente

Crie o arquivo `.env.production` na raiz do projeto:

```env
VITE_API_URL=https://seu-backend.onrender.com/api
VITE_API_MODE=server
```

**⚠️ IMPORTANTE**: Substitua `https://seu-backend.onrender.com` pela URL real do seu backend no Render.

### 5. Build e Deploy
```bash
npm run build
npm run deploy
```

Ou use o script combinado:
```bash
npm run deploy
```

## URLs do Firebase

Após o deploy, seu app estará disponível em:
- `https://seu-projeto.firebaseapp.com`
- `https://seu-projeto.web.app`

## Atualizar Backend no Render

Não esqueça de adicionar as URLs do Firebase em `ALLOWED_ORIGINS` no Render:
```
https://seu-projeto.firebaseapp.com,https://seu-projeto.web.app
```

## Documentação Completa

Para instruções detalhadas, consulte: [DEPLOY_FIREBASE.md](./DEPLOY_FIREBASE.md)


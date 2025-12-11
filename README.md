# 🔌 Guia de Integração com Backend Node.js

Este guia explica como integrar o frontend com um backend Node.js.

## 📋 Pré-requisitos

- Backend Node.js rodando
- Endpoints da API implementados
- Sistema de autenticação JWT (recomendado)

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Ativar modo servidor
VITE_API_MODE=server

# URL do seu backend
VITE_API_URL=http://localhost:3000/api
```

### 2. Estrutura de Endpoints Esperada

O frontend espera os seguintes endpoints no backend:

#### **Autenticação**
```
POST /api/auth/login
Body: { email: string, password: string }
Response: { user: UserData, token: string }

POST /api/auth/logout
Headers: Authorization: Bearer {token}

POST /api/auth/refresh
Body: { refreshToken: string }
Response: { token: string }
```

#### **Usuários**
```
GET /api/users/me
Headers: Authorization: Bearer {token}
Response: UserData

PATCH /api/users/:id
Headers: Authorization: Bearer {token}
Body: Partial<UserData>
Response: UserData
```

#### **Alunos**
```
GET /api/students
Headers: Authorization: Bearer {token}
Response: StudentData[]

GET /api/students/:id
Headers: Authorization: Bearer {token}
Response: StudentData

POST /api/students
Headers: Authorization: Bearer {token}
Body: Partial<StudentData>
Response: StudentData

PATCH /api/students/:id
Headers: Authorization: Bearer {token}
Body: Partial<StudentData>
Response: StudentData

GET /api/students/:id/medical
Headers: Authorization: Bearer {token}
Response: StudentMedicalInfo
```

#### **Treinos**
```
GET /api/workouts
Headers: Authorization: Bearer {token}
Response: Workout[]

GET /api/workouts/student/:studentId
Headers: Authorization: Bearer {token}
Response: Workout[]

POST /api/workouts
Headers: Authorization: Bearer {token}
Body: Workout
Response: Workout

PATCH /api/workouts/:id
Headers: Authorization: Bearer {token}
Body: Partial<Workout>
Response: Workout
```

#### **Planos de Treino**
```
GET /api/training/:studentId
Headers: Authorization: Bearer {token}
Response: Workout[]

POST /api/training/:studentId
Headers: Authorization: Bearer {token}
Body: { workouts: Workout[] }
Response: Workout[]
```

#### **Conquistas**
```
GET /api/achievements/user
Headers: Authorization: Bearer {token}
Response: Achievement[]
```

#### **Ranking**
```
GET /api/ranking/monthly
Headers: Authorization: Bearer {token}
Response: RankingUser[]

GET /api/ranking/total
Headers: Authorization: Bearer {token}
Response: RankingUser[]
```

#### **Preferências**
```
GET /api/preferences
Headers: Authorization: Bearer {token}
Response: UserPreferences

PUT /api/preferences
Headers: Authorization: Bearer {token}
Body: UserPreferences
Response: UserPreferences
```

### 3. Tipos TypeScript

Os tipos estão definidos em `src/types/index.ts`:

```typescript
interface UserData {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher";
  level?: number;
  points?: number;
  streak?: number;
  avatar?: string;
}

interface StudentData extends UserData {
  age: number;
}

interface Workout {
  id: string;
  type: "A" | "B" | "C";
  name: string;
  exercises: Exercise[];
  completedAt?: string;
}

interface Exercise {
  id: string;
  name: string;
  series: number;
  reps: string;
  weight: number;
  rest: string;
  completed: boolean;
  isPR?: boolean;
}

// ... outros tipos
```

### 4. Autenticação JWT

O cliente HTTP já está preparado para JWT:

```typescript
// Após login bem-sucedido, o token é salvo automaticamente
const response = await api.login(email, password);
// Token é armazenado em localStorage e adicionado aos headers

// Para fazer logout
import { logout } from './api';
logout(); // Remove token do localStorage e headers
```

### 5. Tratamento de Erros

O sistema já trata erros automaticamente:

```typescript
try {
  const students = await api.getStudents();
} catch (error) {
  // Erros são lançados como APIError
  if (error instanceof APIError) {
    console.error(error.statusCode, error.message);
  }
}
```

## 🔄 Modo de Desenvolvimento

### Usando Mock (Padrão)

```bash
# .env
VITE_API_MODE=mock
```

Benefícios:
- ✅ Desenvolvimento sem backend
- ✅ Dados persistidos em localStorage
- ✅ Testes rápidos

### Usando Servidor Real

```bash
# .env
VITE_API_MODE=server
VITE_API_URL=http://localhost:3000/api
```

Benefícios:
- ✅ Teste com dados reais
- ✅ Validação de integração
- ✅ Debug de problemas

## 🛠️ Exemplo de Backend Node.js

### Estrutura Básica

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/workouts', require('./routes/workouts'));
// ... outras rotas

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Exemplo de Rota (Login)

```javascript
// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Validar credenciais (exemplo simplificado)
  const user = await User.findOne({ email });
  if (!user || !user.validatePassword(password)) {
    return res.status(401).json({ message: 'Credenciais inválidas' });
  }
  
  // Gerar token
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  });
});

module.exports = router;
```

### Middleware de Autenticação

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = authMiddleware;
```

## 🎯 Checklist de Integração

- [ ] Backend Node.js rodando
- [ ] Endpoints implementados conforme documentação
- [ ] CORS configurado
- [ ] JWT implementado
- [ ] Variáveis de ambiente configuradas
- [ ] `.env` criado com `VITE_API_MODE=server`
- [ ] Testes de integração realizados
- [ ] Tratamento de erros verificado
- [ ] Performance otimizada

## 📚 Recursos Adicionais

- **Documentação da API**: Configure Swagger/OpenAPI no backend
- **Testes**: Use Jest para testes unitários
- **Monitoramento**: Configure logs e analytics
- **Deploy**: Configure CI/CD para produção

## 🐛 Troubleshooting

### Erro: "Erro de conexão"
- Verifique se o backend está rodando
- Confirme a URL no `.env`
- Verifique CORS no backend

### Erro: "Token inválido"
- Limpe o localStorage
- Faça login novamente
- Verifique o SECRET do JWT

### Erro: "404 Not Found"
- Confirme que as rotas no backend estão corretas
- Verifique os endpoints em `src/api/config.ts`

## 💡 Dicas

1. **Desenvolvimento**: Use modo mock para desenvolvimento rápido
2. **Staging**: Use servidor de testes antes de produção
3. **Produção**: Configure variáveis de ambiente apropriadas
4. **Logs**: Ative logs detalhados em desenvolvimento
5. **Cache**: Implemente cache onde apropriado

---

Para mais informações, consulte a documentação do código em `src/api/`.

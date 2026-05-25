# 🚀 Quick Start - NutriXP

## ⚡ Setup em 5 Minutos

### 1️⃣ MySQL - Criar Banco (1 minuto)

```bash
mysql -u root -p < database\schema.sql
```

### 2️⃣ Backend - Python (2 minutos)

```bash
cd backend

# Windows
python -m venv venv && venv\Scripts\activate

# Linux/Mac
python3 -m venv venv && source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# EDITAR: backend/app.py linhas 10-15
# ⚠️ Altere MYSQL_PASSWORD com sua senha!

# Rodar servidor
python app.py
```

**Esperado:** `Running on http://127.0.0.1:5000`

### 3️⃣ Frontend - React (2 minutos)

```bash
cd frontend

npm install
npm start
```

**Esperado:** Abre `http://localhost:3000` automaticamente

---

## ✅ Testar Funcionamento

### 1. Criar Conta
1. Clique em "Registre-se"
2. Preencha: Nome, Email, Senha
3. Clique em "✅ Registrar"

### 2. Fazer Login
1. Use o email e senha criados
2. Clique em "🔓 Login"
3. Você será redirecionado para o Dashboard

### 3. Registrar Refeição
1. Clique em "🍽️ Refeições"
2. Escolha tipo (almoço, jantar, etc)
3. Descreva os alimentos: "salada com frango"
4. Clique em "✅ Registrar Refeição"
5. ✨ **Veja seu XP aumentar!**

### 4. Registrar Exercício
1. Clique em "🏋️ Exercícios"
2. Escolha tipo: "corrida"
3. Digite duração: "30" minutos
4. Veja XP estimado aparecer
5. Clique em "✅ Registrar Exercício"

### 5. Ver Ranking
1. Clique em "🏆 Ranking"
2. Veja seu perfil entre os usuários
3. Crie mais contas para ver ranking crescer

---

## 📂 Estrutura Criada

```
projeto_expo/
├── README.md              ← Documentação completa
├── ARQUITETURA.md         ← Diagramas e detalhes técnicos
├── INSTALACAO.md          ← Guia passo-a-passo
├── QUICK_START.md         ← Este arquivo
│
├── database/
│   └── schema.sql         ← Criar tabelas MySQL
│
├── backend/
│   ├── app.py             ← API Flask (9 endpoints)
│   ├── requirements.txt    ← Dependências Python
│   └── .env.example       ← Exemplo de configuração
│
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── App.js         ← Componente principal
    │   ├── App.css        ← Estilos globais
    │   ├── index.js       ← Entry point React
    │   ├── components/    ← 4 componentes principais
    │   │   ├── Dashboard.js
    │   │   ├── FormRefeicao.js
    │   │   ├── FormExercicio.js
    │   │   ├── Ranking.js
    │   │   └── *.css (4 arquivos)
    │   └── services/
    │       └── api.js     ← Cliente HTTP
    └── package.json       ← Dependências Node
```

---

## 🎮 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/login` | Fazer login (retorna JWT) |
| `GET` | `/usuarios` | Listar todos os usuários |
| `GET` | `/usuarios/<id>` | Obter usuário específico |
| `POST` | `/usuarios` | Registrar novo usuário |
| `GET` | `/refeicoes/<uid>` | Listar refeições |
| `POST` | `/refeicoes` | Registrar refeição (+XP) |
| `DELETE` | `/refeicoes/<id>` | Remover refeição (-XP) |
| `GET` | `/exercicios/<uid>` | Listar exercícios |
| `POST` | `/exercicios` | Registrar exercício (+XP) |
| `DELETE` | `/exercicios/<id>` | Remover exercício (-XP) |
| `GET` | `/ranking` | Top usuários por XP |
| `GET` | `/health` | Status da API |

---

## 🔧 Portas

- **Frontend:** http://localhost:3000 (React)
- **Backend:** http://localhost:5000 (Flask)
- **MySQL:** localhost:3306 (Banco)

---

## ⚠️ Problemas Comuns

| Problema | Solução |
|----------|---------|
| "Cannot connect to MySQL" | Verifique MySQL está rodando: `mysql -u root -p` |
| "Port 5000 already in use" | Mude porta em `backend/app.py` linha 42 |
| "Module not found (React)" | Rode `npm install` no diretório `frontend/` |
| "Python venv not found" | Crie novamente: `python -m venv venv` |

---

## 📝 Exemplo de Dados

### Usuário Teste
```
Email: teste@example.com
Senha: 123456
```

### Refeição Teste
```
Tipo: almoço
Alimentos: salada com frango e brócolis
XP Ganho: ~80-90 XP
```

### Exercício Teste
```
Tipo: corrida
Duração: 30 minutos
XP Ganho: 90 XP
```

---

## 📚 Documentos Adicionais

- **[README.md](README.md)** - Visão geral completa do projeto
- **[INSTALACAO.md](INSTALACAO.md)** - Instalação detalhada
- **[ARQUITETURA.md](ARQUITETURA.md)** - Diagramas e fórmulas de XP

---

## 🎯 Próximos Passos Recomendados

1. ✅ Rodar os 3 serviços (MySQL, Flask, React)
2. ✅ Criar uma conta de teste
3. ✅ Testar cada funcionalidade
4. ✅ Ler [ARQUITETURA.md](ARQUITETURA.md) para entender melhor
5. 🔧 Customizar cores em `frontend/src/App.css`
6. ➕ Adicionar novas features!

---

**Parabéns! Seu app de nutrição com gamificação está pronto! 🎉**

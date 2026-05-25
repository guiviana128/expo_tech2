# 🍎 NutriXP - App de Nutrição com Gamificação

## 📋 Descrição
Aplicação web que incentiva usuários a manter uma alimentação saudável e exercícios físicos através de um sistema de **XP (experiência)** e **níveis**.

### Funcionamento
- Usuários registram suas refeições e exercícios
- Ganham **XP** baseado em:
  - Alimentos saudáveis (mais XP)
  - Quantidade de exercício (mais XP)
  - Consistência (bônus)
- Sobem de **nível** ao acumular XP
- Participam de um **ranking** com outros usuários

---

## 💻 Stack Tecnológico

### **Frontend: React.js**
```
Por que React?
✓ Componentes reutilizáveis (DRY - Don't Repeat Yourself)
✓ Estado reativo (atualiza interface automaticamente)
✓ Comunidade grande e muitas bibliotecas
✓ Performance otimizada com virtual DOM
```

### **Backend: Python + Flask**
```
Por que Python + Flask?
✓ Sintaxe simples e legível
✓ Flask é leve e flexível (não impõe padrões)
✓ Integração fácil com banco de dados
✓ Segurança robusta (JWT, validação)
```

### **Banco de Dados: MySQL**
```
Por que MySQL?
✓ Relacional (dados estruturados)
✓ Suporta transações ACID
✓ Gratuito e open-source
✓ Escalável para aplicações médias
```

### **Arquitetura**
```
┌─────────────────────────────────────────┐
│         FRONTEND (React)                 │
│  - Dashboard com gráficos de XP         │
│  - Formulário de refeições              │
│  - Formulário de exercícios             │
│  - Ranking de usuários                  │
└────────────────┬────────────────────────┘
                 │ HTTP (GET, POST, DELETE)
┌────────────────▼────────────────────────┐
│  BACKEND (Python + Flask)               │
│  - API REST com validação               │
│  - Lógica de cálculo de XP              │
│  - Autenticação com JWT                 │
└────────────────┬────────────────────────┘
                 │ SQL
┌────────────────▼────────────────────────┐
│  BANCO DE DADOS (MySQL)                 │
│  - Usuários                             │
│  - Refeições                            │
│  - Exercícios                           │
│  - Histórico de XP                      │
└─────────────────────────────────────────┘
```

---

## 📁 Estrutura do Projeto

```
projeto_expo/
├── backend/                    # Python + Flask
│   ├── app.py                 # Aplicação principal
│   ├── config.py              # Configurações
│   ├── requirements.txt        # Dependências
│   └── models.py              # Modelos de dados
│
├── frontend/                   # React
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── pages/            # Páginas principais
│   │   ├── services/         # Requisições API
│   │   └── App.js            # Componente principal
│   └── package.json          # Dependências
│
├── database/
│   └── schema.sql            # Estrutura do banco
│
└── README.md                 # Este arquivo
```

---

## 🚀 Como Rodar

### **1. Backend (Python)**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### **2. Frontend (React)**
```bash
cd frontend
npm install
npm start
```

### **3. Banco de Dados (MySQL)**
```bash
mysql -u root -p < database/schema.sql
```

---

## 📡 API Endpoints

### **GET /usuarios**
Retorna lista de todos os usuários

### **GET /usuarios/<id>**
Retorna dados de um usuário específico

### **POST /usuarios**
Cria um novo usuário

### **GET /refeicoes/<usuario_id>**
Retorna refeições de um usuário

### **POST /refeicoes**
Registra uma nova refeição (adiciona XP)

### **DELETE /refeicoes/<id>**
Remove uma refeição

### **GET /exercicios/<usuario_id>**
Retorna exercícios de um usuário

### **POST /exercicios**
Registra um novo exercício (adiciona XP)

### **DELETE /exercicios/<id>**
Remove um exercício

### **GET /ranking**
Retorna ranking de usuários por XP

---

## 🎮 Cálculo de XP

```python
# Alimentos
Maçã, Brócolis, Frango:    +50 XP
Pizza, Hambúrguer:         +10 XP
Salada:                    +80 XP

# Exercícios
Corrida (30 min):         +100 XP
Musculação (1 hora):      +150 XP
Caminhada (30 min):       +50 XP
Yoga (1 hora):            +75 XP

# Bônus de Consistência
3 dias seguidos:          +20 XP
7 dias seguidos:          +50 XP
```

---

## 🔒 Segurança

- Validação de entrada em frontend e backend
- Senhas criptografadas com bcrypt
- JWT para autenticação
- SQL Prepared Statements (prevenção de SQL Injection)

---

## 📚 Tecnologias Específicas

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| React | 18.x | Interface responsiva |
| Flask | 2.x | Framework web Python |
| MySQL | 8.x | Banco relacional |
| Axios | 1.x | Requisições HTTP |
| SQLAlchemy | 2.x | ORM Python |
| JWT | - | Autenticação |

---

**Desenvolvido para incentivar hábitos saudáveis através da gamificação! 🎮💪**

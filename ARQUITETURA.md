# 🏗️ Arquitetura do NutriXP

## 📐 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENTE (Frontend)                          │
│                     React.js 18.2                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   Login Page     │  │   Dashboard      │  │   Forms      │  │
│  │                  │  │  - XP Progress   │  │ - Refeições  │  │
│  │  - Register      │  │  - Stats Cards   │  │ - Exercícios │  │
│  │  - Login         │  │  - Chart XP      │  │              │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │   Ranking Page   │  │   Navigation     │                    │
│  │  - Top Users     │  │   - Navbar       │                    │
│  │  - Badges (🥇🥈🥉)  │  │   - Routing      │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                  │
│  📡 HTTP Client (Axios)                                        │
│     └─ Methods: GET, POST, DELETE                              │
│     └─ Auth: JWT Token (localStorage)                          │
└─────────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
                   http://localhost:3000
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                  SERVIDOR (Backend)                             │
│                 Flask 2.3.0 + Python 3.8+                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           API REST - 9 Endpoints Principais              │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  🔓 POST   /login                                        │  │
│  │     └─ Gera JWT Token                                   │  │
│  │                                                          │  │
│  │  👤 GET    /usuarios          | Listar todos            │  │
│  │  👤 GET    /usuarios/<id>     | Obter específico        │  │
│  │  👤 POST   /usuarios          | Registrar novo          │  │
│  │                                                          │  │
│  │  🍽️ GET    /refeicoes/<uid>   | Listar refeições       │  │
│  │  🍽️ POST   /refeicoes        | Registrar + calcula XP  │  │
│  │  🍽️ DELETE /refeicoes/<id>    | Remove + subtrai XP    │  │
│  │                                                          │  │
│  │  🏃 GET    /exercicios/<uid>  | Listar exercícios      │  │
│  │  🏃 POST   /exercicios        | Registrar + calcula XP  │  │
│  │  🏃 DELETE /exercicios/<id>   | Remove + subtrai XP    │  │
│  │                                                          │  │
│  │  🏆 GET    /ranking           | Top usuários (XP DESC)  │  │
│  │                                                          │  │
│  │  🔧 GET    /health            | Status da API           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │        Lógica de Negócio (Funções)                       │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  • calcular_xp_refeicao(alimentos)                       │  │
│  │    └─ Retorna XP baseado em alimentos saudáveis         │  │
│  │                                                          │  │
│  │  • calcular_xp_exercicio(tipo, duracao_minutos)         │  │
│  │    └─ XP = duracao * taxa_por_tipo                      │  │
│  │                                                          │  │
│  │  • verificar_nivel(usuario_id)                          │  │
│  │    └─ novo_nivel = (XP // 1000) + 1                    │  │
│  │                                                          │  │
│  │  • token_required(decorator)                            │  │
│  │    └─ Protege endpoints com JWT                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  🔐 Segurança:                                                 │
│     - bcrypt para hash de senhas                               │
│     - JWT (RS256) para autenticação                            │
│     - Prepared Statements para SQL injection prevention        │
│     - CORS habilitado para localhost:3000                      │
└─────────────────────────────────────────────────────────────────┘
                            ↕ SQL
                   mysql://localhost:3306
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│               BANCO DE DADOS (MySQL 8.0)                        │
│                  Database: nutrixp                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ TABELA: usuarios                                           │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │ - id (PK)                                                  │ │
│  │ - nome VARCHAR(100)                                        │ │
│  │ - email VARCHAR(100) UNIQUE                                │ │
│  │ - senha VARCHAR(255) [bcrypt hash]                         │ │
│  │ - xp INT [padrão: 0]                                       │ │
│  │ - nivel INT [padrão: 1]                                    │ │
│  │ - data_criacao TIMESTAMP                                   │ │
│  │ - ultima_atividade TIMESTAMP                               │ │
│  │                                                            │ │
│  │ Índices:                                                   │ │
│  │ - PRIMARY KEY (id)                                         │ │
│  │ - UNIQUE KEY (email)                                       │ │
│  │ - INDEX xp DESC (para ranking)                             │ │
│  │ - INDEX nivel DESC                                         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ TABELA: refeicoes                                          │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │ - id (PK)                                                  │ │
│  │ - usuario_id (FK → usuarios.id) [ON DELETE CASCADE]        │ │
│  │ - tipo VARCHAR(50) [café, almoço, lanche, janta]          │ │
│  │ - alimentos TEXT                                           │ │
│  │ - calorias INT                                             │ │
│  │ - xp_ganho INT                                             │ │
│  │ - data_refeicao DATETIME                                   │ │
│  │ - criado_em TIMESTAMP                                      │ │
│  │                                                            │ │
│  │ Índices:                                                   │ │
│  │ - INDEX (usuario_id, data_refeicao DESC)                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ TABELA: exercicios                                         │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │ - id (PK)                                                  │ │
│  │ - usuario_id (FK → usuarios.id) [ON DELETE CASCADE]        │ │
│  │ - tipo VARCHAR(100) [corrida, yoga, musculação...]        │ │
│  │ - duracao_minutos INT                                      │ │
│  │ - xp_ganho INT                                             │ │
│  │ - data_exercicio DATETIME                                  │ │
│  │ - criado_em TIMESTAMP                                      │ │
│  │                                                            │ │
│  │ Índices:                                                   │ │
│  │ - INDEX (usuario_id, data_exercicio DESC)                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ TABELA: historico_xp [Auditoria]                           │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │ - id (PK)                                                  │ │
│  │ - usuario_id (FK → usuarios.id)                            │ │
│  │ - tipo VARCHAR(50) [refeição, exercício, bônus...]        │ │
│  │ - xp_ganho INT                                             │ │
│  │ - referencia_id INT [ID da refeição/exercício]            │ │
│  │ - data_evento DATETIME                                     │ │
│  │ - criado_em TIMESTAMP                                      │ │
│  │                                                            │ │
│  │ Uso: Rastreamento de todas as mudanças de XP              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ TABELA: metas_diarias [Funcionalidade Extra]               │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │ - id (PK)                                                  │ │
│  │ - usuario_id (FK → usuarios.id)                            │ │
│  │ - data_meta DATE                                           │ │
│  │ - refeicoes_esperadas INT [padrão: 3]                      │ │
│  │ - exercicios_minutos INT [padrão: 30]                      │ │
│  │ - calorias_alvo INT [padrão: 2000]                         │ │
│  │ - completado BOOLEAN                                       │ │
│  │                                                            │ │
│  │ Índices:                                                   │ │
│  │ - UNIQUE (usuario_id, data_meta)                           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Dados

### 1. Autenticação
```
[Login Page] → POST /login → [Validação de senha] → JWT Token
              ↓
        localStorage.setItem('token')
              ↓
        [Redirect → Dashboard]
```

### 2. Registrar Refeição
```
[Usuário preencheMornis formulário]
              ↓
      [Form onSubmit]
              ↓
   POST /refeicoes (JWT)
              ↓
    [Backend calcula XP]
   calcular_xp_refeicao()
              ↓
   [Insere em refeicoes]
      [Atualiza usuarios.xp]
      [Insere em historico_xp]
      [Verifica nível]
              ↓
      [Retorna mensagem + ID]
              ↓
   [Frontend atualiza Dashboard]
```

### 3. Visualizar Ranking
```
[Usuário clica em Ranking]
              ↓
    GET /ranking?limite=10
              ↓
    [Backend ordena por XP DESC]
    SELECT * FROM usuarios ORDER BY xp DESC LIMIT 10
              ↓
    [Adiciona posição + insígnia]
              ↓
    [Frontend renderiza cards]
```

---

## 🔐 Modelo de Segurança

### Autenticação (JWT)
```
1. Usuário faz login com email + senha
2. Backend valida com bcrypt.checkpw()
3. Backend gera JWT token com:
   - usuario_id
   - exp (expiração em 7 dias)
4. Frontend armazena em localStorage
5. Cada requisição incluí: Authorization: Bearer <token>
6. Backend valida @token_required decorator
```

### Proteção de Dados
```
- Senhas: bcrypt com salt aleatório
- SQL Injection: Prepared Statements (%s placeholder)
- CSRF: JWT em header (não em cookie)
- CORS: Apenas localhost:3000 permitido
```

---

## 📊 Cálculo de XP - Fórmulas

### Refeições
```python
def calcular_xp_refeicao(alimentos):
    xp = 50  # Base
    
    # Alimentos saudáveis
    saudaveis = {
        'salada': +30,
        'brócolis': +30,
        'maçã': +30,
        'frango': +30,
        'peixe': +30,
        'ovo': +30,
        'iogurte': +30
    }
    
    # Alimentos não saudáveis
    ruins = {
        'pizza': -20,
        'hambúrguer': -20,
        'refrigerante': -20,
        'doce': -20,
        'batata_frita': -20
    }
    
    # Aplicar bônus/penalidade
    for alimento, bônus in saudaveis.items():
        if alimento in alimentos:
            xp += bônus
    
    for alimento, penalidade in ruins.items():
        if alimento in alimentos:
            xp += penalidade
    
    return max(10, xp)  # Mínimo 10 XP
```

### Exercícios
```python
def calcular_xp_exercicio(tipo, duracao_minutos):
    xp_por_minuto = {
        'corrida': 3.0,
        'natação': 3.5,
        'musculação': 2.5,
        'bicicleta': 2.0,
        'yoga': 1.2,
        'caminhada': 1.5
    }
    
    taxa = xp_por_minuto.get(tipo, 1.0)
    xp = int(duracao_minutos * taxa)
    
    return max(20, xp)  # Mínimo 20 XP
```

### Níveis
```python
def calcular_nivel(xp_total):
    novo_nivel = (xp_total // 1000) + 1
    return novo_nivel

# Exemplo:
# 0-999 XP     → Nível 1
# 1000-1999 XP → Nível 2
# 2000-2999 XP → Nível 3
```

---

## 🚀 Escalabilidade Futura

### Otimizações Possíveis
1. **Cache (Redis)**
   - Cachear ranking top 10
   - Cachear perfil do usuário

2. **Background Jobs (Celery)**
   - Processar bônus de consistência
   - Enviar notificações

3. **Banco de Dados**
   - Adicionar replicação MySQL
   - Particionamento de historico_xp

4. **Frontend**
   - Code splitting com React.lazy
   - PWA (offline mode)

5. **Features Novas**
   - Desafios semanais
   - Sistema de amigos
   - Badges personalizadas
   - Push notifications

---

## 📚 Stack Tecnológico - Justificativas

| Tecnologia | Razão |
|-----------|--------|
| **React** | Componentes reutilizáveis, estado reativo, grande comunidade |
| **Flask** | Leve, flexível, fácil de aprender e escalar |
| **MySQL** | Relacional, ACID compliance, gratuito e escalável |
| **JWT** | Stateless, ideal para APIs, funciona bem com SPAs |
| **bcrypt** | KDF robusto, mais seguro que salted SHA |
| **Axios** | HTTP client simples com interceptors |

---

**Arquitetura moderna, segura e pronta para produção! 🚀**

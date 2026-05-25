# Guia de Instalação e Execução - NutriXP

## 📋 Pré-requisitos

- **Node.js 16+** (para React)
- **Python 3.8+** (para Flask)
- **MySQL 8.0+** (banco de dados)
- **npm** (gerenciador de pacotes JavaScript)
- **pip** (gerenciador de pacotes Python)

---

## 🗄️ 1. Configuração do Banco de Dados (MySQL)

### Windows (usando MySQL Workbench ou Command Line)

```bash
# Abra o terminal MySQL
mysql -u root -p

# Execute o script de criação do banco
source C:\projeto_expo\database\schema.sql

# Verifique se foi criado
SHOW DATABASES;
USE nutrixp;
SHOW TABLES;
```

### Linux/Mac

```bash
mysql -u root -p < /caminho/para/database/schema.sql
```

---

## 🐍 2. Configuração do Backend (Python + Flask)

### 2.1 Criar ambiente virtual

```bash
cd C:\projeto_expo\backend

# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 2.2 Instalar dependências

```bash
pip install -r requirements.txt
```

### 2.3 Configurar credenciais MySQL

Edite `app.py` e altere:

```python
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'sua_senha_mysql'  # ← Altere aqui
app.config['MYSQL_DB'] = 'nutrixp'
app.config['SECRET_KEY'] = 'sua_chave_secreta_super_segura'  # ← Altere aqui
```

### 2.4 Executar o servidor Flask

```bash
python app.py
```

O servidor estará rodando em: **http://localhost:5000**

---

## ⚛️ 3. Configuração do Frontend (React)

### 3.1 Instalar dependências

```bash
cd C:\projeto_expo\frontend

npm install
```

### 3.2 Verificar configuração da API

O arquivo `src/services/api.js` já está configurado para acessar:
```javascript
const API_BASE_URL = 'http://localhost:5000';
```

Se mudar a porta, edite este arquivo.

### 3.3 Iniciar o servidor de desenvolvimento

```bash
npm start
```

O React abrirá automaticamente em: **http://localhost:3000**

---

## 🚀 Execução Completa

### Terminal 1 - Backend (Python)

```bash
cd C:\projeto_expo\backend
venv\Scripts\activate
python app.py
```

**Esperado:**
```
 * Running on http://127.0.0.1:5000
 * Press CTRL+C to quit
```

### Terminal 2 - Frontend (React)

```bash
cd C:\projeto_expo\frontend
npm start
```

**Esperado:**
```
Compiled successfully!
You can now view nutrixp-frontend in the browser.
  Local: http://localhost:3000
```

### Terminal 3 (opcional) - MySQL

```bash
mysql -u root -p
USE nutrixp;
SELECT * FROM usuarios;
```

---

## 🧪 Testar a API com curl

### 1. Criar usuário

```bash
curl -X POST http://localhost:5000/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nome":"João","email":"joao@test.com","senha":"123456"}'
```

### 2. Fazer login

```bash
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@test.com","senha":"123456"}'
```

### 3. Registrar refeição (use o token do login)

```bash
curl -X POST http://localhost:5000/refeicoes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{"tipo":"almoço","alimentos":"salada com frango"}'
```

### 4. Obter ranking

```bash
curl http://localhost:5000/ranking
```

---

## 📁 Estrutura de Diretórios Esperada

```
projeto_expo/
├── README.md                    # Documentação principal
├── INSTALACAO.md              # Este arquivo
│
├── backend/
│   ├── app.py                 # API Flask
│   ├── requirements.txt        # Dependências Python
│   └── venv/                  # Ambiente virtual
│
├── frontend/
│   ├── src/
│   │   ├── App.js            # Componente principal
│   │   ├── App.css           # Estilos globais
│   │   ├── components/       # Componentes React
│   │   │   ├── Dashboard.js
│   │   │   ├── FormRefeicao.js
│   │   │   ├── FormExercicio.js
│   │   │   ├── Ranking.js
│   │   │   └── *.css
│   │   ├── services/
│   │   │   └── api.js        # Cliente HTTP
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json          # Dependências Node
│   └── node_modules/         # Pacotes instalados
│
└── database/
    └── schema.sql            # Schema do MySQL
```

---

## ⚠️ Troubleshooting

### Erro: "Cannot connect to MySQL"

- Verifique se o MySQL está rodando
- Confirme credenciais em `backend/app.py`
- Teste: `mysql -u root -p` no terminal

### Erro: "Port 5000 already in use"

```bash
# Windows - Liberar porta
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Erro: "npm command not found"

- Instale Node.js em: https://nodejs.org/
- Reinicie o terminal após instalação

### Erro: "Python version too old"

```bash
# Windows - Verificar versão
python --version

# Instale Python 3.8+ em: https://www.python.org/
```

---

## 📚 Próximos Passos

1. ✅ Executar os 3 terminais conforme instruído
2. 🔓 Abrir http://localhost:3000
3. 📝 Registrar uma conta nova
4. 🍎 Testar registrar refeição
5. 🏃 Testar registrar exercício
6. 🏆 Verificar ranking
7. 📊 Ver dashboard com XP

---

## 🛠️ Desenvolvimento Adicional

Para adicionar mais features:

1. **Backend:** Edite `backend/app.py` (adicione novos endpoints)
2. **Frontend:** Crie componentes em `frontend/src/components/`
3. **Banco:** Modifique `database/schema.sql` para novos dados
4. **API Client:** Atualize `frontend/src/services/api.js`

---

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs no terminal
2. Confirme portas (3000, 5000) estão livres
3. Limpe cache: `npm cache clean --force`
4. Recrie ambiente virtual Python

**Bom desenvolvimento! 🚀**

🍎 NutriXP — App de Nutrição com Gamificação
📋 Sobre o Projeto

O NutriXP é uma aplicação web desenvolvida para incentivar hábitos saudáveis através de um sistema de gamificação, utilizando XP (experiência), níveis e ranking de usuários.

Os usuários podem registrar refeições e exercícios físicos, ganhando pontos conforme suas escolhas saudáveis e frequência de atividades.

🎯 Objetivos do Sistema
Incentivar alimentação saudável
Estimular prática de exercícios físicos
Criar engajamento através de níveis e XP
Permitir acompanhamento de evolução
Promover competição saudável com ranking
⚙️ Funcionalidades

👤 Usuários
Cadastro e autenticação
Sistema de níveis
Acúmulo de XP
Histórico de progresso

🍎 Refeições
Registro de refeições
Classificação de alimentos
Ganho de XP baseado na qualidade alimentar

🏃 Exercícios
Registro de atividades físicas
Cálculo de XP por duração/intensidade
Histórico de exercícios

🏆 Gamificação
Sistema de XP
Progressão de níveis
Bônus de consistência
Ranking global de usuários

💻 Stack Tecnológica
Frontend — React.js
Por que React?
Componentes reutilizáveis
Atualização automática da interface
Alta performance com Virtual DOM
Grande comunidade e ecossistema
Tecnologias Frontend
Tecnologia	Uso
React 18	Interface da aplicação
Axios	Requisições HTTP
CSS	Estilização
React Router	Navegação entre páginas
Backend — Python + Flask
Por que Flask?
Framework leve e flexível
Fácil integração com APIs
Ótimo para projetos REST
Código simples e organizado
Tecnologias Backend
Tecnologia	Uso
Python	Lógica da aplicação
Flask	API REST
SQLAlchemy	ORM
JWT	Autenticação
bcrypt	Criptografia de senhas
Banco de Dados — MySQL
Por que MySQL?
Banco relacional robusto
Suporte a transações ACID
Gratuito e open-source
Escalável para aplicações médias


🏗️ Arquitetura do Sistema
------------------------------------

            FRONTEND (React)         
-------------------------------------
 • Dashboard de XP                   
 • Cadastro de refeições             
 • Cadastro de exercícios            
• Ranking de usuários              

                 │ HTTP / REST API

         BACKEND (Python/Flask)      
-------------------------------------
 • API REST                          
 • Regras de negócio                 
 • Cálculo de XP                     
• Autenticação JWT                  

                 │ SQL
              
           BANCO DE DADOS           
-------------------------------------
 • Usuários                          
 • Refeições                         
 • Exercícios                        
 • Histórico de XP                   






-------------------------------------
📁 Estrutura do Projeto
projeto_expo/
│
├── backend/
│   ├── app/
│   │   ├── controllers/
│   │   │   └── user_controller.py
│   │   │
│   │   ├── models/
│   │   │   └── user_model.py
│   │   │
│   │   ├── routes/
│   │   │   └── user_routes.py
│   │   │
│   │   ├── services/
│   │   │   └── user_service.py
│   │   │
│   │   ├── database/
│   │   │   └── connection.py
│   │   │
│   │   ├── config/
│   │   │   └── config.py
│   │   │
│   │   └── app.py
│   │
│   ├── requirements.txt
│   └── .env

── frontend/
  ├── public/
     │
     ├── src/
        ├── assets/
        │
        ├── components/
        │
        ├── pages/
        │
        ├── services/
        │   └── api.js
        │
        ├── styles/
        │
        ├── routes/
   
        ├── hooks/

        ├── context/
        │
        ├── App.js
       └── main.js
   
   ├── package.json
   └── vite.config.js

├── database/
   ├── schema.sql
   └── seed.sql

|── docs/
   └── api-docs.md

── .gitignore
── README.md
── docker-compose.yml

----------------------------
🚀 Como Executar o Projeto
1️⃣ Clonar o Repositório
git clone https://github.com/seu-usuario/nutrixp.git
cd nutrixp
🔧 Backend (Flask)
Instalar dependências
cd backend
pip install -r requirements.txt
Executar servidor
python app.py

Servidor disponível em:

http://localhost:5000
🎨 Frontend (React)
Instalar dependências
cd frontend
npm install
Executar aplicação
npm start

Aplicação disponível em:

http://localhost:3000
🗄️ Banco de Dados (MySQL)
Criar banco e importar estrutura
mysql -u root -p < database/schema.sql
📡 API Endpoints
👤 Usuários
Método	Endpoint	Descrição
GET	/usuarios	Lista usuários
GET	/usuarios/<id>	Busca usuário
POST	/usuarios	Cria usuário
🍎 Refeições
Método	Endpoint	Descrição
GET	/refeicoes/<usuario_id>	Lista refeições
POST	/refeicoes	Cria refeição
DELETE	/refeicoes/<id>	Remove refeição
🏃 Exercícios
Método	Endpoint	Descrição
GET	/exercicios/<usuario_id>	Lista exercícios
POST	/exercicios	Cria exercício
DELETE	/exercicios/<id>	Remove exercício
🏆 Ranking
Método	Endpoint	Descrição
GET	/ranking	Ranking global
🎮 Sistema de XP
🍎 Alimentos
Alimento	XP
Maçã	+50 XP
Brócolis	+50 XP
Frango	+50 XP
Pizza	+10 XP
Hambúrguer	+10 XP
Salada	+80 XP
🏃 Exercícios
Exercício	XP
Corrida (30 min)	+100 XP
Musculação (1h)	+150 XP
Caminhada (30 min)	+50 XP
Yoga (1h)	+75 XP
🔥 Bônus de Consistência
Frequência	Bônus
3 dias seguidos	+20 XP
7 dias seguidos	+50 XP
🔒 Segurança
Validação de dados no frontend e backend
Senhas criptografadas com bcrypt
Autenticação JWT
Proteção contra SQL Injection
Uso de Prepared Statements
📚 Tecnologias Utilizadas
Tecnologia	Versão
React	18.x
Flask	2.x
Python	3.x
MySQL	8.x
Axios	1.x
SQLAlchemy	2.x
📈 Possíveis Melhorias Futuras
Upload de fotos das refeições
Integração com smartwatch
Sistema de desafios
Conquistas e medalhas
Notificações em tempo real
Dashboard avançado com gráficos
👨‍💻 Desenvolvedor

Projeto desenvolvido com foco em aprendizado de:

Desenvolvimento Full Stack
APIs REST
Banco de Dados Relacional
Gamificação
Arquitetura Web
🥗 NutriXP

“Transformando hábitos saudáveis em evolução dentro do jogo da vida.” 🎮💪

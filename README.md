# 🏆 Bolão Copa do Mundo 2026

Um sistema completo de bolão para a Copa do Mundo de 2026, desenvolvido com uma arquitetura moderna (Monorepo), utilizando **Django** no backend e **Next.js** no frontend. O projeto inclui sistema de ranking, grupos privados, autenticação segura e uma interface premium responsiva.

## 🚀 Tecnologias Utilizadas

### Backend (API)
- **Python 3.10+ / Django 5.0**
- **Django REST Framework** (Criação da API)
- **SimpleJWT** (Autenticação JWT segura)
- **python-decouple** (Gerenciamento de variáveis de ambiente)
- Banco de Dados Padrão: **SQLite** (preparado para migração fácil para PostgreSQL)

### Frontend (Web App)
- **Next.js 14** (React Framework)
- **Tailwind CSS** (Estilização e Responsividade)
- **Framer Motion** (Animações fluidas de interface)
- **Zustand** (Gerenciamento de estado global)
- **Axios** (Integração com a API)

---

## 💻 Como rodar o projeto localmente

Para reproduzir este projeto em outra máquina, certifique-se de ter o **Python (3.10+)** e o **Node.js (18+)** instalados. 
Como é um monorepo, a configuração é feita em duas etapas: Backend e Frontend.

### 1. Configurando o Backend (Django)

Abra o terminal, navegue até a pasta raiz do projeto e siga os comandos:

```bash
# Entre na pasta do backend
cd backend

# Crie um ambiente virtual (Recomendado)
python -m venv venv

# Ative o ambiente virtual
# No Windows: venv\Scripts\activate
# No Linux/Mac (WSL): source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Configure as variáveis de ambiente
# Copie o arquivo de exemplo e edite se necessário
cp .env.example .env

# Crie o banco de dados e as tabelas
python manage.py migrate

# Inicie o servidor
python manage.py runserver
```
A API estará rodando em `http://localhost:8000/api/`

---

### 2. Configurando o Frontend (Next.js)

Abra **um novo terminal**, mantendo o terminal do backend rodando, e siga os comandos:

```bash
# Na raiz do projeto, entre na pasta do frontend
cd frontend

# Instale os pacotes e dependências
npm install

# Crie o arquivo de variáveis de ambiente local
# (Opcional, pois o sistema já usa localhost:8000 como padrão)
echo NEXT_PUBLIC_API_URL=http://localhost:8000/api > .env.local

# Inicie a aplicação web
npm run dev
```
O sistema web estará rodando em `http://localhost:3000`

---

## 🔒 Segurança Integrada
- Throttling (Rate Limiting) ativo para impedir ataques de Força Bruta no login e redefinição de senhas.
- Rotas protegidas (AuthGuard) redirecionando usuários não autenticados.
- Chaves secretas protegidas via arquivos `.env` não versionados.

---
Feito com dedicação para a Copa do Mundo FIFA 2026! ⚽🏆

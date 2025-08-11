# 🚀 ORBIT - Painel de Controle

<div align="center">

![Orbit Logo](https://img.shields.io/badge/ORBIT-Painel%20de%20Controle-00ffff?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIHN0cm9rZT0iIzAwZmZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Im04IDEybDIgMmw0LTQiIHN0cm9rZT0iIzAwZmZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+)

**Organizador de tarefas pessoal com tema de viagem espacial**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://postgresql.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18+-orange.svg)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

## 🌌 Sobre o Projeto

O **Orbit** é um sistema de gerenciamento de tarefas pessoais com uma interface espacial imersiva. Desenvolvido para comandantes que precisam organizar suas missões diárias e semanais enquanto navegam pelo cosmos da produtividade.

### ✨ Características Principais

- 🛸 **Interface Espacial**: Design imersivo com tema de nave espacial
- ⏱️ **Timer Pomodoro**: Sistema de foco integrado com tema "Hiperespaço"
- 📋 **Gestão de Missões**: Organize tarefas diárias e semanais
- 🎯 **Sistema de Prioridades**: Classifique missões por importância
- 🏆 **Gamificação**: Pontos de foco e sistema de sequências
- 📊 **Estatísticas**: Acompanhe seu progresso como comandante
- 🔐 **Sistema Seguro**: Autenticação JWT e proteção de dados

## 🚀 Demo

![Orbit Demo](https://img.shields.io/badge/Demo-Em%20Breve-00ffff?style=for-the-badge)

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **Helmet** - Segurança HTTP

### Frontend
- **HTML5** - Estrutura
- **CSS3** - Estilização avançada com animações
- **JavaScript** - Interatividade
- **Fontes**: Share Tech Mono, Orbitron

### Segurança
- **Rate Limiting** - Proteção contra spam
- **CORS** - Controle de origem
- **Sanitização** - Proteção contra injeções
- **Headers de Segurança** - Proteção adicional

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- PostgreSQL 15+
- Git

### 1. Clone o repositório
```bash
git clone https://github.com/joaoelvas/orbit.git
cd orbit
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o banco de dados
```bash
# Configure as variáveis de ambiente
cp .env.example .env

# Execute o setup do banco
npm run setup-db
```

### 4. Configure o arquivo .env
```env
# Servidor
PORT=3000
NODE_ENV=development

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=orbit_db
DB_USER=seu_usuario
DB_PASSWORD=sua_senha

# Segurança
JWT_SECRET=sua_chave_jwt_super_segura_32_caracteres
SESSION_SECRET=sua_chave_session_super_segura_32_chars
```

### 5. Inicie a aplicação
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 🎮 Como Usar

1. **Cadastro/Login**: Crie sua conta de comandante
2. **Painel Principal**: Visualize suas estatísticas e status
3. **Missões Diárias**: Adicione e gerencie tarefas do dia
4. **Diretivas Semanais**: Organize objetivos de longo prazo
5. **Timer de Hiperespaço**: Use o Pomodoro para sessões de foco
6. **Diário de Bordo**: Acompanhe seu histórico de conquistas

## 📁 Estrutura do Projeto

```
orbit/
├── 📁 public/           # Frontend
│   ├── 📁 css/         # Estilos
│   ├── 📁 js/          # Scripts
│   ├── 📄 index.html   # Dashboard
│   └── 📄 login.html   # Autenticação
├── 📁 server/          # Backend
│   ├── 📁 config/      # Configurações
│   ├── 📁 middleware/  # Middlewares
│   ├── 📁 models/      # Modelos de dados
│   └── 📁 routes/      # Rotas da API
├── 📁 scripts/         # Scripts utilitários
├── 📁 database/        # Migrations e seeds
├── 📄 server.js        # Servidor principal
└── 📄 package.json     # Dependências
```

## 🔧 Scripts Disponíveis

```bash
npm start        # Inicia em produção
npm run dev      # Inicia em desenvolvimento
npm run setup-db # Configura banco de dados
```

## 🛡️ Segurança

O projeto implementa diversas camadas de segurança:

- ✅ Autenticação JWT
- ✅ Hash de senhas com bcrypt
- ✅ Rate limiting
- ✅ Headers de segurança
- ✅ Proteção CORS
- ✅ Sanitização de dados
- ✅ Validação de entrada

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍🚀 Autor

**João Elvas**
- GitHub: [@joaoelvas](https://github.com/joaoelvas)

---

<div align="center">

**Desenvolvido com 💙 por João Elvas**

*"Que a força esteja com suas tarefas"* 🚀

</div>

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const initializeDatabase = require("./scripts/init-database");
require("dotenv").config();

// Importar rotas
const authRoutes = require("./server/routes/auth");
const taskRoutes = require("./server/routes/tasks");
const userRoutes = require("./server/routes/users");

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar trust proxy para Railway
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Middleware de segurança
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limite de requests por IP
  trustProxy: process.env.NODE_ENV === "production",
  message: {
    error: "Muitas tentativas de acesso. Tente novamente em alguns minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração de sessão
app.use(
  session({
    secret: "orbit-session-secret-key-2025",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    },
  })
);

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Usar as rotas
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

// Rota para a página principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Rota para login
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Rota para teste de botões
app.get("/test-buttons", (req, res) => {
  res.sendFile(path.join(__dirname, "test-buttons.html"));
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error("🚨 Erro interno:", err.stack);
  res.status(500).json({
    message: "Algo deu errado no sistema orbital!",
    error: process.env.NODE_ENV === "production" ? {} : err.message,
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    message: "Rota não encontrada no sistema orbital",
  });
});

// Inicializar banco de dados e iniciar servidor
async function startServer() {
  try {
    // Inicializar banco de dados
    await initializeDatabase();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor Orbit rodando na porta ${PORT}`);
      console.log(`🌌 Acesse: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error.message);
    process.exit(1);
  }
}

startServer();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./server/routes/auth");
const taskRoutes = require("./server/routes/tasks");
const userRoutes = require("./server/routes/users");

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar trust proxy para Railway
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limite de requests por IP
  trustProxy: process.env.NODE_ENV === "production",
});

// Middlewares de segurança
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
      },
    },
  })
);

app.use(limiter);
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CORS_ORIGIN || "https://yourdominio.com"
        : "http://localhost:3000",
    credentials: true,
  })
);

// Configuração de sessão
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    },
  })
);

// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

// Middleware para verificar autenticação nas rotas protegidas
const checkAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.redirect("/login");
  }

  next();
};

// Rota para login
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Rota principal - servir o index.html (protegida)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Tratamento de erros 404
app.use((req, res) => {
  res.status(404).json({ message: "Rota não encontrada" });
});

// Tratamento de erros globais
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Erro interno do servidor",
    error:
      process.env.NODE_ENV === "development" ? err.message : "Algo deu errado!",
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Orbit rodando na porta ${PORT}`);
  console.log(`🌌 Acesse: http://localhost:${PORT}`);
});

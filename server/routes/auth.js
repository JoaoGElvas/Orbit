const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Registro
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validações básicas
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Todos os campos são obrigatórios",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "A senha deve ter pelo menos 6 caracteres",
      });
    }

    // Verificar se usuário já existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        message: "Este email já está registrado no sistema orbital",
      });
    }

    // Verificar se username já existe
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({
        message: "Este nome de comandante já está em uso",
      });
    }

    // Criar usuário
    const user = await User.create(username, email, password);

    // Configurar sessão
    req.session.userId = user.id;
    req.session.username = user.username;

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      "orbit-jwt-secret-key-2025",
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Comandante registrado com sucesso!",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({
      message: "Erro interno do servidor orbital",
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Nome de usuário e senha são obrigatórios",
      });
    }

    // Buscar usuário
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({
        message: "Credenciais inválidas",
      });
    }

    // Verificar senha
    const isValidPassword = await User.validatePassword(user, password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    // Atualizar última atividade
    await User.updateLastActivity(user.id);

    // Configurar sessão
    req.session.userId = user.id;
    req.session.username = user.username;

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      "orbit-jwt-secret-key-2025",
      { expiresIn: "24h" }
    );

    res.json({
      message: "Bem-vindo de volta, Comandante!",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        last_activity: user.last_activity,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({
      message: "Erro interno do servidor orbital",
    });
  }
});

// Verificar token
router.get("/verify", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ valid: false, message: "Token não fornecido" });
    }

    const decoded = jwt.verify(token, "orbit-jwt-secret-key-2025");
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res
        .status(401)
        .json({ valid: false, message: "Usuário não encontrado" });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Erro na verificação:", error);
    res.status(401).json({
      valid: false,
      message: "Token inválido",
    });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Erro ao fazer logout" });
    }
    res.json({ message: "Logout realizado com sucesso" });
  });
});

module.exports = router;

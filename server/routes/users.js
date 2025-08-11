const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Obter dados do usuário
router.get("/profile", async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    const stats = await User.getStats(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.json({
      user,
      stats,
    });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Obter estatísticas do usuário
router.get("/stats", async (req, res) => {
  try {
    const userId = req.user.userId;

    const stats = await User.getStats(userId);

    if (!stats) {
      return res.status(404).json({ message: "Estatísticas não encontradas" });
    }

    res.json(stats);
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

module.exports = router;

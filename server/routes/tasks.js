const express = require("express");
const { authenticateSession } = require("../middleware/auth");
const Task = require("../models/Task");

const router = express.Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateSession);

// Listar tarefas
router.get("/", async (req, res) => {
  try {
    const { type, completed } = req.query;
    const userId = req.user.userId;

    const tasks = await Task.findByUser(
      userId,
      type || null,
      completed !== undefined ? completed === "true" : null
    );

    res.json(tasks);
  } catch (error) {
    console.error("Erro ao listar tarefas:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Criar nova tarefa
router.post("/", async (req, res) => {
  try {
    const { title, description, priority, type } = req.body;
    const userId = req.user.userId;

    if (!title) {
      return res
        .status(400)
        .json({ message: "Título da tarefa é obrigatório" });
    }

    const validPriorities = ["low", "normal", "critical"];
    const validTypes = ["daily", "weekly"];

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ message: "Prioridade inválida" });
    }

    if (type && !validTypes.includes(type)) {
      return res.status(400).json({ message: "Tipo inválido" });
    }

    const task = await Task.create(userId, title, description, priority, type);

    res.status(201).json({
      message: "Missão adicionada ao painel de controle!",
      task,
    });
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Atualizar tarefa
router.put("/:id", async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = req.user.userId;
    const updates = req.body;

    // Remover campos não permitidos
    const allowedFields = ["title", "description", "priority", "position"];
    const filteredUpdates = {};

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return res
        .status(400)
        .json({ message: "Nenhum campo válido para atualizar" });
    }

    const task = await Task.update(taskId, userId, filteredUpdates);

    if (!task) {
      return res.status(404).json({ message: "Tarefa não encontrada" });
    }

    res.json({
      message: "Missão atualizada!",
      task,
    });
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Marcar tarefa como completa
router.patch("/:id/complete", async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = req.user.userId;

    const task = await Task.complete(taskId, userId);

    if (!task) {
      return res.status(404).json({ message: "Tarefa não encontrada" });
    }

    res.json({
      message: "Missão concluída! Pontos de foco adquiridos!",
      task,
    });
  } catch (error) {
    console.error("Erro ao completar tarefa:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Reordenar tarefas
router.patch("/reorder", async (req, res) => {
  try {
    const { taskIds } = req.body;
    const userId = req.user.userId;

    if (!Array.isArray(taskIds)) {
      return res.status(400).json({ message: "Lista de IDs inválida" });
    }

    await Task.reorder(userId, taskIds);

    res.json({ message: "Painel reorganizado!" });
  } catch (error) {
    console.error("Erro ao reordenar tarefas:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Excluir tarefa
router.delete("/:id", async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = req.user.userId;

    const task = await Task.delete(taskId, userId);

    if (!task) {
      return res.status(404).json({ message: "Tarefa não encontrada" });
    }

    res.json({
      message: "Missão removida do painel!",
      task,
    });
  } catch (error) {
    console.error("Erro ao excluir tarefa:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Histórico de tarefas (Diário de Bordo)
router.get("/history", async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 50;

    const history = await Task.getHistory(userId, limit);

    res.json(history);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

module.exports = router;

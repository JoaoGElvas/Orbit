const authenticateSession = (req, res, next) => {
  // Verificar se há sessão ativa
  if (!req.session.userId) {
    return res
      .status(401)
      .json({ message: "Sessão não encontrada. Faça login novamente." });
  }

  // Adicionar dados do usuário ao request
  req.user = {
    userId: req.session.userId,
    username: req.session.username,
  };

  next();
};

module.exports = { authenticateSession };

const { users } = require('../data/db');

function authenticate(req, res, next) {
  const userId = req.headers['user-id'];

  if (!userId) {
    return res.status(401).json({ error: "Необходима аутентификация" });
  }

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(401).json({ error: "Пользователь не найден" });
  }

  req.user = user;
  next();
}

module.exports = { authenticate };
const jwt = require('jsonwebtoken');
const { users } = require('../data/db');

const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный или просроченный токен' });
    }
    req.user = user;
    next();
  });
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Необходима аутентификация' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Доступ запрещен. Недостаточно прав.',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
}

module.exports = { authenticateToken, authorize };
const express = require('express');
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');
const { users } = require('../data/db');

const router = express.Router();

const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
const REFRESH_SECRET = 'your-super-secret-refresh-key-change-this-in-production';
const TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

let refreshTokens = new Set();

const createTestUsers = async () => {
  users.length = 0;

  const hashedPasswordUser = await bcrypt.hash('password123', 10);
  const testUser = {
    id: nanoid(),
    email: 'user@example.com',
    password: hashedPasswordUser,
    first_name: 'Обычный',
    last_name: 'Пользователь',
    role: 'user',
    isBlocked: false,
    created_at: new Date().toISOString()
  };
  users.push(testUser);

  const hashedPasswordSeller = await bcrypt.hash('seller123', 10);
  const testSeller = {
    id: nanoid(),
    email: 'seller@example.com',
    password: hashedPasswordSeller,
    first_name: 'Иван',
    last_name: 'Продавец',
    role: 'seller',
    isBlocked: false,
    created_at: new Date().toISOString()
  };
  users.push(testSeller);

  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
  const testAdmin = {
    id: nanoid(),
    email: 'admin@example.com',
    password: hashedPasswordAdmin,
    first_name: 'Админ',
    last_name: 'Системы',
    role: 'admin',
    isBlocked: false,
    created_at: new Date().toISOString()
  };
  users.push(testAdmin);

  console.log('Тестовые пользователи созданы:');
  console.log('- Обычный пользователь: user@example.com / password123');
  console.log('- Продавец: seller@example.com / seller123');
  console.log('- Администратор: admin@example.com / admin123');
};
createTestUsers();

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      isBlocked: user.isBlocked
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
};

router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: nanoid(),
      email,
      password: hashedPassword,
      first_name,
      last_name,
      role: 'user',
      isBlocked: false,
      created_at: new Date().toISOString()
    };

    users.push(newUser);

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);
    refreshTokens.add(refreshToken);

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      ...userWithoutPassword,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: 'Ваш аккаунт заблокирован. Обратитесь к администратору.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.add(refreshToken);

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      ...userWithoutPassword,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Ошибка при входе' });
  }
});

router.post('/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token не предоставлен' });
    }

    if (!refreshTokens.has(refreshToken)) {
      return res.status(401).json({ error: 'Недействительный refresh token' });
    }

    jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
      if (err) {
        refreshTokens.delete(refreshToken);
        return res.status(401).json({ error: 'Недействительный или просроченный refresh token' });
      }

      const existingUser = users.find(u => u.id === user.id);
      if (!existingUser) {
        refreshTokens.delete(refreshToken);
        return res.status(401).json({ error: 'Пользователь не найден' });
      }

      if (existingUser.isBlocked) {
        refreshTokens.delete(refreshToken);
        return res.status(403).json({ error: 'Ваш аккаунт заблокирован' });
      }

      refreshTokens.delete(refreshToken);

      const newAccessToken = generateAccessToken(existingUser);
      const newRefreshToken = generateRefreshToken(existingUser);
      refreshTokens.add(newRefreshToken);

      res.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      });
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении токенов' });
  }
});

router.post('/logout', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      refreshTokens.delete(refreshToken);
    }

    res.json({ message: 'Успешный выход из системы' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Ошибка при выходе' });
  }
});

router.get('/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

module.exports = router;
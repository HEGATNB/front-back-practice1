const express = require('express');
const bcrypt = require('bcrypt');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

const { users } = require('../data/db');

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список всех пользователей (только для администраторов)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 */
router.get('/', authenticateToken, authorize('admin'), (req, res) => {
  const usersWithoutPasswords = users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  res.json(usersWithoutPasswords);
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по ID (только для администраторов)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Информация о пользователе
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Пользователь не найден
 */
router.get('/:id', authenticateToken, authorize('admin'), (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }

  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Обновить информацию пользователя (только для администраторов)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, seller, admin]
 *               isBlocked:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Пользователь обновлен
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Пользователь не найден
 */
router.put('/:id', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const userIndex = users.findIndex(u => u.id === req.params.id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const { first_name, last_name, email, role, isBlocked } = req.body;

    if (users[userIndex].role === 'admin' && role !== 'admin' && req.user.id !== users[userIndex].id) {
      return res.status(403).json({ error: 'Нельзя изменить роль администратора' });
    }
    if (first_name) users[userIndex].first_name = first_name;
    if (last_name) users[userIndex].last_name = last_name;
    if (email) users[userIndex].email = email;
    if (role && req.user.id !== users[userIndex].id) {
      users[userIndex].role = role;
    }
    if (isBlocked !== undefined && req.user.id !== users[userIndex].id) {
      users[userIndex].isBlocked = isBlocked;
    }

    users[userIndex].updated_at = new Date().toISOString();

    const { password, ...userWithoutPassword } = users[userIndex];
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении пользователя' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Заблокировать пользователя (только для администраторов)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Пользователь заблокирован
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Пользователь не найден
 */
router.delete('/:id', authenticateToken, authorize('admin'), (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }

  if (users[userIndex].id === req.user.id) {
    return res.status(403).json({ error: 'Нельзя заблокировать самого себя' });
  }

  users[userIndex].isBlocked = true;
  users[userIndex].updated_at = new Date().toISOString();

  res.json({ message: 'Пользователь заблокирован' });
});

module.exports = router;
const express = require('express');
const { nanoid } = require('nanoid');
const { authenticateToken } = require('./auth');

const router = express.Router();

// База данных товаров в памяти
let products = [];

// Инициализация тестовых товаров (ТОЛЬКО ЗДЕСЬ!)
const initialProducts = [
  {
    id: nanoid(),
    title: 'Доска с волком',
    category: 'Доски',
    description: 'Идеально подойдет для настоящих альфа.',
    price: 9000,
    createdBy: null // публичный товар
  },
  {
    id: nanoid(),
    title: 'Доска в виде туфли',
    category: 'Доски',
    description: 'Мечта любого джентльмена.',
    price: 7700,
    createdBy: null
  },
  {
    id: nanoid(),
    title: 'Доска Komodo',
    category: 'Доски',
    description: 'Инновационная доска с технологией Helium. Легкая и прочная.',
    price: 10000,
    createdBy: null
  },
  {
    id: nanoid(),
    title: 'Доска Buster',
    category: 'Доски',
    description: 'Одна из лучших досок на рынке благодаря своей износостойкости и скорости.',
    price: 12900,
    createdBy: null
  },
  {
    id: nanoid(),
    title: 'Набор доска, насос, и весла',
    category: 'Доски',
    description: 'Все сразу в комплекте - бери и в путь.',
    price: 22000,
    createdBy: null
  }
];

products.push(...initialProducts);
console.log('Инициализировано товаров:', products.length);

// Middleware для проверки прав на товар
const checkProductPermission = (req, res, next) => {
  const productId = req.params.id;
  const product = products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  // Публичные товары доступны всем
  if (!product.createdBy) {
    req.product = product;
    return next();
  }

  // Для приватных товаров нужна авторизация и права
  if (!req.user) {
    return res.status(401).json({ error: 'Необходима авторизация' });
  }

  if (product.createdBy !== req.user.id) {
    return res.status(403).json({ error: 'Нет прав на выполнение операции' });
  }

  req.product = product;
  next();
};

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить все товары
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 */
router.get('/', (req, res) => {
  res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Products]
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
 *         description: Товар
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет доступа
 *       404:
 *         description: Товар не найден
 */
router.get('/:id', authenticateToken, checkProductPermission, (req, res) => {
  res.json(req.product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Товар создан
 *       401:
 *         description: Не авторизован
 */
router.post('/', authenticateToken, (req, res) => {
  try {
    const { title, category, description, price } = req.body;

    if (!title || !category || !description || !price) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    const newProduct = {
      id: nanoid(),
      title,
      category,
      description,
      price: parseFloat(price),
      createdBy: req.user.id,
      created_at: new Date().toISOString()
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Ошибка при создании товара' });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить товар
 *     tags: [Products]
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
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Товар обновлен
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав
 *       404:
 *         description: Товар не найден
 */
router.put('/:id', authenticateToken, checkProductPermission, (req, res) => {
  try {
    const { title, category, description, price } = req.body;

    if (!title || !category || !description || !price) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    const updatedProduct = {
      ...req.product,
      title,
      category,
      description,
      price: parseFloat(price),
      updated_at: new Date().toISOString()
    };

    const index = products.findIndex(p => p.id === req.params.id);
    products[index] = updatedProduct;

    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении товара' });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Товар удален
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав
 *       404:
 *         description: Товар не найден
 */
router.delete('/:id', authenticateToken, checkProductPermission, (req, res) => {
  try {
    products = products.filter(p => p.id !== req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Ошибка при удалении товара' });
  }
});

module.exports = router;
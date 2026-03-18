const express = require('express');
const { nanoid } = require('nanoid');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

let products = [];

const initialProducts = [
  {
    id: nanoid(),
    title: 'Доска с волком',
    category: 'Доски',
    description: 'Идеально подойдет для настоящих альфа.',
    price: 9000,
    createdBy: null,
    created_at: new Date().toISOString()
  },
  {
    id: nanoid(),
    title: 'Доска в виде туфли',
    category: 'Доски',
    description: 'Мечта любого джентльмена.',
    price: 7700,
    createdBy: null,
    created_at: new Date().toISOString()
  },
  {
    id: nanoid(),
    title: 'Доска Komodo',
    category: 'Доски',
    description: 'Инновационная доска с технологией Helium. Легкая и прочная.',
    price: 10000,
    createdBy: null,
    created_at: new Date().toISOString()
  },
  {
    id: nanoid(),
    title: 'Доска Buster',
    category: 'Доски',
    description: 'Одна из лучших досок на рынке благодаря своей износостойкости и скорости.',
    price: 12900,
    createdBy: null,
    created_at: new Date().toISOString()
  },
  {
    id: nanoid(),
    title: 'Набор доска, насос, и весла',
    category: 'Доски',
    description: 'Все сразу в комплекте - бери и в путь.',
    price: 22000,
    createdBy: null,
    created_at: new Date().toISOString()
  }
];

products.push(...initialProducts);
console.log('Инициализировано товаров:', products.length);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить все товары (доступно пользователям)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список товаров
 *       401:
 *         description: Не авторизован
 */
router.get('/', authenticateToken, authorize('user', 'seller', 'admin'), (req, res) => {
  res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID (доступно пользователям)
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
 *       404:
 *         description: Товар не найден
 */
router.get('/:id', authenticateToken, authorize('user', 'seller', 'admin'), (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Товар не найден' });
  }
  res.json(product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар (только для продавцов и админов)
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
 *       403:
 *         description: Недостаточно прав
 */
router.post('/', authenticateToken, authorize('seller', 'admin'), (req, res) => {
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
 *     summary: Обновить товар (только для продавцов и админов)
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
 *         description: Недостаточно прав
 *       404:
 *         description: Товар не найден
 */
router.put('/:id', authenticateToken, authorize('seller', 'admin'), (req, res) => {
  try {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    const product = products[productIndex];

    if (req.user.role === 'seller' && product.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Вы можете редактировать только свои товары' });
    }

    const { title, category, description, price } = req.body;

    if (!title || !category || !description || !price) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    const updatedProduct = {
      ...product,
      title,
      category,
      description,
      price: parseFloat(price),
      updated_at: new Date().toISOString()
    };

    products[productIndex] = updatedProduct;
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
 *     summary: Удалить товар (только для администраторов)
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
 *         description: Недостаточно прав
 *       404:
 *         description: Товар не найден
 */
router.delete('/:id', authenticateToken, authorize('admin'), (req, res) => {
  try {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    products.splice(productIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Ошибка при удалении товара' });
  }
});

module.exports = router;
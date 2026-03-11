const express = require('express');
const { nanoid } = require('nanoid');
const { products } = require('../data/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

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
 *                 example: Ноутбук
 *               category:
 *                 type: string
 *                 example: Электроника
 *               description:
 *                 type: string
 *                 example: Мощный ноутбук для работы и игр
 *               price:
 *                 type: number
 *                 example: 99999.99
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *       400:
 *         description: Не все обязательные поля заполнены
 *       401:
 *         description: Необходима аутентификация
 */
router.post('/', (req, res) => {
  const { title, category, description, price } = req.body;

  if (!title || !category || !description || price === undefined) {
    return res.status(400).json({
      error: "Необходимо заполнить все поля: title, category, description, price"
    });
  }

  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ error: "Цена должна быть положительным числом" });
  }

  const newProduct = {
    id: nanoid(),
    title,
    category,
    description,
    price,
    createdBy: req.user.id,
    createdAt: new Date().toISOString()
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список всех товаров
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список товаров
 *       401:
 *         description: Необходима аутентификация
 */
router.get('/', (req, res) => {
  res.status(200).json(products);
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
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Товар найден
 *       404:
 *         description: Товар не найден
 *       401:
 *         description: Необходима аутентификация
 */
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({ error: "Товар не найден" });
  }

  res.status(200).json(product);
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
 *         description: ID товара
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
 *       404:
 *         description: Товар не найден
 *       400:
 *         description: Некорректные данные
 *       401:
 *         description: Необходима аутентификация
 */
router.put('/:id', (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);

  if (productIndex === -1) {
    return res.status(404).json({ error: "Товар не найден" });
  }

  const { title, category, description, price } = req.body;

  if (products[productIndex].createdBy !== req.user.id) {
    return res.status(403).json({ error: "Нет прав на редактирование этого товара" });
  }

  if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
    return res.status(400).json({ error: "Цена должна быть положительным числом" });
  }

  const updatedProduct = {
    ...products[productIndex],
    title: title || products[productIndex].title,
    category: category || products[productIndex].category,
    description: description || products[productIndex].description,
    price: price !== undefined ? price : products[productIndex].price,
    updatedAt: new Date().toISOString()
  };

  products[productIndex] = updatedProduct;
  res.status(200).json(updatedProduct);
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
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Товар удален
 *       404:
 *         description: Товар не найден
 *       401:
 *         description: Необходима аутентификация
 */
router.delete('/:id', (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);

  if (productIndex === -1) {
    return res.status(404).json({ error: "Товар не найден" });
  }

  if (products[productIndex].createdBy !== req.user.id) {
    return res.status(403).json({ error: "Нет прав на удаление этого товара" });
  }

  const deletedProduct = products[productIndex];
  products.splice(productIndex, 1);

  res.status(200).json({
    message: "Товар успешно удален",
    deletedProduct
  });
});

module.exports = router;
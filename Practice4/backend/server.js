const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SpaceShop API',
      version: '1.0.0',
      description: 'API для магазина космических объектов',
      contact: {
        name: 'SpaceShop Team',
        email: 'info@spaceshop.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Локальный сервер разработки'
      }
    ],
    components: {
      schemas: {
        Product: {
          type: 'object',
          required: ['name', 'category', 'description', 'price', 'stock'],
          properties: {
            id: {
              type: 'string',
              description: 'Уникальный идентификатор товара',
              example: 'abc123'
            },
            name: {
              type: 'string',
              description: 'Название товара',
              example: 'Луна'
            },
            category: {
              type: 'string',
              description: 'Категория товара',
              example: 'спутники'
            },
            description: {
              type: 'string',
              description: 'Описание товара',
              example: 'Не смотрите на то что запылилась, на луне есть титан, железо и алюминий'
            },
            price: {
              type: 'number',
              description: 'Цена товара',
              example: 10000
            },
            oldPrice: {
              type: 'number',
              nullable: true,
              description: 'Старая цена (если есть скидка)',
              example: 15000
            },
            stock: {
              type: 'integer',
              description: 'Количество на складе',
              example: 1
            },
            rating: {
              type: 'number',
              description: 'Рейтинг товара (0-5)',
              example: 4.0
            },
            image: {
              type: 'string',
              description: 'URL изображения товара',
              example: '/images/moon.jpg'
            }
          }
        },
        User: {
          type: 'object',
          required: ['username', 'email'],
          properties: {
            id: {
              type: 'string',
              description: 'Уникальный идентификатор пользователя',
              example: 'user_123'
            },
            username: {
              type: 'string',
              description: 'Имя пользователя',
              example: 'cosmonaut'
            },
            email: {
              type: 'string',
              description: 'Email пользователя',
              format: 'email',
              example: 'cosmonaut@space.com'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата регистрации',
              example: '2024-01-15T10:30:00Z'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Сообщение об ошибке'
            }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "SpaceShop API Documentation"
}));

let products = [
  {
    id: nanoid(6),
    name: "Луна",
    category: "спутники",
    description: "Не смотрите на то что запылилась, на луне есть титан, железо и алюминий",
    price: 10000,
    oldPrice: null,
    stock: 1,
    rating: 4.0,
    image: "/images/moon.jpg"
  },
  {
    id: nanoid(6),
    name: "Марс",
    category: "планеты",
    description: "Содержит железо, алюминий, титан, серу и кремний, а также метан. Почти пригоден для жизни",
    price: 5000,
    oldPrice: null,
    stock: 1,
    rating: 4.3,
    image: "/images/mars.jpg"
  },
  {
    id: nanoid(6),
    name: "Солнце",
    category: "звезды",
    description: "Способствует выработке витамина D, можно не платить за отопление",
    price: 10000000,
    oldPrice: null,
    stock: 1,
    rating: 5.0,
    image: "/images/sun.jpg"
  },
  {
    id: nanoid(6),
    name: "Энцелад",
    category: "спутники",
    description: "Содержит колоссальные объемы воды, к сожалению - соленой",
    price: 100,
    oldPrice: 10000,
    stock: 1,
    rating: 4.8,
    image: "/images/enceladus.jpg"
  },
  {
    id: nanoid(6),
    name: "Уран",
    category: "планета",
    description: "Содержит водород, гелий и метан. Ходят слухи что поверхность планеты покрыта алмазами",
    price: 100000,
    oldPrice: null,
    stock: 12,
    rating: 4.6,
    image: "/images/uranus.png"
  }
];

app.use(express.json());

app.use(cors({
  origin: "http://localhost:3001",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      console.log('Body:', req.body);
    }
  });
  next();
});

function findProductOr404(id, res) {
  const product = products.find(p => p.id === id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return null;
  }
  return product;
}

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Получить список всех товаров
 *     description: Возвращает массив всех доступных космических объектов
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Успешный ответ со списком товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/products', (req, res) => {
  res.json(products);
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     description: Возвращает детальную информацию о конкретном космическом объекте
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Уникальный идентификатор товара
 *         example: "abc123"
 *     responses:
 *       200:
 *         description: Информация о товаре
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Product not found"
 */
app.get('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const product = findProductOr404(id, res);
  if (!product) return;
  res.json(product);
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Создать новый товар
 *     description: Добавляет новый космический объект в каталог
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - description
 *               - price
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *                 description: Название товара
 *                 example: "Венера"
 *               category:
 *                 type: string
 *                 description: Категория товара
 *                 example: "планеты"
 *               description:
 *                 type: string
 *                 description: Описание товара
 *                 example: "Самая горячая планета Солнечной системы"
 *               price:
 *                 type: number
 *                 description: Цена товара
 *                 example: 15000
 *               oldPrice:
 *                 type: number
 *                 nullable: true
 *                 description: Старая цена (если есть скидка)
 *                 example: 20000
 *               stock:
 *                 type: integer
 *                 description: Количество на складе
 *                 example: 1
 *               rating:
 *                 type: number
 *                 description: Рейтинг товара (0-5)
 *                 example: 4.2
 *               image:
 *                 type: string
 *                 description: URL изображения
 *                 example: "/images/venus.jpg"
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Ошибка валидации (отсутствуют обязательные поля)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Missing required fields"
 */
app.post('/api/products', (req, res) => {
  const { name, category, description, price, stock, rating = 0, image = '', oldPrice = null } = req.body;

  if (!name || !category || !description || !price || stock === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newProduct = {
    id: nanoid(6),
    name: name.trim(),
    category: category.trim(),
    description: description.trim(),
    price: Number(price),
    oldPrice: oldPrice ? Number(oldPrice) : null,
    stock: Number(stock),
    rating: Number(rating),
    image: image.trim()
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Обновить существующий товар
 *     description: Обновляет информацию о космическом объекте по его ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара для обновления
 *         example: "abc123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Новое название
 *                 example: "Луна (обновленная)"
 *               category:
 *                 type: string
 *                 description: Новая категория
 *                 example: "спутники"
 *               description:
 *                 type: string
 *                 description: Новое описание
 *                 example: "Обновленное описание луны"
 *               price:
 *                 type: number
 *                 description: Новая цена
 *                 example: 12000
 *               oldPrice:
 *                 type: number
 *                 nullable: true
 *                 description: Новая старая цена
 *                 example: 15000
 *               stock:
 *                 type: integer
 *                 description: Новое количество на складе
 *                 example: 2
 *               rating:
 *                 type: number
 *                 description: Новый рейтинг
 *                 example: 4.5
 *               image:
 *                 type: string
 *                 description: Новый URL изображения
 *                 example: "/images/new-moon.jpg"
 *     responses:
 *       200:
 *         description: Товар успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Нет данных для обновления
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Nothing to update"
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Product not found"
 */
app.patch('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const product = findProductOr404(id, res);
  if (!product) return;

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  const { name, category, description, price, stock, rating, image, oldPrice } = req.body;

  if (name !== undefined) product.name = name.trim();
  if (category !== undefined) product.category = category.trim();
  if (description !== undefined) product.description = description.trim();
  if (price !== undefined) product.price = Number(price);
  if (oldPrice !== undefined) product.oldPrice = oldPrice ? Number(oldPrice) : null;
  if (stock !== undefined) product.stock = Number(stock);
  if (rating !== undefined) product.rating = Number(rating);
  if (image !== undefined) product.image = image.trim();

  res.json(product);
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     description: Удаляет космический объект из каталога по его ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара для удаления
 *         example: "abc123"
 *     responses:
 *       204:
 *         description: Товар успешно удален (нет содержимого)
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Product not found"
 */
app.delete('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const exists = products.some(p => p.id === id);
  if (!exists) return res.status(404).json({ error: "Product not found" });

  products = products.filter(p => p.id !== id);
  res.status(204).send();
});

// User routes with Swagger documentation
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Получить список всех пользователей
 *     description: Возвращает массив всех зарегистрированных пользователей
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Не авторизован
 */
app.get('/api/users', (req, res) => {
  // Mock response for demonstration
  res.json([
    { id: 'user_1', username: 'cosmonaut', email: 'cosmo@space.com', createdAt: new Date().toISOString() },
    { id: 'user_2', username: 'astronomer', email: 'astro@space.com', createdAt: new Date().toISOString() }
  ]);
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Получить пользователя по ID
 *     description: Возвращает информацию о конкретном пользователе
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Информация о пользователе
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Пользователь не найден
 */
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  // Mock response
  if (id === 'user_1') {
    res.json({ id: 'user_1', username: 'cosmonaut', email: 'cosmo@space.com', createdAt: new Date().toISOString() });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Создать нового пользователя
 *     description: Регистрирует нового пользователя в системе
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *                 example: "newcosmonaut"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "new@space.com"
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Ошибка валидации
 */
app.post('/api/users', (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newUser = {
    id: `user_${nanoid(6)}`,
    username: username.trim(),
    email: email.trim().toLowerCase(),
    createdAt: new Date().toISOString()
  };

  res.status(201).json(newUser);
});

app.get('/', (req, res) => {
  res.json({
    name: "SpaceShop API",
    version: "1.0.0",
    description: "API для магазина космических объектов",
    documentation: "http://localhost:3000/api-docs",
    endpoints: {
      products: "http://localhost:3000/api/products",
      users: "http://localhost:3000/api/users",
      docs: "http://localhost:3000/api-docs"
    }
  });
});

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Обновить пользователя
 *     description: Обновляет информацию о пользователе
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "updatedname"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "updated@space.com"
 *     responses:
 *       200:
 *         description: Пользователь обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Пользователь не найден
 */
app.patch('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { username, email } = req.body;

  // Mock update
  if (id === 'user_1') {
    res.json({
      id: 'user_1',
      username: username || 'cosmonaut',
      email: email || 'cosmo@space.com',
      createdAt: new Date().toISOString()
    });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Удалить пользователя
 *     description: Удаляет пользователя из системы
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     responses:
 *       204:
 *         description: Пользователь удален
 *       404:
 *         description: Пользователь не найден
 */
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;

  if (id === 'user_1') {
    res.status(204).send();
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
  console.log(`Swagger документация доступна на http://localhost:${port}/api-docs`);
});
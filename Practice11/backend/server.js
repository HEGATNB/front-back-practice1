const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');

const app = express();
const port = 3000;

app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'user-id']
}));

app.options('*', cors());

app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth & Products API with RBAC',
      version: '1.1.0',
      description: 'API для аутентификации и управления товарами с системой ролей (RBAC)',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Локальный сервер',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send(`
    <h1>API сервер работает!</h1>
    <p>Доступные эндпоинты:</p>
    <ul>
      <li><a href="/api-docs">/api-docs</a> - Swagger документация</li>
      <li>POST /api/auth/register - регистрация (Гость)</li>
      <li>POST /api/auth/login - вход (Гость)</li>
      <li>POST /api/auth/refresh - обновление токенов (Гость)</li>
      <li>POST /api/auth/logout - выход (Авторизованные)</li>
      <li>GET /api/auth/me - информация о пользователе (Пользователь)</li>
      <li>GET /api/products - все товары (Пользователь)</li>
      <li>GET /api/products/:id - товар по ID (Пользователь)</li>
      <li>POST /api/products - создать товар (Продавец, Админ)</li>
      <li>PUT /api/products/:id - обновить товар (Продавец, Админ)</li>
      <li>DELETE /api/products/:id - удалить товар (Админ)</li>
      <li>GET /api/users - список пользователей (Админ)</li>
      <li>GET /api/users/:id - пользователь по ID (Админ)</li>
      <li>PUT /api/users/:id - обновить пользователя (Админ)</li>
      <li>PATCH /api/users/:id/toggle-block - заблокировать/разблокировать (Админ)</li>
      <li>DELETE /api/users/:id - удалить пользователя (Админ)</li>
    </ul>
    <p><strong>Тестовые пользователи:</strong></p>
    <ul>
      <li>Обычный пользователь: user@example.com / password123</li>
      <li>Продавец: seller@example.com / seller123</li>
      <li>Администратор: admin@example.com / admin123</li>
    </ul>
  `);
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
  console.log(`Swagger UI доступен по адресу http://localhost:${port}/api-docs`);
  console.log('\nТестовые пользователи:');
  console.log('- Обычный пользователь: user@example.com / password123');
  console.log('- Продавец: seller@example.com / seller123');
  console.log('- Администратор: admin@example.com / admin123');
});
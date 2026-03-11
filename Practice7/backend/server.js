const express = require('express');
const cors = require('cors'); // Добавить эту строку
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

const app = express();
const port = 3000;

// Добавить CORS middleware
app.use(cors({
  origin: 'http://localhost:3001', // Разрешаем запросы с фронтенда
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'user-id']
}));

app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth & Products API',
      version: '1.0.0',
      description: 'API для аутентификации и управления товарами',
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

app.get('/', (req, res) => {
  res.send(`
    <h1>API сервер работает!</h1>
    <p>Доступные эндпоинты:</p>
    <ul>
      <li><a href="/api-docs">/api-docs</a> - Swagger документация</li>
      <li>POST /api/auth/register - регистрация</li>
      <li>POST /api/auth/login - вход</li>
      <li>GET/POST /api/products - товары</li>
    </ul>
  `);
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
  console.log(`Swagger UI доступен по адресу http://localhost:${port}/api-docs`);
});
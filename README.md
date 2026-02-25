# Практические задания 1-6

## Структура проекта

front-back-practice1/
├── Practice1/ # Практическое задание 1
├── Practice2/ # Практическое задание 2
├── Practice3/ # Практическое задание 3
├── Practice4/ # Практическое задание 4-5
│ ├── frontend/ # React + Vite (фронтенд)
│ └── backend/ # Express (бэкенд)
└── README.md


---

## Практическое задание 1 — Верстка страницы магазина

Статическая страница «Магазин курсов по разработке» с карточками курсов.

**Технологии:** HTML, SCSS/CSS, БЭМ
**Файлы:** `practice1/main.html`

---

## Практическое задание 2 — CRUD-интерфейс (клиентский)

Страница управления товарами с операциями создания, чтения, обновления и удаления на чистом JavaScript (данные хранятся в памяти браузера).

**Технологии:** HTML, JavaScript, SCSS/CSS
**Файлы:** `practice2/main.html`, `practice2/script.js`

---

## Практическое задание 3 — Работа с DevTools и HTTP

Отчеты с результатами исследования HTTP-запросов и инструментов разработчика браузера.

**Файлы:** `practice3/reports1/`, `practice3/reports2/`

### reports1/ — Запросы к локальному серверу (http://localhost:3000)

| № файла | Метод | URL | Описание |
|---------|-------|-----|----------|
| request1.png | GET | `http://localhost:3000/api/products/1` | Запрос на получение товара с ID=1 |
| request2.png | GET | `http://localhost:3000/api/products` | Запрос на получение списка всех товаров (фигурки Человек-паук, Халк, Железный человек) |
| request3.png | GET | `http://localhost:3000/api/products/2` | Запрос на получение товара с ID=2 (фигурка Халк) |

### reports2/ — Запросы к внешнему API ipstack (http://api.ipstack.com)

| № файла | Метод | URL | Описание |
|---------|-------|-----|----------|
| request4.png | GET | `http://api.ipstack.com/134.201.250.155?access_key=15a5970b7692f4c851e67f48a9dc9fed` | Запрос геолокации для IPv4-адреса 134.201.250.155 (Лос-Анджелес, США) |
| request5.png | GET | `http://api.ipstack.com/check?access_key=15a5970b7692f4c851e67f48a9dc9fed` | Запрос геолокации для текущего IP-адреса клиента (Россия, Монино) |
| request6.png | GET | `http://api.ipstack.com/134.201.250.155?access_key=15a5970b7692f4c851e67f48a9dc9fed&fields=city,country_name` | Запрос геолокации с ограничением полей (только city и country_name) для IP 134.201.250.155 |
| request7.png | GET | `http://api.ipstack.com/134.201.250.155?access_key=15a5970b7692f4c851e67f48a9dc9fed` | Запрос геолокации для IPv4-адреса 134.201.250.155 с обработкой данных в JavaScript |
| request8.png | GET | `http://api.ipstack.com/2001:4860:4860::8887?access_key=15a5970b7692f4c851e67f48a9dc9fed` | Запрос геолокации для IPv6-адреса 2001:4860:4860::8888 (Маунтин-Вью, США) |

---

## Практическое задание 4 — REST API сервер
React фронтенд и Express бэкенд, документированный через Swagger.

Express-сервер с CRUD-операциями для сущностей Product и User, хранение данных в памяти.

### API эндпоинты

| Метод   | URL                    | Описание                    |
|---------|------------------------|-----------------------------|
| GET     | /api/products          | Список всех продуктов       |
| POST    | /api/products          | Создать продукт             |
| GET     | /api/products/:id      | Получить продукт по ID      |
| PATCH   | /api/products/:id      | Обновить продукт            |
| DELETE  | /api/products/:id      | Удалить продукт             |
| GET     | /api/users             | Список всех пользователей   |
| POST    | /api/users             | Создать пользователя        |
| GET     | /api/users/:id         | Получить пользователя по ID |
| PATCH   | /api/users/:id         | Обновить пользователя       |
| DELETE  | /api/users/:id         | Удалить пользователя        |

### Swagger-документация

Интерактивная документация доступна по адресу /api-docs (swagger-jsdoc + swagger-ui-express).

**Технологии:** Node.js, Express, nanoid, cors, swagger-jsdoc, swagger-ui-express

---

## Практическое задание 5 — React-клиент

SPA-приложение на React + Vite, подключенное к REST API из задания 4. Реализован список продуктов с возможностью добавления, редактирования и удаления через модальное окно.

**Технологии:** React, Vite, Axios, SCSS

---

## Для запуска

### 1. Установка зависимостей

**Бэкенд:**

cd Practice4/backend
npm install


**Фронтенд:**

cd Practice4/frontend
npm install


### 2. Запуск серверов

**Терминал 1 - Бэкенд:**

cd Practice4/backend
node server.js


или с автоматическим перезапуском:

npx nodemon server.js


**Терминал 2 - Фронтенд:**

cd Practice4/frontend
npm start


или для Vite:

npm run dev


---

## Основные адреса

| Адрес                        | Назначение                          |
|------------------------------|-------------------------------------|
| http://localhost:3001        | Главная страница магазина (фронтенд) |
| http://localhost:3000/api-docs | Интерактивная документация Swagger  |
| http://localhost:3000/api/products | API товаров (JSON)               |

---

## Интерактивная документация Swagger

После запуска бэкенда документация доступна по адресу:

http://localhost:3000/api-docs


### Возможности Swagger UI:

- Просмотр всех доступных эндпоинтов
- Визуализация схем данных (Product, User)
- Отправка тестовых запросов прямо из браузера
- Просмотр ответов API в реальном времени
- Скачивание спецификации OpenAPI

---

## Проверка работоспособности

**Проверка бэкенда:**

curl http://localhost:3000/api/products


или откройте в браузере http://localhost:3000/api/products

**Проверка Swagger:**

Откройте в браузере http://localhost:3000/api-docs

**Проверка фронтенда:**

Откройте в браузере http://localhost:3001

---
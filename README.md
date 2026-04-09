# Практические задания 1-6

## Структура проекта

front-back-practice1/<br>
├── Practice1/ # Практическое задание 1<br>
├── Practice2/ # Практическое задание 2<br>
├── Practice3/ # Практическое задание 3<br>
├── Practice4/ # Практическое задание 4-5<br>
│ ├── frontend/ # React + Vite (фронтенд)<br>
│ └── backend/ # Express (бэкенд)<br>
└── README.md<br>


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

# Практические задания 7-11

## Структура проекта


front-back-practice/<br>
├── Practice7/                 # Практическое задание 7 - Базовая аутентификация<br>
│   └── frontend               # Простой фронтэнд<br>
│   └── backend                # Express сервер с bcrypt<br>
├── Practice8/                 # Практическое задание 8 - JWT токены<br>
│   └── frontend               # Простой фронтэнд<br>
│   └── backend                # Express сервер с JWT<br>
├── Practice9-10/              # Практические задания 9-10 - Фронтенд + Токены<br>
│   ├── frontend/              # React + Vite (фронтенд)<br>
│   └── backend/               # Express (бэкенд с JWT и refresh токенами)<br>
├── Practice11/                # Практическое задание 11 - RBAC<br>
│   ├── frontend/              # React + Vite (фронтенд с ролями)<br>
│   └── backend/               # Express (бэкенд с RBAC)<br>
└── README.md<br>


В результате выполнения практических работ были выполнены следующие задания:

## Практическое задание 7 — Базовая аутентификация с bcrypt

Express-сервер с регистрацией и входом, хешированием паролей через bcrypt.

Технологии: Node.js, Express, bcrypt, nanoid, Swagger

### Api Эндпоинты

|Метод|URL|Описание|
|-------|-----|----------|
|POST|	/api/auth/register|	Регистрация пользователя|
|POST|	/api/auth/login|	Вход в систему|
|POST|	/api/products|	Создать товар|
|GET|	/api/products|	Получить список товаров|
|GET|	/api/products/:id|	Получить товар по ID|
|PUT|	/api/products/:id|	Обновить товар|
|DELETE|	/api/products/:id|	Удалить товар|

## Практическое задание 8 — JWT токены

Доработка сервера из задания 7: добавлена выдача JWT токена при входе и защищённый маршрут /api/auth/me.

Технологии: Node.js, Express, bcrypt, jsonwebtoken, nanoid, Swagger

### Api Эндпоинты

|Метод|URL|Описание|
|-------|-----|---------|
|POST|	/api/auth/register|	Регистрация|
|POST|	/api/auth/login|	Вход|
|GET|	/api/auth/me|	Текущий пользователь|
|POST|	/api/products|	Создать товар|
|GET|	/api/products|	Список товаров|
|GET|	/api/products/:id|	Товар по ID|
|PUT|	/api/products/:id|	Обновить товар|
|DELETE|	/api/products/:id|	Удалить товар|

## Практическое задание 9-10 — React-клиент + Refresh токены

Полноценное SPA-приложение на React, подключённое к Express-серверу с поддержкой refresh-токенов и автоматическим обновлением токенов.
Бэкенд (backend/)

Express-сервер с поддержкой пары токенов (access + refresh).<br>

|Метод|URL|Описание|
|-------|-----|---------|
|POST	|/api/auth/register|	Регистрация пользователя|
|POST|	/api/auth/login	Вход в систему|
|POST|	/api/auth/refresh|	Обновление пары токенов|
|POST|	/api/auth/logout|	Выход из системы|
|GET|	/api/auth/me|	Получение информации о текущем пользователе|
|POST|	/api/products|	Создать товар|
|GET|	/api/products|	Получить список товаров|
|GET|	/api/products/:id|	Получить товар по ID|
|PUT|	/api/products/:id|	Обновить товар|
|DELETE|	/api/products/:id|	Удалить товар|


Хранение данных

    Пользователи и товары хранятся в памяти (массивы)

    Refresh токены хранятся в Set для возможности инвалидации

Токены

    Access token: 15 минут

    Refresh token: 7 дней

    Refresh token хранится на сервере, при обновлении старая пара токенов сбрасывается


Технологии: React, Vite, Axios, React Router, SCSS

### Структура фронтенда

frontend/src/<br>
├── api.js                 # Axios клиент с перехватчиками<br>
├── App.js                 # Роутинг<br>
├── context/<br>
│   └── AuthContext.jsx    # Контекст аутентификации<br>
├── components/<br>
│   ├── Header.jsx         # Шапка с навигацией<br>
│   ├── PrivateRoute.jsx   # Защита маршрутов<br>
│   ├── ProductCard.jsx    # Карточка товара<br>
│   └── ProductForm.jsx    # Форма товара<br>
├── pages/<br>
│   ├── LoginPage.jsx      # Страница входа<br>
│   ├── RegisterPage.jsx   # Страница регистрации<br>
│   └── ProductsPage.jsx   # Страница товаров<br>
└── styles/<br>
    └── App.scss           # Стили

# Практические задания 13-17

## Структура проекта

front-back-practice1/<br>
├── Practice13/ # Практическое задание 13<br>
├── Practice14/ # Практическое задание 14<br>
├── Practice15/ # Практическое задание 15<br>
├── Practice16/ # Практическое задание 16<br>
├── Practice17/ # Практическое задание 17<br>
└── README.md<br>


### №13: Service Worker
- Регистрация Service Worker
- кэширование статических ресурсов, работа приложения без интернета

### №14: Web App Manifest
- Создание manifest.json
- Иконки для разных устройств
- Установка приложения на экран

### №15: HTTPS + App Shell
- Настройка локального HTTPS (mkcert)
- Архитектура App Shell
- Динамическая загрузка страниц

### №16: WebSocket + Push
- Socket.IO для двусторонней связи
- Push-уведомления при добавлении задач.

### №17: Детализация Push
- Форма с datetime-local, планирование напоминаний на сервере
- Кнопка "Отложить на 5 минут" (*не работает в некоторых браузерах*)


## Структура PWA
task-manager-pwa/<br>
├── server.js              # Node.js сервер<br>
├── index.html             # App Shell<br>
├── app.js                 # Клиентская логика<br>
├── styles.css             # Стили<br>
├── sw.js                  # Service Worker<br>
├── manifest.json          # PWA манифест<br>
├── content/<br>
│   ├── home.html<br>
│   └── about.html<br>
└── icons/                 # Иконки PWA<br>

## Установка и запуск

### 1. Клонирование репозитория

```
git clone <repository-url>
cd task-manager-pwa
```
2. Установка зависимостей
```
npm install
```
3. Генерация VAPID-ключей
```
npx web-push generate-vapid-keys
```
Скопируйте полученные ключи и вставьте их в файл server.js:
```
const vapidKeys = {
    publicKey: 'ВАШ_ПУБЛИЧНЫЙ_КЛЮЧ',
    privateKey: 'ВАШ_ПРИВАТНЫЙ_КЛЮЧ'
};
```
4. Запуск сервера
```
node server.js
```
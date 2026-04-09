const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const vapidKeys = {
    publicKey: 'BNS6Ei721eKvrTlrLn5IpeOCdC3dC-o-GkL2_UcXlhkDC_rvn_hvuhYRkCZrp_62KrXbo5rXajWUES0gYtB2Ix0',
    privateKey: 'WgPuE8fBCQSFDd-M9bSoFDq7P5q51QV8XbWcrfuRAjk'
};

webpush.setVapidDetails(
    'mailto:HEGATNB@mail.ru',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, './')));

let subscriptions = [];

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(' Клиент подключён:', socket.id);

    // Обработка события 'newTask' от клиента
    socket.on('newTask', (task) => {
        console.log(' Новая задача от клиента:', task.text);

        io.emit('taskAdded', task);

        const payload = JSON.stringify({
            title: '📋 Новая задача',
            body: task.text,
            icon: '/icons/launchericon-192x192.png',
            badge: '/icons/launchericon-48x48.png',
            timestamp: Date.now()
        });

        subscriptions.forEach(sub => {
            webpush.sendNotification(sub, payload).catch(err => {
                console.error(' Push error:', err);
                if (err.statusCode === 410 || err.statusCode === 404) {
                    subscriptions = subscriptions.filter(s => s.endpoint !== sub.endpoint);
                }
            });
        });
    });

    socket.on('disconnect', () => {
        console.log('Клиент отключён:', socket.id);
    });
});

app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    const exists = subscriptions.some(sub => sub.endpoint === subscription.endpoint);
    if (!exists) {
        subscriptions.push(subscription);
        console.log('Новая push-подписка добавлена. Всего подписок:', subscriptions.length);
    }
    res.status(201).json({ message: 'Подписка сохранена' });
});

app.post('/unsubscribe', (req, res) => {
    const { endpoint } = req.body;
    subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint);
    console.log('Подписка удалена. Осталось подписок:', subscriptions.length);
    res.status(200).json({ message: 'Подписка удалена' });
});

app.get('/vapid-public-key', (req, res) => {
    res.json({ publicKey: vapidKeys.publicKey });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log(`Откройте в браузере: http://localhost:${PORT}`);
    console.log(`Публичный VAPID-ключ: ${vapidKeys.publicKey.substring(0, 30)}...`);
});
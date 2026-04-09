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
const reminders = new Map();

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

function scheduleReminder(id, text, reminderTime) {
    if (reminders.has(id)) {
        const existing = reminders.get(id);
        clearTimeout(existing.timeoutId);
        reminders.delete(id);
        console.log('Old reminder cleared for id:', id);
    }

    const delay = reminderTime - Date.now();

    if (delay <= 0) {
        console.log('Reminder time is in the past, skipping for id:', id);
        return;
    }

    const timeoutId = setTimeout(() => {
        console.log('Sending push notification for reminder:', id);

        const payload = JSON.stringify({
            title: 'Напоминание',
            body: text,
            icon: '/icons/launchericon-192x192.png',
            badge: '/icons/launchericon-48x48.png',
            reminderId: id,
            timestamp: Date.now()
        });

        subscriptions.forEach(sub => {
            webpush.sendNotification(sub, payload).catch(err => {
                console.error('Push error:', err);
                if (err.statusCode === 410 || err.statusCode === 404) {
                    subscriptions = subscriptions.filter(s => s.endpoint !== sub.endpoint);
                }
            });
        });

        reminders.delete(id);
    }, delay);

    reminders.set(id, {
        timeoutId: timeoutId,
        text: text,
        reminderTime: reminderTime
    });

    console.log('Reminder scheduled for id:', id, 'delay:', delay / 1000, 'seconds');
}

function cancelReminder(id) {
    if (reminders.has(id)) {
        const existing = reminders.get(id);
        clearTimeout(existing.timeoutId);
        reminders.delete(id);
        console.log('Reminder cancelled for id:', id);
        return true;
    }
    return false;
}

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('newTask', (task) => {
        console.log('New task from client:', task.text);

        io.emit('taskAdded', task);

        const payload = JSON.stringify({
            title: 'Новая задача',
            body: task.text,
            icon: '/icons/launchericon-192x192.png',
            badge: '/icons/launchericon-48x48.png',
            timestamp: Date.now()
        });

        subscriptions.forEach(sub => {
            webpush.sendNotification(sub, payload).catch(err => {
                console.error('Push error:', err);
                if (err.statusCode === 410 || err.statusCode === 404) {
                    subscriptions = subscriptions.filter(s => s.endpoint !== sub.endpoint);
                }
            });
        });
    });

    socket.on('newReminder', (reminder) => {
        const { id, text, reminderTime } = reminder;
        console.log('New reminder received:', { id, text, reminderTime });
        scheduleReminder(id, text, reminderTime);
    });

    socket.on('cancelReminder', (reminderId) => {
        console.log('Cancel reminder request for id:', reminderId);
        cancelReminder(reminderId);
    });

    socket.on('updateReminder', (reminder) => {
        const { id, text, reminderTime } = reminder;
        console.log('Update reminder request for id:', id);
        cancelReminder(id);
        if (reminderTime) {
            scheduleReminder(id, text, reminderTime);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    const exists = subscriptions.some(sub => sub.endpoint === subscription.endpoint);
    if (!exists) {
        subscriptions.push(subscription);
        console.log('New push subscription added. Total:', subscriptions.length);
    }
    res.status(201).json({ message: 'Subscription saved' });
});

app.post('/unsubscribe', (req, res) => {
    const { endpoint } = req.body;
    subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint);
    console.log('Subscription removed. Remaining:', subscriptions.length);
    res.status(200).json({ message: 'Subscription removed' });
});

app.get('/vapid-public-key', (req, res) => {
    res.json({ publicKey: vapidKeys.publicKey });
});

app.post('/snooze', (req, res) => {
    const reminderId = parseInt(req.query.reminderId, 10);

    console.log('Snooze request for reminder:', reminderId);

    if (!reminderId || !reminders.has(reminderId)) {
        console.log('Reminder not found:', reminderId);
        return res.status(400).json({ error: 'Reminder not found' });
    }

    const reminder = reminders.get(reminderId);

    clearTimeout(reminder.timeoutId);

    const snoozeDelay = 5 * 60 * 1000;
    const newTimeoutId = setTimeout(() => {
        console.log('Sending snoozed push notification for reminder:', reminderId);

        const payload = JSON.stringify({
            title: 'Отложенное напоминание',
            body: reminder.text,
            icon: '/icons/launchericon-192x192.png',
            badge: '/icons/launchericon-48x48.png',
            reminderId: reminderId,
            timestamp: Date.now()
        });

        subscriptions.forEach(sub => {
            webpush.sendNotification(sub, payload).catch(err => {
                console.error('Push error:', err);
                if (err.statusCode === 410 || err.statusCode === 404) {
                    subscriptions = subscriptions.filter(s => s.endpoint !== sub.endpoint);
                }
            });
        });

        reminders.delete(reminderId);
    }, snoozeDelay);

    reminders.set(reminderId, {
        timeoutId: newTimeoutId,
        text: reminder.text,
        reminderTime: Date.now() + snoozeDelay
    });

    console.log('Reminder snoozed for 5 minutes:', reminderId);
    res.status(200).json({ message: 'Reminder snoozed for 5 minutes' });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Public VAPID key: ${vapidKeys.publicKey.substring(0, 30)}...`);
});
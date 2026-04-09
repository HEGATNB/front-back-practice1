const socket = io('http://localhost:3001');

const contentDiv = document.getElementById('app-content');
const homeBtn = document.getElementById('home-btn');
const aboutBtn = document.getElementById('about-btn');

let currentPage = 'home';
let vapidPublicKey = null;

function setActiveButton(activeId) {
    [homeBtn, aboutBtn].forEach(btn => btn.classList.remove('active'));
    document.getElementById(activeId).classList.add('active');
}

async function loadContent(page) {
    currentPage = page;
    try {
        const response = await fetch(`/content/${page}.html`);
        if (!response.ok) throw new Error('Страница не найдена');
        const html = await response.text();
        contentDiv.innerHTML = html;

        if (page === 'home') {
            initHomePage();
        }
    } catch (err) {
        console.error('Ошибка загрузки страницы:', err);
        contentDiv.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="empty-state__text">Ошибка загрузки страницы</div>
                <div class="empty-state__subtext">Проверьте подключение</div>
            </div>
        `;
    }
}

class Task {
    constructor(id, text, completed = false, createdAt = Date.now(), deadline = null) {
        this.id = id;
        this.text = text;
        this.completed = completed;
        this.createdAt = createdAt;
        this.deadline = deadline;
    }
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    return tasks.map(t => new Task(t.id, t.text, t.completed, t.createdAt, t.deadline));
}

function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    if (currentPage === 'home') {
        renderTasks();
    }
}

function formatDeadline(timestamp) {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    const now = new Date();
    const diff = date - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) {
        return 'просрочено';
    } else if (days === 0) {
        return 'сегодня';
    } else if (days === 1) {
        return 'завтра';
    } else {
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
}

function isOverdue(deadline) {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderTasks() {
    const tasks = loadTasks();
    const list = document.getElementById('task-list');
    const statsDiv = document.getElementById('stats');

    if (!list) return;

    if (tasks.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">
                    <i class="fas fa-clipboard-list"></i>
                </div>
                <div class="empty-state__text">Нет задач</div>
                <div class="empty-state__subtext">Добавьте свою первую задачу</div>
            </div>
        `;
        if (statsDiv) statsDiv.innerHTML = '<i class="fas fa-chart-simple"></i> Всего задач: 0';
        return;
    }

    const completedCount = tasks.filter(t => t.completed).length;
    const activeCount = tasks.length - completedCount;

    if (statsDiv) {
        statsDiv.innerHTML = `<i class="fas fa-chart-simple"></i> Всего: ${tasks.length} | <i class="fas fa-check-circle" style="color: #22c55e;"></i> Выполнено: ${completedCount} | <i class="fas fa-clock" style="color: #f97316;"></i> Активных: ${activeCount}`;
    }

    list.innerHTML = tasks
        .sort((a, b) => b.createdAt - a.createdAt)
        .map(task => {
            const deadlineHtml = task.deadline ? `
                <div class="task-card__deadline ${isOverdue(task.deadline) && !task.completed ? 'overdue' : ''}">
                    <i class="fas fa-calendar-alt"></i> ${formatDeadline(task.deadline)}
                </div>
            ` : '';

            return `
                <div class="task-card ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                    <div class="task-card__content" data-id="${task.id}">
                        <div class="task-card__text">
                            ${task.completed ? '<i class="fas fa-check-circle" style="color: #22c55e; font-size: 14px; margin-right: 8px;"></i>' : ''}
                            ${escapeHtml(task.text)}
                        </div>
                        ${deadlineHtml}
                    </div>
                    <div class="task-card__actions">
                        <button class="task-card__edit" data-id="${task.id}" aria-label="Редактировать задачу">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="task-card__delete" data-id="${task.id}" aria-label="Удалить задачу">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        })
        .join('');

    document.querySelectorAll('.task-card__content').forEach(el => {
        el.addEventListener('click', () => toggleTask(parseInt(el.dataset.id)));
    });

    document.querySelectorAll('.task-card__edit').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            openEditModal(parseInt(el.dataset.id));
        });
    });

    document.querySelectorAll('.task-card__delete').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTask(parseInt(el.dataset.id));
        });
    });
}

function showWebSocketNotification(task) {
    const notification = document.createElement('div');
    notification.className = 'websocket-toast';
    notification.innerHTML = `
        <div class="websocket-toast__icon">
            <i class="fas fa-bell"></i>
        </div>
        <div class="websocket-toast__content">
            <div class="websocket-toast__title">Новая задача</div>
            <div class="websocket-toast__text">${escapeHtml(task.text)}</div>
        </div>
        <button class="websocket-toast__close">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);

    notification.querySelector('.websocket-toast__close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });

    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

async function getVapidPublicKey() {
    try {
        const response = await fetch('/vapid-public-key');
        const data = await response.json();
        return data.publicKey;
    } catch (err) {
        console.error('Ошибка получения VAPID ключа:', err);
        return null;
    }
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

async function subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push-уведомления не поддерживаются');
        alert('Ваш браузер не поддерживает push-уведомления');
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        const existingSubscription = await registration.pushManager.getSubscription();

        if (existingSubscription) {
            console.log('Уже есть активная подписка');
            return true;
        }

        const vapidKey = await getVapidPublicKey();
        if (!vapidKey) {
            throw new Error('Не удалось получить VAPID ключ');
        }

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey)
        });

        const response = await fetch('http://localhost:3001/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription)
        });

        if (response.ok) {
            console.log('Подписка на push отправлена');
            return true;
        }
        return false;
    } catch (err) {
        console.error('Ошибка подписки на push:', err);
        if (err.message.includes('permission')) {
            alert('Необходимо разрешить уведомления в настройках браузера');
        }
        return false;
    }
}

async function unsubscribeFromPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            await fetch('http://localhost:3001/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endpoint: subscription.endpoint })
            });
            await subscription.unsubscribe();
            console.log('Отписка выполнена');
        }
    } catch (err) {
        console.error('Ошибка отписки:', err);
    }
}

async function updateNotificationButtons() {
    const enableBtn = document.getElementById('enable-push');
    const disableBtn = document.getElementById('disable-push');

    if (!enableBtn || !disableBtn) return;

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        enableBtn.style.display = 'none';
        disableBtn.style.display = 'none';
        return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
        enableBtn.style.display = 'none';
        disableBtn.style.display = 'inline-flex';
    } else {
        enableBtn.style.display = 'inline-flex';
        disableBtn.style.display = 'none';
    }
}

socket.on('connect', () => {
    console.log('WebSocket подключен');
});

socket.on('taskAdded', (task) => {
    console.log(' Получена задача от другого клиента:', task);
    showWebSocketNotification(task);
});

socket.on('disconnect', () => {
    console.log('WebSocket отключен');
});

function addTask(text, deadline) {
    if (!text.trim()) return;

    const tasks = loadTasks();
    const newTask = new Task(Date.now(), text.trim(), false, Date.now(), deadline || null);
    tasks.push(newTask);
    saveTasks(tasks);
    renderTasks();

    socket.emit('newTask', {
        id: newTask.id,
        text: newTask.text,
        deadline: newTask.deadline,
        createdAt: newTask.createdAt
    });
}

function toggleTask(id) {
    const tasks = loadTasks();
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks(tasks);
        renderTasks();
    }
}

function deleteTask(id) {
    let tasks = loadTasks();
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(tasks);
    renderTasks();
}

function updateTask(id, newText, newDeadline) {
    const tasks = loadTasks();
    const task = tasks.find(t => t.id === id);
    if (task && newText.trim()) {
        task.text = newText.trim();
        task.deadline = newDeadline || null;
        saveTasks(tasks);
        renderTasks();
    }
}

function openEditModal(id) {
    const tasks = loadTasks();
    const task = tasks.find(t => t.id === id);
    if (task) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal__content">
                <h2 class="modal__title">
                    <i class="fas fa-edit"></i> Редактировать задачу
                </h2>
                <input type="text" id="edit-input" class="modal__input" value="${escapeHtml(task.text)}" placeholder="Текст задачи">
                <input type="date" id="edit-date" class="modal__date" value="${task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : ''}">
                <div class="modal__actions">
                    <button id="cancel-edit" class="modal__button modal__button--cancel">
                        <i class="fas fa-times"></i> Отмена
                    </button>
                    <button id="save-edit" class="modal__button modal__button--save">
                        <i class="fas fa-save"></i> Сохранить
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const closeModal = () => modal.remove();

        document.getElementById('cancel-edit').addEventListener('click', closeModal);
        document.getElementById('save-edit').addEventListener('click', () => {
            const newText = document.getElementById('edit-input').value.trim();
            const newDeadline = document.getElementById('edit-date').value ? new Date(document.getElementById('edit-date').value).getTime() : null;
            if (newText) {
                updateTask(id, newText, newDeadline);
                closeModal();
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
}

function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function initHomePage() {
    const form = document.getElementById('task-form');
    const input = document.getElementById('task-input');
    const dateInput = document.getElementById('task-date');

    if (dateInput) {
        dateInput.value = getTodayDate();
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = input.value.trim();
            const deadline = dateInput.value ? new Date(dateInput.value).getTime() : null;
            if (text) {
                addTask(text, deadline);
                input.value = '';
                dateInput.value = getTodayDate();
                input.focus();
            }
        });
    }

    renderTasks();
}

function updateConnectionStatus() {
    const statusDiv = document.getElementById('status');
    if (navigator.onLine) {
        statusDiv.className = 'status status--online';
        statusDiv.innerHTML = '<i class="fas fa-wifi"></i> Онлайн';
    } else {
        statusDiv.className = 'status status--offline';
        statusDiv.innerHTML = '<i class="fas fa-plug"></i> Офлайн';
    }
}

homeBtn.addEventListener('click', () => {
    setActiveButton('home-btn');
    loadContent('home');
});

aboutBtn.addEventListener('click', () => {
    setActiveButton('about-btn');
    loadContent('about');
});

window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);

updateConnectionStatus();
loadContent('home');

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log(' Service Worker зарегистрирован:', registration.scope);
            const enableBtn = document.getElementById('enable-push');
            const disableBtn = document.getElementById('disable-push');

            if (enableBtn) {
                enableBtn.addEventListener('click', async () => {
                    if (Notification.permission === 'denied') {
                        alert('Уведомления запрещены. Разрешите их в настройках браузера.');
                        return;
                    }
                    if (Notification.permission === 'default') {
                        const permission = await Notification.requestPermission();
                        if (permission !== 'granted') {
                            alert('Необходимо разрешить уведомления.');
                            return;
                        }
                    }
                    const success = await subscribeToPush();
                    if (success) {
                        await updateNotificationButtons();
                    }
                });
            }

            if (disableBtn) {
                disableBtn.addEventListener('click', async () => {
                    await unsubscribeFromPush();
                    await updateNotificationButtons();
                });
            }

            await updateNotificationButtons();

        } catch (err) {
            console.error('Ошибка регистрации Service Worker:', err);
        }
    });
}
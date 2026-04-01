const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const statusDiv = document.getElementById('status');
const statsDiv = document.getElementById('stats');

class Task {
    constructor(id, text, completed = false, createdAt = Date.now()) {
        this.id = id;
        this.text = text;
        this.completed = completed;
        this.createdAt = createdAt;
    }
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    return tasks.map(t => new Task(t.id, t.text, t.completed, t.createdAt));
}

function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderTasks() {
    const tasks = loadTasks();

    if (tasks.length === 0) {
        list.innerHTML = '<li class="empty-state"> Нет задач</li>';
        statsDiv.innerHTML = 'Всего задач: 0';
        return;
    }

    const completedCount = tasks.filter(t => t.completed).length;
    const activeCount = tasks.length - completedCount;

    statsDiv.innerHTML = ` Всего: ${tasks.length} | Выполнено: ${completedCount} |  Активных: ${activeCount}`;

    list.innerHTML = tasks
        .sort((a, b) => b.createdAt - a.createdAt)
        .map(task => `
            <li class="todo-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <span class="todo-text ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                    ${escapeHtml(task.text)}
                </span>
                <button class="delete-btn" data-id="${task.id}">🗑️</button>
            </li>
        `)
        .join('');

    document.querySelectorAll('.todo-text').forEach(el => {
        el.addEventListener('click', () => toggleTask(parseInt(el.dataset.id)));
    });

    document.querySelectorAll('.delete-btn').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTask(parseInt(el.dataset.id));
        });
    });
}

function addTask(text) {
    if (!text.trim()) return;

    const tasks = loadTasks();
    const newTask = new Task(Date.now(), text.trim(), false);
    tasks.push(newTask);
    saveTasks(tasks);
    renderTasks();
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

function updateConnectionStatus() {
    if (navigator.onLine) {
        statusDiv.className = 'status online';
        statusDiv.innerHTML = ' Онлайн ';
    } else {
        statusDiv.className = 'status offline';
        statusDiv.innerHTML = ' Офлайн ';
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text) {
        addTask(text);
        input.value = '';
        input.focus();
    }
});

window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);

updateConnectionStatus();
renderTasks();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log(' ServiceWorker зарегистрирован:', registration.scope);
        } catch (err) {
            console.error(' Ошибка регистрации ServiceWorker:', err);
        }
    });
}

if (!('serviceWorker' in navigator)) {
    console.warn(' Service Worker не поддерживается браузером');
    statusDiv.innerHTML = ' Ваш браузер не поддерживает Service Worker';
}
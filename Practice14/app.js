const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const dateInput = document.getElementById('task-date');
const list = document.getElementById('task-list');
const statusDiv = document.getElementById('status');
const statsDiv = document.getElementById('stats');
const editModal = document.getElementById('edit-modal');
const editInput = document.getElementById('edit-input');
const editDate = document.getElementById('edit-date');
const editId = document.getElementById('edit-id');
const cancelEdit = document.getElementById('cancel-edit');
const saveEdit = document.getElementById('save-edit');

let currentEditId = null;

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
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
        return 'сегодня';
    } else if (days === 1) {
        return 'вчера';
    } else if (days < 7) {
        return `${days} д. назад`;
    } else {
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
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

    if (tasks.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">📋</div>
                <div class="empty-state__text">Нет задач</div>
                <div class="empty-state__subtext">Добавьте свою первую задачу</div>
            </div>
        `;
        statsDiv.innerHTML = 'Всего задач: 0';
        return;
    }

    const completedCount = tasks.filter(t => t.completed).length;
    const activeCount = tasks.length - completedCount;

    statsDiv.innerHTML = `Всего: ${tasks.length} | Выполнено: ${completedCount} | Активных: ${activeCount}`;

    list.innerHTML = tasks
        .sort((a, b) => b.createdAt - a.createdAt)
        .map(task => {
            const deadlineHtml = task.deadline ? `
                <span class="task-card__deadline ${isOverdue(task.deadline) && !task.completed ? 'overdue' : ''}">
                    📅 ${formatDeadline(task.deadline)}
                </span>
            ` : '';

            return `
                <div class="task-card ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                    <div class="task-card__content" data-id="${task.id}">
                        <div class="task-card__text">${escapeHtml(task.text)}</div>
                        <div class="task-card__meta">
                            ${deadlineHtml}
                        </div>
                    </div>
                    <div class="task-card__actions">
                        <button class="task-card__edit" data-id="${task.id}" aria-label="Редактировать задачу">✎</button>
                        <button class="task-card__delete" data-id="${task.id}" aria-label="Удалить задачу">✕</button>
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

function addTask(text, deadline) {
    if (!text.trim()) return;

    const tasks = loadTasks();
    const newTask = new Task(Date.now(), text.trim(), false, Date.now(), deadline || null);
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
        currentEditId = id;
        editInput.value = task.text;
        if (task.deadline) {
            editDate.value = new Date(task.deadline).toISOString().split('T')[0];
        } else {
            editDate.value = '';
        }
        editModal.classList.add('active');
    }
}

function closeEditModal() {
    editModal.classList.remove('active');
    currentEditId = null;
    editInput.value = '';
    editDate.value = '';
}

function updateConnectionStatus() {
    if (navigator.onLine) {
        statusDiv.className = 'status status--online';
        statusDiv.innerHTML = 'Онлайн';
    } else {
        statusDiv.className = 'status status--offline';
        statusDiv.innerHTML = 'Офлайн';
    }
}

function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

if (dateInput) {
    dateInput.value = getTodayDate();
}

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

cancelEdit.addEventListener('click', closeEditModal);
saveEdit.addEventListener('click', () => {
    if (currentEditId) {
        const newText = editInput.value.trim();
        const newDeadline = editDate.value ? new Date(editDate.value).getTime() : null;
        if (newText) {
            updateTask(currentEditId, newText, newDeadline);
            closeEditModal();
        }
    }
});

editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
        closeEditModal();
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
            console.log('ServiceWorker зарегистрирован:', registration.scope);
        } catch (err) {
            console.error('Ошибка регистрации ServiceWorker:', err);
        }
    });
}

if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker не поддерживается браузером');
    statusDiv.innerHTML = 'Не поддерживается';
}
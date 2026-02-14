class ProductAPI {
    constructor() {
        this.storageKey = 'products';
        this.products = this.loadProducts();
    }

    loadProducts() {
        const products = localStorage.getItem(this.storageKey);
        return products ? JSON.parse(products) : [];
    }

    saveProducts() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.products));
    }

    getAll() {
        return [...this.products];
    }

    getById(id) {
        return this.products.find(p => p.id === id);
    }

    create(product) {
        const newProduct = {
            ...product,
            id: this.generateId()
        };
        this.products.push(newProduct);
        this.saveProducts();
        return newProduct;
    }

    update(id, updatedProduct) {
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) return null;

        this.products[index] = { ...this.products[index], ...updatedProduct };
        this.saveProducts();
        return this.products[index];
    }

    delete(id) {
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) return false;

        this.products.splice(index, 1);
        this.saveProducts();
        return true;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

class UI {
    constructor(api) {
        this.api = api;
        this.currentEditId = null;

        this.form = document.getElementById('productForm');
        this.productId = document.getElementById('productId');
        this.productName = document.getElementById('productName');
        this.productPrice = document.getElementById('productPrice');
        this.productsList = document.getElementById('productsList');
        this.submitBtn = document.getElementById('submitBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.formTitle = document.getElementById('form-title');

        this.init();
    }

    init() {
        this.renderProducts();

        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.cancelBtn.addEventListener('click', this.resetForm.bind(this));
    }

    handleSubmit(e) {
        e.preventDefault();

        const name = this.productName.value.trim();
        const price = parseFloat(this.productPrice.value);

        if (!name || isNaN(price)) {
            this.showMessage('Заполните все поля корректно', 'error');
            return;
        }

        const productData = { name, price };

        if (this.currentEditId) {
            const updated = this.api.update(this.currentEditId, productData);
            if (updated) {
                this.showMessage(`Товар "${updated.name}" обновлен`, 'success');
            }
        } else {
            const created = this.api.create(productData);
            this.showMessage(`Товар "${created.name}" добавлен`, 'success');
        }

        this.resetForm();
        this.renderProducts();
    }

    handleEdit(id) {
        const product = this.api.getById(id);
        if (!product) return;

        this.currentEditId = id;
        this.productId.value = id;
        this.productName.value = product.name;
        this.productPrice.value = product.price;
        this.submitBtn.textContent = 'Обновить';
        this.formTitle.textContent = 'Редактировать товар';
        this.cancelBtn.style.display = 'block';

        this.form.scrollIntoView({ behavior: 'smooth' });
    }

    handleDelete(id) {
        if (confirm('Вы уверены, что хотите удалить этот товар?')) {
            const product = this.api.getById(id);
            const deleted = this.api.delete(id);

            if (deleted) {
                this.showMessage(`Товар "${product.name}" удален`, 'info');
                this.renderProducts();

                // Сброс формы если удалили редактируемый товар
                if (this.currentEditId === id) {
                    this.resetForm();
                }
            }
        }
    }

    renderProducts() {
        const products = this.api.getAll();

        if (products.length === 0) {
            this.productsList.innerHTML = '<div class="empty-state">Список товаров пуст. Добавьте первый товар!</div>';
            return;
        }

        this.productsList.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-card__actions">
                    <button class="btn btn-edit btn-small" onclick="ui.handleEdit('${product.id}')">✎</button>
                    <button class="btn btn-delete btn-small" onclick="ui.handleDelete('${product.id}')">×</button>
                </div>
                <h3 class="product-card__title">${this.escapeHtml(product.name)}</h3>
                <div class="product-card__price">${product.price.toFixed(2)}</div>
            </div>
        `).join('');
    }

    resetForm() {
        this.form.reset();
        this.productId.value = '';
        this.currentEditId = null;
        this.submitBtn.textContent = 'Добавить';
        this.formTitle.textContent = 'Добавить товар';
        this.cancelBtn.style.display = 'none';
    }

    showMessage(text, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = text;

        const container = document.querySelector('.container');
        container.insertBefore(messageDiv, container.firstChild);

        setTimeout(() => {
            messageDiv.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const api = new ProductAPI();
const ui = new UI(api);

window.ui = ui;
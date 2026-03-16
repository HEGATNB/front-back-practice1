import React, { useState } from 'react';

const ProductForm = ({ product, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: product?.title || '',
    category: product?.category || '',
    description: product?.description || '',
    price: product?.price || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataToSend = {
      title: formData.title,
      category: formData.category,
      description: formData.description,
      price: parseFloat(formData.price)
    };

    console.log('Submitting product data:', dataToSend);
    onSubmit(dataToSend);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="backdrop" onClick={handleBackdropClick}>
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">
            {product ? 'Редактировать товар' : 'Новый товар'}
          </h2>
          <button className="iconBtn" onClick={onClose}>✕</button>
        </div>
        <div className="modal__content">
          <form className="form" onSubmit={handleSubmit}>
            <label className="label">
              Название товара
              <input
                type="text"
                className="input"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Введите название товара"
              />
            </label>

            <label className="label">
              Категория
              <select
                className="input"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Выберите категорию</option>
                <option value="Доски">Доски</option>
                <option value="Гидрокостюмы">Гидрокостюмы</option>
                <option value="Аксессуары">Аксессуары</option>
                <option value="Ласты">Ласты</option>
                <option value="Лимитед">Лимитированные</option>
              </select>
            </label>

            <label className="label">
              Описание
              <textarea
                className="input textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Опишите товар"
                rows="4"
              />
            </label>

            <label className="label">
              Цена (₽)
              <input
                type="number"
                className="input"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="1"
                min="0"
                required
                placeholder="0"
              />
            </label>

            <div className="modal__footer">
              <button type="button" className="btn" onClick={onClose}>
                Отмена
              </button>
              <button type="submit" className="btn btn--primary">
                {product ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
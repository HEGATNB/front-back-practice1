import React, { useEffect, useState } from "react";

export default function ProductModal({ open, mode, initialProduct, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [stock, setStock] = useState("");
  const [rating, setRating] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    if (!open) return;

    setName(initialProduct?.name ?? "");
    setCategory(initialProduct?.category ?? "");
    setDescription(initialProduct?.description ?? "");
    setPrice(initialProduct?.price != null ? String(initialProduct.price) : "");
    setOldPrice(initialProduct?.oldPrice != null ? String(initialProduct.oldPrice) : "");
    setStock(initialProduct?.stock != null ? String(initialProduct.stock) : "");
    setRating(initialProduct?.rating != null ? String(initialProduct.rating) : "");
    setImage(initialProduct?.image ?? "");
  }, [open, initialProduct]);

  if (!open) return null;

  const title = mode === "edit" ? "Редактирование товара" : "Добавление товара";

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedCategory = category.trim();
    const trimmedDesc = description.trim();
    const parsedPrice = Number(price);
    const parsedOldPrice = oldPrice ? Number(oldPrice) : null;
    const parsedStock = Number(stock);
    const parsedRating = rating ? Number(rating) : 0;

    if (!trimmedName) {
      alert("Введите название товара");
      return;
    }
    if (!trimmedCategory) {
      alert("Введите категорию");
      return;
    }
    if (!trimmedDesc) {
      alert("Введите описание");
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      alert("Введите корректную цену");
      return;
    }
    if (parsedOldPrice && (!Number.isFinite(parsedOldPrice) || parsedOldPrice <= parsedPrice)) {
      alert("Старая цена должна быть больше новой цены");
      return;
    }
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      alert("Введите корректное количество на складе");
      return;
    }
    if (rating && (!Number.isFinite(parsedRating) || parsedRating < 0 || parsedRating > 5)) {
      alert("Рейтинг должен быть от 0 до 5");
      return;
    }

    onSubmit({
      id: initialProduct?.id,
      name: trimmedName,
      category: trimmedCategory,
      description: trimmedDesc,
      price: parsedPrice,
      oldPrice: parsedOldPrice,
      stock: parsedStock,
      rating: parsedRating,
      image: image.trim()
    });
  };

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div className="modal__title">{title}</div>
          <button className="iconBtn" onClick={onClose}>✕</button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label className="label">
            Название *
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например, Энцелад"
              autoFocus
            />
          </label>

          <label className="label">
            Категория *
            <input
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Например, спутники"
            />
          </label>

          <label className="label">
            Описание *
            <textarea
              className="input textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Подробное описание товара"
              rows="3"
            />
          </label>

          <div className="form-row">
            <label className="label">
              Цена * (₽)
              <input
                className="input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="70"
                type="number"
                min="0"
                step="1"
              />
            </label>

            <label className="label">
              Старая цена (₽)
              <input
                className="input"
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
                placeholder="100"
                type="number"
                min="0"
                step="1"
              />
            </label>
          </div>

          <div className="form-row">
            <label className="label">
              На складе * (шт.)
              <input
                className="input"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="1"
                type="number"
                min="0"
                step="1"
              />
            </label>

            <label className="label">
              Рейтинг (0-5)
              <input
                className="input"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="4.8"
                type="number"
                min="0"
                max="5"
                step="0.1"
              />
            </label>
          </div>

          <label className="label">
            URL изображения
            <input
              className="input"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="/images/enceladus.jpg"
            />
          </label>

          <div className="modal__footer">
            <button type="button" className="btn" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn--primary">
              {mode === "edit" ? "Сохранить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
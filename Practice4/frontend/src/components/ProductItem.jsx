import React from "react";

export default function ProductItem({ product, onEdit, onDelete }) {
  // Вычисляем процент скидки, если есть oldPrice
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <div className="product-card">
      {discount > 0 && (
        <div className="product-discount-badge">-{discount}%</div>
      )}
      <div className="product-image">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div className="no-image">Нет изображения</div>
        )}
      </div>

      <div className="product-content">
        <div className="product-category">{product.category}</div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>

        <div className="product-details">
          <div className="product-price-container">
            {product.oldPrice ? (
              <>
                <span className="product-old-price">
                  {product.oldPrice.toLocaleString()} ₽
                </span>
                <span className="product-price product-price--sale">
                  {product.price.toLocaleString()} ₽
                </span>
              </>
            ) : (
              <span className="product-price">
                {product.price.toLocaleString()} ₽
              </span>
            )}
          </div>
          <div className="product-stock">
            В наличии: {product.stock} шт.
          </div>
          {product.rating > 0 && (
            <div className="product-rating">★ {product.rating}</div>
          )}
        </div>
        
        <div className="product-actions">
          <button className="btn btn--edit" onClick={() => onEdit(product)}>
            ✎ Редактировать
          </button>
          <button className="btn btn--delete" onClick={() => onDelete(product.id)}>
            × Удалить
          </button>
        </div>
      </div>
    </div>
  );
}
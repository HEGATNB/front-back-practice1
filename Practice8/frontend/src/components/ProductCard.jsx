import React from 'react';

const ProductCard = ({ product, onEdit, onDelete, canModify = true, onImageError }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img
          src={product.image}
          alt={product.title}
          onError={(e) => onImageError?.(e, product.fallbackImage)}
        />
      </div>
      <div className="product-content">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.title}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-details">
          <div className="product-price-container">
            <span className="product-price">
              {formatPrice(product.price)} ₽
            </span>
          </div>
        </div>
        {canModify ? (
          <div className="product-actions">
            {onEdit && (
              <button
                className="btn btn--edit"
                onClick={() => onEdit(product)}
              >
                ✏️ Редактировать
              </button>
            )}
            {onDelete && (
              <button
                className="btn btn--delete"
                onClick={() => onDelete(product.id)}
              >
                🗑️ Удалить
              </button>
            )}
          </div>
        ) : (
          <div className="product-actions" style={{ opacity: 0.5, justifyContent: 'center' }}>
            <span className="btn" style={{ cursor: 'not-allowed' }}>🔒 Только для автора</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
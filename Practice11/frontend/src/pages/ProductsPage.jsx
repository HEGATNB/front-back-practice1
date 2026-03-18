import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import ProductForm from '../components/ProductForm';
import { products as productsApi } from '../api';
import { useAuth } from '../context/AuthContext';

const imageList = [
  '/images/surf1.jpg',
  '/images/surf2.jpg',
  '/images/surf3.jpg',
  '/images/surf4.jpg',
  '/images/surf5.jpg',
];

const fallbackImageList = [
  'https://images.unsplash.com/photo-1621629059565-040e4f5fa967?w=400',
  'https://images.unsplash.com/photo-1607006351497-7e33ad9f8d15?w=400',
  'https://images.unsplash.com/photo-1600343786757-28c0d73e29db?w=400',
  'https://images.unsplash.com/photo-1531429626901-5a29fcd46f3b?w=400',
  'https://images.unsplash.com/photo-1565884282038-9acb05b9d4e4?w=400',
];

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState('');
  const { user, isSeller, isAdmin } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  const getImageByIndex = (index, useFallback = false) => {
    const imageArray = useFallback ? fallbackImageList : imageList;
    const imageIndex = index % imageArray.length;
    return imageArray[imageIndex];
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getAll();

      const productsWithImages = response.data.map((product, index) => ({
        ...product,
        image: getImageByIndex(index, false),
        fallbackImage: getImageByIndex(index, true),
      }));

      setProducts(productsWithImages);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Ошибка при загрузке товаров');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (productData) => {
    try {
      const response = await productsApi.create(productData);

      const newProduct = {
        ...response.data,
        image: getImageByIndex(products.length, false),
        fallbackImage: getImageByIndex(products.length, true),
      };

      setProducts(prev => [...prev, newProduct]);
      setShowModal(false);
      setError('');
    } catch (err) {
      console.error('Error creating product:', err);
      if (err.response?.status === 403) {
        setError('Недостаточно прав для создания товара');
      } else if (err.response?.status === 401) {
        setError('Необходима авторизация');
      } else {
        setError('Ошибка при создании товара');
      }
    }
  };

  const handleUpdateProduct = async (productData) => {
    try {
      const response = await productsApi.update(editingProduct.id, productData);

      setProducts(prev => prev.map(p =>
        p.id === editingProduct.id
          ? {
              ...response.data,
              image: editingProduct.image,
              fallbackImage: editingProduct.fallbackImage
            }
          : p
      ));

      setEditingProduct(null);
      setShowModal(false);
      setError('');
    } catch (err) {
      console.error('Error updating product:', err);
      if (err.response?.status === 403) {
        setError('Недостаточно прав для редактирования этого товара');
      } else {
        setError('Ошибка при обновлении товара');
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }

    try {
      await productsApi.delete(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      setError('');
    } catch (err) {
      console.error('Error deleting product:', err);
      if (err.response?.status === 403) {
        setError('Только администратор может удалять товары');
      } else {
        setError('Ошибка при удалении товара');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmit = (data) => {
    if (editingProduct) {
      handleUpdateProduct(data);
    } else {
      handleCreateProduct(data);
    }
  };

  const canEditProduct = (product) => {
    if (!user) return false;
    if (isAdmin()) return true; // Админ может всё
    if (isSeller() && product.createdBy === user.id) return true;
    return false;
  };

  const canDeleteProduct = () => {
    return isAdmin();
  };

  const handleImageError = (e, fallbackImage) => {
    e.target.onerror = null;
    e.target.src = fallbackImage;
  };

  return (
    <div className="page">
      <Header />

      <main className="main">
        <div className="container">
          <div className="toolbar">
            <h1 className="title"> Каталог серфинга</h1>
            {isSeller() && (
              <button
                className="btn btn--primary"
                onClick={() => setShowModal(true)}
              >
                + Добавить товар
              </button>
            )}
          </div>

          {!user && (
            <div className="info-message">
              ️ Для просмотра товаров необходимо войти в систему
            </div>
          )}

          {user && !isSeller() && (
            <div className="info-message">
               Вы вошли как обычный пользователь. Только просмотр товаров.
            </div>
          )}

          {user && isSeller() && !isAdmin() && (
            <div className="info-message">
               Вы вошли как продавец. Вы можете создавать товары и редактировать свои.
            </div>
          )}

          {user && isAdmin() && (
            <div className="info-message" style={{ background: 'rgba(99, 102, 241, 0.12)', borderColor: '#6366f1' }}>
               Вы вошли как администратор. Полный доступ к управлению.
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
              <button
                className="btn btn--danger"
                style={{ marginLeft: '10px', padding: '4px 8px' }}
                onClick={() => setError('')}
              >
                ✕
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading">Загрузка товаров...</div>
          ) : (
            <>
              {products.length === 0 ? (
                <div className="empty">
                  Товаров пока нет
                </div>
              ) : (
                <div className="products-grid">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={canEditProduct(product) ? handleEdit : null}
                      onDelete={canDeleteProduct() ? handleDeleteProduct : null}
                      canModify={canEditProduct(product)}
                      onImageError={handleImageError}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {showModal && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ProductsPage;
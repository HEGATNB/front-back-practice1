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
  const { user } = useAuth();

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
      console.log('Fetched from backend:', response.data);

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
      console.log('Creating product:', productData);

      const response = await productsApi.create(productData);
      console.log('Product created:', response.data);

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
      if (err.response?.status === 401) {
        setError('Необходима авторизация. Пожалуйста, войдите в систему.');
      } else {
        setError('Ошибка при создании товара');
      }
    }
  };

  const handleUpdateProduct = async (productData) => {
    try {
      console.log('Updating product:', productData);

      const response = await productsApi.update(editingProduct.id, productData);
      console.log('Product updated:', response.data);

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
        setError('Нет прав на редактирование этого товара');
      } else if (err.response?.status === 401) {
        setError('Необходима авторизация');
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
        setError('Нет прав на удаление этого товара');
      } else if (err.response?.status === 401) {
        setError('Необходима авторизация');
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

  const canModifyProduct = (product) => {
    return !product.createdBy || product.createdBy === user?.id;
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
            <button
              className="btn btn--primary"
              onClick={() => setShowModal(true)}
              disabled={!user}
            >
              + Добавить товар
            </button>
          </div>

          {!user && (
            <div className="info-message">
              ⚠️ Для добавления товаров необходимо войти в систему
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
                      onEdit={canModifyProduct(product) ? handleEdit : null}
                      onDelete={canModifyProduct(product) ? handleDeleteProduct : null}
                      canModify={canModifyProduct(product)}
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
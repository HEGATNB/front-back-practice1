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

const initialProducts = [
  {
    id: '1',
    title: 'Доска с волком',
    category: 'Доски',
    description: 'Идеально подойдет для настоящих альфа.',
    price: 9000,
  },
  {
    id: '2',
    title: 'Доска в виде туфли',
    category: 'Доски',
    description: 'Мечта любого джентльмена.',
    price: 7700,
  },
  {
    id: '3',
    title: 'Доска Komodo',
    category: 'Доски',
    description: 'Инновационная доска с технологией Helium. Легкая и прочная.',
    price: 10000,
  },
  {
    id: '4',
    title: 'Доска Buster',
    category: 'Доски',
    description: 'Одна из лучших досок на рынке благодаря своей износостойкости и скорости.',
    price: 12900,
  },
  {
    id: '5',
    title: 'Набор доска, насос, и весла',
    category: 'Доски',
    description: 'Все сразу в комплекте - бери и в путь.',
    price: 22000,
  }
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

      let backendProducts = [];
      try {
        const response = await productsApi.getAll();
        console.log('Fetched from backend:', response.data);
        backendProducts = response.data || [];
      } catch (err) {
        console.log('Backend not available, using initial products');
      }

      if (backendProducts.length === 0) {
        console.log('Loading initial products to backend');

        for (const product of initialProducts) {
          try {
            const response = await productsApi.create(product);
            console.log('Created product:', response.data);
            backendProducts.push(response.data);
          } catch (createErr) {
            console.error('Error creating initial product:', createErr);
          }
        }
      }

      const productsWithImages = backendProducts.map((product, index) => {
        console.log(`Product ${index}: ${product.title} gets image ${index % imageList.length + 1}`);
        return {
          ...product,
          image: getImageByIndex(index, false),
          fallbackImage: getImageByIndex(index, true),
          isFromBackend: true
        };
      });

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
      const newIndex = products.length;
      console.log(`New product gets image ${newIndex % imageList.length + 1}`);

      const newProduct = {
        ...response.data,
        image: getImageByIndex(newIndex, false),
        fallbackImage: getImageByIndex(newIndex, true),
      };

      setProducts(prev => [...prev, newProduct]);
      setShowModal(false);
      setError('');
    } catch (err) {
      console.error('Error creating product:', err);
      if (err.response?.status === 401) {
        setError('Необходима авторизация. Пожалуйста, войдите в систему.');
      } else if (err.response) {
        setError(`Ошибка: ${err.response.data.error || 'Неизвестная ошибка'}`);
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
            <div className="error-message">
              ⚠️ Для управления товарами необходимо войти в систему
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
                  {products.map((product, index) => {
                    console.log(`Displaying product ${index}: ${product.title} with image ${(index % imageList.length) + 1}`);

                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onEdit={canModifyProduct(product) ? handleEdit : null}
                        onDelete={canModifyProduct(product) ? handleDeleteProduct : null}
                        canModify={canModifyProduct(product)}
                        onImageError={handleImageError}
                      />
                    );
                  })}
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

      <footer className="footer">
        <div className="footer__inner">© 2024 Surf Shop</div>
      </footer>
    </div>
  );
};

export default ProductsPage;
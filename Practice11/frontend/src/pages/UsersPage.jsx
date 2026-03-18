import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { users as usersApi } from '../api';
import { useAuth } from '../context/AuthContext';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { user: currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Проверка прав доступа
    if (!isAdmin()) {
      navigate('/products');
      return;
    }
    loadUsers();
  }, [isAdmin, navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAll();
      setUsers(response.data);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Ошибка при загрузке пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (userData) => {
    try {
      const response = await usersApi.update(editingUser.id, userData);

      setUsers(prev => prev.map(u =>
        u.id === editingUser.id ? response.data : u
      ));

      setShowEditModal(false);
      setEditingUser(null);
      setError('');
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Ошибка при обновлении пользователя');
    }
  };

  const handleBlockUser = async (userId) => {
    if (!window.confirm('Вы уверены, что хотите заблокировать этого пользователя?')) {
      return;
    }

    try {
      await usersApi.block(userId);
      // Обновляем статус пользователя в списке
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, isBlocked: true } : u
      ));
      setError('');
    } catch (err) {
      console.error('Error blocking user:', err);
      setError('Ошибка при блокировке пользователя');
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'badge badge--admin';
      case 'seller': return 'badge badge--seller';
      default: return 'badge badge--user';
    }
  };

  const getRoleName = (role) => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'seller': return 'Продавец';
      default: return 'Пользователь';
    }
  };

  if (!isAdmin()) {
    return null; // Перенаправление произойдет в useEffect
  }

  return (
    <div className="page">
      <Header />

      <main className="main">
        <div className="container">
          <div className="toolbar">
            <h1 className="title">👥 Управление пользователями</h1>
            <button className="btn" onClick={() => navigate('/products')}>
              ← К товарам
            </button>
          </div>

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
            <div className="loading">Загрузка пользователей...</div>
          ) : (
            <div className="users-table">
              <div className="users-table__header">
                <div className="users-table__cell">ID</div>
                <div className="users-table__cell">Имя</div>
                <div className="users-table__cell">Email</div>
                <div className="users-table__cell">Роль</div>
                <div className="users-table__cell">Статус</div>
                <div className="users-table__cell">Действия</div>
              </div>

              {users.map(user => (
                <div key={user.id} className="users-table__row">
                  <div className="users-table__cell">{user.id.slice(0, 8)}...</div>
                  <div className="users-table__cell">{user.first_name} {user.last_name}</div>
                  <div className="users-table__cell">{user.email}</div>
                  <div className="users-table__cell">
                    <span className={getRoleBadgeClass(user.role)}>
                      {getRoleName(user.role)}
                    </span>
                  </div>
                  <div className="users-table__cell">
                    {user.isBlocked ? (
                      <span className="badge badge--blocked">Заблокирован</span>
                    ) : (
                      <span className="badge badge--active">Активен</span>
                    )}
                  </div>
                  <div className="users-table__cell users-table__actions">
                    {user.id !== currentUser?.id && (
                      <>
                        <button
                          className="btn btn--primary"
                          onClick={() => handleEdit(user)}
                          disabled={user.isBlocked}
                        >
                          ✏️
                        </button>
                        {!user.isBlocked && (
                          <button
                            className="btn btn--danger"
                            onClick={() => handleBlockUser(user.id)}
                          >
                            🔒
                          </button>
                        )}
                      </>
                    )}
                    {user.id === currentUser?.id && (
                      <span className="badge">Это вы</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Модальное окно редактирования пользователя */}
      {showEditModal && editingUser && (
        <div className="backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Редактирование пользователя</h2>
              <button className="iconBtn" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="modal__content">
              <form className="form" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleUpdateUser({
                  first_name: formData.get('first_name'),
                  last_name: formData.get('last_name'),
                  email: formData.get('email'),
                  role: formData.get('role')
                });
              }}>
                <label className="label">
                  Имя
                  <input
                    type="text"
                    name="first_name"
                    className="input"
                    defaultValue={editingUser.first_name}
                    required
                  />
                </label>

                <label className="label">
                  Фамилия
                  <input
                    type="text"
                    name="last_name"
                    className="input"
                    defaultValue={editingUser.last_name}
                    required
                  />
                </label>

                <label className="label">
                  Email
                  <input
                    type="email"
                    name="email"
                    className="input"
                    defaultValue={editingUser.email}
                    required
                  />
                </label>

                <label className="label">
                  Роль
                  <select name="role" className="input" defaultValue={editingUser.role}>
                    <option value="user">Пользователь</option>
                    <option value="seller">Продавец</option>
                    <option value="admin">Администратор</option>
                  </select>
                </label>

                <div className="modal__footer">
                  <button type="button" className="btn" onClick={() => setShowEditModal(false)}>
                    Отмена
                  </button>
                  <button type="submit" className="btn btn--primary">
                    Сохранить
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
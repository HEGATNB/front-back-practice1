import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/products" className="brand">
          Surf Shop
        </Link>
        <div className="header__right">
          {user ? (
            <>
              {isAdmin() && (
                <Link to="/users" className="btn btn--primary">
                  👥 Пользователи
                </Link>
              )}
              <div className="header__user">
                <span>
                  {user.first_name} {user.last_name}
                  {user.role && (
                    <span style={{
                      marginLeft: '8px',
                      fontSize: '12px',
                      opacity: 0.7,
                      background: 'rgba(255,255,255,0.1)',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      {user.role === 'admin' ? '⭐ Админ' :
                       user.role === 'seller' ? '💰 Продавец' : '👤 Пользователь'}
                    </span>
                  )}
                </span>
                <button className="btn btn--danger" onClick={handleLogout}>
                  Выйти
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn">Войти</Link>
              <Link to="/register" className="btn btn--primary">Регистрация</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
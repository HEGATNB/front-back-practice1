import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
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
            <div className="header__user">
              <span>{user.first_name} {user.last_name}</span>
              <button className="btn btn--danger" onClick={handleLogout}>
                Выйти
              </button>
            </div>
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
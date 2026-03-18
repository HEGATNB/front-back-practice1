import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../api';
import Header from '../components/Header';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('blocked') === 'true') {
      setError('Ваш аккаунт был заблокирован. Обратитесь к администратору.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await auth.login({ email, password });

      const { accessToken, refreshToken, ...userData } = response.data;

      if (userData && userData.id) {
        login(userData);
        navigate('/products');
      }
    } catch (err) {
      console.error('Login error:', err);

      if (err.code === 'ERR_NETWORK') {
        setError('Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен на порту 3000');
      } else if (err.response) {
        if (err.response.status === 403 && err.response.data?.error?.includes('заблокирован')) {
          setError('Ваш аккаунт заблокирован. Обратитесь к администратору.');
        } else {
          setError(err.response.data?.error || `Ошибка ${err.response.status}`);
        }
      } else {
        setError('Ошибка при входе');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Header />
      <main className="main">
        <div className="container">
          <div className="auth-container">
            <h1 className="auth-title">Вход в систему</h1>

            {error && <div className="error-message">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Пароль</label>
                <input
                  type="password"
                  id="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn btn--primary btn--full"
                disabled={loading}
              >
                {loading ? 'Вход...' : 'Войти'}
              </button>
            </form>

            <div className="auth-link">
              Нет аккаунта?
              <Link to="/register">Зарегистрироваться</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
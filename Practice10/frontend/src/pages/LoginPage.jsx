import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../api';
import Header from '../components/Header';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', { email });

      const response = await auth.login({ email, password });
      console.log('Login response full:', response);
      console.log('Login response data:', response.data);

      const { accessToken, refreshToken, ...userData } = response.data;

      if (userData && userData.id) {
        console.log('Login successful, user:', userData);
        login(userData);

        navigate('/products');
      } else {
        console.error('Invalid response structure:', response.data);
        setError('Неверный формат ответа от сервера');
      }
    } catch (err) {
      console.error('Login error full:', err);
      console.error('Login error response:', err.response);

      if (err.code === 'ERR_NETWORK') {
        setError('Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен на порту 3000');
      } else if (err.response) {
        setError(err.response.data?.error || `Ошибка ${err.response.status}`);
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
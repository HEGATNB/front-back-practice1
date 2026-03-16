import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../api';
import Header from '../components/Header';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await auth.register(formData);
      login(response.data);
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при регистрации');
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
            <h1 className="auth-title">Регистрация</h1>

            {error && <div className="error-message">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  className="input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@mail.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Имя</label>
                  <input
                    type="text"
                    name="first_name"
                    className="input"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Иван"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Фамилия</label>
                  <input
                    type="text"
                    name="last_name"
                    className="input"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Иванов"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Пароль</label>
                <input
                  type="password"
                  name="password"
                  className="input"
                  value={formData.password}
                  onChange={handleChange}
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
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>
            </form>

            <div className="auth-link">
              Уже есть аккаунт?
              <Link to="/login">Войти</Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer__inner">© 2024 Surf Shop. Все права защищены.</div>
      </footer>
    </div>
  );
};

export default RegisterPage;
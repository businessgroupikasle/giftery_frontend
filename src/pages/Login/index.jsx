import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '@hooks/useAuth';
import { ROUTES } from '@constants/routes';
import { MESSAGES } from '@constants/messages';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success(MESSAGES.AUTH.LOGIN_SUCCESS);
      navigate(ROUTES.HOME);
    } catch (err) {
      toast.error(err.message || MESSAGES.AUTH.INVALID_CREDENTIALS);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 420 }}>
        <h1>Sign In</h1>
        <input
          id="login-email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          id="login-password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button id="login-submit" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p>Don't have an account? <Link to={ROUTES.REGISTER}>Register</Link></p>
        <p><Link to="/forgot-password">Forgot Password?</Link></p>
      </form>
    </main>
  );
};

export default Login;

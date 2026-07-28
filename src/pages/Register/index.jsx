import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '@hooks/useAuth';
import { ROUTES } from '@constants/routes';
import { MESSAGES } from '@constants/messages';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success(MESSAGES.AUTH.REGISTER_SUCCESS);
      navigate(ROUTES.HOME);
    } catch (err) {
      toast.error(err.message || MESSAGES.GENERIC.ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 420 }}>
        <h1>Create Account</h1>
        <input
          id="reg-name"
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          id="reg-email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          id="reg-password"
          type="password"
          placeholder="Password (min 8 chars)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button id="reg-submit" type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
        <p>Already have an account? <Link to={ROUTES.LOGIN}>Login</Link></p>
      </form>
    </main>
  );
};

export default Register;

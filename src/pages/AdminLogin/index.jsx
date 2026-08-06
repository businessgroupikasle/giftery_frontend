import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiBriefcase, 
  FiLock, 
  FiMail, 
  FiEye, 
  FiEyeOff, 
  FiArrowRight, 
  FiArrowLeft
} from 'react-icons/fi';
import useAuth from '@hooks/useAuth';
import { ROUTES } from '@constants/routes';
import styles from './AdminLogin.module.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: 'admin@giftery.com',
    password: 'Admin@123',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleQuickFill = () => {
    setForm({
      email: 'admin@giftery.com',
      password: 'Admin@123',
    });
    toast.info('Store Admin credentials pre-filled');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({ email: form.email, password: form.password });
      toast.success('Welcome back, Store Administrator');
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      toast.error(err.message || 'Invalid Store Admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminAuthContainer}>
      <Link to={ROUTES.HOME} className={styles.backHomeBtn}>
        <FiArrowLeft />
        <span>Back to Store</span>
      </Link>

      <div className={styles.adminOverlay} />

      <div className={styles.adminCard}>
        {/* Header */}
        <div className={styles.brandHeader}>
          <div className={styles.briefcaseBadge}>
            <FiBriefcase />
          </div>
          <h2 className={styles.brandName}>GIFTERYS</h2>
          <span className={styles.brandSub}>STORE ADMIN MANAGEMENT PORTAL</span>
        </div>

        {/* Titles */}
        <div className={styles.titleGroup}>
          <h1 className={styles.mainTitle}>Admin Authentication</h1>
          <p className={styles.subTitle}>
            Access catalog management, customer orders, and store operations
          </p>
        </div>

        {/* Quick Fill Tool */}
        <div className={styles.quickFillBar}>
          <span className={styles.quickFillText}>⚡ Store Admin Credentials</span>
          <button type="button" className={styles.quickFillBtn} onClick={handleQuickFill}>
            Auto Fill
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="admin-email">
              Store Admin Email
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}><FiMail /></span>
              <input
                id="admin-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={styles.inputField}
                placeholder="admin@giftery.com"
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="admin-pass">
              Password
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}><FiLock /></span>
              <input
                id="admin-pass"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                className={styles.inputField}
                placeholder="••••••••••••"
                required
              />
              <button
                type="button"
                className={styles.togglePass}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>ENTER ADMIN DASHBOARD</span>
                <FiArrowRight />
              </>
            )}
          </button>
        </form>

        {/* Switch Portal Navigation */}
        <div className={styles.otherPortals}>
          <Link to={ROUTES.SUPER_ADMIN_LOGIN} className={styles.portalLink}>
            👑 Super Admin Portal
          </Link>
          <Link to={ROUTES.LOGIN} style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 600 }}>
            👤 Customer Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

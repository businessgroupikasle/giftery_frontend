import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiShield, 
  FiLock, 
  FiMail, 
  FiEye, 
  FiEyeOff, 
  FiArrowRight, 
  FiArrowLeft,
  FiKey,
  FiCheckCircle
} from 'react-icons/fi';
import useAuth from '@hooks/useAuth';
import { ROUTES } from '@constants/routes';
import styles from './SuperAdminLogin.module.css';

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: 'superadmin@giftery.com',
    password: 'SuperAdmin@123',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleChange = (e) => {
    setAuthError('');
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleQuickFill = () => {
    setAuthError('');
    setForm({
      email: 'superadmin@giftery.com',
      password: 'SuperAdmin@123',
    });
    toast.info('Super Admin credentials pre-filled');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    try {
      const res = await login({ email: form.email, password: form.password });
      toast.success('👑 Welcome, Super Administrator');
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      const errMsg = err.message || 'Invalid Super Admin credentials. Please check your username & password.';
      setAuthError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.superAuthContainer}>
      <Link to={ROUTES.HOME} className={styles.backHomeBtn}>
        <FiArrowLeft />
        <span>Back to Store</span>
      </Link>

      <div className={styles.superOverlay} />

      <div className={styles.superCard}>
        {/* Shield Header */}
        <div className={styles.brandHeader}>
          <div className={styles.shieldBadge}>
            <FiShield />
          </div>
          <h2 className={styles.brandTitle}>GIFTERYS</h2>
          <span className={styles.brandSub}>SUPER ADMIN ACCESS PORTAL</span>
        </div>

        {/* Titles */}
        <div className={styles.titleGroup}>
          <h1 className={styles.mainTitle}>Elevated Authorization</h1>
          <p className={styles.subTitle}>
            High-security portal for master controls, role elevation, and system management
          </p>
        </div>

        {/* Security Banner */}
        <div className={styles.securityBanner}>
          <FiKey />
          <span>Restricted Portal • Master System Privileges Active</span>
        </div>

        {/* Quick Fill Tool */}
        <div className={styles.quickFillBar}>
          <span className={styles.quickFillText}>⚡ Super Admin Credentials</span>
          <button type="button" className={styles.quickFillBtn} onClick={handleQuickFill}>
            Auto Fill
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Validation Error Alert Banner */}
          {authError && (
            <div className={styles.errorAlertBanner}>
              <span className={styles.errorAlertIcon}>⚠️</span>
              <div className={styles.errorAlertText}>
                <strong>Authentication Failed</strong>
                <p>{authError}</p>
              </div>
              <button type="button" onClick={() => setAuthError('')} className={styles.errorAlertClose}>✕</button>
            </div>
          )}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="super-email">
              Super Admin Email
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}><FiMail /></span>
              <input
                id="super-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={styles.inputField}
                placeholder="superadmin@giftery.com"
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="super-pass">
              Master Access Key / Password
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}><FiLock /></span>
              <input
                id="super-pass"
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
                <span>ENTER SUPER ADMIN PORTAL</span>
                <FiArrowRight />
              </>
            )}
          </button>
        </form>

        {/* Switch Portal Navigation */}
        <div className={styles.otherPortals}>
          <Link to={ROUTES.ADMIN_LOGIN} className={styles.portalLink}>
            💼 Store Admin Portal
          </Link>
          <Link to={ROUTES.LOGIN} className={styles.portalLink}>
            👤 Customer Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;

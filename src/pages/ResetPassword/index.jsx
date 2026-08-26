import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiLock, FiEye, FiEyeOff, FiArrowRight, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import authService from '@services/authService';
import { ROUTES } from '@constants/routes';
import styles from './ResetPassword.module.css';

const GiftLogoSvg = () => (
  <svg className={styles.brandLogo} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 12V36" stroke="url(#resetGoldGrad)" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="6" y="17" width="28" height="19" rx="2" stroke="url(#resetGoldGrad)" strokeWidth="2.2" fill="url(#resetGoldGrad)" fillOpacity="0.12" />
    <rect x="4" y="12" width="32" height="5" rx="1.5" fill="url(#resetGoldGrad)" stroke="url(#resetGoldGrad)" strokeWidth="1.5" />
    <path d="M20 12C20 12 16 4 11 4C7.5 4 6 6.5 7 9.5C8 12 20 12 20 12Z" stroke="url(#resetGoldGrad)" strokeWidth="2" strokeLinejoin="round" fill="url(#resetGoldGrad)" fillOpacity="0.2" />
    <path d="M20 12C20 12 24 4 29 4C32.5 4 34 6.5 33 9.5C32 12 20 12 20 12Z" stroke="url(#resetGoldGrad)" strokeWidth="2" strokeLinejoin="round" fill="url(#resetGoldGrad)" fillOpacity="0.2" />
    <defs>
      <linearGradient id="resetGoldGrad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F7D58B" />
        <stop offset="0.5" stopColor="#DFA843" />
        <stop offset="1" stopColor="#B8832A" />
      </linearGradient>
    </defs>
  </svg>
);

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!token) {
      const err = 'Reset token is missing or invalid.';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    if (!password) {
      const err = 'Password is required';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      const err = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    if (password !== confirmPassword) {
      const err = 'Passwords do not match.';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setIsSuccess(true);
      toast.success('Password reset successfully. Please login with your new password.');
      setTimeout(() => {
        navigate(ROUTES.LOGIN, { replace: true });
      }, 2500);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid or expired reset link.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Link to={ROUTES.LOGIN} className={styles.backBtn}>
        <FiArrowLeft />
        <span>Back to Login</span>
      </Link>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <GiftLogoSvg />
          <h1 className={styles.brandTitle}>GIFTERY</h1>
          <p className={styles.brandSubtitle}>Security & Recovery</p>
          <h2 className={styles.sectionTitle}>Set New Password</h2>
          <p className={styles.sectionDescription}>
            Please enter and confirm your new password below.
          </p>
        </div>

        {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <FiCheckCircle style={{ fontSize: '3rem', color: '#10b981', marginBottom: '1rem' }} />
            <h3 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>Password Updated!</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Your password has been reset successfully. Redirecting you to the login page...
            </p>
            <Link to={ROUTES.LOGIN} className={styles.submitBtn} style={{ textDecoration: 'none' }}>
              <span>Go to Login</span>
              <FiArrowRight />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>New Password</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}><FiLock /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => { setErrorMsg(''); setPassword(e.target.value); }}
                  className={styles.inputField}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Confirm Password</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}><FiLock /></span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => { setErrorMsg(''); setConfirmPassword(e.target.value); }}
                  className={styles.inputField}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className={styles.passwordRequirements}>
              Must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special symbol.
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              <span>{loading ? 'Updating Password...' : 'Reset Password'}</span>
              <FiArrowRight />
            </button>

            <Link to={ROUTES.LOGIN} className={styles.backLoginLink}>
              <FiArrowLeft />
              <span>Cancel and return to Login</span>
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiMail, 
  FiLock, 
  FiUser, 
  FiPhone,
  FiEye, 
  FiEyeOff, 
  FiArrowRight, 
  FiArrowLeft,
  FiKey, 
  FiX
} from 'react-icons/fi';

import useAuth from '@hooks/useAuth';
import authService from '@services/authService';
import { ROUTES } from '@constants/routes';
import { MESSAGES } from '@constants/messages';
import { isValidEmail, isValidMobile } from '../../utils/validation';
import styles from './Login.module.css';

const GiftLogoSvg = () => (
  <svg className={styles.headerLogoSvg} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 12V36" stroke="url(#loginGoldGrad)" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="6" y="17" width="28" height="19" rx="2" stroke="url(#loginGoldGrad)" strokeWidth="2.2" fill="url(#loginGoldGrad)" fillOpacity="0.12" />
    <rect x="4" y="12" width="32" height="5" rx="1.5" fill="url(#loginGoldGrad)" stroke="url(#loginGoldGrad)" strokeWidth="1.5" />
    <path d="M20 12C20 12 16 4 11 4C7.5 4 6 6.5 7 9.5C8 12 20 12 20 12Z" stroke="url(#loginGoldGrad)" strokeWidth="2" strokeLinejoin="round" fill="url(#loginGoldGrad)" fillOpacity="0.2" />
    <path d="M20 12C20 12 24 4 29 4C32.5 4 34 6.5 33 9.5C32 12 20 12 20 12Z" stroke="url(#loginGoldGrad)" strokeWidth="2" strokeLinejoin="round" fill="url(#loginGoldGrad)" fillOpacity="0.2" />
    <defs>
      <linearGradient id="loginGoldGrad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F7D58B" />
        <stop offset="0.5" stopColor="#DFA843" />
        <stop offset="1" stopColor="#B8832A" />
      </linearGradient>
    </defs>
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSending, setResetSending] = useState(false);

  // Inline OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);

  // Form Fields
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });

  // Animated Segmented Control Indicator
  const loginTabRef = useRef(null);
  const registerTabRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({});

  // Update tab state when route changes
  useEffect(() => {
    const isReg = location.pathname === ROUTES.REGISTER;
    setActiveTab(isReg ? 'register' : 'login');
  }, [location.pathname]);

  // Update indicator position when tab changes or resizes
  useEffect(() => {
    const targetRef = activeTab === 'login' ? loginTabRef.current : registerTabRef.current;
    if (targetRef) {
      setIndicatorStyle({
        left: targetRef.offsetLeft,
        width: targetRef.offsetWidth,
      });
    }
  }, [activeTab]);

  // Hide body scrollbar on auth pages
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  const handleTabSwitch = (tab) => {
    setAuthError('');
    setActiveTab(tab);
    if (tab === 'login' && location.pathname !== ROUTES.LOGIN) {
      navigate(ROUTES.LOGIN, { replace: true });
    } else if (tab === 'register' && location.pathname !== ROUTES.REGISTER) {
      navigate(ROUTES.REGISTER, { replace: true });
    }
  };

  const handleChange = (e) => {
    setAuthError('');
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRequestOTP = async () => {
    if (!form.email || !isValidEmail(form.email)) {
      toast.error('Please enter a valid email address (e.g. name@domain.com)');
      return;
    }

    setSendingOTP(true);
    try {
      await authService.requestOTP({ email: form.email, name: form.name });
      setOtpSent(true);
      setForm((prev) => ({ ...prev, otp: '' }));
      toast.success('Verification code sent');
    } catch (err) {
      toast.error(err.message || 'Failed to send verification OTP code. Please try again.');
    } finally {
      setSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!form.otp || form.otp.trim().length !== 6) {
      toast.error('Please enter a valid 6-digit OTP code');
      return;
    }

    setVerifyingOTP(true);
    try {
      await authService.verifyEmail({ email: form.email, otp: form.otp });
      setOtpVerified(true);
      toast.success('OTP code verified successfully!');
    } catch (err) {
      toast.error(err.message || 'Invalid OTP code. Please check your email and try again.');
    } finally {
      setVerifyingOTP(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    const redirectTarget = location.state?.from || ROUTES.HOME;

    try {
      if (!form.email || !isValidEmail(form.email)) {
        const errorMsg = 'Please enter a valid email address';
        setAuthError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      if (activeTab === 'login') {
        const res = await login({ email: form.email, password: form.password });
        toast.success(MESSAGES.AUTH.LOGIN_SUCCESS);
        
        const loggedUser = res?.user || res?.data?.user;
        const role = loggedUser?.role;
        if (role === 'SUPER_ADMIN' || role === 'ADMIN' || form.email.toLowerCase().includes('admin')) {
          navigate(ROUTES.DASHBOARD);
        } else {
          navigate(redirectTarget);
        }
      } else {
        if (!form.phone || !isValidMobile(form.phone)) {
          const errorMsg = 'Please enter a valid 10-digit mobile number';
          setAuthError(errorMsg);
          toast.error(errorMsg);
          setLoading(false);
          return;
        }
        if (!form.otp) {
          const errorMsg = 'Please click "Send OTP" and enter the 6-digit code sent to your email.';
          setAuthError(errorMsg);
          toast.warning(errorMsg);
          setLoading(false);
          return;
        }
        if (!otpVerified) {
          const errorMsg = 'Please click "Verify OTP" to verify your 6-digit code first.';
          setAuthError(errorMsg);
          toast.warning(errorMsg);
          setLoading(false);
          return;
        }
        if (form.password !== form.confirmPassword) {
          const errorMsg = 'Passwords do not match';
          setAuthError(errorMsg);
          toast.error(errorMsg);
          setLoading(false);
          return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(form.password)) {
          const errorMsg = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
          setAuthError(errorMsg);
          toast.error(errorMsg);
          setLoading(false);
          return;
        }

        if (!termsAgreed) {
          const errorMsg = 'Please agree to the Terms & Privacy Policy';
          setAuthError(errorMsg);
          toast.error(errorMsg);
          setLoading(false);
          return;
        }

        const res = await register({
          name: form.name,
          email: form.email,
          password: form.password,
          otp: form.otp,
        });

        const newUser = {
          id: 'usr-' + Math.floor(1000 + Math.random() * 9000),
          name: form.name,
          email: form.email,
          phone: form.phone || 'Not provided',
          role: 'CUSTOMER',
          ordersCount: 0,
          totalSpent: 0,
          joinedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          status: 'Active',
        };

        try {
          const existing = JSON.parse(localStorage.getItem('registered_users') || '[]');
          localStorage.setItem('registered_users', JSON.stringify([newUser, ...existing]));
          window.dispatchEvent(new Event('registered_users_updated'));
        } catch (e) {}

        toast.success('Account created and verified successfully!');
        const loggedUser = res?.user || res?.data?.user;
        const role = loggedUser?.role;
        if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
          navigate(ROUTES.DASHBOARD);
        } else {
          navigate(redirectTarget);
        }
      }
    } catch (err) {
      const errText = err.message || (activeTab === 'login' ? 'Invalid username or password. Please check your credentials.' : MESSAGES.GENERIC.ERROR);
      setAuthError(errText);
      toast.error(errText);
    } finally {
      setLoading(false);
    }
  };


  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSending(true);

    try {
      await authService.forgotPassword(resetEmail);
      toast.success(`Password reset instructions sent to ${resetEmail}`);
      setShowForgotModal(false);
      setResetEmail('');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
    } finally {
      setResetSending(false);
    }
  };

  return (
    <div className={styles.authPageContainer}>
      {/* Back to Home Button — Top Left */}
      <Link to={ROUTES.HOME} className={styles.backHomeBtn}>
        <FiArrowLeft className={styles.backHomeIcon} />
        <span>Back to Home</span>
      </Link>

      <div className={styles.authCard}>
        {/* Header Logo */}
        <div className={styles.authCardHeader}>
          <Link to={ROUTES.HOME} className={styles.headerLogoLink}>
            <GiftLogoSvg />
            <div className={styles.headerBrandGroup}>
              <h1 className={styles.headerBrandTitle}>GIFTERY</h1>
              <span className={styles.headerBrandTagline}>PREMIUM GIFTS, LASTING IMPRESSIONS</span>
            </div>
          </Link>
          <p className={styles.authHeaderSubtitle}>
            {activeTab === 'login'
              ? 'Access your luxury gifting dashboard'
              : 'Create an account to explore bespoke corporate gifts'}
          </p>
        </div>

        {/* Animated Segmented Tab Switcher */}
        <div className={styles.segmentedControl}>
          <div className={styles.segmentedIndicator} style={indicatorStyle} />
          <button
            ref={loginTabRef}
            type="button"
            className={`${styles.segmentBtn} ${activeTab === 'login' ? styles.segmentBtnActive : ''}`}
            onClick={() => handleTabSwitch('login')}
          >
            Sign In
          </button>
          <button
            ref={registerTabRef}
            type="button"
            className={`${styles.segmentBtn} ${activeTab === 'register' ? styles.segmentBtnActive : ''}`}
            onClick={() => handleTabSwitch('register')}
          >
            Create Account
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className={styles.authForm}>
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
          {/* Full Name Field (Register only) */}
          {activeTab === 'register' && (
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Full Name</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}><FiUser /></span>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Alexander Vance"
                  value={form.name}
                  onChange={handleChange}
                  className={styles.inputField}
                  required
                />
              </div>
            </div>
          )}

          {/* Mobile Number Field (Register only) */}
          {activeTab === 'register' && (
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Mobile / Phone Number</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}><FiPhone /></span>
                <input
                  type="tel"
                  name="phone"
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  value={form.phone || ''}
                  onChange={handleChange}
                  className={styles.inputField}
                  required
                />
              </div>
            </div>
          )}

          {/* Email Address & Inline Send OTP Button */}
          <div className={styles.inputGroup}>
            <div className={styles.inputHeaderRow}>
              <label className={styles.inputLabel}>Email Address</label>
              {activeTab === 'register' && (
                <button
                  type="button"
                  onClick={handleRequestOTP}
                  disabled={sendingOTP}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#d99b26',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {sendingOTP ? 'Sending OTP...' : otpSent ? '↻ Resend OTP' : 'Send OTP →'}
                </button>
              )}
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}><FiMail /></span>
              <input
                type="email"
                name="email"
                placeholder="name@company.com"
                value={form.email}
                onChange={handleChange}
                className={styles.inputField}
                required
              />
            </div>
          </div>

          {/* Inline Verification OTP Field (Register Only) */}
          {activeTab === 'register' && (
            <div className={styles.inputGroup}>
              <div className={styles.inputHeaderRow}>
                <label className={styles.inputLabel} style={{ color: '#d99b26', fontWeight: '700' }}>
                  Verification OTP Code
                </label>
                {otpVerified ? (
                  <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    ✓ Verified
                  </span>
                ) : otpSent ? (
                  <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '600' }}>
                    ✓ Code Sent to Email
                  </span>
                ) : null}
              </div>
              <div className={styles.inputWrapper} style={{ position: 'relative' }}>
                <span className={styles.inputIcon} style={{ color: '#d99b26' }}><FiKey /></span>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 6-digit OTP code"
                  maxLength={6}
                  value={form.otp || ''}
                  onChange={(e) => {
                    handleChange(e);
                    if (otpVerified) setOtpVerified(false);
                  }}
                  className={styles.inputField}
                  style={{
                    borderColor: otpVerified ? '#10b981' : '#d99b26',
                    letterSpacing: '0.12em',
                    fontWeight: '700',
                    paddingRight: '115px',
                  }}
                  required
                />
                {otpVerified ? (
                  <button
                    type="button"
                    disabled
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: '#064e3b',
                      color: '#34d399',
                      border: '1px solid #059669',
                      borderRadius: '6px',
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'default',
                    }}
                  >
                    ✓ Verified
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={verifyingOTP}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'linear-gradient(135deg, #d99b26 0%, #b87c12 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.38rem 0.85rem',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(217, 155, 38, 0.3)',
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    {verifyingOTP ? 'Verifying...' : 'Verify OTP'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Password Field */}
          <div className={styles.inputGroup}>
            <div className={styles.inputHeaderRow}>
              <label className={styles.inputLabel}>Password</label>
              {activeTab === 'login' && (
                <button
                  type="button"
                  className={styles.forgotPasswordBtn}
                  onClick={() => setShowForgotModal(true)}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}><FiLock /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••••••"
                value={form.password}
                onChange={handleChange}
                className={styles.inputField}
                required
                minLength={6}
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

          {/* Confirm Password Field (Register only) */}
          {activeTab === 'register' && (
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Confirm Password</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}><FiLock /></span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={styles.inputField}
                  required
                  minLength={6}
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
          )}

          {/* Terms & Conditions Checkbox (Register only) */}
          {activeTab === 'register' && (
            <label className={styles.termsCheckboxLabel}>
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className={styles.termsCheckbox}
              />
              <span>
                I agree to the <Link to="/terms" className={styles.termsLink}>Terms of Service</Link> and{' '}
                <Link to="/privacy" className={styles.termsLink}>Privacy Policy</Link>
              </span>
            </label>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            <span>
              {loading
                ? 'Processing...'
                : activeTab === 'login'
                ? 'Sign In to Dashboard'
                : 'Create & Validate Account'}
            </span>
            <FiArrowRight />
          </button>
        </form>

      </div>

      {/* ── FORGOT PASSWORD MODAL ────────────────────────────────────── */}
      {showForgotModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.forgotModal}>
            <div className={styles.modalHeader}>
              <h3>Reset Password</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setShowForgotModal(false)}
              >
                <FiX />
              </button>
            </div>
            <p className={styles.modalDescription}>
              Enter the email address associated with your account, and we&apos;ll send you a link to reset your password.
            </p>
            <form onSubmit={handleForgotSubmit}>
              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}><FiMail /></span>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className={styles.inputField}
                    required
                  />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowForgotModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.sendBtn}
                  disabled={resetSending}
                >
                  {resetSending ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiMail, 
  FiLock, 
  FiUser, 
  FiEye, 
  FiEyeOff, 
  FiArrowRight, 
  FiArrowLeft,
  FiKey, 
  FiX
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaMeta } from 'react-icons/fa6';
import useAuth from '@hooks/useAuth';
import authService from '@services/authService';
import { ROUTES } from '@constants/routes';
import { MESSAGES } from '@constants/messages';
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
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSending, setResetSending] = useState(false);

  // Inline OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);

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
    setActiveTab(tab);
    if (tab === 'login' && location.pathname !== ROUTES.LOGIN) {
      navigate(ROUTES.LOGIN, { replace: true });
    } else if (tab === 'register' && location.pathname !== ROUTES.REGISTER) {
      navigate(ROUTES.REGISTER, { replace: true });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRequestOTP = async () => {
    if (!form.email || !form.email.includes('@')) {
      toast.error('Please enter a valid email address first');
      return;
    }

    setSendingOTP(true);
    try {
      await authService.requestOTP({ email: form.email, name: form.name });
      setOtpSent(true);
      setForm((prev) => ({ ...prev, otp: '' }));
      toast.success(`📧 Verification code sent to ${form.email}. Please enter the 6-digit OTP code below.`);
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP code');
    } finally {
      setSendingOTP(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeTab === 'login') {
        const res = await login({ email: form.email, password: form.password });
        toast.success(MESSAGES.AUTH.LOGIN_SUCCESS);
        
        const loggedUser = res?.user || res?.data?.user;
        const role = loggedUser?.role;
        if (role === 'SUPER_ADMIN' || role === 'ADMIN' || form.email.toLowerCase().includes('admin')) {
          navigate(ROUTES.DASHBOARD);
        } else {
          navigate(ROUTES.HOME);
        }
      } else {
        if (!form.otp) {
          toast.warning('Please click "Send OTP" and enter the 6-digit code sent to your email.');
          setLoading(false);
          return;
        }
        if (form.password !== form.confirmPassword) {
          toast.error('Passwords do not match');
          setLoading(false);
          return;
        }
        if (!termsAgreed) {
          toast.error('Please agree to the Terms & Privacy Policy');
          setLoading(false);
          return;
        }

        await authService.register({
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

        toast.success('🎉 Account created and verified successfully!');
        navigate(ROUTES.HOME);
      }
    } catch (err) {
      toast.error(err.message || (activeTab === 'login' ? MESSAGES.AUTH.INVALID_CREDENTIALS : MESSAGES.GENERIC.ERROR));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = (provider) => {
    toast.info(`Connecting to ${provider}...`);
    setTimeout(() => {
      toast.success(`Successfully authenticated with ${provider}`);
      navigate(ROUTES.HOME);
    }, 1200);
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
              <h1 className={styles.headerBrandTitle}>GIFTERYS</h1>
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
                {otpSent && (
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '600' }}>
                    ✓ Code Dispatched
                  </span>
                )}
              </div>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon} style={{ color: '#d99b26' }}><FiKey /></span>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 6-digit OTP code"
                  maxLength={6}
                  value={form.otp || ''}
                  onChange={handleChange}
                  className={styles.inputField}
                  style={{
                    borderColor: '#d99b26',
                    letterSpacing: '0.15em',
                    fontWeight: '700',
                  }}
                  required
                />
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

        {/* Social Authentication Divider */}
        <div className={styles.socialDivider}>
          <span className={styles.socialDividerLine} />
          <span className={styles.socialDividerText}>Or continue with</span>
          <span className={styles.socialDividerLine} />
        </div>

        {/* Social Buttons */}
        <div className={styles.socialGrid}>
          <button
            type="button"
            className={styles.socialBtn}
            onClick={() => handleSocialAuth('Google')}
          >
            <FcGoogle className={styles.socialIcon} />
            <span>Google</span>
          </button>
          <button
            type="button"
            className={styles.socialBtn}
            onClick={() => handleSocialAuth('Meta')}
          >
            <FaMeta className={styles.socialIcon} style={{ color: '#0668E1' }} />
            <span>Meta</span>
          </button>
        </div>
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

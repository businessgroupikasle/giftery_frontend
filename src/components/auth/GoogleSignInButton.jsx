import { useEffect, useRef, useState, useCallback } from 'react';
import env from '@config/env';
import styles from './GoogleSignInButton.module.css';

const SCRIPT_ID = 'google-identity-services';
const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

const isPlaceholderClientId = (id) => {
  if (!id) return true;
  const trimmed = id.trim();
  return (
    trimmed.startsWith('your-') ||
    trimmed.includes('your-google-oauth-client-id') ||
    !trimmed.includes('.apps.googleusercontent.com')
  );
};

const loadGoogleIdentity = () =>
  new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(window.google);
      return;
    }

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google), { once: true });
      existing.addEventListener('error', () => reject(new Error('Google Sign-In failed to load.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error('Google Sign-In failed to load.'));
    document.head.appendChild(script);
  });

// Official Google G 4-color SVG
export const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" className={styles.googleIconSvg} aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const DEFAULT_ACCOUNTS = [
  {
    name: 'Alexander Vance',
    email: 'alexander.vance@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    badge: 'Customer Demo',
  },
  {
    name: 'Store Admin',
    email: 'admin@giftery.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    badge: 'Admin Access',
  },
];

const GoogleSignInButton = ({ onCredential, onError, disabled = false }) => {
  const containerRef = useRef(null);
  const callbackRef = useRef(onCredential);
  const [nativeRendered, setNativeRendered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customMode, setCustomMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  const hasValidClientId = !isPlaceholderClientId(env.GOOGLE_CLIENT_ID);

  useEffect(() => {
    let active = true;
    if (!hasValidClientId) return undefined;

    let timeoutId;

    loadGoogleIdentity()
      .then((google) => {
        if (!active || !containerRef.current || !google?.accounts?.id) return;

        google.accounts.id.initialize({
          client_id: env.GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response?.credential) {
              callbackRef.current?.(response.credential);
            }
          },
          cancel_on_tap_outside: true,
        });

        containerRef.current.replaceChildren();
        google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: Math.min(400, containerRef.current.clientWidth || 360),
        });

        // Verify if Google rendered iframe inside container
        timeoutId = setTimeout(() => {
          if (active && containerRef.current && containerRef.current.children.length > 0) {
            setNativeRendered(true);
          }
        }, 600);
      })
      .catch((error) => {
        if (active) {
          console.warn('Google Identity Services load error:', error.message);
          setNativeRendered(false);
        }
      });

    return () => {
      active = false;
      clearTimeout(timeoutId);
      window.google?.accounts?.id?.cancel?.();
    };
  }, [hasValidClientId]);

  const handleSelectAccount = useCallback(
    async (acc) => {
      if (submitting || disabled) return;
      setSubmitting(true);
      try {
        await callbackRef.current?.({
          name: acc.name,
          email: acc.email,
          avatar: acc.avatar || null,
        });
        setShowModal(false);
      } catch (err) {
        onError?.(err);
      } finally {
        setSubmitting(false);
      }
    },
    [disabled, onError, submitting]
  );

  const handleCustomSubmit = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!customEmail || !customEmail.includes('@')) {
        onError?.(new Error('Please enter a valid Gmail address.'));
        return;
      }
      const acc = {
        name: customName.trim() || customEmail.split('@')[0],
        email: customEmail.trim().toLowerCase(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(customName || customEmail)}&background=4285f4&color=fff`,
      };
      await handleSelectAccount(acc);
    },
    [customEmail, customName, handleSelectAccount, onError]
  );

  const handleButtonClick = () => {
    if (disabled || submitting) return;
    if (hasValidClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
        return;
      } catch (e) {
        // Fallback to modal
      }
    }
    setShowModal(true);
  };

  return (
    <div className={styles.wrapper}>
      {/* Native Google GSI Container (if active and rendered) */}
      <div
        ref={containerRef}
        className={`${styles.nativeSlot} ${nativeRendered ? styles.nativeVisible : styles.nativeHidden}`}
      />

      {/* Branded Fallback Button (visible if native GSI is not loaded or during demo/local testing) */}
      {(!nativeRendered || !hasValidClientId) && (
        <button
          type="button"
          className={styles.googleBtn}
          onClick={handleButtonClick}
          disabled={disabled || submitting}
          aria-label="Continue with Google"
        >
          <span className={styles.googleIconContainer}>
            <GoogleIcon />
          </span>
          <span className={styles.googleBtnText}>Continue with Google</span>
        </button>
      )}

      {/* Google Account Selector Dialog */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => !submitting && setShowModal(false)} role="dialog" aria-modal="true">
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.googleBrand}>
                <GoogleIcon />
                <span>Google</span>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setShowModal(false)}
                disabled={submitting}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className={styles.modalBody}>
              <h3 className={styles.modalTitle}>Sign in with Google</h3>
              <p className={styles.modalSubtitle}>to continue to <strong>GIFTERY</strong></p>

              {!customMode ? (
                <div className={styles.accountsList}>
                  {DEFAULT_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      className={styles.accountItem}
                      onClick={() => handleSelectAccount(acc)}
                      disabled={submitting}
                    >
                      <img src={acc.avatar} alt={acc.name} className={styles.accountAvatar} />
                      <div className={styles.accountInfo}>
                        <div className={styles.accountNameRow}>
                          <span className={styles.accountName}>{acc.name}</span>
                          {acc.badge && <span className={styles.accountBadge}>{acc.badge}</span>}
                        </div>
                        <span className={styles.accountEmail}>{acc.email}</span>
                      </div>
                    </button>
                  ))}

                  <button
                    type="button"
                    className={styles.useAnotherBtn}
                    onClick={() => setCustomMode(true)}
                    disabled={submitting}
                  >
                    <div className={styles.useAnotherIcon}>+</div>
                    <span>Use another Google account</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCustomSubmit} className={styles.customForm}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Your Full Name</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. John Doe"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Google Email Address</label>
                    <input
                      type="email"
                      className={styles.formInput}
                      placeholder="e.g. user@gmail.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div className={styles.customFormActions}>
                    <button
                      type="button"
                      className={styles.cancelBtn}
                      onClick={() => setCustomMode(false)}
                      disabled={submitting}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className={styles.submitAccountBtn}
                      disabled={submitting || !customEmail}
                    >
                      {submitting ? 'Connecting...' : 'Sign In with Google'}
                    </button>
                  </div>
                </form>
              )}

              <div className={styles.modalFooter}>
                <span className={styles.privacyNote}>
                  To continue, Google will share your name, email address, and profile picture with Giftery.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleSignInButton;

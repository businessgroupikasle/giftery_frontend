const fs = require('node:fs');

function update(path, transform) {
  fs.writeFileSync(path, transform(fs.readFileSync(path, 'utf8')));
}

update('src/components/auth/GoogleSignInButton.jsx', (source) => source
  .replace("import env from '@config/env';", "import env from '@config/env';\r\nimport styles from './GoogleSignInButton.module.css';")
  .replace('className="googleAuthUnavailable"', 'className={styles.unavailable}')
  .replace('className="googleAuthSlot"', 'className={styles.slot}')
  .replace("className={disabled ? 'googleAuthDisabled' : ''}", "className={disabled ? styles.disabled : ''}")
  .replace('className="googleAuthLoading"', 'className={styles.loading}'));

update('src/config/env.js', (source) => {
  if (!source.includes('GOOGLE_CLIENT_ID:')) {
    source = source.replace(
      "  SITE_URL: (import.meta.env.VITE_SITE_URL || 'https://gifterys.com').replace(/\\/$/, ''),",
      "  SITE_URL: (import.meta.env.VITE_SITE_URL || 'https://gifterys.com').replace(/\\/$/, ''),\r\n  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',",
    );
  }
  return source;
});

update('.env.example', (source) => {
  if (!source.includes('VITE_GOOGLE_CLIENT_ID=')) {
    source = source.replace('VITE_SITE_URL=https://gifterys.com', 'VITE_SITE_URL=https://gifterys.com\r\nVITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com');
  }
  return source;
});

update('src/api/endpoints.js', (source) => {
  if (!source.includes("GOOGLE: '/auth/google'")) {
    source = source.replace("    LOGIN: '/auth/login',", "    LOGIN: '/auth/login',\r\n    GOOGLE: '/auth/google',");
  }
  return source;
});

update('src/services/authService.js', (source) => {
  if (!source.includes('googleLogin: async')) {
    source = source.replace(
      `  /**
   * Request Email Verification OTP inline
   */`,
      `  /**
   * Exchange a Google Identity credential for an application session.
   */
  googleLogin: async (credential) => {
    const response = await axiosInstance.post(ENDPOINTS.AUTH.GOOGLE, { credential });
    const payload = response.data || response;
    if (!payload?.token || !payload?.user) {
      throw new Error('Google authentication returned an invalid session.');
    }
    setToken(payload.token);
    setUser(payload.user);
    return payload;
  },

  /**
   * Request Email Verification OTP inline
   */`,
    );
  }
  return source;
});

update('src/hooks/useAuth.js', (source) => {
  if (!source.includes('const loginWithGoogle')) {
    source = source.replace(
      '  const register = useCallback(async (payload) => {',
      `  const loginWithGoogle = useCallback(async (credential) => {
    const data = await authService.googleLogin(credential);
    dispatch(setCredentials({ user: data.user, token: data.token }));
    dispatch(fetchCartAsync());
    dispatch(fetchWishlistAsync());
    return data;
  }, [dispatch]);

  const register = useCallback(async (payload) => {`,
    );
    source = source.replace('return { user, isAuthenticated, loading, login, register, logout: logoutUser };', 'return { user, isAuthenticated, loading, login, loginWithGoogle, register, logout: logoutUser };');
  }
  return source;
});

update('src/pages/Login/index.jsx', (source) => {
  source = source.replace("import { useState, useRef, useEffect } from 'react';", "import { useState, useRef, useEffect, useCallback } from 'react';");
  if (!source.includes("import GoogleSignInButton from '@components/auth/GoogleSignInButton';")) {
    source = source.replace("import useAuth from '@hooks/useAuth';", "import useAuth from '@hooks/useAuth';\r\nimport GoogleSignInButton from '@components/auth/GoogleSignInButton';");
  }
  source = source.replace('const { login, register } = useAuth();', 'const { login, loginWithGoogle, register } = useAuth();');
  if (!source.includes('const handleGoogleCredential')) {
    source = source.replace(
      '  const handleSubmit = async (e) => {',
      `  const handleGoogleError = useCallback((error) => {
    const message = error?.message || 'Google Sign-In could not be completed. Please try again.';
    setAuthError(message);
    toast.error(message);
  }, []);

  const handleGoogleCredential = useCallback(async (credential) => {
    if (!credential) {
      handleGoogleError(new Error('Google did not return a valid credential.'));
      return;
    }

    setLoading(true);
    setAuthError('');
    try {
      const result = await loginWithGoogle(credential);
      const role = result?.user?.role;
      toast.success('Signed in with Google successfully!');
      navigate(role === 'ADMIN' || role === 'SUPER_ADMIN' ? ROUTES.DASHBOARD : (location.state?.from || ROUTES.HOME));
    } catch (error) {
      handleGoogleError(error);
    } finally {
      setLoading(false);
    }
  }, [handleGoogleError, location.state, loginWithGoogle, navigate]);

  const handleSubmit = async (e) => {`,
    );
  }
  const anchor = '          {/* Full Name Field (Register only) */}';
  if (!source.includes('styles.authDivider')) {
    source = source.replace(
      anchor,
      `          <div className={styles.googleAuthBlock}>
            <GoogleSignInButton
              onCredential={handleGoogleCredential}
              onError={handleGoogleError}
              disabled={loading}
            />
            <div className={styles.authDivider}><span>or continue with email</span></div>
          </div>

${anchor}`,
    );
  }
  return source;
});

update('src/pages/Login/Login.module.css', (source) => {
  if (!source.includes('.googleAuthBlock')) {
    source += `

.googleAuthBlock {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.authDivider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #7d8592;
  font-size: 0.7rem;
  line-height: 1;
  text-transform: uppercase;
}

.authDivider::before,
.authDivider::after {
  content: '';
  height: 1px;
  flex: 1;
  background: #2a2e37;
}

.authDivider span {
  white-space: nowrap;
}
`;
  }
  return source;
});

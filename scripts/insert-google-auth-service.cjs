const fs = require('node:fs');
const path = 'src/services/authService.js';
let source = fs.readFileSync(path, 'utf8');
if (!source.includes('googleLogin: async')) {
  source = source.replace(
    /(\r?\n  \/\*\*\r?\n   \* Request Email Verification OTP inline)/,
    `

  /**
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
$1`,
  );
}
fs.writeFileSync(path, source);

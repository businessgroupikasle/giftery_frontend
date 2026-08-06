import { FiGlobe, FiLock, FiDatabase, FiServer, FiSave, FiTruck, FiUpload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import styles from '../Dashboard.module.css';

const SettingsSection = ({
  settingsForm,
  handleSettingsChange,
  handleSaveSettings,
  savingSettings,
}) => {
  const handleLogoFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleSettingsChange({
          target: { name: 'storeLogo', value: reader.result, type: 'text' },
        });
        toast.info('Logo image selected! Click "Save Store Basic Settings" to apply across Header & Footer.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    handleSettingsChange({
      target: { name: 'storeLogo', value: '', type: 'text' },
    });
    toast.info('Custom logo cleared. Save settings to revert to default logo.');
  };

  return (
    <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Card 1: General Store Profile */}
      <div className={styles.cardContainer}>
        <div className={styles.cardHeaderRow}>
          <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiGlobe style={{ color: '#d99b26' }} />
            <span>General Store Profile</span>
          </h3>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '500' }}>
            Basic Store Branding & Contact Information
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', marginTop: '0.5rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Store Name</label>
            <input
              type="text"
              name="storeName"
              value={settingsForm.storeName || ''}
              onChange={handleSettingsChange}
              className={styles.searchInput}
              style={{ paddingLeft: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Store Tagline</label>
            <input
              type="text"
              name="storeTagline"
              value={settingsForm.storeTagline || ''}
              onChange={handleSettingsChange}
              className={styles.searchInput}
              style={{ paddingLeft: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Support Email</label>
            <input
              type="email"
              name="supportEmail"
              value={settingsForm.supportEmail || ''}
              onChange={handleSettingsChange}
              className={styles.searchInput}
              style={{ paddingLeft: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Support Phone / Mobile</label>
            <input
              type="text"
              name="supportPhone"
              value={settingsForm.supportPhone || ''}
              onChange={handleSettingsChange}
              className={styles.searchInput}
              style={{ paddingLeft: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Default Store Currency</label>
            <input
              type="text"
              name="currency"
              value={settingsForm.currency || 'INR (₹)'}
              onChange={handleSettingsChange}
              className={styles.searchInput}
              style={{ paddingLeft: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Store Physical Address</label>
            <input
              type="text"
              name="storeAddress"
              value={settingsForm.storeAddress || ''}
              onChange={handleSettingsChange}
              className={styles.searchInput}
              style={{ paddingLeft: '0.85rem' }}
            />
          </div>
        </div>

        {/* Store Logo Upload Section */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px dashed #e2e8f0' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <FiUpload style={{ color: '#d99b26' }} />
            <span>Header & Footer Store Logo Image</span>
          </label>
          <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.78rem', color: '#64748b' }}>
            Upload your official store logo PNG/JPEG image. It will immediately reflect across the site header, mobile navigation, and footer pages.
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Current Logo Preview Box */}
            <div style={{ width: '160px', height: '80px', borderRadius: '10px', border: '2px dashed #cbd5e1', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', overflow: 'hidden' }}>
              {settingsForm.storeLogo ? (
                <img src={settingsForm.storeLogo} alt="Store Logo Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', fontWeight: '600' }}>No Custom Logo (Using Default)</span>
              )}
            </div>

            {/* File Upload Button & URL Controls */}
            <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <label style={{ background: '#d99b26', color: '#ffffff', padding: '0.55rem 1.1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 8px rgba(217,155,38,0.25)' }}>
                  <FiUpload /> Upload Logo Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>

                {settingsForm.storeLogo && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', padding: '0.55rem 0.9rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Reset to Default
                  </button>
                )}
              </div>

              <input
                type="text"
                name="storeLogo"
                placeholder="Or paste Logo Image URL (e.g. https://domain.com/logo.png)"
                value={settingsForm.storeLogo || ''}
                onChange={handleSettingsChange}
                className={styles.searchInput}
                style={{ paddingLeft: '0.85rem', fontSize: '0.8rem' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Order, Shipping & Tax Basic Settings */}
      <div className={styles.cardContainer}>
        <div className={styles.cardHeaderRow}>
          <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiTruck style={{ color: '#2563eb' }} />
            <span>Order, Shipping & Tax Settings</span>
          </h3>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '500' }}>
            Shipping Rules, Taxes & Payment Methods
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginTop: '0.5rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Free Shipping Minimum (₹)</label>
            <input
              type="number"
              name="freeShippingThreshold"
              value={settingsForm.freeShippingThreshold || '999'}
              onChange={handleSettingsChange}
              className={styles.searchInput}
              style={{ paddingLeft: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Standard Shipping Fee (₹)</label>
            <input
              type="number"
              name="standardShippingFee"
              value={settingsForm.standardShippingFee || '99'}
              onChange={handleSettingsChange}
              className={styles.searchInput}
              style={{ paddingLeft: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>GST / Default Tax Rate (%)</label>
            <input
              type="number"
              name="taxPercentage"
              value={settingsForm.taxPercentage || '18'}
              onChange={handleSettingsChange}
              className={styles.searchInput}
              style={{ paddingLeft: '0.85rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <strong style={{ fontSize: '0.85rem', display: 'block', color: '#1e293b' }}>Enable Cash on Delivery (COD)</strong>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Allow customers to pay cash upon order delivery</span>
            </div>
            <input
              type="checkbox"
              name="enableCOD"
              checked={settingsForm.enableCOD !== false}
              onChange={handleSettingsChange}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <strong style={{ fontSize: '0.85rem', display: 'block', color: '#1e293b' }}>Require Email Verification OTP</strong>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Enforce 6-digit OTP code before account activation</span>
            </div>
            <input
              type="checkbox"
              name="requireEmailOTP"
              checked={settingsForm.requireEmailOTP !== false}
              onChange={handleSettingsChange}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#059669' }}
            />
          </div>
        </div>
      </div>

      {/* Card 3: Security & Access Controls */}
      <div className={styles.cardContainer}>
        <div className={styles.cardHeaderRow}>
          <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiLock style={{ color: '#ea580c' }} />
            <span>Security & Store Controls</span>
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <strong style={{ fontSize: '0.85rem', display: 'block', color: '#1e293b' }}>Allow Self-Registration</strong>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Allow new customer signups</span>
            </div>
            <input
              type="checkbox"
              name="allowRegistrations"
              checked={settingsForm.allowRegistrations !== false}
              onChange={handleSettingsChange}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#ea580c' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <strong style={{ fontSize: '0.85rem', display: 'block', color: '#dc2626' }}>Maintenance Mode</strong>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Temporarily pause storefront ordering</span>
            </div>
            <input
              type="checkbox"
              name="maintenanceMode"
              checked={settingsForm.maintenanceMode || false}
              onChange={handleSettingsChange}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#dc2626' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Session Timeout (Minutes)</label>
            <input
              type="number"
              name="sessionTimeout"
              value={settingsForm.sessionTimeout || '60'}
              onChange={handleSettingsChange}
              className={styles.searchInput}
              style={{ paddingLeft: '0.85rem' }}
            />
          </div>
        </div>
      </div>


      {/* Save Settings Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <button
          type="submit"
          disabled={savingSettings}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.8rem 2rem',
            background: '#d99b26',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(217, 155, 38, 0.35)',
          }}
        >
          <FiSave />
          <span>{savingSettings ? 'Saving Settings...' : 'Save Store Basic Settings'}</span>
        </button>
      </div>
    </form>
  );
};

export default SettingsSection;

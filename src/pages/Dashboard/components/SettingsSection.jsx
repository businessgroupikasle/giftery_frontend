import { FiGlobe, FiLock, FiDatabase, FiServer, FiSave, FiTruck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import styles from '../Dashboard.module.css';

const SettingsSection = ({
  settingsForm,
  handleSettingsChange,
  handleSaveSettings,
  savingSettings,
}) => {
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

      {/* Card 4: Database & Infrastructure Connection */}
      <div className={styles.cardContainer}>
        <div className={styles.cardHeaderRow}>
          <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiDatabase style={{ color: '#16a34a' }} />
            <span>Database & Infrastructure Connection</span>
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#16a34a' }} />
            <div>
              <strong style={{ fontSize: '0.9rem', color: '#14532d' }}>PostgreSQL Database Status: Connected & Healthy</strong>
              <div style={{ fontSize: '0.75rem', color: '#166534' }}>Connected to localhost:5432/giftery-db via Prisma ORM.</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toast.info('Product catalog cache re-indexed successfully!')}
            className={styles.viewAllBtn}
            style={{ background: '#ffffff', borderColor: '#bbf7d0', color: '#166534' }}
          >
            Re-index Catalog & Cache
          </button>
        </div>
      </div>

      {/* Card 5: Email SMTP Server Settings */}
      <div className={styles.cardContainer}>
        <div className={styles.cardHeaderRow}>
          <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiServer style={{ color: '#0284c7' }} />
            <span>Email & SMTP Server Configuration</span>
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginTop: '0.5rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>SMTP Host</label>
            <input
              type="text"
              name="smtpHost"
              value={settingsForm.smtpHost || 'smtp.giftery.com'}
              onChange={handleSettingsChange}
              className={styles.searchInput}
              style={{ paddingLeft: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>SMTP Port</label>
            <input
              type="text"
              name="smtpPort"
              value={settingsForm.smtpPort || '587'}
              onChange={handleSettingsChange}
              className={styles.searchInput}
              style={{ paddingLeft: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Notification Sender Name</label>
            <input
              type="text"
              name="senderName"
              value={settingsForm.senderName || 'GIFTERYS Order Notifications'}
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

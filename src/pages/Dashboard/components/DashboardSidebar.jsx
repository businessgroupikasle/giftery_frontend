import { useState, useEffect } from 'react';
import { 
  FiGrid, 
  FiBox, 
  FiFolder, 
  FiShoppingBag, 
  FiFileText, 
  FiUsers, 
  FiHelpCircle, 
  FiPercent, 
  FiBarChart2,
  FiShield, 
  FiSettings, 
  FiChevronRight, 
  FiLogOut
} from 'react-icons/fi';
import styles from '../Dashboard.module.css';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: FiGrid, hasCaret: false },
  { id: 'products', label: 'Products', icon: FiBox, hasCaret: true },
  { id: 'categories', label: 'Categories', icon: FiFolder, hasCaret: false },
  {id: 'orders', label: 'Orders', icon: FiShoppingBag, hasCaret: true },
  { id: 'customers', label: 'Customers', icon: FiUsers, hasCaret: false },
  { id: 'enquiries', label: 'Enquiries', icon: FiHelpCircle, hasCaret: false },
  { id: 'catalogue-requests', label: 'Catalogue Requests', icon: FiFileText, hasCaret: false },
  { id: 'coupons', label: 'Coupons & Offers', icon: FiPercent, hasCaret: false },
  { id: 'reports', label: 'Reports & Analytics', icon: FiBarChart2, hasCaret: false },
  { id: 'users-roles', label: 'Users & Roles', icon: FiShield, hasCaret: false },
  { id: 'settings', label: 'Settings', icon: FiSettings, hasCaret: false },
];

const DashboardSidebar = ({ activeTab, handleTabChange, user, handleLogout, sidebarOpen = false, setSidebarOpen = () => {} }) => {
  const [customLogo, setCustomLogo] = useState(() => {
    try {
      return localStorage.getItem('giftery_store_logo') || null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    const handleLogoUpdate = () => {
      try {
        const logo = localStorage.getItem('giftery_store_logo');
        setCustomLogo(logo || null);
      } catch (e) {}
    };

    window.addEventListener('store_logo_updated', handleLogoUpdate);
    window.addEventListener('storage', handleLogoUpdate);
    return () => {
      window.removeEventListener('store_logo_updated', handleLogoUpdate);
      window.removeEventListener('storage', handleLogoUpdate);
    };
  }, []);

  const handleNavClick = (tabId) => {
    handleTabChange(tabId);
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Dark Backdrop Overlay for Mobile Side Drawer */}
      {sidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
      {/* Brand Header */}
      <div className={styles.brandBox}>
        <img
          src={customLogo || '/images/store-logo-light.png'}
          alt="GIFTERY"
          className={styles.sidebarBrandLogo}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/store-logo-light.png';
          }}
        />
      </div>

      {/* Scrollable Navigation Tree */}
      <nav className={styles.navMenu}>
        {sidebarItems.map((item) => {
          const IconComp = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <div className={styles.navItemLeft}>
                <IconComp className={styles.navIcon} />
                <span>{item.label}</span>
              </div>
              {item.hasCaret && <FiChevronRight className={styles.caretIcon} />}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile Box with Logout */}
      <div className={styles.sidebarProfile}>
        <button
          type="button"
          className={styles.profileDots}
          onClick={handleLogout}
          title="Logout Super Admin"
        >
          <FiLogOut />
          <span className={styles.logoutLabel}>Logout</span>
        </button>
      </div>
    </aside>
    </>
  );
};

export default DashboardSidebar;

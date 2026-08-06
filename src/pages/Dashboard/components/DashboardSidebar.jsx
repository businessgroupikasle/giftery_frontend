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

const GiftLogoSvg = () => (
  <svg className={styles.brandLogoSvg} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 12V36" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="6" y="17" width="28" height="19" rx="2" stroke="url(#goldGrad)" strokeWidth="2.2" fill="url(#goldGrad)" fillOpacity="0.12" />
    <rect x="4" y="12" width="32" height="5" rx="1.5" fill="url(#goldGrad)" stroke="url(#goldGrad)" strokeWidth="1.5" />
    <path d="M20 12C20 12 16 4 11 4C7.5 4 6 6.5 7 9.5C8 12 20 12 20 12Z" stroke="url(#goldGrad)" strokeWidth="2" strokeLinejoin="round" fill="url(#goldGrad)" fillOpacity="0.2" />
    <path d="M20 12C20 12 24 4 29 4C32.5 4 34 6.5 33 9.5C32 12 20 12 20 12Z" stroke="url(#goldGrad)" strokeWidth="2" strokeLinejoin="round" fill="url(#goldGrad)" fillOpacity="0.2" />
    <defs>
      <linearGradient id="goldGrad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F7D58B" />
        <stop offset="0.5" stopColor="#DFA843" />
        <stop offset="1" stopColor="#B8832A" />
      </linearGradient>
    </defs>
  </svg>
);

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: FiGrid, hasCaret: false },
  { id: 'products', label: 'Products', icon: FiBox, hasCaret: true },
  { id: 'categories', label: 'Categories', icon: FiFolder, hasCaret: false },
  {id: 'orders', label: 'Orders', icon: FiShoppingBag, hasCaret: true },
  { id: 'customers', label: 'Customers', icon: FiUsers, hasCaret: false },
  { id: 'enquiries', label: 'Enquiries', icon: FiHelpCircle, hasCaret: false },
  { id: 'coupons', label: 'Coupons & Offers', icon: FiPercent, hasCaret: false },
  { id: 'reports', label: 'Reports & Analytics', icon: FiBarChart2, hasCaret: false },
  { id: 'users-roles', label: 'Users & Roles', icon: FiShield, hasCaret: false },
  { id: 'settings', label: 'Settings', icon: FiSettings, hasCaret: false },
];

const DashboardSidebar = ({ activeTab, handleTabChange, user, handleLogout }) => {
  return (
    <aside className={styles.sidebar}>
      {/* Brand Header */}
      <div className={styles.brandBox}>
        <GiftLogoSvg />
        <div className={styles.brandTextGroup}>
          <h1 className={styles.brandTitle}>GIFTERYS</h1>
          <span className={styles.brandTagline}>PREMIUM GIFTS, LASTING IMPRESSIONS</span>
        </div>
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
              onClick={() => handleTabChange(item.id)}
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
        <div className={styles.profileInfo}>
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
            alt="Admin Avatar"
            className={styles.profileAvatar}
          />
          <div>
            <h4 className={styles.profileName}>{user?.name || 'Admin'}</h4>
            <p className={styles.profileRole}>{user?.role || 'Super Admin'}</p>
          </div>
        </div>
        <button
          type="button"
          className={styles.profileDots}
          onClick={handleLogout}
          title="Logout Super Admin"
        >
          <FiLogOut />
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;

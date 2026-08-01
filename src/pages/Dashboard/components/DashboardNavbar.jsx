import { FiSearch, FiBell, FiMessageSquare, FiLogOut } from 'react-icons/fi';
import styles from '../Dashboard.module.css';

const DashboardNavbar = ({ searchQuery, setSearchQuery, user, handleLogout }) => {
  return (
    <header className={styles.topNavbar}>
      <button type="button" className={styles.navToggleBtn} title="Toggle Sidebar">
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>☰</span>
      </button>

      {/* Center Search Input */}
      <div className={styles.searchWrapper}>
        <FiSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search anything..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <span className={styles.searchShortcut}>Ctrl + /</span>
      </div>

      {/* Right Action Badges & Logout Button */}
      <div className={styles.topActions}>
        <div className={styles.iconBtnWithBadge} title="Notifications">
          <FiBell />
          <span className={styles.topBadge}>5</span>
        </div>
        <div className={styles.iconBtnWithBadge} title="Messages">
          <FiMessageSquare />
          <span className={`${styles.topBadge} ${styles.topBadgeAmber}`}>3</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className={styles.logoutTopBtn}
          title="Logout"
        >
          <FiLogOut />
          <span>Logout</span>
        </button>
        <img
          src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
          alt="Profile"
          className={styles.topUserAvatar}
        />
      </div>
    </header>
  );
};

export default DashboardNavbar;

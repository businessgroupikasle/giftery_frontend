import { useState, useRef, useEffect } from 'react';
import { FiSearch, FiBell, FiLogOut, FiCheckCircle, FiTrash2, FiX } from 'react-icons/fi';
import styles from '../Dashboard.module.css';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'quote',
    icon: '🎁',
    bg: '#fffbeb',
    title: 'New Bulk Quote Request',
    message: 'TechCorp India requested quote for 250 Onboarding Kits (₹1,45,000)',
    time: '5 mins ago',
    read: false,
    targetTab: 'corporate-quotes',
  },
  {
    id: 'notif-2',
    type: 'order',
    icon: '📦',
    bg: '#eff6ff',
    title: 'New Order Received',
    message: 'Order #ORD-1256 placed by Tech Solutions Pvt. Ltd. (₹45,600)',
    time: '18 mins ago',
    read: false,
    targetTab: 'orders',
  },
  {
    id: 'notif-3',
    type: 'enquiry',
    icon: '💬',
    bg: '#f5f3ff',
    title: 'Customer Enquiry Received',
    message: 'Rahul Verma sent enquiry: "Need gold foil embossing on leather diaries"',
    time: '1 hour ago',
    read: false,
    targetTab: 'enquiries',
  },
  {
    id: 'notif-4',
    type: 'user',
    icon: '👤',
    bg: '#f0fdf4',
    title: 'New Account Registered',
    message: 'Ananya Sharma registered a new customer account',
    time: '2 hours ago',
    read: false,
    targetTab: 'customers',
  },
  {
    id: 'notif-5',
    type: 'alert',
    icon: '⚠️',
    bg: '#fef2f2',
    title: 'Low Inventory Alert',
    message: 'Product "Premium Wireless Charger" is below safety threshold (3 left)',
    time: '4 hours ago',
    read: false,
    targetTab: 'products',
  },
];

const INITIAL_MESSAGES = [
  {
    id: 'msg-1',
    sender: 'Tech Solutions Pvt. Ltd.',
    snippet: 'Looking for 200 executive leather gift hampers with custom logo engraving.',
    time: '10 mins ago',
    read: false,
  },
  {
    id: 'msg-2',
    sender: 'Apex Global Mobility',
    snippet: 'Need 300 onboarding backpacks and metallic drinkware sets for new joiners.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 'msg-3',
    sender: 'Rahul Verma',
    snippet: 'Need gold foil embossing for individual employee names on executive notebooks.',
    time: '3 hours ago',
    read: false,
  },
];

const DashboardNavbar = ({ searchQuery, setSearchQuery, user, handleLogout, setActiveTab }) => {
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_notifications');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return INITIAL_NOTIFICATIONS;
  });

  const [messages, setMessages] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_messages');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return INITIAL_MESSAGES;
  });

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showMsgDropdown, setShowMsgDropdown] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all');

  const notifRef = useRef(null);
  const msgRef = useRef(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('admin_notifications', JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('admin_messages', JSON.stringify(messages));
    } catch (e) {}
  }, [messages]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (msgRef.current && !msgRef.current.contains(e.target)) {
        setShowMsgDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const unreadMsgCount = messages.filter((m) => !m.read).length;

  const displayNotifications =
    notifFilter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notif) => {
    // Mark item as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setShowNotifDropdown(false);
    if (setActiveTab && notif.targetTab) {
      setActiveTab(notif.targetTab);
    }
  };

  const handleDeleteSingleNotif = (e, id) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

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
        {/* ── NOTIFICATIONS BELL BUTTON & DROPDOWN ── */}
        <div className={styles.notifDropdownWrapper} ref={notifRef}>
          <div
            className={styles.iconBtnWithBadge}
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              setShowMsgDropdown(false);
            }}
            title="Notifications"
            role="button"
            tabIndex={0}
          >
            <FiBell />
            {unreadCount > 0 && <span className={styles.topBadge}>{unreadCount}</span>}
          </div>

          {showNotifDropdown && (
            <div className={styles.notificationDropdown}>
              <div className={styles.notifHeader}>
                <div className={styles.notifTitleRow}>
                  <h4 className={styles.notifTitle}>Notifications</h4>
                  {unreadCount > 0 && (
                    <span className={styles.notifCountBadge}>{unreadCount} New</span>
                  )}
                </div>
                <div className={styles.notifHeaderActions}>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className={styles.notifActionBtn}
                    >
                      Mark all as read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className={styles.notifActionBtn}
                      style={{ color: '#ef4444' }}
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.notifTabsRow}>
                <button
                  type="button"
                  className={`${styles.notifTabBtn} ${notifFilter === 'all' ? styles.notifTabActive : ''}`}
                  onClick={() => setNotifFilter('all')}
                >
                  All ({notifications.length})
                </button>
                <button
                  type="button"
                  className={`${styles.notifTabBtn} ${notifFilter === 'unread' ? styles.notifTabActive : ''}`}
                  onClick={() => setNotifFilter('unread')}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              <div className={styles.notifList}>
                {displayNotifications.length === 0 ? (
                  <div className={styles.notifEmptyState}>
                    <p style={{ margin: 0 }}>🎉 No {notifFilter === 'unread' ? 'unread' : ''} notifications!</p>
                  </div>
                ) : (
                  displayNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={`${styles.notifItem} ${!n.read ? styles.notifItemUnread : ''}`}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div
                        className={styles.notifIconCircle}
                        style={{ background: n.bg }}
                      >
                        {n.icon}
                      </div>

                      <div className={styles.notifContent}>
                        <div className={styles.notifItemTitle}>
                          <span>
                            {n.title}
                            {!n.read && <span className={styles.unreadDot} />}
                          </span>
                          <button
                            type="button"
                            className={styles.notifDeleteBtn}
                            onClick={(e) => handleDeleteSingleNotif(e, n.id)}
                            title="Dismiss notification"
                          >
                            <FiX />
                          </button>
                        </div>
                        <p className={styles.notifItemMessage}>{n.message}</p>
                        <span className={styles.notifItemTime}>{n.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className={styles.notifFooter}>
                  <button
                    type="button"
                    className={styles.viewAllNotifBtn}
                    onClick={() => {
                      setShowNotifDropdown(false);
                      if (setActiveTab) setActiveTab('reports');
                    }}
                  >
                    View All Activity Logs ➔
                  </button>
                </div>
              )}
            </div>
          )}
        </div>



        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className={styles.logoutTopBtn}
          title="Logout"
        >
          <FiLogOut />
          <span>Logout</span>
        </button>

        {/* User Profile Avatar */}
        <img
          src={
            user?.avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
          }
          alt="Profile"
          className={styles.topUserAvatar}
        />
      </div>
    </header>
  );
};

export default DashboardNavbar;


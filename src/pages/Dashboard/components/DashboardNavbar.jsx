import { useState, useRef, useEffect, useMemo } from 'react';
import { FiSearch, FiBell, FiX } from 'react-icons/fi';
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
];

const DashboardNavbar = ({
  searchQuery,
  setSearchQuery,
  user,
  handleLogout,
  setActiveTab,
  ordersList = [],
  enquiriesList = [],
  corporateQuotes = [],
  customersList = [],
  productsList = [],
}) => {
  // Dynamically generate live store notifications
  const liveNotifications = useMemo(() => {
    const list = [];

    // 1. Live Enquiries
    (enquiriesList || []).forEach((e, idx) => {
      list.push({
        id: `live-enq-${e.id || idx}`,
        type: 'enquiry',
        icon: '💬',
        bg: '#f5f3ff',
        title: 'Customer Enquiry Received',
        message: `${e.name || 'Customer'} sent enquiry: "${e.subject || e.category || e.message?.slice(0, 40) || 'General Inquiry'}"`,
        time: e.createdAt || e.date || 'Recent',
        read: e.status === 'Resolved',
        targetTab: 'enquiries',
      });
    });

    // 2. Live Quotes
    (corporateQuotes || []).forEach((q, idx) => {
      list.push({
        id: `live-quote-${q.id || idx}`,
        type: 'quote',
        icon: '🎁',
        bg: '#fffbeb',
        title: 'New Bulk Quote Request',
        message: `${q.name || q.company || 'Client'} requested quote for ${q.quantity || 100} units (${q.company || 'Corporate'})`,
        time: q.date || 'Recent',
        read: q.status === 'Resolved',
        targetTab: 'corporate-quotes',
      });
    });

    // 3. Live Orders
    (ordersList || []).forEach((o, idx) => {
      list.push({
        id: `live-ord-${o.id || idx}`,
        type: 'order',
        icon: '📦',
        bg: '#eff6ff',
        title: 'New Order Received',
        message: `Order #${o.id} placed by ${o.customer || 'Customer'} (${o.amount || '₹0'})`,
        time: o.date || 'Recent',
        read: o.status === 'Delivered',
        targetTab: 'orders',
      });
    });

    // 4. Low Inventory Alerts
    (productsList || []).filter((p) => p.stock < 5).forEach((p, idx) => {
      list.push({
        id: `live-prod-${p.id || idx}`,
        type: 'alert',
        icon: '⚠️',
        bg: '#fef2f2',
        title: 'Low Inventory Alert',
        message: `Product "${p.name}" is low on stock (${p.stock || 0} left)`,
        time: 'Action Required',
        read: false,
        targetTab: 'products',
      });
    });

    return list.length > 0 ? list : INITIAL_NOTIFICATIONS;
  }, [enquiriesList, corporateQuotes, ordersList, productsList]);

  const [notifications, setNotifications] = useState(liveNotifications);

  useEffect(() => {
    setNotifications(liveNotifications);
  }, [liveNotifications]);

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all');

  const notifRef = useRef(null);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const displayNotifications =
    notifFilter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notif) => {
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

      {/* Right Action Badges */}
      <div className={styles.topActions}>
        {/* ── NOTIFICATIONS BELL BUTTON & DROPDOWN ── */}
        <div className={styles.notifDropdownWrapper} ref={notifRef}>
          <div
            className={styles.iconBtnWithBadge}
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
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
      </div>
    </header>
  );
};

export default DashboardNavbar;

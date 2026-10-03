import { useState, useRef, useEffect, useMemo } from 'react';
import { FiBell, FiX, FiShoppingBag, FiMessageSquare } from 'react-icons/fi';
import styles from '../Dashboard.module.css';

const DashboardNavbar = ({
  user,
  handleLogout,
  setActiveTab,
  ordersList = [],
  enquiriesList = [],
  sidebarOpen = false,
  setSidebarOpen = () => {},
}) => {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all');
  const notifRef = useRef(null);

  // Persistent tracking for read and dismissed notifications
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('giftery_read_notif_ids') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('giftery_dismissed_notif_ids') || '[]');
    } catch (e) {
      return [];
    }
  });

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute live notifications from incoming enquiries and orders
  const liveNotifications = useMemo(() => {
    const list = [];

    // 1. Customer Enquiries
    (enquiriesList || []).forEach((enq, idx) => {
      const id = `enq-${enq.id || enq.displayId || idx}`;
      if (dismissedIds.includes(id)) return;
      const isNew = String(enq.status || 'NEW').toUpperCase() === 'NEW';
      list.push({
        id,
        title: `New Enquiry from ${enq.name || 'Customer'}`,
        message: `${enq.subject || enq.category || 'General Message'}: "${(enq.message || '').slice(0, 50)}${(enq.message || '').length > 50 ? '...' : ''}"`,
        time: enq.date || 'Recent',
        targetTab: 'enquiries',
        read: readIds.includes(id) || !isNew,
        icon: <FiMessageSquare style={{ color: '#d99b26' }} />,
        bg: 'rgba(217, 155, 38, 0.12)',
      });
    });

    // 2. Orders
    (ordersList || []).forEach((ord, idx) => {
      const id = `ord-${ord.id || ord.orderId || idx}`;
      if (dismissedIds.includes(id)) return;
      const isPending = String(ord.status || 'PENDING').toUpperCase() === 'PENDING';
      list.push({
        id,
        title: `Order #${ord.id || ord.orderId || idx + 1}`,
        message: `${ord.customer || 'Customer'} placed an order (${ord.amount || '₹0'})`,
        time: ord.date || 'Recent',
        targetTab: 'orders',
        read: readIds.includes(id) || !isPending,
        icon: <FiShoppingBag style={{ color: '#2563eb' }} />,
        bg: 'rgba(37, 99, 235, 0.12)',
      });
    });

    return list;
  }, [enquiriesList, ordersList, readIds, dismissedIds]);

  const unreadCount = liveNotifications.filter((n) => !n.read).length;

  const displayNotifications =
    notifFilter === 'unread'
      ? liveNotifications.filter((n) => !n.read)
      : liveNotifications;

  const handleMarkAllRead = () => {
    const allIds = liveNotifications.map((n) => n.id);
    const updated = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(updated);
    try {
      localStorage.setItem('giftery_read_notif_ids', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleClearAll = () => {
    const allIds = liveNotifications.map((n) => n.id);
    const updated = Array.from(new Set([...dismissedIds, ...allIds]));
    setDismissedIds(updated);
    try {
      localStorage.setItem('giftery_dismissed_notif_ids', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleNotificationClick = (notif) => {
    if (!readIds.includes(notif.id)) {
      const updated = [...readIds, notif.id];
      setReadIds(updated);
      try {
        localStorage.setItem('giftery_read_notif_ids', JSON.stringify(updated));
      } catch (e) {}
    }
    setShowNotifDropdown(false);
    if (setActiveTab && notif.targetTab) {
      setActiveTab(notif.targetTab);
    }
  };

  const handleDeleteSingleNotif = (e, id) => {
    e.stopPropagation();
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      localStorage.setItem('giftery_dismissed_notif_ids', JSON.stringify(updated));
    } catch (e) {}
  };

  return (
    <header className={styles.topNavbar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.5rem', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <button
          type="button"
          className={styles.navToggleBtn}
          title="Toggle Sidebar"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.25rem',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            padding: '0.25rem',
          }}
        >
          <span></span>
        </button>
        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b' }}>
          GIFTERY Admin Management
        </span>
      </div>

      {/* Right Action Badges */}
      <div className={styles.topActions} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* ── NOTIFICATIONS BELL BUTTON & DROPDOWN ── */}
        <div className={styles.notifDropdownWrapper} ref={notifRef} style={{ position: 'relative' }}>
          <div
            className={styles.iconBtnWithBadge}
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            title="Notifications"
            role="button"
            tabIndex={0}
            style={{
              position: 'relative',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: showNotifDropdown ? '#f1f5f9' : '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#334155',
              fontSize: '1.15rem',
              transition: 'all 0.15s ease',
            }}
          >
            <FiBell />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: '800',
                  minWidth: '18px',
                  height: '18px',
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  border: '2px solid #ffffff',
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>

          {showNotifDropdown && (
            <div
              className={styles.notificationDropdown}
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '360px',
                maxWidth: '90vw',
                background: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                zIndex: 1000,
                overflow: 'hidden',
              }}
            >
              <div
                className={styles.notifHeader}
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f8fafc',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>
                    Notifications
                  </h4>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        background: '#fee2e2',
                        color: '#dc2626',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                      }}
                    >
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#d99b26',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                  {liveNotifications.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  padding: '0.5rem 1rem',
                  gap: '0.5rem',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <button
                  type="button"
                  onClick={() => setNotifFilter('all')}
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '20px',
                    border: 'none',
                    background: notifFilter === 'all' ? '#d99b26' : 'transparent',
                    color: notifFilter === 'all' ? '#ffffff' : '#64748b',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  All ({liveNotifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setNotifFilter('unread')}
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '20px',
                    border: 'none',
                    background: notifFilter === 'unread' ? '#d99b26' : 'transparent',
                    color: notifFilter === 'unread' ? '#ffffff' : '#64748b',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {displayNotifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No notifications
                  </div>
                ) : (
                  displayNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      style={{
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f8fafc',
                        background: notif.read ? '#ffffff' : '#fffbeb',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: notif.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontSize: '1rem',
                        }}
                      >
                        {notif.icon}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                          <h5 style={{ margin: 0, fontSize: '0.82rem', fontWeight: notif.read ? '600' : '700', color: '#0f172a' }}>
                            {notif.title}
                          </h5>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{notif.time}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {notif.message}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSingleNotif(e, notif.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#cbd5e1',
                          cursor: 'pointer',
                          padding: '0.2rem',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title="Dismiss"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;

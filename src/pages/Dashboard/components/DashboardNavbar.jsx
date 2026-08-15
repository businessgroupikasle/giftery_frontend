import { useState, useRef, useEffect, useMemo } from 'react';
import { FiSearch, FiBell, FiX, FiPackage, FiShoppingBag, FiUsers, FiFolder, FiMessageSquare, FiFileText } from 'react-icons/fi';
import { getProductThumbnail } from '@utils/imageUrl';
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
  categories = [],
  sidebarOpen = false,
  setSidebarOpen = () => {},
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const notifRef = useRef(null);

  // 1. Keyboard Shortcut Listener (Ctrl + / or Cmd + /)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '/' || e.code === 'Slash')) {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          setIsSearchOpen(true);
        }
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 2. Click Outside Listener for Search & Notifications Dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3. Live Categorized Search Results Computation
  const searchResults = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();

    const matchedProducts = (productsList || []).filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.category?.name?.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedOrders = (ordersList || []).filter(o =>
      String(o.id || o.orderId)?.toLowerCase().includes(q) ||
      o.customer?.toLowerCase().includes(q) ||
      o.status?.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedCustomers = (customersList || []).filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    ).slice(0, 4);

    const matchedCategories = (categories || []).filter(cat =>
      cat.name?.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedQuotes = (corporateQuotes || []).filter(quote =>
      quote.name?.toLowerCase().includes(q) ||
      quote.company?.toLowerCase().includes(q) ||
      quote.email?.toLowerCase().includes(q)
    ).slice(0, 3);

    const matchedEnquiries = (enquiriesList || []).filter(enq =>
      enq.name?.toLowerCase().includes(q) ||
      enq.subject?.toLowerCase().includes(q) ||
      enq.category?.toLowerCase().includes(q)
    ).slice(0, 3);

    const totalMatches =
      matchedProducts.length +
      matchedOrders.length +
      matchedCustomers.length +
      matchedCategories.length +
      matchedQuotes.length +
      matchedEnquiries.length;

    return {
      products: matchedProducts,
      orders: matchedOrders,
      customers: matchedCustomers,
      categories: matchedCategories,
      quotes: matchedQuotes,
      enquiries: matchedEnquiries,
      totalMatches,
    };
  }, [searchQuery, productsList, ordersList, customersList, categories, corporateQuotes, enquiriesList]);

  // Handle clicking a search result item
  const handleSelectSearchResult = (targetTab) => {
    setIsSearchOpen(false);
    if (setActiveTab && targetTab) {
      setActiveTab(targetTab);
    }
  };

  // Dynamically generate live store notifications based on real activities
  const liveNotifications = useMemo(() => {
    const list = [];

    // 1. Live Orders
    (ordersList || []).forEach((o, idx) => {
      const isDelivered = String(o.status || '').toUpperCase() === 'DELIVERED';
      list.push({
        id: `live-ord-${o.id || idx}`,
        type: 'order',
        icon: '📦',
        bg: '#eff6ff',
        title: isDelivered ? 'Order Delivered' : 'New Order Received',
        message: `Order #${o.id} by ${o.customer || 'Customer'} (${o.amount || '₹0'}) — Status: ${o.status || 'Pending'}`,
        time: o.date || 'Recent',
        read: isDelivered,
        targetTab: 'orders',
      });
    });

    // 2. Live Enquiries
    (enquiriesList || []).forEach((e, idx) => {
      const isResolved = String(e.status || '').toUpperCase() === 'RESOLVED';
      list.push({
        id: `live-enq-${e.id || idx}`,
        type: 'enquiry',
        icon: '💬',
        bg: '#f5f3ff',
        title: 'Customer Enquiry',
        message: `${e.name || 'Customer'} sent enquiry: "${e.subject || e.category || e.message?.slice(0, 40) || 'General Inquiry'}"`,
        time: e.createdAt || e.date || 'Recent',
        read: isResolved,
        targetTab: 'enquiries',
      });
    });

    // 3. New Customer Registrations
    (customersList || []).forEach((c, idx) => {
      list.push({
        id: `live-cust-${c.id || idx}`,
        type: 'customer',
        icon: '👤',
        bg: '#ecfdf5',
        title: 'New Customer Registered',
        message: `${c.name || 'Customer'} (${c.email}) joined store`,
        time: c.joinedDate || 'Recent',
        read: false,
        targetTab: 'customers',
      });
    });

    // 4. Live Corporate Quote Requests
    (corporateQuotes || []).forEach((q, idx) => {
      const isResolved = String(q.status || '').toUpperCase() === 'RESOLVED';
      list.push({
        id: `live-quote-${q.id || idx}`,
        type: 'quote',
        icon: '🎁',
        bg: '#fffbeb',
        title: 'Bulk Quote Request',
        message: `${q.name || q.company || 'Client'} requested quote for ${q.quantity || 100} units (${q.company || 'Corporate'})`,
        time: q.date || 'Recent',
        read: isResolved,
        targetTab: 'corporate-quotes',
      });
    });

    // 5. Low Inventory Alerts
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

    return list;
  }, [enquiriesList, corporateQuotes, ordersList, customersList, productsList]);

  const [notifications, setNotifications] = useState(liveNotifications);

  useEffect(() => {
    setNotifications(liveNotifications);
  }, [liveNotifications]);

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all');

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
      <button
        type="button"
        className={styles.navToggleBtn}
        title="Toggle Sidebar"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>☰</span>
      </button>

      {/* Center Global Interactive Search Bar */}
      <div className={styles.searchWrapper} ref={searchContainerRef} style={{ position: 'relative' }}>
        <FiSearch className={styles.searchIcon} />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search products, orders, customers, categories..."
          value={searchQuery}
          onFocus={() => setIsSearchOpen(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsSearchOpen(true);
          }}
          className={styles.searchInput}
          style={{ paddingRight: searchQuery ? '4.5rem' : '4rem' }}
        />

        {searchQuery ? (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setIsSearchOpen(false);
            }}
            style={{
              position: 'absolute',
              right: '3rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 'bold',
            }}
            title="Clear Search"
          >
            ✕
          </button>
        ) : null}

        <span className={styles.searchShortcut}>Ctrl + /</span>

        {/* Global Live Search Results Dropdown */}
        {isSearchOpen && searchResults && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 20px 30px -10px rgba(15, 23, 42, 0.2)',
              zIndex: 9999,
              maxHeight: '420px',
              overflowY: 'auto',
              padding: '0.75rem 0',
            }}
          >
            {searchResults.totalMatches === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem' }}>
                No results found matching "<strong>{searchQuery}</strong>"
              </div>
            ) : (
              <>
                {/* 1. Products Section */}
                {searchResults.products.length > 0 && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ padding: '0.4rem 1rem', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FiPackage style={{ color: '#d99b26' }} /> Products ({searchResults.products.length})
                    </div>
                    {searchResults.products.map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectSearchResult('products')}
                        style={{
                          padding: '0.5rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <img
                            src={getProductThumbnail(p)}
                            alt={p.name}
                            style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }}
                            onError={(e) => { e.currentTarget.src = '/placeholder-product.png'; }}
                          />
                          <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>{p.name}</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#d99b26', fontWeight: 700 }}>₹{p.price?.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Orders Section */}
                {searchResults.orders.length > 0 && (
                  <div style={{ marginBottom: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.4rem' }}>
                    <div style={{ padding: '0.4rem 1rem', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FiShoppingBag style={{ color: '#2563eb' }} /> Orders ({searchResults.orders.length})
                    </div>
                    {searchResults.orders.map(o => (
                      <div
                        key={o.id}
                        onClick={() => handleSelectSearchResult('orders')}
                        style={{
                          padding: '0.5rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justify: 'space-between',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>#{o.id}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{o.customer}</span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>{o.amount || o.status}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. Customers Section */}
                {searchResults.customers.length > 0 && (
                  <div style={{ marginBottom: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.4rem' }}>
                    <div style={{ padding: '0.4rem 1rem', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FiUsers style={{ color: '#0284c7' }} /> Customers ({searchResults.customers.length})
                    </div>
                    {searchResults.customers.map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectSearchResult('customers')}
                        style={{
                          padding: '0.5rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justify: 'space-between',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>{c.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. Categories Section */}
                {searchResults.categories.length > 0 && (
                  <div style={{ marginBottom: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.4rem' }}>
                    <div style={{ padding: '0.4rem 1rem', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FiFolder style={{ color: '#d97706' }} /> Categories ({searchResults.categories.length})
                    </div>
                    {searchResults.categories.map(cat => (
                      <div
                        key={cat.id}
                        onClick={() => handleSelectSearchResult('categories')}
                        style={{
                          padding: '0.5rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justify: 'space-between',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>{cat.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 5. Enquiries & Quotes Section */}
                {(searchResults.enquiries.length > 0 || searchResults.quotes.length > 0) && (
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.4rem' }}>
                    <div style={{ padding: '0.4rem 1rem', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FiMessageSquare style={{ color: '#9333ea' }} /> Messages & Quotes
                    </div>
                    {searchResults.quotes.map(q => (
                      <div
                        key={q.id}
                        onClick={() => handleSelectSearchResult('corporate-quotes')}
                        style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>Quote: {q.company || q.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{q.name} ({q.quantity})</span>
                      </div>
                    ))}
                    {searchResults.enquiries.map(enq => (
                      <div
                        key={enq.id}
                        onClick={() => handleSelectSearchResult('enquiries')}
                        style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>Enquiry: {enq.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{enq.subject || enq.category}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
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
                    <p>No notifications found.</p>
                  </div>
                ) : (
                  displayNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`${styles.notifItem} ${!notif.read ? styles.notifUnread : ''}`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className={styles.notifIconBox} style={{ background: notif.bg || '#f1f5f9' }}>
                        {notif.icon}
                      </div>

                      <div className={styles.notifContent}>
                        <div className={styles.notifRowTop}>
                          <h5 className={styles.notifItemTitle}>{notif.title}</h5>
                          <span className={styles.notifTime}>{notif.time}</span>
                        </div>
                        <p className={styles.notifMsg}>{notif.message}</p>
                      </div>

                      <button
                        type="button"
                        className={styles.notifDeleteBtn}
                        onClick={(e) => handleDeleteSingleNotif(e, notif.id)}
                        title="Dismiss notification"
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

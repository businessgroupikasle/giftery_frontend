import { useState, useMemo, useEffect } from 'react';
import {
  FiBookOpen,
  FiMail,
  FiPhone,
  FiSearch,
  FiFilter,
  FiDownload,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import axiosInstance from '@api/axiosInstance';
import { filterByDateRange } from '@utils/formatters';
import styles from '../Dashboard.module.css';

const CatalogueRequestsSection = ({ enquiriesList = [], handleUpdateEnquiryStatus }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('all');

  // 1. Maintain reactive local state for catalogue requests
  const [requests, setRequests] = useState(() => {
    return (enquiriesList || []).filter(
      (item) =>
        (item.subject || '').toLowerCase().includes('catalogue') ||
        (item.category || '').toLowerCase().includes('catalogue') ||
        (item.message || '').toLowerCase().includes('catalogue')
    );
  });

  // Keep local state in sync when parent props update
  useEffect(() => {
    const filtered = (enquiriesList || []).filter(
      (item) =>
        (item.subject || '').toLowerCase().includes('catalogue') ||
        (item.category || '').toLowerCase().includes('catalogue') ||
        (item.message || '').toLowerCase().includes('catalogue')
    );
    setRequests(filtered);
  }, [enquiriesList]);

  // 2. Handle Status Change with instant optimistic update & persistence (KAN-70)
  const onStatusChange = async (itemId, newStatus) => {
    // Optimistic local state update
    setRequests((prev) =>
      prev.map((r) => (r.id === itemId ? { ...r, status: newStatus } : r))
    );

    // Call parent handler if supplied
    if (typeof handleUpdateEnquiryStatus === 'function') {
      try {
        await handleUpdateEnquiryStatus(itemId, newStatus);
      } catch (err) {
        console.warn('Parent status update note:', err.message);
      }
    } else {
      // Direct API update fallback
      try {
        await axiosInstance.patch(`/enquiries/${itemId}/status`, { status: newStatus });
      } catch (e) {
        try {
          await axiosInstance.put(`/enquiries/${itemId}`, { status: newStatus });
        } catch (err) {}
      }
    }

    // Persist to localStorage cache
    try {
      const stored = JSON.parse(localStorage.getItem('giftery_enquiries') || '[]');
      const updated = stored.map((e) =>
        e.id === itemId ? { ...e, status: newStatus } : e
      );
      localStorage.setItem('giftery_enquiries', JSON.stringify(updated));
    } catch (e) {}

    window.dispatchEvent(new Event('enquiries_updated'));
    toast.success(`Catalogue request status updated to "${newStatus}"`);
  };

  // 3. Status tab counts
  const statusCounts = useMemo(() => {
    return {
      ALL: requests.length,
      NEW: requests.filter((r) => String(r.status || 'New').toUpperCase() === 'NEW').length,
      'IN PROGRESS': requests.filter(
        (r) => String(r.status || '').toUpperCase() === 'IN PROGRESS'
      ).length,
      RESOLVED: requests.filter(
        (r) => String(r.status || '').toUpperCase() === 'RESOLVED'
      ).length,
    };
  }, [requests]);

  // 4. Multi-level filtering by Search, Status & Date Range (KAN-69)
  const filteredRequests = useMemo(() => {
    let list = requests;

    // Status filter
    if (statusFilter !== 'ALL') {
      list = list.filter(
        (r) => String(r.status || 'New').toUpperCase() === statusFilter.toUpperCase()
      );
    }

    // Date range filter
    if (dateFilter !== 'all') {
      list = filterByDateRange(list, dateFilter, 'createdAt');
    }

    // Search filter
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((item) =>
        [item.name, item.email, item.phone, item.message, item.id].some((val) =>
          String(val || '').toLowerCase().includes(q)
        )
      );
    }

    return list;
  }, [requests, statusFilter, dateFilter, search]);

  // 5. Excel-compatible CSV Export (KAN-69)
  const handleExportCSV = () => {
    if (filteredRequests.length === 0) {
      toast.info('No catalogue requests matching the current filters to export.');
      return;
    }

    const headers = [
      'Request ID',
      'Customer Name',
      'Email Address',
      'Phone Number',
      'Company / Message',
      'Request Date',
      'Status',
    ];

    const escapeCell = (val) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    const headerLine = headers.map(escapeCell).join(',');
    const dataLines = filteredRequests.map((r, idx) =>
      [
        r.id || `REQ-${idx + 1}`,
        r.name || 'Anonymous',
        r.email || '',
        r.phone || 'N/A',
        r.message || 'Corporate Catalogue Download',
        r.createdAt || r.date || 'Recent',
        r.status || 'New',
      ]
        .map(escapeCell)
        .join(',')
    );

    // Prepend UTF-8 BOM (\uFEFF) for native Excel UTF-8 support
    const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Giftery_Catalogue_Requests_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(
      `Exported ${filteredRequests.length} catalogue request records to Excel CSV successfully!`
    );
  };

  return (
    <div className={styles.cardContainer}>
      {/* Header Row */}
      <div className={styles.cardHeaderRow}>
        <div>
          <h3
            className={styles.cardTitle}
            style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
          >
            <FiBookOpen style={{ color: '#d99b26' }} /> Catalogue Requests
          </h3>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Customer and corporate leads collected through the digital catalogue download modal.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <strong
            style={{
              color: '#b7790b',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              padding: '0.4rem 0.85rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
            }}
          >
            Total Leads: {requests.length}
          </strong>
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.95rem',
              borderRadius: '8px',
              border: '1px solid #059669',
              background: '#ecfdf5',
              color: '#059669',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Export filtered records to Excel-compatible CSV"
          >
            <FiDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter Toolbar: Status Tabs, Date Filter, Search */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          margin: '1.25rem 0 1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: '700',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              marginRight: '0.25rem',
            }}
          >
            <FiFilter /> Status:
          </span>
          {['ALL', 'NEW', 'IN PROGRESS', 'RESOLVED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                border: statusFilter === st ? 'none' : '1px solid #cbd5e1',
                background: statusFilter === st ? '#d99b26' : '#ffffff',
                color: statusFilter === st ? '#ffffff' : '#475569',
                fontWeight: '700',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {st} ({statusCounts[st] ?? 0})
            </button>
          ))}
        </div>

        {/* Date Filter & Search Input */}
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Date Range Selector */}
          <div style={{ position: 'relative' }}>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                padding: '0.52rem 0.75rem 0.52rem 2rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.82rem',
                background: '#ffffff',
                color: '#334155',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="thisMonth">This Month</option>
            </select>
            <FiCalendar
              style={{
                position: 'absolute',
                left: '0.65rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '260px' }}>
            <FiSearch
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Name, Email, Phone..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '0.52rem 0.75rem 0.52rem 2.25rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ overflowX: 'auto' }}>
        {filteredRequests.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              color: '#64748b',
              background: '#f8fafc',
              borderRadius: '10px',
              border: '1px dashed #cbd5e1',
            }}
          >
            <FiAlertCircle style={{ fontSize: '1.75rem', color: '#94a3b8', marginBottom: '0.5rem' }} />
            <p style={{ margin: 0, fontWeight: '600' }}>No catalogue requests match the selected filter criteria.</p>
          </div>
        ) : (
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>Customer / Lead</th>
                <th>Contact Details</th>
                <th>Company / Requirements</th>
                <th>Requested Date</th>
                <th>Status (Click to Update)</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((item) => {
                const currentStatus = String(item.status || 'New');
                const isResolved = currentStatus.toUpperCase() === 'RESOLVED';
                const isInProgress = currentStatus.toUpperCase() === 'IN PROGRESS';

                return (
                  <tr key={item.id}>
                    <td>
                      <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.9rem' }}>
                        {item.name || 'Anonymous Lead'}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        ID: #{String(item.id).slice(-8)}
                      </span>
                    </td>
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.82rem',
                          color: '#334155',
                          marginBottom: '0.2rem',
                        }}
                      >
                        <FiMail style={{ color: '#d99b26' }} /> {item.email || 'N/A'}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.82rem',
                          color: '#64748b',
                        }}
                      >
                        <FiPhone style={{ color: '#16a34a' }} /> {item.phone || 'N/A'}
                      </div>
                    </td>
                    <td style={{ maxWidth: '280px', fontSize: '0.82rem', color: '#475569', lineHeight: 1.4 }}>
                      {item.message || 'Requested GIFTERY Corporate Gifting Catalogue'}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      {item.createdAt || item.date || 'Recent'}
                    </td>
                    <td>
                      <select
                        value={currentStatus}
                        onChange={(e) => onStatusChange(item.id, e.target.value)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '20px',
                          border: '1px solid transparent',
                          fontWeight: '700',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          outline: 'none',
                          background: isResolved ? '#dcfce7' : isInProgress ? '#fef3c7' : '#e0e7ff',
                          color: isResolved ? '#15803d' : isInProgress ? '#b45309' : '#3730a3',
                        }}
                        title="Click to update status"
                      >
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CatalogueRequestsSection;

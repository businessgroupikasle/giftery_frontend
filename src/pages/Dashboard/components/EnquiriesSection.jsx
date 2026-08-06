import { useState } from 'react';
import {
  FiHelpCircle,
  FiMail,
  FiPhone,
  FiCalendar,
  FiSearch,
  FiEye,
  FiTag,
  FiFilter,
  FiX,
} from 'react-icons/fi';
import styles from '../Dashboard.module.css';

const EnquiriesSection = ({
  enquiriesList = [],
  handleUpdateEnquiryStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  // Filter enquiries based on search term & status filter
  const filteredEnquiries = enquiriesList.filter((e) => {
    const matchesStatus =
      statusFilter === 'ALL' ||
      (e.status || 'New').toUpperCase() === statusFilter.toUpperCase();

    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (e.id && e.id.toLowerCase().includes(query)) ||
      (e.name && e.name.toLowerCase().includes(query)) ||
      (e.email && e.email.toLowerCase().includes(query)) ||
      (e.phone && e.phone.toLowerCase().includes(query)) ||
      (e.subject && e.subject.toLowerCase().includes(query)) ||
      (e.message && e.message.toLowerCase().includes(query));

    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className={styles.cardContainer}>
        {/* Header Row */}
        <div className={styles.cardHeaderRow}>
          <div>
            <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiHelpCircle style={{ color: '#d99b26' }} />
              <span>Customer Enquiries</span>
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              View and manage customer contact messages, quote requests, and store visit appointments in a structured table view.
            </p>
          </div>
          <span className={styles.viewAllBtn} style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
            Total Enquiries: {enquiriesList.length}
          </span>
        </div>

        {/* Filter & Search Toolbar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginTop: '1.25rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          {/* Left: Status Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', marginRight: '0.25rem' }}>
              <FiFilter /> Filter:
            </span>
            {['ALL', 'NEW', 'IN PROGRESS', 'RESOLVED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background:
                    statusFilter === st
                      ? st === 'NEW'
                        ? '#2563eb'
                        : st === 'IN PROGRESS'
                        ? '#d97706'
                        : st === 'RESOLVED'
                        ? '#059669'
                        : '#0f172a'
                      : '#f1f5f9',
                  color: statusFilter === st ? '#ffffff' : '#64748b',
                }}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Right: Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <FiSearch style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search ID, Name, Email, Phone..."
              value={searchTerm}
              onChange={(evt) => setSearchTerm(evt.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem 0.55rem 2.4rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                outline: 'none',
                fontSize: '0.85rem',
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <FiX />
              </button>
            )}
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
          {filteredEnquiries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
              <FiHelpCircle style={{ fontSize: '2.5rem', color: '#cbd5e1', marginBottom: '0.5rem' }} />
              <p style={{ margin: 0, fontWeight: '600', fontSize: '1rem', color: '#334155' }}>No customer enquiries found</p>
              <span style={{ fontSize: '0.85rem' }}>Try adjusting your search query or status filter.</span>
            </div>
          ) : (
            <table className={styles.ordersTable}>
              <thead>
                <tr>
                  <th>Enquiry ID</th>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Category / Subject</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnquiries.map((e) => (
                  <tr key={e.id}>
                    {/* 1. Enquiry ID */}
                    <td>
                      <code style={{ background: '#f1f5f9', color: '#d99b26', padding: '0.25rem 0.55rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800' }}>
                        {e.id}
                      </code>
                    </td>

                    {/* 2. Customer Name */}
                    <td>
                      <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{e.name}</strong>
                    </td>

                    {/* 3. Email */}
                    <td>
                      <a
                        href={`mailto:${e.email}`}
                        style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <FiMail style={{ color: '#64748b' }} />
                        {e.email}
                      </a>
                    </td>

                    {/* 4. Phone Number */}
                    <td>
                      {e.phone ? (
                        <a
                          href={`tel:${e.phone}`}
                          style={{ color: '#334155', textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <FiPhone style={{ color: '#64748b' }} />
                          {e.phone}
                        </a>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontStyle: 'italic' }}>Not provided</span>
                      )}
                    </td>

                    {/* 5. Category */}
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', color: '#334155' }}>
                        <FiTag style={{ color: '#d99b26', fontSize: '0.75rem' }} />
                        {e.subject || e.category || 'General Inquiry'}
                      </span>
                    </td>

                    {/* 6. Date */}
                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <FiCalendar style={{ color: '#94a3b8' }} />
                        {e.createdAt || e.date || 'Recent'}
                      </span>
                    </td>

                    {/* 7. Status */}
                    <td>
                      <span className={`${styles.pillStatus} ${e.status === 'Resolved' ? styles.pillDelivered : e.status === 'In Progress' ? styles.pillProcessing : styles.pillPending}`}>
                        {e.status || 'New'}
                      </span>
                    </td>

                    {/* 8. Actions */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        {/* View Details Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedEnquiry(e)}
                          title="View Details & Full Message"
                          style={{
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px',
                            padding: '0.35rem 0.6rem',
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <FiEye /> View
                        </button>

                        {/* Status Change Selector */}
                        <select
                          value={e.status || 'New'}
                          onChange={(evt) => handleUpdateEnquiryStatus(e.id, evt.target.value)}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            padding: '0.35rem 0.5rem',
                            cursor: 'pointer',
                            fontWeight: '600',
                            color: '#1e293b',
                          }}
                        >
                          <option value="New">New</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── ENQUIRY DETAILS MODAL ── */}
      {selectedEnquiry && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={() => setSelectedEnquiry(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
            }}
            onClick={(evt) => evt.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedEnquiry(null)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: '#f1f5f9',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                fontWeight: 'bold',
              }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <code style={{ background: '#f1f5f9', color: '#d99b26', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '800' }}>
                {selectedEnquiry.id}
              </code>
              <span className={`${styles.pillStatus} ${selectedEnquiry.status === 'Resolved' ? styles.pillDelivered : selectedEnquiry.status === 'In Progress' ? styles.pillProcessing : styles.pillPending}`}>
                {selectedEnquiry.status || 'New'}
              </span>
            </div>

            <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '800' }}>
              {selectedEnquiry.name}
            </h3>

            {/* Contact details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>EMAIL ADDRESS</span>
                <a href={`mailto:${selectedEnquiry.email}`} style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '600' }}>
                  {selectedEnquiry.email}
                </a>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>PHONE NUMBER</span>
                <span style={{ color: '#1e293b', fontSize: '0.88rem', fontWeight: '600' }}>
                  {selectedEnquiry.phone || 'Not provided'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>CATEGORY / SUBJECT</span>
                <span style={{ color: '#1e293b', fontSize: '0.88rem', fontWeight: '600' }}>
                  {selectedEnquiry.subject || selectedEnquiry.category || 'General Inquiry'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>SUBMITTED DATE</span>
                <span style={{ color: '#1e293b', fontSize: '0.88rem', fontWeight: '600' }}>
                  {selectedEnquiry.createdAt || selectedEnquiry.date || 'Recent'}
                </span>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.4rem' }}>ENQUIRY MESSAGE / REQUIREMENTS:</span>
              <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '10px', fontSize: '0.9rem', color: '#1e293b', lineHeight: '1.6', whiteSpace: 'pre-line', maxHeight: '180px', overflowY: 'auto' }}>
                {selectedEnquiry.message}
              </div>
            </div>

            {/* Update Status Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Change Status:</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['New', 'In Progress', 'Resolved'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      handleUpdateEnquiryStatus(selectedEnquiry.id, st);
                      setSelectedEnquiry((prev) => ({ ...prev, status: st }));
                    }}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      background: selectedEnquiry.status === st ? '#0f172a' : '#ffffff',
                      color: selectedEnquiry.status === st ? '#ffffff' : '#475569',
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnquiriesSection;

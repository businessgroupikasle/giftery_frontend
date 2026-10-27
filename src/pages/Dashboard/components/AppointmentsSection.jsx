import { useMemo, useState } from 'react';
import { FiCalendar, FiClock, FiMail, FiMapPin, FiPhone, FiSearch, FiTrash2 } from 'react-icons/fi';
import { formatEnquiryId } from '@utils/formatters';
import styles from '../Dashboard.module.css';

const isAppointment = (item) =>
  item.type === 'appointment' ||
  String(item.subject || '').toLowerCase().includes('studio appointment') ||
  String(item.message || '').toLowerCase().includes('appointment requested for');

const getAppointmentDetails = (item) => {
  const message = String(item.message || '');
  const scheduleMatch = message.match(/Appointment requested for (.+?) at (.+?)\./i);
  const locationMatch = message.match(/Store: (.+?)\. Notes:/i);
  const notesMatch = message.match(/Notes: (.+)$/i);

  return {
    date: item.appointmentDate || scheduleMatch?.[1] || 'Not specified',
    time: item.appointmentTime || scheduleMatch?.[2] || 'Not specified',
    location: item.appointmentLocation || locationMatch?.[1] || String(item.subject || '').replace(/^Studio Appointment:\s*/i, '') || 'Giftery Experience Studio',
    notes: item.appointmentNotes || notesMatch?.[1] || 'None',
  };
};

const AppointmentsSection = ({ enquiriesList = [], handleUpdateEnquiryStatus, handleDeleteEnquiry }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const appointments = useMemo(() => enquiriesList.filter(isAppointment), [enquiriesList]);
  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return appointments.filter((item) => {
      const matchesStatus = statusFilter === 'ALL' || String(item.status || 'New').toUpperCase() === statusFilter;
      const details = getAppointmentDetails(item);
      const matchesSearch = !query || [item.name, item.email, item.phone, details.date, details.time, details.location]
        .some((value) => String(value || '').toLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [appointments, search, statusFilter]);

  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardHeaderRow}>
        <div>
          <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiCalendar style={{ color: '#d99b26' }} /> Studio Appointments
          </h3>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            View and manage customer visits booked through the Experience Studio appointment form.
          </p>
        </div>
        <span className={styles.viewAllBtn}>Total Appointments: {appointments.length}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', margin: '1.25rem 0 1rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          {['ALL', 'NEW', 'IN PROGRESS', 'RESOLVED'].map((status) => (
            <button key={status} type="button" onClick={() => setStatusFilter(status)} style={{ padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid #cbd5e1', background: statusFilter === status ? '#0f172a' : '#ffffff', color: statusFilter === status ? '#ffffff' : '#475569', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}>
              {status}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
          <FiSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search appointments..." style={{ width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.75rem 0.55rem 2.25rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {filteredAppointments.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '10px' }}>
            <FiCalendar style={{ fontSize: '2rem', color: '#cbd5e1', marginBottom: '0.5rem' }} />
            <p style={{ margin: 0, fontWeight: 700, color: '#334155' }}>No appointments found</p>
          </div>
        ) : (
          <table className={`${styles.ordersTable} ${styles.dashboardDataTable}`}>
            <thead>
              <tr><th>Appointment ID</th><th>Customer</th><th>Contact</th><th>Schedule</th><th>Location / Notes</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filteredAppointments.map((item, index) => {
                const details = getAppointmentDetails(item);
                const displayId = item.displayId || formatEnquiryId(item.id, item.createdAt, index);
                return (
                  <tr key={item.id}>
                    <td><code style={{ color: '#d99b26', fontWeight: 800 }}>{displayId}</code></td>
                    <td><strong>{item.name || 'Customer'}</strong></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.25rem' }}><FiMail /> {item.email}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FiPhone /> {item.phone}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.25rem' }}><FiCalendar /> {details.date}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FiClock /> {details.time}</div>
                    </td>
                    <td style={{ maxWidth: '280px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}><FiMapPin /> {details.location}</div>
                      <div style={{ color: '#64748b', marginTop: '0.3rem' }}>Notes: {details.notes}</div>
                    </td>
                    <td>
                      <select value={item.status || 'New'} onChange={(event) => handleUpdateEnquiryStatus(item.id, event.target.value)} style={{ padding: '0.4rem 0.55rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontWeight: 700 }}>
                        <option value="New">New</option><option value="In Progress">In Progress</option><option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td>
                      <button type="button" onClick={() => handleDeleteEnquiry(item.id, displayId)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.65rem', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '7px', fontWeight: 700, cursor: 'pointer' }}>
                        <FiTrash2 /> Delete
                      </button>
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

export default AppointmentsSection;

import { FiCalendar } from 'react-icons/fi';

// Values match the range names understood by filterByDateRange in @utils/formatters
export const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All Dates' },
  { value: 'Today', label: 'Today' },
  { value: 'Yesterday', label: 'Yesterday' },
  { value: 'Last 7 Days', label: 'Last 7 Days' },
  { value: 'Last 30 Days', label: 'Last 30 Days' },
  { value: 'This Month', label: 'This Month' },
];

const DateRangeFilter = ({ value, onChange }) => (
  <div style={{ position: 'relative' }}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Filter by date range"
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
      {DATE_RANGE_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
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
);

export default DateRangeFilter;

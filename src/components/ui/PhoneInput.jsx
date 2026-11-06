import { getPhoneCountry, getPhonePlaceholder, OTHER_PHONE_COUNTRIES, PRIORITY_PHONE_COUNTRIES, readPhoneInput } from '@utils/phone';
import styles from './PhoneInput.module.css';

const optionFor = ({ code, name, dial }) => <option key={code} value={code}>{name} +{dial}</option>;

/**
 * Country code dropdown plus mobile number field. The input keeps the host form's own
 * input styling through `inputClassName` and `inputStyle`. Only inline elements are used,
 * so it can sit inside a form's <label>.
 */
const PhoneInput = ({
  id,
  name = 'phone',
  country,
  value,
  onChange,
  onBlur,
  required = false,
  disabled = false,
  invalid = false,
  describedBy,
  placeholder,
  label = 'Mobile number',
  inputClassName = '',
  inputStyle,
}) => (
  <span className={styles.phoneField}>
    <span className={`${styles.countryBox} ${invalid ? styles.countryBoxInvalid : ''}`}>
      <span className={styles.code} aria-hidden="true">+{getPhoneCountry(country).dial}</span>
      <span className={styles.chevron} aria-hidden="true" />
      <select
        className={styles.countrySelect}
        value={getPhoneCountry(country).code}
        disabled={disabled}
        aria-label="Country code"
        autoComplete="tel-country-code"
        onChange={(event) => onChange({ country: event.target.value, number: value })}
      >
        <optgroup label="Common">{PRIORITY_PHONE_COUNTRIES.map(optionFor)}</optgroup>
        <optgroup label="All countries">{OTHER_PHONE_COUNTRIES.map(optionFor)}</optgroup>
      </select>
    </span>
    <input
      id={id}
      className={`${inputClassName} ${styles.phoneInput}`}
      style={inputStyle}
      type="tel"
      name={name}
      inputMode="tel"
      autoComplete="tel-national"
      aria-label={label}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      required={required}
      disabled={disabled}
      placeholder={placeholder ?? getPhonePlaceholder(country)}
      value={value}
      onChange={(event) => onChange(readPhoneInput(event.target.value, country))}
      onBlur={onBlur}
    />
  </span>
);

export default PhoneInput;

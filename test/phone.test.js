import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPhoneCountry, getPhoneError, getPhonePlaceholder, normalizePhone, OTHER_PHONE_COUNTRIES, parseStoredPhone, PRIORITY_PHONE_COUNTRIES, readPhoneInput, storedPhoneFields,
} from '../src/utils/phone.js';

test('the country list leads with India and the UAE and has no duplicates', () => {
  assert.deepEqual(PRIORITY_PHONE_COUNTRIES.slice(0, 2).map(({ code, dial }) => [code, dial]), [['IN', '91'], ['AE', '971']]);
  const codes = [...PRIORITY_PHONE_COUNTRIES, ...OTHER_PHONE_COUNTRIES].map((country) => country.code);
  assert.equal(new Set(codes).size, codes.length);
  assert.ok(codes.length > 200);
  assert.equal(getPhoneCountry('AE').name, 'United Arab Emirates');
  assert.equal(getPhoneCountry('nonsense').code, 'IN');
});

test('numbers are validated against the selected country', () => {
  assert.equal(normalizePhone('AE', '501234567'), '+971501234567');
  assert.equal(normalizePhone('AE', '050 123 4567'), '+971501234567', 'a local leading zero is fine');
  assert.equal(normalizePhone('IN', '9876543210'), '+919876543210');
  assert.equal(normalizePhone('US', '(202) 555-0123'), '+12025550123');
  assert.equal(normalizePhone('AE', '9876543210'), null, 'an Indian number is not a UAE number');
  assert.equal(normalizePhone('IN', '501234567'), null, 'a UAE number is not an Indian number');
  assert.equal(normalizePhone('IN', '1234567890'), null);
  assert.equal(normalizePhone('IN', ''), null);
});

test('error messages name the country and respect whether the field is required', () => {
  assert.equal(getPhoneError('AE', ''), '');
  assert.equal(getPhoneError('AE', '', { required: true }), 'Please enter your mobile number.');
  assert.equal(getPhoneError('AE', '501234567', { required: true }), '');
  assert.equal(getPhoneError('AE', '123'), 'Please enter a valid mobile number for United Arab Emirates (+971).');
  assert.doesNotMatch(getPhoneError('IN', '123'), /10-digit/);
});

test('typing keeps digits only, and pasting a full number switches the country', () => {
  assert.deepEqual(readPhoneInput('98765-abc 43210', 'IN'), { country: 'IN', number: '9876543210' });
  assert.deepEqual(readPhoneInput('+971 50 123 4567', 'IN'), { country: 'AE', number: '501234567' });
  assert.deepEqual(readPhoneInput('+91', 'AE'), { country: 'AE', number: '91' }, 'an unfinished code does not change the country');
  assert.equal(readPhoneInput('12345678901234567890', 'IN').number.length, 15);
});

test('saved numbers split back into the two fields', () => {
  assert.deepEqual(parseStoredPhone('+971501234567'), { country: 'AE', number: '501234567' });
  assert.deepEqual(parseStoredPhone('9876543210'), { country: 'IN', number: '9876543210' });
  assert.deepEqual(parseStoredPhone('+919876543210'), { country: 'IN', number: '9876543210' });
  assert.deepEqual(parseStoredPhone(''), { country: 'IN', number: '' });
  assert.deepEqual(parseStoredPhone('Not provided'), { country: 'IN', number: '' });
  assert.deepEqual(parseStoredPhone(null), { country: 'IN', number: '' });
});

test('saved numbers spread straight into form state', () => {
  assert.deepEqual(storedPhoneFields('+971501234567'), { phone: '501234567', phoneCountry: 'AE' });
  assert.deepEqual(storedPhoneFields(undefined), { phone: '', phoneCountry: 'IN' });
});

test('placeholders show a realistic number for the country, not an Indian format', () => {
  assert.equal(getPhonePlaceholder('AE'), '050 123 4567');
  assert.doesNotMatch(getPhonePlaceholder('IN'), /10-digit/);
});

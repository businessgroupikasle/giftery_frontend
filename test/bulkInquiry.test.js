import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BULK_SUCCESS_MESSAGE,
  EMPTY_BULK_FORM,
  buildBulkInquiryPayload,
  describeBulkSubmitError,
  validateBulkField,
  validateBulkForm,
} from '../src/pages/Product/bulkInquiryForm.js';

const filled = {
  ...EMPTY_BULK_FORM,
  quantity: '250',
  name: 'Priya Raman',
  email: 'priya@example.com',
  phone: '9876543210',
};

test('a complete form has no errors', () => {
  assert.deepEqual(validateBulkForm(filled, 'IN'), {});
});

test('an empty form flags every required field and nothing optional', () => {
  assert.deepEqual(Object.keys(validateBulkForm(EMPTY_BULK_FORM, 'IN')).sort(), ['email', 'name', 'phone', 'quantity']);
});

test('quantity must be a whole number of at least 100 units', () => {
  for (const quantity of ['0', '-3', '1', '50', '99', '2.5', '1e3', '10 boxes', 'abc', '1000001']) {
    assert.notEqual(validateBulkField('quantity', { ...filled, quantity }, 'IN'), '', `${quantity} should be rejected`);
  }
  assert.equal(validateBulkField('quantity', { ...filled, quantity: '99' }, 'IN'), 'Minimum bulk order is 100 units.');
  for (const quantity of ['100', ' 1000 ', '1000000']) {
    assert.equal(validateBulkField('quantity', { ...filled, quantity }, 'IN'), '', `${quantity} should be accepted`);
  }
});

test('email and phone are checked for format', () => {
  assert.notEqual(validateBulkField('email', { ...filled, email: 'priya@' }, 'IN'), '');
  assert.notEqual(validateBulkField('phone', { ...filled, phone: '12345' }, 'IN'), '');
  assert.equal(validateBulkField('phone', { ...filled, phone: '501234567' }, 'AE'), '');
});

test('payload sends only the product ID and the customer details', () => {
  const payload = buildBulkInquiryPayload('prod_1', { ...filled, name: ' Priya ', company: '  ', requirements: ' Logo ' }, 'IN');
  assert.deepEqual(payload, {
    productId: 'prod_1',
    quantity: 250,
    name: 'Priya',
    email: 'priya@example.com',
    phone: '+919876543210',
    company: undefined,
    requirements: 'Logo',
  });
  assert.equal('price' in payload, false);
  assert.equal('productName' in payload, false);
});

test('submit errors map to a banner and field messages', () => {
  assert.match(describeBulkSubmitError({}).message, /couldn't reach our server/);
  assert.match(describeBulkSubmitError({ status: 500, message: 'boom' }).message, /not sent/);
  assert.match(describeBulkSubmitError({ status: 429 }).message, /wait a few minutes/);
  const conflict = describeBulkSubmitError({ status: 409, message: 'You have already submitted a bulk inquiry.' });
  assert.equal(conflict.message, 'You have already submitted a bulk inquiry.');
  const invalid = describeBulkSubmitError({ status: 422, message: 'x', errors: [{ field: 'quantity', message: 'Quantity must be at least 1' }, { field: 'price', message: 'ignored' }] });
  assert.deepEqual(invalid.fieldErrors, { quantity: 'Quantity must be at least 1' });
  assert.match(invalid.message, /highlighted fields/);
});

test('success message promises follow-up, not a confirmed discount', () => {
  assert.match(BULK_SUCCESS_MESSAGE, /10% offer eligibility/);
  assert.doesNotMatch(BULK_SUCCESS_MESSAGE, /applied|guaranteed|confirmed/i);
});

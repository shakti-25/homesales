import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyAdminPin, ADMIN_SECURITY_PIN } from './auth.ts';

test('verifyAdminPin accepts valid 6-digit pin 250205', () => {
  assert.equal(ADMIN_SECURITY_PIN, '250205');
  assert.equal(verifyAdminPin('250205'), true);
  assert.equal(verifyAdminPin(' 250205 '), true);
});

test('verifyAdminPin rejects incorrect pins', () => {
  assert.equal(verifyAdminPin('123456'), false);
  assert.equal(verifyAdminPin(''), false);
  assert.equal(verifyAdminPin('250200'), false);
  assert.equal(verifyAdminPin('admin'), false);
});

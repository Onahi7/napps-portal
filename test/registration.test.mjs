import test from 'node:test';
import assert from 'node:assert/strict';
import { optionalNumber, duesDeclarationSchema, getAcademicSession } from '../src/lib/registrationValidation.ts';
import { resolveApiBaseUrl, CLOUDFLARE_API_BASE } from '../src/config/apiBase.ts';

test('retired hosting settings cannot send registration back to Render', () => {
  for (const value of [undefined, '', 'https://napps-api.dicksonhardy7.workers.dev/api/v1', 'https://napps-backend-5ty7.onrender.com/api/v1/']) {
    assert.equal(resolveApiBaseUrl(value), CLOUDFLARE_API_BASE);
  }
  assert.equal(resolveApiBaseUrl(CLOUDFLARE_API_BASE), CLOUDFLARE_API_BASE);
  assert.equal(resolveApiBaseUrl('http://localhost:3001/api/v1'), 'http://localhost:3001/api/v1');
});

test('dues lookup displays the active academic session', () => {
  assert.equal(getAcademicSession(new Date('2026-10-25T12:00:00Z')), '2026/2027');
  assert.equal(getAcademicSession(new Date('2027-08-31T12:00:00Z')), '2026/2027');
  assert.equal(getAcademicSession(new Date('2027-09-01T12:00:00Z')), '2027/2028');
});

test('an optional enrollment can be omitted or left blank', () => {
  for (const value of [undefined, null, '', NaN]) assert.equal(optionalNumber.parse(value), undefined);
});
test('enrollment preserves zero and valid whole counts', () => {
  for (const value of [0, 350, '350']) assert.equal(optionalNumber.parse(value), Number(value));
  for (const value of [-1, 1.5, 'invalid']) assert.equal(optionalNumber.safeParse(value).success, false);
});
test('dues declarations store session and level independently', () => {
  for (const level of ['national', 'state', 'zonal']) {
    assert.deepEqual(duesDeclarationSchema.parse({ sessionId: '2026/2027', level, paid: true }), { sessionId: '2026/2027', level, paid: true });
  }
  assert.equal(duesDeclarationSchema.safeParse({ sessionId: '2026/2027', level: 'exam', paid: true }).success, false);
});

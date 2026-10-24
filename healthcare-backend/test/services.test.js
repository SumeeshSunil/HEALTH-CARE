import test from 'node:test';
import assert from 'node:assert/strict';
import { catalogFields, assertOrderAccess, assertOrderTransition } from '../src/utils/services.js';
import { CatalogItem, ServiceOrder } from '../src/models/Services.js';

test('catalog prices use integer paise and reject invalid money or stock', () => {
  assert.equal(catalogFields({ name: 'Test', price: 12.35, stock: 3 }).pricePaise, 1235);
  for (const price of [-1, 1.005, Infinity, '30', null]) assert.throws(() => catalogFields({ name: 'Test', price }));
  assert.throws(() => catalogFields({ name: 'Test', price: 1, stock: -2 }));
  assert.throws(() => catalogFields({ name: '', price: 1 }));
  assert.equal(catalogFields({ name: 'Free', price: 0 }).pricePaise, 0);
});
test('orders are private to their patient and relevant department staff', () => {
  const order = { patient: 'p1', kind: 'lab' };
  for (const user of [{ id: 'p1', role: 'patient' }, { role: 'lab' }, { role: 'admin' }]) assert.doesNotThrow(() => assertOrderAccess(order, user));
  for (const user of [{ id: 'p2', role: 'patient' }, { id: 'p1', role: 'doctor' }, { role: 'pharmacy' }]) assert.throws(() => assertOrderAccess(order, user));
  assert.throws(() => assertOrderAccess(order, { id: 'p1', role: 'patient' }, true));
});
test('lab fulfillment requires payment, sample collection and nonempty results', () => {
  const order = { kind: 'lab', status: 'pending', payment: { status: 'unpaid' } };
  assert.throws(() => assertOrderTransition(order, 'sample_collected'));
  order.payment.status = 'paid';
  assert.doesNotThrow(() => assertOrderTransition(order, 'sample_collected'));
  assert.throws(() => assertOrderTransition(order, 'completed', 'Report'));
  order.status = 'sample_collected';
  assert.throws(() => assertOrderTransition(order, 'completed', ''));
  assert.doesNotThrow(() => assertOrderTransition(order, 'completed', 'Demo report'));
  assert.throws(() => assertOrderTransition(order, 'dispensed'));
});
test('medicine fulfillment and persistence reject fractional inventory and quantities', async () => {
  assert.doesNotThrow(() => assertOrderTransition({ kind: 'medicine', status: 'pending', payment: { status: 'paid' } }, 'dispensed'));
  const item = new CatalogItem({ name: 'Demo', kind: 'medicine', pricePaise: 30, stock: 0.5 });
  await assert.rejects(item.validate());
  const order = new ServiceOrder({ patient: 'a'.repeat(24), patientName: 'Demo', item: 'b'.repeat(24), kind: 'medicine', itemName: 'Demo', amountPaise: 10, quantity: 1.5, bookingKey: 'key' });
  await assert.rejects(order.validate());
});

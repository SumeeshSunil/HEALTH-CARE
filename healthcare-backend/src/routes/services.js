import { Router } from 'express';
import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { CatalogItem, ServiceOrder, catalogResponse, orderResponse } from '../models/Services.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { HttpError } from '../utils/HttpError.js';
import { demoPaymentsEnabled } from '../utils/appointments.js';
import { validKind, staffFor, catalogFields, assertOrderAccess, assertOrderTransition } from '../utils/services.js';

export const serviceRouter = Router();
serviceRouter.use(requireAuth);
function id(value) { if (!mongoose.isObjectIdOrHexString(value)) throw new HttpError(400, 'Invalid ID'); return value; }
function manager(user, kind) {
  if (!['admin', staffFor(kind)].includes(user.role)) throw new HttpError(403, 'Department staff access required');
}

serviceRouter.get('/catalog/:kind', async (req, res) => {
  const kind = validKind(req.params.kind);
  const manage = ['admin', staffFor(kind)].includes(req.user.role);
  const items = await CatalogItem.find({ kind, ...(!manage ? { isActive: true } : {}) }).sort({ name: 1 });
  res.json({ items: items.map(catalogResponse) });
});
serviceRouter.post('/catalog/:kind', async (req, res) => {
  const kind = validKind(req.params.kind); manager(req.user, kind);
  const item = await CatalogItem.create({ kind, ...catalogFields(req.body) });
  res.status(201).json({ item: catalogResponse(item) });
});
serviceRouter.patch('/catalog/:kind/:id', async (req, res) => {
  const kind = validKind(req.params.kind); manager(req.user, kind);
  const values = catalogFields(req.body);
  // Stock additions use $inc so a concurrent dispense cannot be overwritten.
  delete values.stock;
  const item = await CatalogItem.findOneAndUpdate({ _id: id(req.params.id), kind }, { $set: values }, { returnDocument: 'after', runValidators: true });
  if (!item) throw new HttpError(404, 'Item not found');
  res.json({ item: catalogResponse(item) });
});
serviceRouter.post('/catalog/medicine/:id/restock', requireRole('admin', 'pharmacy'), async (req, res) => {
  const quantity = req.body?.quantity;
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100000) throw new HttpError(400, 'Enter a restock quantity from 1 to 100000');
  const item = await CatalogItem.findOneAndUpdate({ _id: id(req.params.id), kind: 'medicine' }, { $inc: { stock: quantity } }, { returnDocument: 'after' });
  if (!item) throw new HttpError(404, 'Medicine not found');
  res.json({ item: catalogResponse(item) });
});
serviceRouter.get('/orders', requireRole('patient', 'admin', 'lab', 'pharmacy'), async (req, res) => {
  const filter = req.user.role === 'patient' ? { patient: req.user.id }
    : req.user.role === 'admin' ? {} : { kind: req.user.role === 'lab' ? 'lab' : 'medicine' };
  const orders = await ServiceOrder.find(filter).sort({ createdAt: -1 });
  res.json({ orders: orders.map(orderResponse), demoPaymentsEnabled: demoPaymentsEnabled() });
});
serviceRouter.post('/orders', requireRole('patient'), async (req, res) => {
  const { itemId, quantity = 1, bookingKey } = req.body || {};
  id(itemId);
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100 || typeof bookingKey !== 'string'
      || !/^[a-zA-Z0-9_-]{16,100}$/.test(bookingKey)) throw new HttpError(400, 'Enter a valid quantity and booking key');
  async function existingOrder() {
    const existing = await ServiceOrder.findOne({ patient: req.user.id, bookingKey });
    if (!existing) return null;
    if (String(existing.item) !== itemId || existing.quantity !== quantity) throw new HttpError(409, 'Booking key already used for another order');
    return existing;
  }
  let order = await existingOrder();
  if (order) return res.json({ order: orderResponse(order) });
  const item = await CatalogItem.findOne({ _id: itemId, isActive: true });
  if (!item) throw new HttpError(404, 'Item is unavailable');
  if (item.kind === 'lab' && quantity !== 1) throw new HttpError(400, 'Book one lab test at a time');
  if (item.kind === 'medicine' && item.stock < quantity) throw new HttpError(409, 'Insufficient medicine stock');
  const amountPaise = item.pricePaise * quantity;
  try {
    order = await ServiceOrder.create({ patient: req.user.id, patientName: req.user.name, item: item.id,
      itemName: item.name, kind: item.kind, quantity, bookingKey, amountPaise,
      payment: amountPaise === 0 ? { status: 'paid', method: 'free', paidAt: new Date() } : { status: 'unpaid' } });
  } catch (err) {
    if (err.code !== 11000) throw err;
    order = await existingOrder();
    if (!order) throw err;
  }
  res.status(201).json({ order: orderResponse(order) });
});

serviceRouter.post('/orders/:id/payment', async (req, res) => {
  const order = await ServiceOrder.findById(id(req.params.id));
  if (!order) throw new HttpError(404, 'Order not found');
  assertOrderAccess(order, req.user);
  const { method, outcome = 'success' } = req.body || {};
  if (req.user.role === 'patient') {
    if (method !== 'demo' || !demoPaymentsEnabled()) throw new HttpError(403, 'Only simulated online payment is available here');
  } else if (!['cash', 'card'].includes(method)) throw new HttpError(400, 'Choose cash or card');
  if (!['success', 'failed'].includes(outcome) || (method !== 'demo' && outcome !== 'success')) throw new HttpError(400, 'Invalid payment outcome');
  const payment = outcome === 'failed' ? { 'payment.lastAttempt': 'failed' }
    : { 'payment.status': 'paid', 'payment.method': method, 'payment.paidAt': new Date(),
      'payment.recordedBy': req.user.id, 'payment.lastAttempt': 'success',
      'payment.reference': (method === 'demo' ? 'DEMO-' : 'RECEIPT-') + randomUUID() };
  // One conditional update: duplicate payments preserve the original receipt.
  const saved = await ServiceOrder.findOneAndUpdate({ _id: order.id, 'payment.status': 'unpaid' }, { $set: payment }, { returnDocument: 'after' });
  res.json({ order: orderResponse(saved || await ServiceOrder.findById(order.id)) });
});

serviceRouter.patch('/orders/:id/status', async (req, res) => {
  const order = await ServiceOrder.findById(id(req.params.id));
  if (!order) throw new HttpError(404, 'Order not found');
  assertOrderAccess(order, req.user, true);
  const { status, result = '' } = req.body || {};
  if (order.status === status) return res.json({ order: orderResponse(order) });
  assertOrderTransition(order, status, result);
  if (order.kind === 'medicine') {
    const dispensed = await CatalogItem.findOneAndUpdate({ _id: order.item, stock: { $gte: order.quantity }, dispensedOrders: { $ne: order._id } },
      { $inc: { stock: -order.quantity }, $addToSet: { dispensedOrders: order._id } }, { returnDocument: 'after' });
    if (!dispensed && !await CatalogItem.exists({ _id: order.item, dispensedOrders: order._id })) throw new HttpError(409, 'Insufficient stock. Restock before dispensing');
  }
  const saved = await ServiceOrder.findOneAndUpdate({ _id: order.id, status: order.status },
    { $set: { status, ...(status === 'completed' ? { result: result.trim() } : {}) } }, { returnDocument: 'after', runValidators: true });
  res.json({ order: orderResponse(saved || await ServiceOrder.findById(order.id)) });
});

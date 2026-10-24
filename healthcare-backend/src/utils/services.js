import { HttpError } from './HttpError.js';

export function staffFor(kind) { return kind === 'lab' ? 'lab' : 'pharmacy'; }
export function validKind(kind) {
  if (!['lab', 'medicine'].includes(kind)) throw new HttpError(400, 'Choose lab or medicine');
  return kind;
}
export function catalogFields(body) {
  const { name, price, description = '', stock = 0, isActive = true } = body || {};
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 150
      || typeof price !== 'number' || !Number.isFinite(price) || price < 0 || price > 100000
      || Math.abs(price * 100 - Math.round(price * 100)) > 0.00001
      || typeof description !== 'string' || description.length > 1000
      || !Number.isSafeInteger(stock) || stock < 0 || stock > 1000000 || typeof isActive !== 'boolean') {
    throw new HttpError(400, 'Enter a name, price (up to two decimals), description and whole-number stock');
  }
  return { name: name.trim(), pricePaise: Math.round(price * 100), description: description.trim(), stock, isActive };
}
export function assertOrderAccess(order, user, staffOnly = false) {
  if (user.role === 'admin' || user.role === staffFor(order.kind)) return;
  if (!staffOnly && user.role === 'patient' && String(order.patient) === user.id) return;
  throw new HttpError(403, 'You cannot access this order');
}
export function assertOrderTransition(order, status, result = '') {
  if (order.payment.status !== 'paid') throw new HttpError(409, 'Record payment before fulfilling this order');
  const valid = order.kind === 'lab'
    ? (order.status === 'pending' && status === 'sample_collected') || (order.status === 'sample_collected' && status === 'completed')
    : order.status === 'pending' && status === 'dispensed';
  if (!valid) throw new HttpError(409, 'Invalid order status change');
  if (order.kind === 'lab' && status === 'completed' && (typeof result !== 'string' || !result.trim() || result.length > 5000)) {
    throw new HttpError(400, 'Enter a lab report (1–5000 characters)');
  }
}

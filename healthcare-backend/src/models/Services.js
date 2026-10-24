import mongoose from 'mongoose';

const ref = { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true };
const catalogSchema = new mongoose.Schema({
  kind: { type: String, enum: ['lab', 'medicine'], required: true },
  name: { type: String, trim: true, required: true, maxlength: 150 },
  pricePaise: { type: Number, min: 0, max: 10000000, required: true, validate: Number.isSafeInteger },
  description: { type: String, maxlength: 1000, default: '' },
  stock: { type: Number, min: 0, default: 0, validate: Number.isSafeInteger },
  isActive: { type: Boolean, default: true },
  // An order ID is added with the stock decrement, making a dispense retry safe.
  dispensedOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceOrder' }],
}, { timestamps: true });
catalogSchema.index({ kind: 1, name: 1 }, { unique: true });
export const CatalogItem = mongoose.model('CatalogItem', catalogSchema);

const orderSchema = new mongoose.Schema({
  patient: ref,
  patientName: { type: String, required: true },
  kind: { type: String, enum: ['lab', 'medicine'], required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'CatalogItem', required: true },
  itemName: { type: String, required: true },
  quantity: { type: Number, min: 1, max: 100, required: true, validate: Number.isSafeInteger },
  amountPaise: { type: Number, min: 0, required: true, validate: Number.isSafeInteger },
  bookingKey: { type: String, required: true, maxlength: 100 },
  status: { type: String, enum: ['pending', 'sample_collected', 'completed', 'dispensed'], default: 'pending' },
  result: { type: String, maxlength: 5000, default: '' },
  payment: {
    status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    method: { type: String, enum: ['cash', 'card', 'demo', 'free'], default: undefined },
    reference: String,
    paidAt: Date,
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastAttempt: { type: String, enum: ['success', 'failed'] },
  },
}, { timestamps: true, optimisticConcurrency: true });
orderSchema.index({ patient: 1, bookingKey: 1 }, { unique: true });
export const ServiceOrder = mongoose.model('ServiceOrder', orderSchema);

export const Message = mongoose.model('Message', new mongoose.Schema({
  patient: ref, doctor: ref, sender: ref,
  text: { type: String, trim: true, required: true, maxlength: 2000 },
}, { timestamps: true }));

export const Certificate = mongoose.model('Certificate', new mongoose.Schema({
  patient: ref, doctor: ref,
  patientName: String, doctorName: String,
  type: { type: String, enum: ['Sick Leave Certificate', 'Medical Fitness Certificate', 'Return to Work Authorization'], required: true },
  startDate: { type: String, required: true }, endDate: { type: String, required: true },
  notes: { type: String, required: true, maxlength: 2000 },
}, { timestamps: true }));

const readSchema = new mongoose.Schema({ user: ref, key: { type: String, required: true, maxlength: 100 } });
readSchema.index({ user: 1, key: 1 }, { unique: true });
export const NotificationRead = mongoose.model('NotificationRead', readSchema);

export function catalogResponse(item) {
  return { id: item.id, kind: item.kind, name: item.name, price: item.pricePaise / 100,
    description: item.description, stock: item.stock, isActive: item.isActive };
}
export function orderResponse(order) {
  return { id: order.id, patientId: String(order.patient), patientName: order.patientName,
    kind: order.kind, itemId: String(order.item), itemName: order.itemName, quantity: order.quantity,
    amount: order.amountPaise / 100, status: order.status, result: order.result,
    payment: order.payment, createdAt: order.createdAt };
}

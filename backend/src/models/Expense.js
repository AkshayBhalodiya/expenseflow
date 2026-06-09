import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    notes: { type: String, default: '' },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'bank_transfer', 'other'],
      default: 'cash',
    },
    creditCardId: { type: mongoose.Schema.Types.ObjectId, ref: 'CreditCard', default: null },
    receiptUrl: { type: String, default: '' },
    tags: [{ type: String }],
    isRecurring: { type: Boolean, default: false },
    recurringId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecurringTransaction' },
  },
  { timestamps: true }
);

expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });

export default mongoose.model('Expense', expenseSchema);

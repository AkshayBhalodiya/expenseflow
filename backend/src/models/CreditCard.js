import mongoose from 'mongoose';

const creditCardSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    cardName: { type: String, required: true, trim: true },
    bankName: { type: String, required: true, trim: true },
    lastFourDigits: { type: String, default: '0000', maxlength: 4 },
    creditLimit: { type: Number, required: true, min: 0 },
    usedAmount: { type: Number, default: 0, min: 0 },
    billingCycleDay: { type: Number, default: 1, min: 1, max: 28 },
    paymentDueDay: { type: Number, default: 15, min: 1, max: 28 },
    color: { type: String, default: '#6366f1' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

creditCardSchema.virtual('availableCredit').get(function () {
  return Math.max(0, this.creditLimit - this.usedAmount);
});

creditCardSchema.virtual('utilizationPercent').get(function () {
  return this.creditLimit > 0 ? Math.round((this.usedAmount / this.creditLimit) * 100) : 0;
});

creditCardSchema.set('toJSON', { virtuals: true });
creditCardSchema.set('toObject', { virtuals: true });

export default mongoose.model('CreditCard', creditCardSchema);

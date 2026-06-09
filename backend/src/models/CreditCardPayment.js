import mongoose from 'mongoose';

const creditCardPaymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    creditCardId: { type: mongoose.Schema.Types.ObjectId, ref: 'CreditCard', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date, required: true, default: Date.now },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('CreditCardPayment', creditCardPaymentSchema);

import mongoose from 'mongoose';

const emiSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    loanName: { type: String, required: true, trim: true },
    totalAmount: { type: Number, required: true, min: 0 },
    interestRate: { type: Number, default: 0, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    emiAmount: { type: Number, required: true, min: 0 },
    paidInstallments: { type: Number, default: 0, min: 0 },
    totalInstallments: { type: Number, required: true, min: 1 },
    remainingBalance: { type: Number, required: true, min: 0 },
    nextDueDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('EMI', emiSchema);

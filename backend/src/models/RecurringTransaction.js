import mongoose from 'mongoose';

const recurringSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['expense', 'income'], required: true },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'], required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String },
    source: { type: String },
    paymentMethod: { type: String, default: 'cash' },
    notes: { type: String, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    nextRunDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    lastRunDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('RecurringTransaction', recurringSchema);

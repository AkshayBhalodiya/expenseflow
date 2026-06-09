import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    month: { type: String, required: true },
    year: { type: Number, required: true },
    alertSent80: { type: Boolean, default: false },
    alertSent90: { type: Boolean, default: false },
    alertSent100: { type: Boolean, default: false },
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);

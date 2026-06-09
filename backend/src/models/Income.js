import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    source: {
      type: String,
      enum: ['salary', 'freelancing', 'business', 'investment', 'other'],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

incomeSchema.index({ userId: 1, date: -1 });

export default mongoose.model('Income', incomeSchema);

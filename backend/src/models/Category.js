import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: 'tag' },
    color: { type: String, default: '#6366f1' },
    isDefault: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

categorySchema.index({ name: 1 }, { unique: true });

export default mongoose.model('Category', categorySchema);

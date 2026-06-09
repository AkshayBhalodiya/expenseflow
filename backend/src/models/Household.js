import mongoose from 'mongoose';
import crypto from 'crypto';

const memberSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const householdSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, default: 'Our Home' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [memberSchema],
    inviteCode: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(3).toString('hex').toUpperCase(),
    },
  },
  { timestamps: true }
);

export default mongoose.model('Household', householdSchema);

import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    if (error.code === 8000 || error.message?.includes('bad auth')) {
      console.error('\nAtlas auth failed. Check:');
      console.error('  1. Username/password in backend/.env MONGODB_URI');
      console.error('  2. Atlas → Database Access → user exists with read/write role');
      console.error('  3. Atlas → Network Access → your IP allowed (or 0.0.0.0/0)');
      console.error('  4. Password special chars must be URL-encoded (@ → %40, # → %23)\n');
    }
    process.exit(1);
  }
}

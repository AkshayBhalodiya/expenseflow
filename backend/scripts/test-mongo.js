import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI missing in backend/.env');
  process.exit(1);
}

const masked = uri.replace(/:([^:@/]+)@/, ':****@');
console.log('Testing:', masked);

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('\n✅ MongoDB connected successfully!');
  console.log('Database:', mongoose.connection.name);
  await mongoose.disconnect();
  process.exit(0);
} catch (error) {
  console.error('\n❌ Connection failed:', error.message);
  if (error.code === 8000 || String(error.message).includes('bad auth')) {
    console.error(`
Fix in MongoDB Atlas:
  1. Database Access → create NEW user (or Edit → Reset Password)
  2. Copy password exactly (no spaces)
  3. Database → Connect → Drivers → copy full connection string
  4. Replace <password> with your password in backend/.env
  5. Add database name: ...mongodb.net/expense_management?retryWrites=true&w=majority
  6. Network Access → Add IP → Allow from anywhere (0.0.0.0/0)
`);
  }
  process.exit(1);
}

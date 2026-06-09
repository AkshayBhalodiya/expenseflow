import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import { seedDefaultCategories } from '../src/utils/seedCategories.js';

dotenv.config();

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expense_management';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  await seedDefaultCategories();
  console.log('Default categories seeded');

  const adminEmail = 'admin@expenseflow.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: 'admin12345',
      role: 'admin',
      isEmailVerified: true,
    });
    console.log('Admin user created: admin@expenseflow.com / admin12345');
  } else {
    console.log('Admin user already exists');
  }

  const demoEmail = 'demo@expenseflow.com';
  let demo = await User.findOne({ email: demoEmail });
  if (!demo) {
    demo = await User.create({
      name: 'Demo User',
      email: demoEmail,
      password: 'demo12345',
      role: 'user',
      isEmailVerified: true,
    });
    console.log('Demo user created: demo@expenseflow.com / demo12345');
  } else {
    console.log('Demo user already exists');
  }

  await mongoose.disconnect();
  console.log('Seed completed');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

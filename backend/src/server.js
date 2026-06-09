import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import cron from 'node-cron';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { seedDefaultCategories } from './utils/seedCategories.js';
import { checkEmiDueNotifications } from './services/notificationService.js';
import { processRecurringTransactions } from './services/recurringService.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import incomeRoutes from './routes/incomeRoutes.js';
import emiRoutes from './routes/emiRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import recurringRoutes from './routes/recurringRoutes.js';
import creditCardRoutes from './routes/creditCardRoutes.js';
import householdRoutes from './routes/householdRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

const allowedOrigins = [
  env.frontendUrl,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'ExpenseFlow API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      displayRequestDuration: true,
    },
  })
);
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/emi', emiRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/credit-cards', creditCardRoutes);
app.use('/api/household', householdRoutes);

app.use(errorHandler);

async function start() {
  await connectDB();
  await seedDefaultCategories();

  cron.schedule('0 9 * * *', checkEmiDueNotifications);
  cron.schedule('0 0 * * *', processRecurringTransactions);
  cron.schedule('0 8 1 * *', async () => {
    const User = (await import('./models/User.js')).default;
    const { sendMonthlySummary } = await import('./services/notificationService.js');
    const users = await User.find({ role: 'user' });
    for (const user of users) {
      await sendMonthlySummary(user._id);
    }
  });

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
    console.log(`API docs: http://localhost:${env.port}/api/docs`);
  });
}

start();

export default app;

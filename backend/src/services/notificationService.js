import Notification from '../models/Notification.js';
import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';
import EMI from '../models/EMI.js';
import { sendEmail } from '../utils/helpers.js';
import User from '../models/User.js';

export async function createNotification(userId, type, title, message, metadata = {}) {
  return Notification.create({ userId, type, title, message, metadata });
}

export async function checkBudgetAlerts(userId, category, month, year) {
  const budget = await Budget.findOne({ userId, category, month, year });
  if (!budget) return;

  const startDate = new Date(year, new Date(`${month} 1, ${year}`).getMonth(), 1);
  const endDate = new Date(year, startDate.getMonth() + 1, 0, 23, 59, 59);

  const spent = await Expense.aggregate([
    { $match: { userId, category, date: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const totalSpent = spent[0]?.total || 0;
  const usage = (totalSpent / budget.amount) * 100;

  const alerts = [];
  if (usage >= 100 && !budget.alertSent100) {
    alerts.push({ level: 100, message: `Budget exceeded for ${category}! Spent ₹${totalSpent} of ₹${budget.amount}` });
    budget.alertSent100 = true;
  } else if (usage >= 90 && !budget.alertSent90) {
    alerts.push({ level: 90, message: `90% of ${category} budget used (₹${totalSpent}/₹${budget.amount})` });
    budget.alertSent90 = true;
  } else if (usage >= 80 && !budget.alertSent80) {
    alerts.push({ level: 80, message: `80% of ${category} budget used (₹${totalSpent}/₹${budget.amount})` });
    budget.alertSent80 = true;
  }

  if (alerts.length > 0) {
    await budget.save();
    const user = await User.findById(userId);
    for (const alert of alerts) {
      await createNotification(userId, 'budget_alert', 'Budget Alert', alert.message, { category, usage });
      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: 'Budget Alert - Expense Manager',
          html: `<p>${alert.message}</p>`,
        });
      }
    }
  }
}

export async function checkEmiDueNotifications() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueEmis = await EMI.find({
    isActive: true,
    nextDueDate: { $gte: today, $lte: tomorrow },
  }).populate('userId', 'email name');

  for (const emi of dueEmis) {
    await createNotification(
      emi.userId._id,
      'emi_due',
      'EMI Due Tomorrow',
      `Your EMI of ₹${emi.emiAmount} for ${emi.loanName} is due on ${emi.nextDueDate.toLocaleDateString()}`,
      { emiId: emi._id }
    );
    if (emi.userId.email) {
      await sendEmail({
        to: emi.userId.email,
        subject: 'EMI Due Reminder',
        html: `<p>Hi ${emi.userId.name}, your EMI of ₹${emi.emiAmount} for ${emi.loanName} is due tomorrow.</p>`,
      });
    }
  }
}

export async function sendMonthlySummary(userId) {
  const user = await User.findById(userId);
  if (!user) return;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [expenses, income] = await Promise.all([
    Expense.aggregate([
      { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Income.aggregate([
      { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const totalExp = expenses[0]?.total || 0;
  const totalInc = income[0]?.total || 0;
  const message = `Last month: Income ₹${totalInc}, Expenses ₹${totalExp}, Savings ₹${totalInc - totalExp}`;

  await createNotification(userId, 'monthly_summary', 'Monthly Summary', message);
  if (user.email) {
    await sendEmail({
      to: user.email,
      subject: 'Monthly Financial Summary',
      html: `<p>Hi ${user.name},</p><p>${message}</p>`,
    });
  }
}

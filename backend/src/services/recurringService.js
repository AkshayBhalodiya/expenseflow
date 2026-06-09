import RecurringTransaction from '../models/RecurringTransaction.js';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';

function getNextRunDate(current, frequency) {
  const next = new Date(current);
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

export async function processRecurringTransactions() {
  const now = new Date();
  const due = await RecurringTransaction.find({
    isActive: true,
    nextRunDate: { $lte: now },
    $or: [{ endDate: null }, { endDate: { $gte: now } }],
  });

  for (const recurring of due) {
    if (recurring.type === 'expense') {
      await Expense.create({
        userId: recurring.userId,
        title: recurring.title,
        amount: recurring.amount,
        category: recurring.category || 'Others',
        date: now,
        notes: recurring.notes,
        paymentMethod: recurring.paymentMethod,
        isRecurring: true,
        recurringId: recurring._id,
      });
    } else {
      await Income.create({
        userId: recurring.userId,
        source: recurring.source || 'other',
        amount: recurring.amount,
        date: now,
        notes: recurring.notes,
      });
    }

    recurring.lastRunDate = now;
    recurring.nextRunDate = getNextRunDate(recurring.nextRunDate, recurring.frequency);

    if (recurring.endDate && recurring.nextRunDate > recurring.endDate) {
      recurring.isActive = false;
    }

    await recurring.save();
  }

  return due.length;
}

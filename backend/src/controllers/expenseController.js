import Expense from '../models/Expense.js';
import CreditCard from '../models/CreditCard.js';
import { expenseSchema } from '../utils/validators.js';
import { logActivity } from '../utils/helpers.js';
import { checkBudgetAlerts } from '../services/notificationService.js';
import { extractReceiptData } from '../services/ocrService.js';
import { getMonthYear } from '../utils/helpers.js';
import { syncExpenseToCard, removeExpenseFromCard } from '../services/creditCardService.js';

async function validateCardExpense(userId, data) {
  if (data.paymentMethod !== 'card' || !data.creditCardId) return;
  const card = await CreditCard.findOne({ _id: data.creditCardId, userId, isActive: true });
  if (!card) throw new Error('Credit card not found');
  const available = card.creditLimit - card.usedAmount;
  if (data.amount > available) {
    throw new Error(`Insufficient credit. Available: ${available}, Required: ${data.amount}`);
  }
}

export async function getExpenses(req, res, next) {
  try {
    const { page = 1, limit = 20, category, startDate, endDate, minAmount, maxAmount, search } = req.query;
    const filter = { userId: req.user._id };

    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = +minAmount;
      if (maxAmount) filter.amount.$lte = +maxAmount;
    }

    const expenses = await Expense.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .sort({ date: -1 });

    const total = await Expense.countDocuments(filter);
    res.json({ success: true, data: expenses, pagination: { page: +page, limit: +limit, total } });
  } catch (error) {
    next(error);
  }
}

export async function getExpenseById(req, res, next) {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
}

export async function createExpense(req, res, next) {
  try {
    const data = expenseSchema.parse(req.body);
    if (data.paymentMethod === 'card' && !data.creditCardId) {
      return res.status(400).json({ success: false, message: 'Select a credit card for card payment' });
    }
    await validateCardExpense(req.user._id, data);

    const expense = await Expense.create({
      ...data,
      userId: req.user._id,
      creditCardId: data.creditCardId || null,
      receiptUrl: req.file ? `/uploads/${req.file.filename}` : '',
    });

    await syncExpenseToCard(expense);

    const { month, year } = getMonthYear(new Date(data.date));
    await checkBudgetAlerts(req.user._id, data.category, month, year);
    await logActivity(req.user._id, 'create', 'Expense', expense._id, {}, req.ip);

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
}

export async function updateExpense(req, res, next) {
  try {
    const data = expenseSchema.partial().parse(req.body);
    const oldExpense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!oldExpense) return res.status(404).json({ success: false, message: 'Expense not found' });

    const merged = { ...oldExpense.toObject(), ...data };
    if (merged.paymentMethod === 'card' && !merged.creditCardId) {
      return res.status(400).json({ success: false, message: 'Select a credit card for card payment' });
    }

    const update = { ...data };
    if (req.file) update.receiptUrl = `/uploads/${req.file.filename}`;

    if (merged.paymentMethod === 'card' && merged.creditCardId) {
      const card = await CreditCard.findOne({ _id: merged.creditCardId, userId: req.user._id });
      if (!card) return res.status(400).json({ success: false, message: 'Credit card not found' });
      let available = card.creditLimit - card.usedAmount;
      if (oldExpense.creditCardId?.toString() === merged.creditCardId?.toString() && oldExpense.paymentMethod === 'card') {
        available += oldExpense.amount;
      }
      if (merged.amount > available) {
        return res.status(400).json({ success: false, message: `Insufficient credit. Available: ${available}` });
      }
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      update,
      { new: true }
    );

    await syncExpenseToCard(expense, oldExpense);

    await logActivity(req.user._id, 'update', 'Expense', expense._id, {}, req.ip);
    res.json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
}

export async function deleteExpense(req, res, next) {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    await removeExpenseFromCard(expense);
    await expense.deleteOne();
    await logActivity(req.user._id, 'delete', 'Expense', expense._id, {}, req.ip);
    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    next(error);
  }
}

export async function scanReceipt(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Receipt image required' });

    const extracted = await extractReceiptData(req.file.path);
    const autoCreate = req.body.autoCreate === 'true';

    let expense = null;
    if (autoCreate && extracted.amount > 0) {
      expense = await Expense.create({
        userId: req.user._id,
        title: extracted.shopName || 'Receipt Expense',
        amount: extracted.amount,
        category: 'Others',
        date: extracted.date,
        notes: 'Auto-created from receipt scan',
        receiptUrl: `/uploads/${req.file.filename}`,
      });
    }

    res.json({
      success: true,
      data: { extracted, expense, receiptUrl: `/uploads/${req.file.filename}` },
    });
  } catch (error) {
    next(error);
  }
}

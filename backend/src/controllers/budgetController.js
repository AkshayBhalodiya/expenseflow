import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';
import { budgetSchema } from '../utils/validators.js';
import { getMonthYear } from '../utils/helpers.js';

export async function getBudgets(req, res, next) {
  try {
    const { month, year } = req.query;
    const filter = { userId: req.user._id };
    if (month) filter.month = month;
    if (year) filter.year = +year;

    const budgets = await Budget.find(filter).sort({ category: 1 });

    const enriched = await Promise.all(
      budgets.map(async (budget) => {
        const startDate = new Date(budget.year, new Date(`${budget.month} 1, ${budget.year}`).getMonth(), 1);
        const endDate = new Date(budget.year, startDate.getMonth() + 1, 0, 23, 59, 59);
        const spent = await Expense.aggregate([
          { $match: { userId: req.user._id, category: budget.category, date: { $gte: startDate, $lte: endDate } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const spentAmount = spent[0]?.total || 0;
        return {
          ...budget.toObject(),
          spent: spentAmount,
          remaining: budget.amount - spentAmount,
          usagePercent: budget.amount > 0 ? Math.round((spentAmount / budget.amount) * 100) : 0,
        };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
}

export async function createBudget(req, res, next) {
  try {
    const data = budgetSchema.parse(req.body);
    const budget = await Budget.create({ ...data, userId: req.user._id });
    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
}

export async function updateBudget(req, res, next) {
  try {
    const data = budgetSchema.partial().parse(req.body);
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      data,
      { new: true }
    );
    if (!budget) return res.status(404).json({ success: false, message: 'Budget not found' });
    res.json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
}

export async function deleteBudget(req, res, next) {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!budget) return res.status(404).json({ success: false, message: 'Budget not found' });
    res.json({ success: true, message: 'Budget deleted' });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentMonthBudgetSummary(req, res, next) {
  try {
    const { month, year } = getMonthYear();
    req.query.month = month;
    req.query.year = year;
    return getBudgets(req, res, next);
  } catch (error) {
    next(error);
  }
}

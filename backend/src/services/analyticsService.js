import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import EMI from '../models/EMI.js';
import Budget from '../models/Budget.js';
import { getMonthYear } from '../utils/helpers.js';

export async function getDashboardKPIs(userId) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [incomeAgg, expenseAgg, emiAgg, monthlyExpenses, budgets] = await Promise.all([
    Income.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    EMI.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          monthlyEmi: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, '$emiAmount', 0] },
          },
          totalLoan: { $sum: '$totalAmount' },
          loanOutstanding: { $sum: '$remainingBalance' },
          totalEmiPaid: { $sum: { $multiply: ['$paidInstallments', '$emiAmount'] } },
        },
      },
    ]),
    Expense.aggregate([
      { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Budget.find({ userId, ...getMonthYear(now) }),
  ]);

  const totalIncome = incomeAgg[0]?.total || 0;
  const totalExpenses = expenseAgg[0]?.total || 0;
  const monthlyEmi = emiAgg[0]?.monthlyEmi || 0;
  const loanOutstanding = emiAgg[0]?.loanOutstanding || 0;
  const totalEmiPaid = emiAgg[0]?.totalEmiPaid || 0;

  // Gross savings = Income − Expenses (before EMI)
  const grossSavings = totalIncome - totalExpenses;
  // Available balance = what remains after monthly EMI obligation
  const availableBalance = grossSavings - monthlyEmi;

  const monthlyExpense = monthlyExpenses[0]?.total || 0;

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const budgetUsage = totalBudget > 0 ? Math.round((monthlyExpense / totalBudget) * 100) : 0;

  const daysInMonth = now.getDate();
  const avgDailyExpense = daysInMonth > 0 ? monthlyExpense / daysInMonth : 0;

  const yearExpenses = await Expense.aggregate([
    { $match: { userId, date: { $gte: startOfYear } } },
    { $group: { _id: { $month: '$date' }, total: { $sum: '$amount' } } },
  ]);
  const monthsWithData = yearExpenses.length || 1;
  const avgMonthlyExpense = yearExpenses.reduce((s, m) => s + m.total, 0) / monthsWithData;

  return {
    totalIncome,
    totalExpenses,
    // Gross savings (Income − Expenses)
    totalSavings: grossSavings,
    grossSavings,
    // Monthly EMI obligation (active loans)
    totalEmi: monthlyEmi,
    monthlyEmi,
    // Available balance after EMI (Income − Expenses − Monthly EMI)
    remainingBalance: availableBalance,
    availableBalance,
    // Loan principal still owed (separate from cash flow)
    loanOutstanding,
    totalEmiPaid,
    budgetUsage,
    savingsRate: totalIncome > 0 ? Math.round((grossSavings / totalIncome) * 100) : 0,
    expenseRatio: totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0,
    budgetUtilization: budgetUsage,
    avgDailyExpense: Math.round(avgDailyExpense),
    avgMonthlyExpense: Math.round(avgMonthlyExpense),
    netWorth: availableBalance,
    totalLoanAmount: emiAgg[0]?.totalLoan || 0,
    emiRemainingBalance: loanOutstanding,
  };
}

export async function getMonthlyExpenseTrend(userId, months = 6) {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

  const data = await Expense.aggregate([
    { $match: { userId, date: { $gte: startDate } } },
    {
      $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' } },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return data.map((d) => ({
    month: monthNames[d._id.month - 1],
    amount: d.total,
    year: d._id.year,
  }));
}

export async function getCategoryWiseExpenses(userId, startDate, endDate) {
  const match = { userId };
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) match.date.$lte = new Date(endDate);
  }

  const data = await Expense.aggregate([
    { $match: match },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);

  const grandTotal = data.reduce((s, d) => s + d.total, 0);
  return data.map((d) => ({
    category: d._id,
    amount: d.total,
    count: d.count,
    percentage: grandTotal > 0 ? Math.round((d.total / grandTotal) * 100) : 0,
  }));
}

export async function getWeeklyExpenseTrend(userId) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6);
  startDate.setHours(0, 0, 0, 0);

  const data = await Expense.aggregate([
    { $match: { userId, date: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return data.map((d) => ({
    date: d._id,
    day: new Date(d._id).toLocaleDateString('en-US', { weekday: 'short' }),
    amount: d.total,
  }));
}

export async function getDailyExpenseTrend(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days + 1);
  startDate.setHours(0, 0, 0, 0);

  const data = await Expense.aggregate([
    { $match: { userId, date: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return data.map((d) => ({ date: d._id, amount: d.total }));
}

export async function getIncomeVsExpense(userId, startDate, endDate) {
  const match = { userId };
  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const [income, expense] = await Promise.all([
    Income.aggregate([
      { $match: { ...match, ...(Object.keys(dateFilter).length ? { date: dateFilter } : {}) } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Expense.aggregate([
      { $match: { ...match, ...(Object.keys(dateFilter).length ? { date: dateFilter } : {}) } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  return {
    income: income[0]?.total || 0,
    expense: expense[0]?.total || 0,
  };
}

export async function getAnalytics(userId) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [thisMonthExp, lastMonthExp, thisMonthInc, lastMonthInc, topCategories, emiData] =
    await Promise.all([
      Expense.aggregate([
        { $match: { userId, date: { $gte: thisMonthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { userId, date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Income.aggregate([
        { $match: { userId, date: { $gte: thisMonthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Income.aggregate([
        { $match: { userId, date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      getCategoryWiseExpenses(userId, thisMonthStart),
      EMI.find({ userId, isActive: true }),
    ]);

  const currExp = thisMonthExp[0]?.total || 0;
  const prevExp = lastMonthExp[0]?.total || 0;
  const currInc = thisMonthInc[0]?.total || 0;
  const prevInc = lastMonthInc[0]?.total || 0;

  const expenseGrowth = prevExp > 0 ? Math.round(((currExp - prevExp) / prevExp) * 100) : 0;
  const incomeGrowth = prevInc > 0 ? Math.round(((currInc - prevInc) / prevInc) * 100) : 0;
  const savings = currInc - currExp;
  const prevSavings = prevInc - prevExp;
  const savingsGrowth = prevSavings !== 0 ? Math.round(((savings - prevSavings) / Math.abs(prevSavings)) * 100) : 0;
  const totalEmi = emiData.reduce((s, e) => s + e.emiAmount, 0);
  const emiRatio = currInc > 0 ? Math.round((totalEmi / currInc) * 100) : 0;

  return {
    topSpendingCategories: topCategories.slice(0, 5),
    expenseGrowth,
    savingsGrowth,
    incomeGrowth,
    emiRatio,
    currentMonthSavings: savings,
  };
}

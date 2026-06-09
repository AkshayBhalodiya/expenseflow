import Household from '../models/Household.js';
import User from '../models/User.js';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import EMI from '../models/EMI.js';
import CreditCard from '../models/CreditCard.js';
import { getDashboardKPIs } from './analyticsService.js';

export async function getUserHousehold(userId) {
  const user = await User.findById(userId).populate('householdId');
  if (!user?.householdId) return null;
  return Household.findById(user.householdId);
}

export async function getHouseholdMemberIds(userId) {
  const household = await getUserHousehold(userId);
  if (!household) return [userId];
  return household.members.map((m) => m.userId);
}

export async function getMembersWithDetails(household) {
  const userIds = household.members.map((m) => m.userId);
  const users = await User.find({ _id: { $in: userIds } }).select('name email avatar');
  const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));

  return household.members.map((m) => ({
    userId: m.userId,
    role: m.role,
    joinedAt: m.joinedAt,
    name: userMap[m.userId.toString()]?.name || 'Unknown',
    email: userMap[m.userId.toString()]?.email || '',
    avatar: userMap[m.userId.toString()]?.avatar || '',
  }));
}

async function getUserFinancialSummary(userId) {
  const [income, expenses, emi, cards, kpis] = await Promise.all([
    Income.aggregate([{ $match: { userId } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Expense.aggregate([{ $match: { userId } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    EMI.aggregate([
      { $match: { userId, isActive: true } },
      { $group: { _id: null, monthlyEmi: { $sum: '$emiAmount' }, loanOutstanding: { $sum: '$remainingBalance' } } },
    ]),
    CreditCard.aggregate([
      { $match: { userId, isActive: true } },
      { $group: { _id: null, totalLimit: { $sum: '$creditLimit' }, totalUsed: { $sum: '$usedAmount' } } },
    ]),
    getDashboardKPIs(userId),
  ]);

  const totalIncome = income[0]?.total || 0;
  const totalExpenses = expenses[0]?.total || 0;
  const monthlyEmi = emi[0]?.monthlyEmi || 0;
  const loanOutstanding = emi[0]?.loanOutstanding || 0;
  const cardLimit = cards[0]?.totalLimit || 0;
  const cardUsed = cards[0]?.totalUsed || 0;

  return {
    userId,
    totalIncome,
    totalExpenses,
    grossSavings: totalIncome - totalExpenses,
    monthlyEmi,
    availableBalance: totalIncome - totalExpenses - monthlyEmi,
    loanOutstanding,
    cardLimit,
    cardUsed,
    cardAvailable: cardLimit - cardUsed,
    budgetUsage: kpis.budgetUsage,
  };
}

export async function getHouseholdDashboard(userId) {
  const household = await getUserHousehold(userId);
  if (!household) return null;

  const members = await getMembersWithDetails(household);
  const memberSummaries = await Promise.all(
    members.map(async (m) => ({
      ...m,
      ...(await getUserFinancialSummary(m.userId)),
    }))
  );

  const combined = memberSummaries.reduce(
    (acc, m) => ({
      totalIncome: acc.totalIncome + m.totalIncome,
      totalExpenses: acc.totalExpenses + m.totalExpenses,
      grossSavings: acc.grossSavings + m.grossSavings,
      monthlyEmi: acc.monthlyEmi + m.monthlyEmi,
      availableBalance: acc.availableBalance + m.availableBalance,
      loanOutstanding: acc.loanOutstanding + m.loanOutstanding,
      cardLimit: acc.cardLimit + m.cardLimit,
      cardUsed: acc.cardUsed + m.cardUsed,
      cardAvailable: acc.cardAvailable + m.cardAvailable,
    }),
    {
      totalIncome: 0,
      totalExpenses: 0,
      grossSavings: 0,
      monthlyEmi: 0,
      availableBalance: 0,
      loanOutstanding: 0,
      cardLimit: 0,
      cardUsed: 0,
      cardAvailable: 0,
    }
  );

  combined.memberCount = members.length;
  combined.cardUtilization = combined.cardLimit > 0
    ? Math.round((combined.cardUsed / combined.cardLimit) * 100)
    : 0;

  return {
    household: {
      _id: household._id,
      name: household.name,
      inviteCode: household.inviteCode,
      ownerId: household.ownerId,
    },
    combined,
    members: memberSummaries,
  };
}

export async function getHouseholdExpenses(userId) {
  const memberIds = await getHouseholdMemberIds(userId);
  const expenses = await Expense.find({ userId: { $in: memberIds } })
    .populate('userId', 'name email')
    .sort({ date: -1 })
    .limit(100);
  return expenses;
}

export async function getHouseholdIncome(userId) {
  const memberIds = await getHouseholdMemberIds(userId);
  const income = await Income.find({ userId: { $in: memberIds } })
    .populate('userId', 'name email')
    .sort({ date: -1 })
    .limit(100);
  return income;
}

export async function getHouseholdCharts(memberIds) {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [monthlyTrend, categoryWise, incomeVsExpense] = await Promise.all([
    Expense.aggregate([
      { $match: { userId: { $in: memberIds }, date: { $gte: startDate } } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Expense.aggregate([
      { $match: { userId: { $in: memberIds } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    Promise.all([
      Income.aggregate([{ $match: { userId: { $in: memberIds } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $match: { userId: { $in: memberIds } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]),
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const grandTotal = categoryWise.reduce((s, d) => s + d.total, 0);

  const startWeek = new Date();
  startWeek.setDate(startWeek.getDate() - 6);
  startWeek.setHours(0, 0, 0, 0);

  const [weeklyTrend, dailyTrend] = await Promise.all([
    Expense.aggregate([
      { $match: { userId: { $in: memberIds }, date: { $gte: startWeek } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
    ]),
    Expense.aggregate([
      { $match: { userId: { $in: memberIds }, date: { $gte: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    monthlyTrend: monthlyTrend.map((d) => ({
      month: monthNames[d._id.month - 1],
      amount: d.total,
    })),
    categoryWise: categoryWise.map((d) => ({
      category: d._id,
      amount: d.total,
      percentage: grandTotal > 0 ? Math.round((d.total / grandTotal) * 100) : 0,
    })),
    incomeVsExpense: {
      income: incomeVsExpense[0][0]?.total || 0,
      expense: incomeVsExpense[1][0]?.total || 0,
    },
    weeklyTrend: weeklyTrend.map((d) => ({
      date: d._id,
      day: new Date(d._id).toLocaleDateString('en-US', { weekday: 'short' }),
      amount: d.total,
    })),
    dailyTrend: dailyTrend.map((d) => ({ date: d._id, amount: d.total })),
  };
}

export async function getHouseholdCreditCards(userId) {
  const memberIds = await getHouseholdMemberIds(userId);
  const cards = await CreditCard.find({ userId: { $in: memberIds }, isActive: true })
    .populate('userId', 'name email');
  return cards.map((c) => ({
    ...c.toObject(),
    availableCredit: c.availableCredit,
    utilizationPercent: c.utilizationPercent,
    ownerName: c.userId?.name,
  }));
}

export async function getHouseholdEmis(userId) {
  const memberIds = await getHouseholdMemberIds(userId);
  const emis = await EMI.find({ userId: { $in: memberIds } })
    .populate('userId', 'name email')
    .sort({ nextDueDate: 1 });
  return emis;
}

import {
  getDashboardKPIs,
  getMonthlyExpenseTrend,
  getCategoryWiseExpenses,
  getWeeklyExpenseTrend,
  getDailyExpenseTrend,
  getIncomeVsExpense,
  getAnalytics,
} from '../services/analyticsService.js';

export async function getDashboard(req, res, next) {
  try {
    const userId = req.user._id;
    const scope = req.query.scope || 'personal';

    if (scope === 'household') {
      const { getHouseholdDashboard, getHouseholdMemberIds, getHouseholdCharts } =
        await import('../services/householdService.js');
      const householdData = await getHouseholdDashboard(userId);
      if (!householdData) {
        return res.status(404).json({ success: false, message: 'Create or join a household first' });
      }
      const memberIds = await getHouseholdMemberIds(userId);
      const charts = await getHouseholdCharts(memberIds);
      return res.json({
        success: true,
        data: {
          scope: 'household',
          household: householdData.household,
          kpis: householdData.combined,
          members: householdData.members,
          charts,
        },
      });
    }

    const [kpis, monthlyTrend, categoryWise, weeklyTrend, dailyTrend, incomeVsExpense] =
      await Promise.all([
        getDashboardKPIs(userId),
        getMonthlyExpenseTrend(userId),
        getCategoryWiseExpenses(userId),
        getWeeklyExpenseTrend(userId),
        getDailyExpenseTrend(userId, 30),
        getIncomeVsExpense(userId),
      ]);

    res.json({
      success: true,
      data: { scope: 'personal', kpis, charts: { monthlyTrend, categoryWise, weeklyTrend, dailyTrend, incomeVsExpense } },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAnalyticsData(req, res, next) {
  try {
    const analytics = await getAnalytics(req.user._id);
    res.json({ success: true, data: analytics });
  } catch (error) {
    next(error);
  }
}

export async function getChartData(req, res, next) {
  try {
    const { type, startDate, endDate } = req.query;
    const userId = req.user._id;
    let data;

    switch (type) {
      case 'monthly':
        data = await getMonthlyExpenseTrend(userId);
        break;
      case 'weekly':
        data = await getWeeklyExpenseTrend(userId);
        break;
      case 'daily':
        data = await getDailyExpenseTrend(userId);
        break;
      case 'category':
        data = await getCategoryWiseExpenses(userId, startDate, endDate);
        break;
      case 'income-vs-expense':
        data = await getIncomeVsExpense(userId, startDate, endDate);
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid chart type' });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface ApiOptions extends RequestInit {
  token?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: { page: number; limit: number; total: number };
  unreadCount?: number;
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  private setTokens(accessToken: string, refreshToken?: string) {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const token = options.token || this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) headers['Authorization'] = `Bearer ${token}`;

    let response: Response;
    try {
      response = await fetch(`${API_URL}${endpoint}`, { ...options, headers, credentials: 'include' });
    } catch {
      throw new Error('Cannot connect to server. Make sure backend is running: cd backend && npm run dev');
    }

    if (response.status === 401 && token) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.getToken()}`;
        try {
          response = await fetch(`${API_URL}${endpoint}`, { ...options, headers, credentials: 'include' });
        } catch {
          throw new Error('Cannot connect to server. Make sure backend is running on port 5000.');
        }
      }
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request failed (${response.status})`);
    }

    return data;
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await res.json();
      if (res.ok && data.data?.accessToken) {
        this.setTokens(data.data.accessToken);
        return true;
      }
    } catch {
      // ignore
    }
    this.clearTokens();
    return false;
  }

  // Auth
  login = (email: string, password: string) =>
    this.request<{ success: boolean; data: { user: User; accessToken: string; refreshToken: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    );

  register = (name: string, email: string, password: string) =>
    this.request<{ success: boolean; data: { user: User; accessToken: string; refreshToken: string } }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ name, email, password }) }
    );

  logout = () => {
    const refreshToken = this.getRefreshToken();
    return this.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  };

  getProfile = () => this.request<{ success: boolean; data: User }>('/auth/profile');
  updateProfile = (data: Partial<User>) =>
    this.request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) });
  changePassword = (currentPassword: string, newPassword: string) =>
    this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  forgotPassword = (email: string) =>
    this.request<{ success: boolean; message: string; previewUrl?: string; devResetUrl?: string }>(
      '/auth/forgot-password',
      { method: 'POST', body: JSON.stringify({ email }) }
    );
  resetPassword = (token: string, password: string) =>
    this.request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) });

  // Dashboard & Analytics
  getDashboard = (scope: 'personal' | 'household' = 'personal') =>
    this.request<{ success: boolean; data: DashboardData }>(`/analytics/dashboard?scope=${scope}`);
  getAnalytics = () => this.request<ApiResponse<AnalyticsData>>('/analytics');
  getChartData = (type: string, params?: Record<string, string>) => {
    const query = new URLSearchParams({ type, ...params }).toString();
    return this.request<ApiResponse<unknown>>(`/analytics/charts?${query}`);
  };

  // Expenses
  getExpenses = (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<ApiResponse<Expense[]>>(`/expenses${query}`);
  };
  createExpense = (data: FormData | object) =>
    this.request('/expenses', {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  updateExpense = (id: string, data: FormData | object) =>
    this.request(`/expenses/${id}`, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  deleteExpense = (id: string) => this.request(`/expenses/${id}`, { method: 'DELETE' });
  scanReceipt = (file: File, autoCreate = false) => {
    const form = new FormData();
    form.append('receipt', file);
    form.append('autoCreate', String(autoCreate));
    return this.request<ApiResponse<{ extracted: ReceiptExtracted; expense: Expense | null; receiptUrl: string }>>(
      '/expenses/scan-receipt',
      { method: 'POST', body: form }
    );
  };

  // Income
  getIncome = (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<ApiResponse<Income[]>>(`/income${query}`);
  };
  createIncome = (data: object) => this.request('/income', { method: 'POST', body: JSON.stringify(data) });
  updateIncome = (id: string, data: object) =>
    this.request(`/income/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  deleteIncome = (id: string) => this.request(`/income/${id}`, { method: 'DELETE' });

  // EMI
  getEMIs = () => this.request<ApiResponse<EMI[]>>('/emi');
  getEMIDashboard = () => this.request<ApiResponse<EMIDashboard>>('/emi/dashboard');
  createEMI = (data: object) => this.request('/emi', { method: 'POST', body: JSON.stringify(data) });
  payEMI = (id: string) => this.request(`/emi/${id}/pay`, { method: 'POST' });
  deleteEMI = (id: string) => this.request(`/emi/${id}`, { method: 'DELETE' });

  // Budgets
  getBudgets = (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<ApiResponse<Budget[]>>(`/budgets${query}`);
  };
  createBudget = (data: object) => this.request('/budgets', { method: 'POST', body: JSON.stringify(data) });
  deleteBudget = (id: string) => this.request(`/budgets/${id}`, { method: 'DELETE' });

  // Goals
  getGoals = () => this.request<ApiResponse<Goal[]>>('/goals');
  createGoal = (data: object) => this.request('/goals', { method: 'POST', body: JSON.stringify(data) });
  addToGoal = (id: string, amount: number) =>
    this.request(`/goals/${id}/add`, { method: 'POST', body: JSON.stringify({ amount }) });
  deleteGoal = (id: string) => this.request(`/goals/${id}`, { method: 'DELETE' });

  // Categories
  getCategories = () => this.request('/categories');
  createCategory = (data: object) => this.request('/categories', { method: 'POST', body: JSON.stringify(data) });

  // Notifications
  getNotifications = () => this.request<ApiResponse<NotificationItem[]>>('/notifications');
  markAllRead = () => this.request('/notifications/read-all', { method: 'PATCH' });

  // Reports
  getReport = (params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return this.request<ApiResponse<ReportData>>(`/reports?${query}`);
  };
  exportReport = async (params: Record<string, string>) => {
    const token = this.getToken();
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/reports/export?${query}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.blob();
  };

  // Recurring
  getRecurring = () => this.request<ApiResponse<RecurringTransaction[]>>('/recurring');
  createRecurring = (data: object) =>
    this.request('/recurring', { method: 'POST', body: JSON.stringify(data) });
  toggleRecurring = (id: string) => this.request(`/recurring/${id}/toggle`, { method: 'PATCH' });
  deleteRecurring = (id: string) => this.request(`/recurring/${id}`, { method: 'DELETE' });

  // Household / Home
  getHousehold = () => this.request<ApiResponse<HouseholdInfo | null>>('/household');
  createHousehold = (name: string) =>
    this.request('/household', { method: 'POST', body: JSON.stringify({ name }) });
  joinHousehold = (inviteCode: string) =>
    this.request('/household/join', { method: 'POST', body: JSON.stringify({ inviteCode }) });
  leaveHousehold = () => this.request('/household/leave', { method: 'POST' });
  updateHousehold = (name: string) =>
    this.request('/household', { method: 'PUT', body: JSON.stringify({ name }) });
  removeHouseholdMember = (memberId: string) =>
    this.request(`/household/members/${memberId}`, { method: 'DELETE' });
  getHouseholdExpenses = () => this.request<ApiResponse<HouseholdExpense[]>>('/household/expenses');
  getHouseholdIncome = () => this.request<ApiResponse<HouseholdIncome[]>>('/household/income');
  getHouseholdCreditCards = () => this.request<ApiResponse<HouseholdCreditCard[]>>('/household/credit-cards');
  getHouseholdEMIs = () => this.request<ApiResponse<HouseholdEMI[]>>('/household/emis');
  getHouseholdDashboard = () =>
    this.request<ApiResponse<{ household: { _id: string; name: string; inviteCode: string }; combined: DashboardData['kpis']; members: MemberSummary[] }>>('/household/dashboard');

  // Credit Cards
  getCreditCards = () => this.request<ApiResponse<CreditCardType[]>>('/credit-cards');
  getCreditCardDashboard = () => this.request<ApiResponse<CreditCardDashboard>>('/credit-cards/dashboard');
  createCreditCard = (data: object) =>
    this.request('/credit-cards', { method: 'POST', body: JSON.stringify(data) });
  updateCreditCard = (id: string, data: object) =>
    this.request(`/credit-cards/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  deleteCreditCard = (id: string) => this.request(`/credit-cards/${id}`, { method: 'DELETE' });
  payCreditCard = (id: string, data: object) =>
    this.request(`/credit-cards/${id}/pay`, { method: 'POST', body: JSON.stringify(data) });
  getCreditCardPayments = (id: string) =>
    this.request<ApiResponse<CreditCardPayment[]>>(`/credit-cards/${id}/payments`);
  getCreditCardTransactions = (id: string) =>
    this.request<ApiResponse<Expense[]>>(`/credit-cards/${id}/transactions`);

  // Activity
  getActivityHistory = () => this.request<ApiResponse<ActivityLog[]>>('/users/activity');

  // Admin
  getAllUsers = () => this.request<ApiResponse<AdminUser[]>>('/users');
  getAllExpensesAdmin = () => this.request<ApiResponse<AdminExpense[]>>('/users/expenses/all');
  exportUserData = () => this.request<ApiResponse<Record<string, unknown>>>('/users/export');
}

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
  currency?: string;
  theme?: 'light' | 'dark' | 'system';
  mobile?: string;
  timezone?: string;
  isEmailVerified?: boolean;
}

export interface HouseholdInfo {
  _id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
  isOwner: boolean;
  members: { userId: string; name: string; email: string; role: string }[];
}

export interface HouseholdExpense extends Expense {
  userId?: { name?: string; email?: string };
}

export interface HouseholdIncome extends Income {
  userId?: { name?: string; email?: string };
}

export interface HouseholdEMI extends EMI {
  userId?: { name?: string; email?: string };
}

export interface HouseholdCreditCard extends CreditCardType {
  ownerName?: string;
  userId?: { name?: string; email?: string };
}

export interface MemberSummary {
  userId: string;
  name: string;
  email?: string;
  role?: string;
  totalIncome: number;
  totalExpenses: number;
  grossSavings: number;
  monthlyEmi: number;
  availableBalance: number;
  loanOutstanding: number;
  cardLimit: number;
  cardUsed: number;
  cardAvailable: number;
}

export interface DashboardData {
  scope?: 'personal' | 'household';
  household?: { _id: string; name: string; inviteCode: string };
  members?: MemberSummary[];
  kpis: {
    totalIncome: number;
    totalExpenses: number;
    totalSavings: number;
    grossSavings: number;
    totalEmi: number;
    monthlyEmi: number;
    remainingBalance: number;
    availableBalance: number;
    loanOutstanding: number;
    emiRemainingBalance: number;
    totalEmiPaid: number;
    budgetUsage: number;
    savingsRate: number;
    expenseRatio: number;
    avgDailyExpense: number;
    avgMonthlyExpense: number;
    memberCount?: number;
    cardLimit?: number;
    cardUsed?: number;
    cardAvailable?: number;
    cardUtilization?: number;
  };
  charts: {
    monthlyTrend: { month: string; amount: number }[];
    categoryWise: { category: string; amount: number; percentage: number }[];
    weeklyTrend: { day: string; amount: number; date: string }[];
    dailyTrend: { date: string; amount: number }[];
    incomeVsExpense: { income: number; expense: number };
  };
}

export interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  paymentMethod: string;
  creditCardId?: string;
}

export interface Income {
  _id: string;
  source: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface EMI {
  _id: string;
  loanName: string;
  totalAmount: number;
  emiAmount: number;
  remainingBalance: number;
  paidInstallments: number;
  totalInstallments: number;
  nextDueDate: string;
  isActive: boolean;
}

export interface EMIDashboard {
  totalLoanAmount: number;
  totalPaid: number;
  remainingBalance: number;
  upcomingEmi: { loanName: string; amount: number; dueDate: string } | null;
  activeLoans: number;
}

export interface Budget {
  _id: string;
  category: string;
  amount: number;
  spent: number;
  remaining: number;
  usagePercent: number;
  month: string;
  year: number;
}

export interface Goal {
  _id: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
}

export interface AnalyticsData {
  topSpendingCategories: { category: string; amount: number; percentage: number }[];
  expenseGrowth: number;
  savingsGrowth: number;
  incomeGrowth: number;
  emiRatio: number;
  currentMonthSavings: number;
}

export interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ReportData {
  period: string;
  startDate: string;
  endDate: string;
  expenses: Record<string, unknown>[];
  income: Record<string, unknown>[];
  emis: Record<string, unknown>[];
  summary: {
    totalExpenses: number;
    totalIncome: number;
    totalEmi: number;
    netSavings: number;
    expenseCount: number;
    incomeCount: number;
  };
}

export interface ReceiptExtracted {
  shopName: string;
  amount: number;
  date: string;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface AdminExpense {
  _id: string;
  title: string;
  amount: number;
  date: string;
  userId?: { name?: string };
}

export interface RecurringTransaction {
  _id: string;
  type: 'expense' | 'income';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  title: string;
  amount: number;
  category?: string;
  source?: string;
  paymentMethod?: string;
  notes?: string;
  startDate: string;
  endDate?: string;
  nextRunDate: string;
  isActive: boolean;
  lastRunDate?: string;
}

export interface CreditCardType {
  _id: string;
  cardName: string;
  bankName: string;
  lastFourDigits: string;
  creditLimit: number;
  usedAmount: number;
  availableCredit: number;
  utilizationPercent: number;
  billingCycleDay: number;
  paymentDueDay: number;
  color: string;
  isActive: boolean;
}

export interface CreditCardDashboard {
  totalCards: number;
  totalLimit: number;
  totalUsed: number;
  totalAvailable: number;
  utilization: number;
  cards: CreditCardType[];
}

export interface CreditCardPayment {
  _id: string;
  amount: number;
  paymentDate: string;
  notes?: string;
}

export interface ActivityLog {
  _id: string;
  action: string;
  entity: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export const api = new ApiClient();

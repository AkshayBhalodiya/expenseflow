import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const expenseSchema = z.object({
  title: z.string().min(1).max(200),
  amount: z.number().positive(),
  category: z.string().min(1),
  date: z.coerce.date(),
  notes: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'bank_transfer', 'other']).optional(),
  creditCardId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

export const incomeSchema = z.object({
  source: z.enum(['salary', 'freelancing', 'business', 'investment', 'other']),
  amount: z.number().positive(),
  date: z.coerce.date(),
  notes: z.string().optional(),
});

export const emiSchema = z.object({
  loanName: z.string().min(1),
  totalAmount: z.number().positive(),
  interestRate: z.number().min(0).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  emiAmount: z.number().positive(),
  totalInstallments: z.number().int().positive(),
});

export const budgetSchema = z.object({
  category: z.string().min(1),
  amount: z.number().positive(),
  month: z.string().min(1),
  year: z.number().int(),
});

export const goalSchema = z.object({
  goalName: z.string().min(1),
  targetAmount: z.number().positive(),
  currentAmount: z.number().min(0).optional(),
  targetDate: z.coerce.date().optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2).optional(),
  mobile: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

export const creditCardSchema = z.object({
  cardName: z.string().min(1),
  bankName: z.string().min(1),
  lastFourDigits: z.string().length(4).optional(),
  creditLimit: z.number().positive(),
  billingCycleDay: z.number().int().min(1).max(28).optional(),
  paymentDueDay: z.number().int().min(1).max(28).optional(),
  color: z.string().optional(),
});

export const creditCardPaymentSchema = z.object({
  amount: z.number().positive(),
  paymentDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const recurringSchema = z.object({
  type: z.enum(['expense', 'income']),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  title: z.string().min(1),
  amount: z.number().positive(),
  category: z.string().optional(),
  source: z.string().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
});

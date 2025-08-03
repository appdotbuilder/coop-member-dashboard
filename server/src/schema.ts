
import { z } from 'zod';

// Member schema
export const memberSchema = z.object({
  id: z.number(),
  member_number: z.string(),
  name: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Member = z.infer<typeof memberSchema>;

// Savings schema
export const savingsSchema = z.object({
  id: z.number(),
  member_id: z.number(),
  type: z.enum(['simpanan_pokok', 'simpanan_wajib', 'simpanan_sukarela']),
  amount: z.number(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Savings = z.infer<typeof savingsSchema>;

// Loan schema
export const loanSchema = z.object({
  id: z.number(),
  member_id: z.number(),
  name: z.string(),
  amount: z.number(),
  remaining_amount: z.number(),
  monthly_payment: z.number(),
  status: z.enum(['active', 'completed', 'overdue']),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Loan = z.infer<typeof loanSchema>;

// Transaction schema
export const transactionSchema = z.object({
  id: z.number(),
  member_id: z.number(),
  type: z.enum(['income', 'expense']),
  category: z.enum(['loan_payment', 'savings_deposit', 'loan_disbursement', 'withdrawal']),
  title: z.string(),
  subtitle: z.string().nullable(),
  amount: z.number(),
  created_at: z.coerce.date()
});

export type Transaction = z.infer<typeof transactionSchema>;

// Product schema
export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  status: z.enum(['promo', 'baru', 'regular']),
  image_url: z.string().nullable(),
  description: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Product = z.infer<typeof productSchema>;

// Notification schema
export const notificationSchema = z.object({
  id: z.number(),
  member_id: z.number(),
  title: z.string(),
  message: z.string(),
  is_read: z.boolean(),
  created_at: z.coerce.date()
});

export type Notification = z.infer<typeof notificationSchema>;

// Dashboard data schema
export const dashboardDataSchema = z.object({
  member: memberSchema,
  totalSavings: z.number(),
  savingsBreakdown: z.array(z.object({
    type: z.enum(['simpanan_pokok', 'simpanan_wajib', 'simpanan_sukarela']),
    amount: z.number()
  })),
  totalLoans: z.number(),
  loans: z.array(loanSchema),
  recentTransactions: z.array(transactionSchema),
  unreadNotifications: z.number()
});

export type DashboardData = z.infer<typeof dashboardDataSchema>;

// API Input schemas
export const getMemberDashboardInputSchema = z.object({
  memberId: z.number()
});

export type GetMemberDashboardInput = z.infer<typeof getMemberDashboardInputSchema>;

export const getTransactionsInputSchema = z.object({
  memberId: z.number(),
  limit: z.number().optional().default(10),
  offset: z.number().optional().default(0)
});

export type GetTransactionsInput = z.infer<typeof getTransactionsInputSchema>;

export const getProductsInputSchema = z.object({
  limit: z.number().optional().default(10),
  offset: z.number().optional().default(0),
  status: z.enum(['promo', 'baru', 'regular']).optional()
});

export type GetProductsInput = z.infer<typeof getProductsInputSchema>;

export const getNotificationsInputSchema = z.object({
  memberId: z.number(),
  limit: z.number().optional().default(10),
  offset: z.number().optional().default(0)
});

export type GetNotificationsInput = z.infer<typeof getNotificationsInputSchema>;

export const markNotificationReadInputSchema = z.object({
  notificationId: z.number(),
  memberId: z.number()
});

export type MarkNotificationReadInput = z.infer<typeof markNotificationReadInputSchema>;

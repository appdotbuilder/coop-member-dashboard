
import { serial, text, pgTable, timestamp, numeric, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const savingsTypeEnum = pgEnum('savings_type', ['simpanan_pokok', 'simpanan_wajib', 'simpanan_sukarela']);
export const loanStatusEnum = pgEnum('loan_status', ['active', 'completed', 'overdue']);
export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense']);
export const transactionCategoryEnum = pgEnum('transaction_category', ['loan_payment', 'savings_deposit', 'loan_disbursement', 'withdrawal']);
export const productStatusEnum = pgEnum('product_status', ['promo', 'baru', 'regular']);

// Members table
export const membersTable = pgTable('members', {
  id: serial('id').primaryKey(),
  member_number: text('member_number').notNull().unique(),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Savings table
export const savingsTable = pgTable('savings', {
  id: serial('id').primaryKey(),
  member_id: integer('member_id').notNull().references(() => membersTable.id),
  type: savingsTypeEnum('type').notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Loans table
export const loansTable = pgTable('loans', {
  id: serial('id').primaryKey(),
  member_id: integer('member_id').notNull().references(() => membersTable.id),
  name: text('name').notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  remaining_amount: numeric('remaining_amount', { precision: 15, scale: 2 }).notNull(),
  monthly_payment: numeric('monthly_payment', { precision: 15, scale: 2 }).notNull(),
  status: loanStatusEnum('status').notNull().default('active'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Transactions table
export const transactionsTable = pgTable('transactions', {
  id: serial('id').primaryKey(),
  member_id: integer('member_id').notNull().references(() => membersTable.id),
  type: transactionTypeEnum('type').notNull(),
  category: transactionCategoryEnum('category').notNull(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Products table
export const productsTable = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  price: numeric('price', { precision: 15, scale: 2 }).notNull(),
  status: productStatusEnum('status').notNull().default('regular'),
  image_url: text('image_url'),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Notifications table
export const notificationsTable = pgTable('notifications', {
  id: serial('id').primaryKey(),
  member_id: integer('member_id').notNull().references(() => membersTable.id),
  title: text('title').notNull(),
  message: text('message').notNull(),
  is_read: boolean('is_read').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Relations
export const membersRelations = relations(membersTable, ({ many }) => ({
  savings: many(savingsTable),
  loans: many(loansTable),
  transactions: many(transactionsTable),
  notifications: many(notificationsTable)
}));

export const savingsRelations = relations(savingsTable, ({ one }) => ({
  member: one(membersTable, {
    fields: [savingsTable.member_id],
    references: [membersTable.id]
  })
}));

export const loansRelations = relations(loansTable, ({ one }) => ({
  member: one(membersTable, {
    fields: [loansTable.member_id],
    references: [membersTable.id]
  })
}));

export const transactionsRelations = relations(transactionsTable, ({ one }) => ({
  member: one(membersTable, {
    fields: [transactionsTable.member_id],
    references: [membersTable.id]
  })
}));

export const notificationsRelations = relations(notificationsTable, ({ one }) => ({
  member: one(membersTable, {
    fields: [notificationsTable.member_id],
    references: [membersTable.id]
  })
}));

// Export all tables for relation queries
export const tables = {
  members: membersTable,
  savings: savingsTable,
  loans: loansTable,
  transactions: transactionsTable,
  products: productsTable,
  notifications: notificationsTable
};

// TypeScript types for the table schemas
export type Member = typeof membersTable.$inferSelect;
export type NewMember = typeof membersTable.$inferInsert;
export type Savings = typeof savingsTable.$inferSelect;
export type NewSavings = typeof savingsTable.$inferInsert;
export type Loan = typeof loansTable.$inferSelect;
export type NewLoan = typeof loansTable.$inferInsert;
export type Transaction = typeof transactionsTable.$inferSelect;
export type NewTransaction = typeof transactionsTable.$inferInsert;
export type Product = typeof productsTable.$inferSelect;
export type NewProduct = typeof productsTable.$inferInsert;
export type Notification = typeof notificationsTable.$inferSelect;
export type NewNotification = typeof notificationsTable.$inferInsert;

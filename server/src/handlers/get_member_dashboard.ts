
import { db } from '../db';
import { membersTable, savingsTable, loansTable, transactionsTable, notificationsTable } from '../db/schema';
import { type GetMemberDashboardInput, type DashboardData } from '../schema';
import { eq, desc, sum, count, and } from 'drizzle-orm';

export async function getMemberDashboard(input: GetMemberDashboardInput): Promise<DashboardData> {
  try {
    // Fetch member information
    const memberResult = await db.select()
      .from(membersTable)
      .where(eq(membersTable.id, input.memberId))
      .execute();

    if (memberResult.length === 0) {
      throw new Error(`Member with ID ${input.memberId} not found`);
    }

    const member = memberResult[0];

    // Fetch savings breakdown by type
    const savingsResult = await db.select({
      type: savingsTable.type,
      amount: sum(savingsTable.amount)
    })
      .from(savingsTable)
      .where(eq(savingsTable.member_id, input.memberId))
      .groupBy(savingsTable.type)
      .execute();

    // Convert savings amounts to numbers and calculate total
    const savingsBreakdown = savingsResult.map(saving => ({
      type: saving.type,
      amount: parseFloat(saving.amount || '0')
    }));

    const totalSavings = savingsBreakdown.reduce((total, saving) => total + saving.amount, 0);

    // Fetch active loans
    const loansResult = await db.select()
      .from(loansTable)
      .where(eq(loansTable.member_id, input.memberId))
      .orderBy(desc(loansTable.created_at))
      .execute();

    // Convert loan amounts to numbers and calculate total remaining
    const loans = loansResult.map(loan => ({
      ...loan,
      amount: parseFloat(loan.amount),
      remaining_amount: parseFloat(loan.remaining_amount),
      monthly_payment: parseFloat(loan.monthly_payment)
    }));

    const totalLoans = loans.reduce((total, loan) => total + loan.remaining_amount, 0);

    // Fetch recent transactions (last 5)
    const transactionsResult = await db.select()
      .from(transactionsTable)
      .where(eq(transactionsTable.member_id, input.memberId))
      .orderBy(desc(transactionsTable.created_at))
      .limit(5)
      .execute();

    // Convert transaction amounts to numbers
    const recentTransactions = transactionsResult.map(transaction => ({
      ...transaction,
      amount: parseFloat(transaction.amount)
    }));

    // Count unread notifications
    const unreadNotificationsResult = await db.select({
      count: count()
    })
      .from(notificationsTable)
      .where(and(
        eq(notificationsTable.member_id, input.memberId),
        eq(notificationsTable.is_read, false)
      ))
      .execute();

    const unreadNotifications = unreadNotificationsResult[0]?.count || 0;

    const dashboardData: DashboardData = {
      member,
      totalSavings,
      savingsBreakdown,
      totalLoans,
      loans,
      recentTransactions,
      unreadNotifications
    };

    return dashboardData;
  } catch (error) {
    console.error('Failed to fetch member dashboard:', error);
    throw error;
  }
}

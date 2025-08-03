
import { db } from '../db';
import { transactionsTable } from '../db/schema';
import { type GetTransactionsInput, type Transaction } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getTransactions = async (input: GetTransactionsInput): Promise<Transaction[]> => {
  try {
    // Build query with member filter, ordered by creation date (newest first), with pagination
    const results = await db.select()
      .from(transactionsTable)
      .where(eq(transactionsTable.member_id, input.memberId))
      .orderBy(desc(transactionsTable.created_at))
      .limit(input.limit)
      .offset(input.offset)
      .execute();

    // Convert numeric fields back to numbers
    return results.map(transaction => ({
      ...transaction,
      amount: parseFloat(transaction.amount)
    }));
  } catch (error) {
    console.error('Get transactions failed:', error);
    throw error;
  }
};

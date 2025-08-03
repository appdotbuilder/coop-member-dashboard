
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { membersTable, transactionsTable } from '../db/schema';
import { type GetTransactionsInput } from '../schema';
import { getTransactions } from '../handlers/get_transactions';

describe('getTransactions', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return transactions for a member', async () => {
    // Create test member
    const memberResult = await db.insert(membersTable)
      .values({
        member_number: 'M001',
        name: 'Test Member',
        phone: '123456789',
        email: 'test@example.com'
      })
      .returning()
      .execute();

    const memberId = memberResult[0].id;

    // Create test transactions with slight delay to ensure distinct timestamps
    const firstTransaction = await db.insert(transactionsTable)
      .values({
        member_id: memberId,
        type: 'expense',
        category: 'loan_payment',
        title: 'Loan Payment',
        subtitle: 'Monthly payment',
        amount: '150000'
      })
      .returning()
      .execute();

    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    const secondTransaction = await db.insert(transactionsTable)
      .values({
        member_id: memberId,
        type: 'income',
        category: 'savings_deposit',
        title: 'Savings Deposit',
        subtitle: null,
        amount: '25000'
      })
      .returning()
      .execute();

    const input: GetTransactionsInput = {
      memberId: memberId,
      limit: 10,
      offset: 0
    };

    const result = await getTransactions(input);

    expect(result).toHaveLength(2);
    expect(result[0].member_id).toEqual(memberId);
    expect(result[0].title).toEqual('Savings Deposit'); // Should be newest first
    expect(typeof result[0].amount).toBe('number');
    expect(result[0].amount).toEqual(25000);
    expect(result[1].title).toEqual('Loan Payment');
    expect(result[1].amount).toEqual(150000);
  });

  it('should apply pagination correctly', async () => {
    // Create test member
    const memberResult = await db.insert(membersTable)
      .values({
        member_number: 'M002',
        name: 'Test Member 2',
        phone: '987654321',
        email: 'test2@example.com'
      })
      .returning()
      .execute();

    const memberId = memberResult[0].id;

    // Create multiple transactions with delays to ensure distinct timestamps
    await db.insert(transactionsTable)
      .values({
        member_id: memberId,
        type: 'income',
        category: 'savings_deposit',
        title: 'Transaction 1',
        subtitle: null,
        amount: '10000'
      })
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(transactionsTable)
      .values({
        member_id: memberId,
        type: 'expense',
        category: 'loan_payment',
        title: 'Transaction 2',
        subtitle: null,
        amount: '20000'
      })
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(transactionsTable)
      .values({
        member_id: memberId,
        type: 'income',
        category: 'savings_deposit',
        title: 'Transaction 3',
        subtitle: null,
        amount: '30000'
      })
      .execute();

    // Test first page
    const firstPageInput: GetTransactionsInput = {
      memberId: memberId,
      limit: 2,
      offset: 0
    };

    const firstPage = await getTransactions(firstPageInput);
    expect(firstPage).toHaveLength(2);

    // Test second page
    const secondPageInput: GetTransactionsInput = {
      memberId: memberId,
      limit: 2,
      offset: 2
    };

    const secondPage = await getTransactions(secondPageInput);
    expect(secondPage).toHaveLength(1);
  });

  it('should only return transactions for specified member', async () => {
    // Create two test members
    const member1Result = await db.insert(membersTable)
      .values({
        member_number: 'M003',
        name: 'Member One',
        phone: '111111111',
        email: 'member1@example.com'
      })
      .returning()
      .execute();

    const member2Result = await db.insert(membersTable)
      .values({
        member_number: 'M004',
        name: 'Member Two',
        phone: '222222222',
        email: 'member2@example.com'
      })
      .returning()
      .execute();

    const member1Id = member1Result[0].id;
    const member2Id = member2Result[0].id;

    // Create transactions for both members
    await db.insert(transactionsTable)
      .values([
        {
          member_id: member1Id,
          type: 'income',
          category: 'savings_deposit',
          title: 'Member 1 Transaction',
          subtitle: null,
          amount: '100000'
        },
        {
          member_id: member2Id,
          type: 'expense',
          category: 'loan_payment',
          title: 'Member 2 Transaction',
          subtitle: null,
          amount: '200000'
        }
      ])
      .execute();

    const input: GetTransactionsInput = {
      memberId: member1Id,
      limit: 10,
      offset: 0
    };

    const result = await getTransactions(input);

    expect(result).toHaveLength(1);
    expect(result[0].member_id).toEqual(member1Id);
    expect(result[0].title).toEqual('Member 1 Transaction');
  });

  it('should return empty array for member with no transactions', async () => {
    // Create test member
    const memberResult = await db.insert(membersTable)
      .values({
        member_number: 'M005',
        name: 'Empty Member',
        phone: '555555555',
        email: 'empty@example.com'
      })
      .returning()
      .execute();

    const memberId = memberResult[0].id;

    const input: GetTransactionsInput = {
      memberId: memberId,
      limit: 10,
      offset: 0
    };

    const result = await getTransactions(input);

    expect(result).toHaveLength(0);
  });
});

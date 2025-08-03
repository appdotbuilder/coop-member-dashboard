
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { membersTable, savingsTable, loansTable, transactionsTable, notificationsTable } from '../db/schema';
import { type GetMemberDashboardInput } from '../schema';
import { getMemberDashboard } from '../handlers/get_member_dashboard';

// Test data
const testMember = {
  member_number: 'MB001234',
  name: 'Test Member',
  phone: '+62812345678',
  email: 'test@example.com'
};

describe('getMemberDashboard', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should fetch comprehensive dashboard data for a member', async () => {
    // Create test member
    const memberResult = await db.insert(membersTable)
      .values(testMember)
      .returning()
      .execute();
    const memberId = memberResult[0].id;

    // Create test savings
    await db.insert(savingsTable)
      .values([
        {
          member_id: memberId,
          type: 'simpanan_pokok',
          amount: '5000000.00'
        },
        {
          member_id: memberId,
          type: 'simpanan_wajib',
          amount: '2000000.00'
        },
        {
          member_id: memberId,
          type: 'simpanan_wajib',
          amount: '1500000.00'
        },
        {
          member_id: memberId,
          type: 'simpanan_sukarela',
          amount: '3000000.00'
        }
      ])
      .execute();

    // Create test loans
    await db.insert(loansTable)
      .values([
        {
          member_id: memberId,
          name: 'Pinjaman TV',
          amount: '6000000.00',
          remaining_amount: '4500000.00',
          monthly_payment: '500000.00',
          status: 'active'
        },
        {
          member_id: memberId,
          name: 'Pinjaman Kulkas',
          amount: '4000000.00',
          remaining_amount: '3000000.00',
          monthly_payment: '300000.00',
          status: 'active'
        }
      ])
      .execute();

    // Create test transactions (first transaction will be older)
    await db.insert(transactionsTable)
      .values({
        member_id: memberId,
        type: 'expense',
        category: 'loan_payment',
        title: 'Angsuran Pinjaman',
        subtitle: 'TV LED 42"',
        amount: '500000.00'
      })
      .execute();

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Second transaction will be more recent
    await db.insert(transactionsTable)
      .values({
        member_id: memberId,
        type: 'income',
        category: 'savings_deposit',
        title: 'Setoran Simpanan',
        subtitle: 'Simpanan Wajib',
        amount: '1500000.00'
      })
      .execute();

    // Create test notifications
    await db.insert(notificationsTable)
      .values([
        {
          member_id: memberId,
          title: 'Payment Reminder',
          message: 'Your loan payment is due',
          is_read: false
        },
        {
          member_id: memberId,
          title: 'Account Update',
          message: 'Your account has been updated',
          is_read: true
        },
        {
          member_id: memberId,
          title: 'New Promotion',
          message: 'Check out our new products',
          is_read: false
        }
      ])
      .execute();

    const result = await getMemberDashboard({ memberId });

    // Verify member information
    expect(result.member.id).toBe(memberId);
    expect(result.member.name).toBe('Test Member');
    expect(result.member.member_number).toBe('MB001234');
    expect(result.member.phone).toBe('+62812345678');
    expect(result.member.email).toBe('test@example.com');

    // Verify total savings (5000000 + 2000000 + 1500000 + 3000000 = 11500000)
    expect(result.totalSavings).toBe(11500000);

    // Verify savings breakdown
    expect(result.savingsBreakdown).toHaveLength(3);
    
    const simpananPokok = result.savingsBreakdown.find(s => s.type === 'simpanan_pokok');
    expect(simpananPokok?.amount).toBe(5000000);
    
    const simpananWajib = result.savingsBreakdown.find(s => s.type === 'simpanan_wajib');
    expect(simpananWajib?.amount).toBe(3500000); // 2000000 + 1500000
    
    const simpananSukarela = result.savingsBreakdown.find(s => s.type === 'simpanan_sukarela');
    expect(simpananSukarela?.amount).toBe(3000000);

    // Verify total loans (4500000 + 3000000 = 7500000)
    expect(result.totalLoans).toBe(7500000);

    // Verify loans
    expect(result.loans).toHaveLength(2);
    expect(result.loans[0].name).toBe('Pinjaman TV');
    expect(result.loans[0].amount).toBe(6000000);
    expect(result.loans[0].remaining_amount).toBe(4500000);
    expect(result.loans[0].monthly_payment).toBe(500000);

    // Verify recent transactions (ordered by created_at DESC, so most recent first)
    expect(result.recentTransactions).toHaveLength(2);
    // Most recent transaction (Setoran Simpanan) should be first
    expect(result.recentTransactions[0].amount).toBe(1500000);
    expect(result.recentTransactions[0].title).toBe('Setoran Simpanan');
    // Older transaction (Angsuran Pinjaman) should be second
    expect(result.recentTransactions[1].amount).toBe(500000);
    expect(result.recentTransactions[1].title).toBe('Angsuran Pinjaman');

    // Verify unread notifications count
    expect(result.unreadNotifications).toBe(2);
  });

  it('should return empty data for member with no savings, loans, or transactions', async () => {
    // Create test member only
    const memberResult = await db.insert(membersTable)
      .values(testMember)
      .returning()
      .execute();
    const memberId = memberResult[0].id;

    const result = await getMemberDashboard({ memberId });

    // Verify member information
    expect(result.member.id).toBe(memberId);
    expect(result.member.name).toBe('Test Member');

    // Verify empty aggregated data
    expect(result.totalSavings).toBe(0);
    expect(result.savingsBreakdown).toHaveLength(0);
    expect(result.totalLoans).toBe(0);
    expect(result.loans).toHaveLength(0);
    expect(result.recentTransactions).toHaveLength(0);
    expect(result.unreadNotifications).toBe(0);
  });

  it('should throw error for non-existent member', async () => {
    const nonExistentInput: GetMemberDashboardInput = {
      memberId: 99999 // Use a member ID that definitely doesn't exist
    };
    
    await expect(getMemberDashboard(nonExistentInput)).rejects.toThrow(/Member with ID 99999 not found/i);
  });

  it('should return correct data types for all numeric fields', async () => {
    // Create test member with minimal data
    const memberResult = await db.insert(membersTable)
      .values(testMember)
      .returning()
      .execute();
    const memberId = memberResult[0].id;

    // Create one savings record
    await db.insert(savingsTable)
      .values({
        member_id: memberId,
        type: 'simpanan_pokok',
        amount: '1000000.50'
      })
      .execute();

    // Create one loan
    await db.insert(loansTable)
      .values({
        member_id: memberId,
        name: 'Test Loan',
        amount: '2000000.75',
        remaining_amount: '1500000.25',
        monthly_payment: '250000.00',
        status: 'active'
      })
      .execute();

    const result = await getMemberDashboard({ memberId });

    // Verify numeric types
    expect(typeof result.totalSavings).toBe('number');
    expect(typeof result.totalLoans).toBe('number');
    expect(typeof result.unreadNotifications).toBe('number');
    
    // Verify savings breakdown numeric types
    expect(typeof result.savingsBreakdown[0].amount).toBe('number');
    expect(result.savingsBreakdown[0].amount).toBe(1000000.5);
    
    // Verify loan numeric types
    expect(typeof result.loans[0].amount).toBe('number');
    expect(typeof result.loans[0].remaining_amount).toBe('number');
    expect(typeof result.loans[0].monthly_payment).toBe('number');
    expect(result.loans[0].amount).toBe(2000000.75);
    expect(result.loans[0].remaining_amount).toBe(1500000.25);
    expect(result.loans[0].monthly_payment).toBe(250000);
  });
});

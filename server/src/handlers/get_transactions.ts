
import { type GetTransactionsInput, type Transaction } from '../schema';

export async function getTransactions(input: GetTransactionsInput): Promise<Transaction[]> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to fetch paginated transaction history for a member
    // Supports filtering by member ID, pagination with limit/offset
    
    const mockTransactions: Transaction[] = [
        {
            id: 1,
            member_id: input.memberId,
            type: 'expense',
            category: 'loan_payment',
            title: "Angsuran Pinjaman (PMK-TV42)",
            subtitle: "TV LED 42\"",
            amount: 154000,
            created_at: new Date('2024-01-15')
        },
        {
            id: 2,
            member_id: input.memberId,
            type: 'income',
            category: 'savings_deposit',
            title: "Setoran Simpanan",
            subtitle: "SW - Simpanan Wajib",
            amount: 15000,
            created_at: new Date('2024-01-14')
        },
        {
            id: 3,
            member_id: input.memberId,
            type: 'expense',
            category: 'loan_payment',
            title: "Angsuran Pinjaman Kulkas",
            subtitle: "Kulkas 2 Pintu",
            amount: 300000,
            created_at: new Date('2024-01-13')
        },
        {
            id: 4,
            member_id: input.memberId,
            type: 'income',
            category: 'loan_disbursement',
            title: "Pencairan Pinjaman",
            subtitle: "Pinjaman Furnitur Sofa",
            amount: 3500000,
            created_at: new Date('2024-01-10')
        }
    ];

    // Apply pagination
    const startIndex = input.offset || 0;
    const endIndex = startIndex + (input.limit || 10);
    
    return Promise.resolve(mockTransactions.slice(startIndex, endIndex));
}

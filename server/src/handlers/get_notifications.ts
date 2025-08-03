
import { type GetNotificationsInput, type Notification } from '../schema';

export async function getNotifications(input: GetNotificationsInput): Promise<Notification[]> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to fetch paginated notifications for a member
    // Supports filtering by member ID and pagination with limit/offset
    
    const mockNotifications: Notification[] = [
        {
            id: 1,
            member_id: input.memberId,
            title: "Pembayaran Berhasil",
            message: "Angsuran pinjaman TV LED sebesar Rp 154.000 telah berhasil dibayar.",
            is_read: false,
            created_at: new Date('2024-01-15')
        },
        {
            id: 2,
            member_id: input.memberId,
            title: "Promo Produk Baru",
            message: "Dapatkan diskon 10% untuk TV LED 55\" hanya bulan ini!",
            is_read: false,
            created_at: new Date('2024-01-14')
        },
        {
            id: 3,
            member_id: input.memberId,
            title: "Setoran Simpanan",
            message: "Setoran simpanan wajib Rp 15.000 telah diterima.",
            is_read: false,
            created_at: new Date('2024-01-14')
        },
        {
            id: 4,
            member_id: input.memberId,
            title: "Pinjaman Disetujui",
            message: "Pinjaman furnitur sofa Rp 3.500.000 telah disetujui dan dicairkan.",
            is_read: true,
            created_at: new Date('2024-01-10')
        }
    ];

    // Apply pagination
    const startIndex = input.offset || 0;
    const endIndex = startIndex + (input.limit || 10);
    
    return Promise.resolve(mockNotifications.slice(startIndex, endIndex));
}


import { db } from '../db';
import { notificationsTable } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { type GetNotificationsInput, type Notification } from '../schema';

export const getNotifications = async (input: GetNotificationsInput): Promise<Notification[]> => {
  try {
    // Build query in a single chain
    const results = await db.select()
      .from(notificationsTable)
      .where(eq(notificationsTable.member_id, input.memberId))
      .orderBy(desc(notificationsTable.created_at))
      .limit(input.limit)
      .offset(input.offset)
      .execute();

    // Return results (no numeric conversions needed for notifications table)
    return results;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    throw error;
  }
};

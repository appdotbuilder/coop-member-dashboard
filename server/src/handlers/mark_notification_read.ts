
import { db } from '../db';
import { notificationsTable } from '../db/schema';
import { type MarkNotificationReadInput } from '../schema';
import { eq, and } from 'drizzle-orm';

export async function markNotificationRead(input: MarkNotificationReadInput): Promise<{ success: boolean }> {
  try {
    // Update notification to mark as read, but only if it belongs to the specified member
    const result = await db.update(notificationsTable)
      .set({ is_read: true })
      .where(
        and(
          eq(notificationsTable.id, input.notificationId),
          eq(notificationsTable.member_id, input.memberId)
        )
      )
      .returning()
      .execute();

    // If no rows were affected, the notification either doesn't exist 
    // or doesn't belong to the specified member
    return { success: result.length > 0 };
  } catch (error) {
    console.error('Mark notification read failed:', error);
    throw error;
  }
}

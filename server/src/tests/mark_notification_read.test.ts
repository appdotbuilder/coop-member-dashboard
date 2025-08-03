
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { membersTable, notificationsTable } from '../db/schema';
import { type MarkNotificationReadInput } from '../schema';
import { markNotificationRead } from '../handlers/mark_notification_read';
import { eq } from 'drizzle-orm';

describe('markNotificationRead', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should mark notification as read for correct member', async () => {
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

    // Create test notification
    const notificationResult = await db.insert(notificationsTable)
      .values({
        member_id: memberId,
        title: 'Test Notification',
        message: 'Test message',
        is_read: false
      })
      .returning()
      .execute();

    const notificationId = notificationResult[0].id;

    const input: MarkNotificationReadInput = {
      notificationId,
      memberId
    };

    const result = await markNotificationRead(input);

    expect(result.success).toBe(true);

    // Verify notification was marked as read
    const updatedNotification = await db.select()
      .from(notificationsTable)
      .where(eq(notificationsTable.id, notificationId))
      .execute();

    expect(updatedNotification).toHaveLength(1);
    expect(updatedNotification[0].is_read).toBe(true);
  });

  it('should return false when notification does not belong to member', async () => {
    // Create two test members
    const member1Result = await db.insert(membersTable)
      .values({
        member_number: 'M001',
        name: 'Member 1',
        phone: '123456789',
        email: 'member1@example.com'
      })
      .returning()
      .execute();

    const member2Result = await db.insert(membersTable)
      .values({
        member_number: 'M002',
        name: 'Member 2',
        phone: '987654321',
        email: 'member2@example.com'
      })
      .returning()
      .execute();

    const member1Id = member1Result[0].id;
    const member2Id = member2Result[0].id;

    // Create notification for member 1
    const notificationResult = await db.insert(notificationsTable)
      .values({
        member_id: member1Id,
        title: 'Member 1 Notification',
        message: 'Message for member 1',
        is_read: false
      })
      .returning()
      .execute();

    const notificationId = notificationResult[0].id;

    // Try to mark notification as read using member 2's ID
    const input: MarkNotificationReadInput = {
      notificationId,
      memberId: member2Id
    };

    const result = await markNotificationRead(input);

    expect(result.success).toBe(false);

    // Verify notification remains unread
    const notification = await db.select()
      .from(notificationsTable)
      .where(eq(notificationsTable.id, notificationId))
      .execute();

    expect(notification).toHaveLength(1);
    expect(notification[0].is_read).toBe(false);
  });

  it('should return false when notification does not exist', async () => {
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

    const input: MarkNotificationReadInput = {
      notificationId: 99999, // Non-existent notification ID
      memberId
    };

    const result = await markNotificationRead(input);

    expect(result.success).toBe(false);
  });

  it('should work with already read notification', async () => {
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

    // Create notification that's already read
    const notificationResult = await db.insert(notificationsTable)
      .values({
        member_id: memberId,
        title: 'Already Read Notification',
        message: 'This is already read',
        is_read: true
      })
      .returning()
      .execute();

    const notificationId = notificationResult[0].id;

    const input: MarkNotificationReadInput = {
      notificationId,
      memberId
    };

    const result = await markNotificationRead(input);

    expect(result.success).toBe(true);

    // Verify notification is still marked as read
    const notification = await db.select()
      .from(notificationsTable)
      .where(eq(notificationsTable.id, notificationId))
      .execute();

    expect(notification).toHaveLength(1);
    expect(notification[0].is_read).toBe(true);
  });
});

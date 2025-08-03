
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { membersTable, notificationsTable } from '../db/schema';
import { type GetNotificationsInput } from '../schema';
import { getNotifications } from '../handlers/get_notifications';
import { eq } from 'drizzle-orm';

// Test input
const testInput: GetNotificationsInput = {
  memberId: 1,
  limit: 10,
  offset: 0
};

describe('getNotifications', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no notifications exist', async () => {
    // Create member first
    await db.insert(membersTable).values({
      member_number: 'M001',
      name: 'Test Member',
      phone: '081234567890',
      email: 'test@example.com'
    }).execute();

    const result = await getNotifications(testInput);

    expect(result).toEqual([]);
  });

  it('should fetch notifications for a member', async () => {
    // Create member first
    await db.insert(membersTable).values({
      member_number: 'M001',
      name: 'Test Member',
      phone: '081234567890',
      email: 'test@example.com'
    }).execute();

    // Create test notifications with different timestamps to ensure proper ordering
    const now = new Date();
    const earlier = new Date(now.getTime() - 60000); // 1 minute earlier

    await db.insert(notificationsTable).values([
      {
        member_id: 1,
        title: 'Test Notification 1',
        message: 'First test notification',
        is_read: false,
        created_at: earlier
      },
      {
        member_id: 1,
        title: 'Test Notification 2',
        message: 'Second test notification',
        is_read: true,
        created_at: now
      }
    ]).execute();

    const result = await getNotifications(testInput);

    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual('Test Notification 2'); // Should be ordered by created_at desc (newest first)
    expect(result[0].message).toEqual('Second test notification');
    expect(result[0].is_read).toBe(true);
    expect(result[0].member_id).toBe(1);
    expect(result[0].created_at).toBeInstanceOf(Date);

    expect(result[1].title).toEqual('Test Notification 1');
    expect(result[1].is_read).toBe(false);
  });

  it('should apply pagination correctly', async () => {
    // Create member first
    await db.insert(membersTable).values({
      member_number: 'M001',
      name: 'Test Member',
      phone: '081234567890',
      email: 'test@example.com'
    }).execute();

    // Create multiple notifications with different timestamps
    const baseTime = new Date();
    const notifications = Array.from({ length: 5 }, (_, i) => ({
      member_id: 1,
      title: `Notification ${i + 1}`,
      message: `Message ${i + 1}`,
      is_read: false,
      created_at: new Date(baseTime.getTime() + i * 1000) // 1 second apart
    }));

    await db.insert(notificationsTable).values(notifications).execute();

    // Test with limit
    const limitedResult = await getNotifications({
      memberId: 1,
      limit: 2,
      offset: 0
    });

    expect(limitedResult).toHaveLength(2);

    // Test with offset
    const offsetResult = await getNotifications({
      memberId: 1,
      limit: 2,
      offset: 2
    });

    expect(offsetResult).toHaveLength(2);
    expect(offsetResult[0].title).not.toEqual(limitedResult[0].title);
  });

  it('should filter by member_id correctly', async () => {
    // Create two members
    await db.insert(membersTable).values([
      {
        member_number: 'M001',
        name: 'Member 1',
        phone: '081234567890',
        email: 'member1@example.com'
      },
      {
        member_number: 'M002',
        name: 'Member 2',
        phone: '081234567891',
        email: 'member2@example.com'
      }
    ]).execute();

    // Create notifications for both members
    await db.insert(notificationsTable).values([
      {
        member_id: 1,
        title: 'Member 1 Notification',
        message: 'For member 1',
        is_read: false
      },
      {
        member_id: 2,
        title: 'Member 2 Notification',
        message: 'For member 2',
        is_read: false
      }
    ]).execute();

    const result = await getNotifications({
      memberId: 1,
      limit: 10,
      offset: 0
    });

    expect(result).toHaveLength(1);
    expect(result[0].member_id).toBe(1);
    expect(result[0].title).toEqual('Member 1 Notification');
  });

  it('should save notifications to database correctly', async () => {
    // Create member first
    await db.insert(membersTable).values({
      member_number: 'M001',
      name: 'Test Member',
      phone: '081234567890',
      email: 'test@example.com'
    }).execute();

    // Create notification
    await db.insert(notificationsTable).values({
      member_id: 1,
      title: 'Database Test',
      message: 'Testing database storage',
      is_read: false
    }).execute();

    // Verify via direct database query
    const notifications = await db.select()
      .from(notificationsTable)
      .where(eq(notificationsTable.member_id, 1))
      .execute();

    expect(notifications).toHaveLength(1);
    expect(notifications[0].title).toEqual('Database Test');
    expect(notifications[0].message).toEqual('Testing database storage');
    expect(notifications[0].is_read).toBe(false);
    expect(notifications[0].created_at).toBeInstanceOf(Date);
  });
});

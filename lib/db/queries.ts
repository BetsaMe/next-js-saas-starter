import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { listings, users, activityLogs } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function updateUserSubscriptionByCustomerId(customerId: string, data: Partial<typeof users.$inferInsert>) {
  await db
    .update(users)
    .set({
      stripeSubscriptionId: data.stripeSubscriptionId,
      stripeProductId: data.stripeProductId,
      planName: data.planName,
      subscriptionStatus: data.subscriptionStatus,
      updatedAt: new Date()
    })
    .where(eq(users.stripeCustomerId, customerId));
}


export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getPublicListings() {
  return await db
    .select({
      id: listings.id,
      title: listings.title,
      price: listings.price,
      imageUrl: listings.imageUrl,
      createdAt: listings.createdAt,
      sellerName: users.name
    })
    .from(listings)
    .leftJoin(users, eq(listings.userId, users.id))
    .orderBy(desc(listings.createdAt));
}
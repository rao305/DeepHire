import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';

export class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Authenticated user is not provisioned in DeepHire') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const [dbUser] = await db
    .select()
    .from(users)
    .where(and(eq(users.clerkId, userId), eq(users.isActive, true)))
    .limit(1);

  return dbUser ?? null;
}

export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    throw new AuthenticationError();
  }

  const [dbUser] = await db
    .select()
    .from(users)
    .where(and(eq(users.clerkId, userId), eq(users.isActive, true)))
    .limit(1);

  if (!dbUser) {
    throw new AuthorizationError();
  }

  return dbUser;
}

export async function getOrganizationId() {
  const user = await requireAuth();
  return user.organizationId;
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}

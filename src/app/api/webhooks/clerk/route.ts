import { NextRequest, NextResponse } from 'next/server';
import type { UserJSON, WebhookEvent } from '@clerk/nextjs/server';
import { Webhook } from 'svix';
import { db } from '@/db';
import { organizations, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

function getPrimaryEmail(data: UserJSON) {
  const primaryEmail = data.email_addresses.find(
    (email) => email.id === data.primary_email_address_id
  );

  return primaryEmail?.email_address ?? data.email_addresses[0]?.email_address;
}

function getDisplayName(data: UserJSON) {
  const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ');
  return fullName || getPrimaryEmail(data)?.split('@')[0] || 'DeepHire workspace';
}

async function upsertOrganization(clerkId: string, name: string) {
  const [organization] = await db
    .insert(organizations)
    .values({
      clerkId,
      name,
      plan: 'free',
    })
    .onConflictDoUpdate({
      target: organizations.clerkId,
      set: {
        name,
      },
    })
    .returning();

  return organization;
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Missing CLERK_WEBHOOK_SECRET');
    return NextResponse.json({ error: 'Webhook secret is not configured' }, { status: 500 });
  }

  const svixId = request.headers.get('svix-id');
  const svixTimestamp = request.headers.get('svix-timestamp');
  const svixSignature = request.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing Svix headers' }, { status: 400 });
  }

  const body = await request.text();
  const webhook = new Webhook(webhookSecret);

  let event: WebhookEvent;

  try {
    event = webhook.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Clerk webhook verification failed:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'organization.created': {
        await upsertOrganization(event.data.id, event.data.name || 'Untitled organization');
        break;
      }

      case 'user.created': {
        const email = getPrimaryEmail(event.data);

        if (!email) {
          console.error(`Clerk user.created event ${event.data.id} did not include an email address`);
          return NextResponse.json({ received: true, skipped: true });
        }

        const organization = await upsertOrganization(
          `personal:${event.data.id}`,
          `${getDisplayName(event.data)}'s workspace`
        );

        await db
          .insert(users)
          .values({
            organizationId: organization.id,
            email,
            role: 'admin',
            clerkId: event.data.id,
            isActive: true,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: users.clerkId,
            set: {
              organizationId: organization.id,
              email,
              isActive: true,
              updatedAt: new Date(),
            },
          });
        break;
      }

      case 'user.deleted': {
        if (event.data.id) {
          await db
            .update(users)
            .set({
              isActive: false,
              updatedAt: new Date(),
            })
            .where(eq(users.clerkId, event.data.id));
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`Failed to process Clerk webhook ${event.type}:`, err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

/**
 * Clerk Webhook Handler
 * Handles user.created, user.updated, and user.deleted events from Clerk
 *
 * Constitutional: Max 150 lines, max 50 lines per function
 * Reference: contracts/clerk-webhook.yaml
 */

import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/db/models/User';

/**
 * Clerk webhook event data interface
 */
interface ClerkUserData {
  id: string;
  email_addresses?: Array<{ email_address: string }>;
  username?: string;
  first_name?: string;
  last_name?: string;
  image_url?: string;
}

/**
 * POST handler for Clerk webhooks
 * Processes user lifecycle events from Clerk authentication
 */
export async function POST(req: NextRequest) {
  try {
    // Parse webhook payload
    const payload = await req.json();
    const eventType = payload.type;

    // Handle different event types
    switch (eventType) {
      case 'user.created':
        return await handleUserCreated(payload.data);

      case 'user.updated':
        return await handleUserUpdated(payload.data);

      case 'user.deleted':
        return await handleUserDeleted(payload.data);

      default:
        return NextResponse.json(
          { success: false, error: 'Unsupported event type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle user.created event
 * Creates new MongoDB user with default D&D profile
 */
async function handleUserCreated(data: ClerkUserData) {
  try {
    // Check for duplicate (idempotency)
    const existing = await User.findOne({ id: data.id });
    if (existing) {
      return NextResponse.json(
        { success: true, message: 'User already exists' },
        { status: 200 }
      );
    }

    // Create user with defaults
    const user = await User.create({
      id: data.id,
      email: data.email_addresses?.[0]?.email_address || '',
      username: data.username || `user_${data.id.slice(-8)}`,
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      imageUrl: data.image_url,
      authProvider: 'clerk',
      isEmailVerified: true,
      role: 'user',
      subscriptionTier: 'free',
      timezone: 'UTC',
      dndEdition: '5th Edition',
      profileSetupCompleted: false,
      sessionsCount: 0,
      charactersCreatedCount: 0,
      campaignsCreatedCount: 0,
      profile: {
        displayName: data.first_name || 'Adventurer',
        dndRuleset: '5e',
        experienceLevel: 'beginner',
        role: 'player'
      },
      subscription: {
        tier: 'free',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      usage: {
        partiesCount: 0,
        encountersCount: 0,
        creaturesCount: 0
      },
      preferences: {
        theme: 'auto',
        defaultInitiativeType: 'manual',
        autoAdvanceRounds: false
      },
      lastClerkSync: new Date(),
      syncStatus: 'active'
    });

    return NextResponse.json(
      { success: true, userId: user._id },
      { status: 201 }
    );
  } catch (error) {
    console.error('User creation error:', error);
    throw error;
  }
}

/**
 * Handle user.updated event
 * Syncs Clerk profile changes to MongoDB
 */
async function handleUserUpdated(data: ClerkUserData) {
  try {
    const user = await User.findOneAndUpdate(
      { id: data.id },
      {
        $set: {
          email: data.email_addresses?.[0]?.email_address,
          username: data.username,
          firstName: data.first_name,
          lastName: data.last_name,
          imageUrl: data.image_url,
          lastClerkSync: new Date(),
          syncStatus: 'active'
        }
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('User update error:', error);
    throw error;
  }
}

/**
 * Handle user.deleted event
 * Removes user from MongoDB
 */
async function handleUserDeleted(data: ClerkUserData) {
  try {
    await User.findOneAndDelete({ id: data.id });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('User deletion error:', error);
    throw error;
  }
}


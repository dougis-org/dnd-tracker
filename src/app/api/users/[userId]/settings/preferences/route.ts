/**
 * User Preferences API Route
 * PATCH /api/users/[userId]/settings/preferences - Updates user preferences
 * Constitutional: Max 150 lines, max 50 lines per function
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/db/connection';
import User, { type IUser } from '@/lib/db/models/User';
import { z } from 'zod';

/**
 * Zod schema for preferences update validation
 * All fields optional for partial updates
 */
const preferencesUpdateSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  emailNotifications: z.boolean().optional(),
  browserNotifications: z.boolean().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  diceRollAnimations: z.boolean().optional(),
  autoSaveEncounters: z.boolean().optional(),
});

/**
 * Build settings response from user document
 * Matches settings-api.yaml contract structure
 */
function buildSettingsResponse(user: IUser) {
  return {
    profile: {
      displayName: user.profile?.displayName || null,
      timezone: user.profile?.timezone || 'UTC',
      dndEdition: user.profile?.dndEdition || '5th Edition',
      experienceLevel: user.profile?.experienceLevel || null,
      primaryRole: user.profile?.primaryRole || null,
      profileSetupCompleted: user.profile?.profileSetupCompleted || false,
    },
    preferences: {
      theme: user.preferences?.theme || 'system',
      emailNotifications: user.preferences?.emailNotifications ?? true,
      browserNotifications: user.preferences?.browserNotifications ?? false,
      timezone: user.preferences?.timezone || 'UTC',
      language: user.preferences?.language || 'en',
      diceRollAnimations: user.preferences?.diceRollAnimations ?? true,
      autoSaveEncounters: user.preferences?.autoSaveEncounters ?? true,
    },
  };
}

/**
 * PATCH /api/users/[userId]/settings/preferences
 * Updates user preferences (partial update supported)
 *
 * @param request - Next.js request object with preferences update
 * @param context - Route context with userId param (Next.js 15 async params)
 * @returns Updated settings object or error
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Check authentication
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to update preferences' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate preferences update
    const validation = preferencesUpdateSchema.safeParse(body);

    if (!validation.success) {
      const zodErrors = validation.error.issues || [];
      const errors = zodErrors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));

      return NextResponse.json(
        {
          error: 'ValidationError',
          message: 'Invalid preferences data',
          errors,
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Await params (Next.js 15 requirement)
    const { userId } = await context.params;

    // Find user by MongoDB _id
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', message: 'User profile could not be found' },
        { status: 404 }
      );
    }

    // Verify userId matches authenticated user
    if (user.id !== clerkId) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You can only update your own preferences' },
        { status: 403 }
      );
    }

    // Update preferences (partial update)
    const updates = validation.data;
    if (!user.preferences) {
      user.preferences = {};
    }

    // Update each field individually for type safety
    if (updates.theme !== undefined) user.preferences.theme = updates.theme;
    if (updates.emailNotifications !== undefined) user.preferences.emailNotifications = updates.emailNotifications;
    if (updates.browserNotifications !== undefined) user.preferences.browserNotifications = updates.browserNotifications;
    if (updates.timezone !== undefined) user.preferences.timezone = updates.timezone;
    if (updates.language !== undefined) user.preferences.language = updates.language;
    if (updates.diceRollAnimations !== undefined) user.preferences.diceRollAnimations = updates.diceRollAnimations;
    if (updates.autoSaveEncounters !== undefined) user.preferences.autoSaveEncounters = updates.autoSaveEncounters;

    await user.save();

    // Return complete settings with updated preferences
    const settings = buildSettingsResponse(user);

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Preferences update error:', error);

    // Generic error response
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

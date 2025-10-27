/**
 * User Preferences API Route
 * PATCH /api/users/[userId]/settings/preferences - Updates user preferences
 * Constitutional: Max 150 lines, max 50 lines per function
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/db/connection';
import User from '@/lib/db/models/User';
import { z } from 'zod';

interface RouteContext {
  params: {
    userId: string;
  };
}

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
function buildSettingsResponse(user: any) {
  return {
    profile: {
      displayName: user.profile.displayName || null,
      timezone: user.profile.timezone || 'UTC',
      dndEdition: user.profile.dndEdition || '5th Edition',
      experienceLevel: user.profile.experienceLevel || null,
      primaryRole: user.profile.primaryRole || null,
      profileSetupCompleted: user.profile.profileSetupCompleted || false,
    },
    preferences: {
      theme: user.preferences.theme || 'system',
      emailNotifications: user.preferences.emailNotifications ?? true,
      browserNotifications: user.preferences.browserNotifications ?? false,
      timezone: user.preferences.timezone || 'UTC',
      language: user.preferences.language || 'en',
      diceRollAnimations: user.preferences.diceRollAnimations ?? true,
      autoSaveEncounters: user.preferences.autoSaveEncounters ?? true,
    },
  };
}

/**
 * PATCH /api/users/[userId]/settings/preferences
 * Updates user preferences (partial update supported)
 *
 * @param request - Next.js request object with preferences update
 * @param context - Route context with userId param
 * @returns Updated settings object or error
 */
export async function PATCH(request: Request, context: RouteContext) {
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
      const errors = validation.error.errors.map((err) => ({
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

    // Find user by MongoDB _id
    const user = await User.findById(context.params.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', message: 'User profile could not be found' },
        { status: 404 }
      );
    }

    // Verify userId matches authenticated user
    if (user.clerkId !== clerkId) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You can only update your own preferences' },
        { status: 403 }
      );
    }

    // Update preferences (partial update)
    const updates = validation.data;
    Object.keys(updates).forEach((key) => {
      user.preferences[key] = updates[key as keyof typeof updates];
    });

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

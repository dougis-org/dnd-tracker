/**
 * User Settings API Route
 * GET /api/users/[userId]/settings - Returns user settings including profile and preferences
 * Constitutional: Max 100 lines, proper error handling
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/db/connection';
import User from '@/lib/db/models/User';

interface RouteContext {
  params: {
    userId: string;
  };
}

/**
 * GET /api/users/[userId]/settings
 * Returns complete user settings for the authenticated user
 *
 * @param request - Next.js request object
 * @param context - Route context with userId param
 * @returns User settings object or error
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    // Check authentication
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to access settings' },
        { status: 401 }
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
        { error: 'Forbidden', message: 'You can only access your own settings' },
        { status: 403 }
      );
    }

    // Build settings response matching API contract
    const settings = {
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

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Settings API error:', error);

    // Generic error response
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch user settings' },
      { status: 500 }
    );
  }
}

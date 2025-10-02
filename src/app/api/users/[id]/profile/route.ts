/**
 * User Profile API Route
 * GET and PATCH endpoints for user profile management
 *
 * Constitutional: Max 150 lines total, max 50 lines per handler
 * Reference: contracts/profile-api.yaml
 */

import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/db/models/User';
import { auth } from '@clerk/nextjs/server';
import {
  validateProfileUpdate,
  sanitizeUserResponse,
  type ProfileUpdateRequest,
} from '@/lib/services/profileValidation';

/**
 * GET /api/users/[id]/profile
 * Retrieve user profile information
 */
export async function GET(
  req: NextRequest,
  context: { params: { id: string }; auth?: { userId: string } }
) {
  try {
    // Get Clerk authentication
    const authResult = context.auth || (await auth());
    const clerkUserId = authResult?.userId;

    // Check authentication
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user from database
    const user = await User.findById(context.params.id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Authorization check: user can only access their own profile
    if (user.id !== clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Return sanitized user profile
    return NextResponse.json(sanitizeUserResponse(user));
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/[id]/profile
 * Update user profile information
 */
export async function PATCH(
  req: NextRequest,
  context: { params: { id: string }; auth?: { userId: string } }
) {
  try {
    // Get Clerk authentication
    const authResult = context.auth || (await auth());
    const clerkUserId = authResult?.userId;

    // Check authentication
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user from database
    const user = await User.findById(context.params.id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Authorization check: user can only update their own profile
    if (user.id !== clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body: ProfileUpdateRequest = await req.json();
    const validationErrors = validateProfileUpdate(body);

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    // Update profile fields
    if (body.displayName !== undefined) {
      user.profile.displayName = body.displayName;
    }
    if (body.dndRuleset !== undefined) {
      user.profile.dndRuleset = body.dndRuleset as '5e' | '3.5e' | 'pf1' | 'pf2';
    }
    if (body.experienceLevel !== undefined) {
      user.profile.experienceLevel = body.experienceLevel;
    }
    if (body.role !== undefined) {
      user.profile.role = body.role;
    }

    // Save updated user
    await user.save();

    // Return updated profile
    return NextResponse.json(sanitizeUserResponse(user));
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

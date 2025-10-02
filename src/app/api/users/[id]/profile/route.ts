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
  verifyUserAuth,
  checkUserAuthorization,
  type ProfileUpdateRequest,
  type DndRuleset,
} from '@/lib/services/profileValidation';

/**
 * GET /api/users/[id]/profile
 * Retrieve user profile information
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }>; auth?: { userId: string } }
) {
  try {
    const params = await context.params;

    // Verify authentication
    const { clerkUserId, error: authError } = await verifyUserAuth(
      { params, auth: context.auth },
      async () => auth()
    );
    if (authError) {
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: authError.status }
      );
    }

    // Fetch user from database
    const user = await User.findById(params.id);

    // Check authorization
    const { error: authzError } = checkUserAuthorization(user, clerkUserId!);
    if (authzError) {
      return NextResponse.json(
        { success: false, error: authzError.message },
        { status: authzError.status }
      );
    }

    // Return sanitized user profile
    return NextResponse.json(sanitizeUserResponse(user!));
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
  context: { params: Promise<{ id: string }>; auth?: { userId: string } }
) {
  try {
    const params = await context.params;

    // Verify authentication
    const { clerkUserId, error: authError } = await verifyUserAuth(
      { params, auth: context.auth },
      async () => auth()
    );
    if (authError) {
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: authError.status }
      );
    }

    // Fetch user from database
    const user = await User.findById(params.id);

    // Check authorization
    const { error: authzError } = checkUserAuthorization(user, clerkUserId!);
    if (authzError) {
      return NextResponse.json(
        { success: false, error: authzError.message },
        { status: authzError.status }
      );
    }

    // Parse request body with error handling
    let body: ProfileUpdateRequest;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate request body
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
      user!.profile!.displayName = body.displayName;
    }
    if (body.dndRuleset !== undefined) {
      user!.profile!.dndRuleset = body.dndRuleset as DndRuleset;
    }
    if (body.experienceLevel !== undefined) {
      user!.profile!.experienceLevel = body.experienceLevel;
    }
    if (body.role !== undefined) {
      user!.profile!.role = body.role;
    }

    // Save updated user
    await user!.save();

    // Return updated profile
    return NextResponse.json(sanitizeUserResponse(user!));
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

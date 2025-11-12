import { NextRequest, NextResponse } from 'next/server';
import { userAdapter } from '@/lib/adapters/userAdapter';

/**
 * GET /api/user/preferences
 * Returns the current user's D&D preferences
 */
export async function GET(request: NextRequest) {
  try {
    // In real implementation with F013, extract userId from Clerk auth
    // For F010 mock, use a default userId
    const userId = request.headers.get('x-user-id') || 'user-123';

    const preferences = await userAdapter.getPreferences(userId);

    return NextResponse.json(preferences, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch preferences';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PUT /api/user/preferences
 * Updates the current user's D&D preferences with partial data
 */
export async function PUT(request: NextRequest) {
  try {
    // Extract userId from request header (mocked; real auth in F013)
    const userId = request.headers.get('x-user-id') || 'user-123';

    const body = await request.json();

    // Validate the update payload - only validate provided fields
    const updates = {
      ...(body.experienceLevel !== undefined && { experienceLevel: body.experienceLevel }),
      ...(body.preferredRole !== undefined && { preferredRole: body.preferredRole }),
      ...(body.ruleset !== undefined && { ruleset: body.ruleset }),
    };

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updated = await userAdapter.updatePreferences(userId, updates);

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update preferences';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { userAdapter } from '@/lib/adapters/userAdapter';

/**
 * GET /api/user/profile
 * Returns the current user's profile
 */
export async function GET(request: NextRequest) {
  try {
    // In real implementation with F013, extract userId from Clerk auth
    // For F010 mock, use a default userId
    const userId = request.headers.get('x-user-id') || 'user-123';

    const profile = await userAdapter.getProfile(userId);

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PUT /api/user/profile
 * Updates the current user's profile with partial data
 */
export async function PUT(request: NextRequest) {
  try {
    // Extract userId from request header (mocked; real auth in F013)
    const userId = request.headers.get('x-user-id') || 'user-123';

    const body = await request.json();

    // Validate the update payload - only validate provided fields
    const updates = {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.email !== undefined && { email: body.email }),
    };

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updated = await userAdapter.updateProfile(userId, updates);

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { userAdapter } from '@/lib/adapters/userAdapter';
import { notificationSettingsSchema } from '@/lib/schemas/userSchema';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'user-123';
    const notifications = await userAdapter.getNotifications(userId);
    return NextResponse.json(notifications);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch notifications';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'user-123';
    const body = await request.json();

    // Validate request body
    const validation = notificationSettingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid notification settings', details: validation.error },
        { status: 400 }
      );
    }

    const updated = await userAdapter.updateNotifications(userId, body);
    return NextResponse.json(updated);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to update notifications';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

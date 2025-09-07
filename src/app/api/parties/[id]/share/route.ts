import { Party, SHARED_ROLES } from '@/models/Party';
import { NextRequest, NextResponse } from 'next/server';
import {
  handleApiError,
  findPartyWithEditAccess,
  setupPartyRoute,
} from '@/app/api/parties/_utils/party-api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/parties/[id]/share - Share party with another user
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const setup = await setupPartyRoute(params);
    if (setup.authError) return setup.authError;
    if (setup.validationError) return setup.validationError;

    const { party, error } = await findPartyWithEditAccess(setup.id!, setup.userId!);
    if (error) return error;

    const body = await req.json();
    const { userId, role } = body;

    // Validate required fields
    if (!userId || !role) {
      return new NextResponse('userId and role are required', { status: 400 });
    }

    // Validate role
    if (!SHARED_ROLES.includes(role)) {
      return new NextResponse('Invalid role. Must be viewer or editor', { status: 400 });
    }

    // Prevent owner from sharing with themselves
    if (userId === party!.userId) {
      return new NextResponse('Cannot share party with yourself', { status: 400 });
    }

    // Check if user is already shared with the party
    const existingShareIndex = party!.sharedWith.findIndex(
      (share: { userId: string }) => share.userId === userId
    );

    if (existingShareIndex !== -1) {
      // Update existing share
      party!.sharedWith[existingShareIndex].role = role;
      party!.sharedWith[existingShareIndex].sharedAt = new Date();
    } else {
      // Add new share
      party!.sharedWith.push({
        userId,
        role,
        sharedAt: new Date(),
      });
    }

    const updatedParty = await party!.save();
    return NextResponse.json(updatedParty);

  } catch (error: any) {
    // Handle JSON parsing errors from req.json()
    if (error.name === 'SyntaxError' || error.message?.includes('JSON')) {
      return new NextResponse('Invalid JSON in request body', { status: 400 });
    }
    return handleApiError(error, 'sharing party');
  }
}
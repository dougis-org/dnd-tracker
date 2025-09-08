import { Party, SHARED_ROLES, IParty } from '@/models/Party';
import { NextRequest, NextResponse } from 'next/server';
import {
  handlePostWithJsonBody,
  findPartyWithEditAccess,
} from '@/app/api/parties/_utils/party-api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface ShareRequestBody {
  userId: string;
  role: string;
}

async function handleShareBody(body: ShareRequestBody, party: IParty): Promise<NextResponse> {
  const { userId, role } = body;

  // Validate required fields
  if (!userId || !role) {
    return new NextResponse('userId and role are required', { status: 400 });
  }

  // Validate role
  if (!SHARED_ROLES.includes(role as 'viewer' | 'editor')) {
    return new NextResponse('Invalid role. Must be viewer or editor', { status: 400 });
  }

  // Prevent owner from sharing with themselves
  if (userId === party.userId) {
    return new NextResponse('Cannot share party with yourself', { status: 400 });
  }

  // Check if user is already shared with the party
  const existingShareIndex = party.sharedWith.findIndex(
    (share: { userId: string }) => share.userId === userId
  );

  const validatedRole = role as 'viewer' | 'editor';

  if (existingShareIndex !== -1) {
    // Update existing share
    party.sharedWith[existingShareIndex].role = validatedRole;
    party.sharedWith[existingShareIndex].sharedAt = new Date();
  } else {
    // Add new share
    party.sharedWith.push({
      userId,
      role: validatedRole,
      sharedAt: new Date(),
    });
  }

  const updatedParty = await party.save();
  return NextResponse.json(updatedParty);
}

// POST /api/parties/[id]/share - Share party with another user
export async function POST(req: NextRequest, { params }: RouteParams) {
  return handlePostWithJsonBody(req, params, findPartyWithEditAccess, handleShareBody);
}
import { Party, IParty } from '@/models/Party';
import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateUser,
  validateObjectId,
  findPartyWithAccess,
  findPartyWithEditAccess,
  findPartyWithDeleteAccess,
  handleApiError,
} from '../_utils/party-api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/parties/[id] - Get specific party
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { userId, error: authError } = await authenticateUser();
  if (authError) return authError;

  try {
    const { id } = await params;
    
    const { valid, error: validationError } = validateObjectId(id);
    if (!valid) return validationError!;

    const { party, error: accessError } = await findPartyWithAccess(id, userId!);
    if (accessError) return accessError;

    return NextResponse.json(party);
  } catch (error) {
    return handleApiError(error, 'fetching party');
  }
}

// PUT /api/parties/[id] - Update specific party
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { userId, error: authError } = await authenticateUser();
  if (authError) return authError;

  try {
    const { id } = await params;
    
    const { valid, error: validationError } = validateObjectId(id);
    if (!valid) return validationError!;

    const { party, error: accessError } = await findPartyWithEditAccess(id, userId!);
    if (accessError) return accessError;

    const body = await req.json();
    const { name, description, campaignName, maxSize } = body;

    // Validate required fields
    if (name !== undefined && (!name || name.trim().length === 0)) {
      return new NextResponse('Name is required', { status: 400 });
    }

    // Update only provided fields
    const updateData: Partial<IParty> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (campaignName !== undefined) updateData.campaignName = campaignName;
    if (maxSize !== undefined) updateData.maxSize = maxSize;

    const updatedParty = await Party.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedParty);
  } catch (error) {
    return handleApiError(error, 'updating party');
  }
}

// DELETE /api/parties/[id] - Delete specific party  
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { userId, error: authError } = await authenticateUser();
  if (authError) return authError;

  try {
    const { id } = await params;
    
    const { valid, error: validationError } = validateObjectId(id);
    if (!valid) return validationError!;

    const { party, error: accessError } = await findPartyWithDeleteAccess(id, userId!);
    if (accessError) return accessError;

    await Party.findByIdAndDelete(id);
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, 'deleting party');
  }
}
import { Party, IParty } from '@/models/Party';
import { NextRequest, NextResponse } from 'next/server';
import {
  handleGetParty,
  handleUpdateParty,
  handleDeleteParty,
  handleApiError,
} from '../_utils/party-api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/parties/[id] - Get specific party
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const result = await handleGetParty(params);
    if ('party' in result) {
      return NextResponse.json(result.party);
    }
    return result; // Return error response
  } catch (error) {
    return handleApiError(error, 'fetching party');
  }
}

// PUT /api/parties/[id] - Update specific party
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const result = await handleUpdateParty(params);
    if (!('party' in result)) {
      return result; // Return error response
    }

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
      result.id,
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
  try {
    const result = await handleDeleteParty(params);
    if (!('party' in result)) {
      return result; // Return error response
    }

    await Party.findByIdAndDelete(result.id);
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, 'deleting party');
  }
}
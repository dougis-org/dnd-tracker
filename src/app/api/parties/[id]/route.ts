import { auth } from '@clerk/nextjs/server';
import { Party, IParty } from '@/models/Party';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// GET /api/parties/[id] - Get specific party
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { id } = await props.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid party ID', { status: 400 });
    }

    const party = await Party.findById(id);
    
    if (!party) {
      return new NextResponse('Party not found', { status: 404 });
    }

    // Check if user has access (owner or shared with user)
    const hasAccess = party.userId === userId || 
      party.sharedWith.some((share: IParty['sharedWith'][0]) => share.userId === userId);
    
    if (!hasAccess) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    return NextResponse.json(party);
  } catch (error) {
    console.error('Error fetching party:', error);
    return new NextResponse('Error fetching party', { status: 500 });
  }
}

// PUT /api/parties/[id] - Update specific party
export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { id } = await props.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid party ID', { status: 400 });
    }

    const party = await Party.findById(id);
    
    if (!party) {
      return new NextResponse('Party not found', { status: 404 });
    }

    // Check if user has edit permission (owner or editor role)
    const isOwner = party.userId === userId;
    const hasEditorRole = party.sharedWith.some(
      (share: IParty['sharedWith'][0]) => share.userId === userId && share.role === 'editor'
    );
    
    if (!isOwner && !hasEditorRole) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await req.json();
    const { name, description, campaignName, maxSize } = body;

    // Validate required fields
    if (name !== undefined && (!name || name.trim().length === 0)) {
      return new NextResponse('Name is required', { status: 400 });
    }

    // Update only provided fields
    const updateData: any = {};
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
    console.error('Error updating party:', error);
    return new NextResponse('Error updating party', { status: 500 });
  }
}

// DELETE /api/parties/[id] - Delete specific party  
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { id } = await props.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid party ID', { status: 400 });
    }

    const party = await Party.findById(id);
    
    if (!party) {
      return new NextResponse('Party not found', { status: 404 });
    }

    // Only owner can delete party (not editors)
    if (party.userId !== userId) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    await Party.findByIdAndDelete(id);
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting party:', error);
    return new NextResponse('Error deleting party', { status: 500 });
  }
}
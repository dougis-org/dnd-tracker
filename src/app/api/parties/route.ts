import { Party } from '@/models/Party';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, handleApiError } from './_utils/party-api-utils';

export async function GET(req: NextRequest) {
  const { userId, error } = await authenticateUser();
  if (error) return error;

  try {
    const parties = await Party.find({
      $or: [{ userId }, { 'sharedWith.userId': userId }],
    }).populate('characters.characterId');
    return NextResponse.json(parties);
  } catch (error) {
    // If Character schema isn't available, fetch without population
    const parties = await Party.find({
      $or: [{ userId }, { 'sharedWith.userId': userId }],
    });
    return NextResponse.json(parties);
  }
}

export async function POST(req: NextRequest) {
  const { userId, error } = await authenticateUser();
  if (error) return error;

  try {
    const body = await req.json();
    const { name, description, campaignName, maxSize } = body;

    const newParty = new Party({
      userId,
      name,
      description,
      campaignName,
      maxSize,
    });

    const savedParty = await newParty.save();
    return NextResponse.json(savedParty, { status: 201 });
  } catch (error: any) {
    // Handle JSON parsing errors from req.json()
    if (error.name === 'SyntaxError' || error.message?.includes('JSON')) {
      return new NextResponse('Invalid JSON in request body', { status: 400 });
    }
    return handleApiError(error, 'creating party');
  }
}

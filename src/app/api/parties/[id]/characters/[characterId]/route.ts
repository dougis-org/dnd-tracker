import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { Party, type IParty } from '@/models/Party';
import { canEditParty } from '@/lib/utils/user-context';
import { EMAIL_REGEX } from '../../_utils/party-api-utils';
import { Types } from 'mongoose';

interface UpdateCharacterRequest {
  playerName?: string;
  playerEmail?: string;
  isActive?: boolean;
}

type CharacterAssignment = IParty['characters'][number];

/**
 * DELETE /api/parties/[id]/characters/[characterId]
 * Remove a character from a party
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; characterId: string }> }
) {
  try {
    const { id: partyId, characterId } = await params;
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    // Validate ID formats
    if (!Types.ObjectId.isValid(partyId)) {
      return new NextResponse('Invalid party ID format', { status: 400 });
    }

    if (!Types.ObjectId.isValid(characterId)) {
      return new NextResponse('Invalid character ID format', { status: 400 });
    }

    // Find the party
    const party = await Party.findById(partyId);
    if (!party) {
      return new NextResponse('Party not found', { status: 404 });
    }

    // Check if user can edit this party
    if (!canEditParty(party, userId)) {
      return new NextResponse('Insufficient permissions to edit this party', {
        status: 403,
      });
    }

    // Find the character assignment
    const characterIndex = party.characters.findIndex(
      (char: CharacterAssignment) => char.characterId.toString() === characterId
    );

    if (characterIndex === -1) {
      return new NextResponse('Character not found in this party', {
        status: 404,
      });
    }

    // Remove the character from the party
    party.characters.splice(characterIndex, 1);
    await party.save();

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error removing character from party:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

/**
 * PUT /api/parties/[id]/characters/[characterId]
 * Update character assignment details
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; characterId: string }> }
) {
  try {
    const { id: partyId, characterId } = await params;
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    // Validate ID formats
    if (!Types.ObjectId.isValid(partyId)) {
      return new NextResponse('Invalid party ID format', { status: 400 });
    }

    if (!Types.ObjectId.isValid(characterId)) {
      return new NextResponse('Invalid character ID format', { status: 400 });
    }

    const body: UpdateCharacterRequest = await req.json();
    const { playerName, playerEmail, isActive } = body;

    // Find the party
    const party = await Party.findById(partyId);
    if (!party) {
      return new NextResponse('Party not found', { status: 404 });
    }

    // Check if user can edit this party
    if (!canEditParty(party, userId)) {
      return new NextResponse('Insufficient permissions to edit this party', {
        status: 403,
      });
    }

    // Find the character assignment
    const characterAssignment = party.characters.find(
      (char: CharacterAssignment) => char.characterId.toString() === characterId
    );

    if (!characterAssignment) {
      return new NextResponse('Character not found in this party', {
        status: 404,
      });
    }

    // Validate email if provided
    if (playerEmail !== undefined) {
      if (playerEmail && !EMAIL_REGEX.test(playerEmail)) {
        return new NextResponse('Invalid email format', { status: 400 });
      }
    }

    // Update character assignment details
    if (playerName !== undefined) {
      characterAssignment.playerName = playerName.trim() || undefined;
    }

    if (playerEmail !== undefined) {
      characterAssignment.playerEmail = playerEmail
        ? playerEmail.trim().toLowerCase()
        : undefined;
    }

    if (isActive !== undefined) {
      characterAssignment.isActive = isActive;
    }

    await party.save();

    // Return updated party with populated character data
    const updatedParty = await Party.findById(partyId).populate(
      'characters.characterId'
    );

    return NextResponse.json(updatedParty, { status: 200 });
  } catch (error) {
    console.error('Error updating character assignment:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
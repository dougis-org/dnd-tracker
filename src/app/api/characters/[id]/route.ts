import { NextRequest, NextResponse } from 'next/server';

import { ApiErrors, withAuthAndDb } from '@/lib/api/common';
import { validateUpdateCharacter } from '@/lib/validations/characters';
import { CharacterService } from '@/lib/services/characterService';
import { handleCharacterNotFound, handleCharacterErrors } from '@/lib/api/character-helpers';

interface RouteParams {
  id: string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { id } = await params;
  return withAuthAndDb(async (userId) => {
    try {
      const character = await CharacterService.getCharacter({
        userId,
        characterId: id,
      });

      return NextResponse.json(character, { status: 200 });
    } catch (error) {
      const handled = handleCharacterNotFound(error);
      if (handled) return handled;
      return handleCharacterErrors('GET /api/characters/[id]', error) as never;
    }
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { id } = await params;
  return withAuthAndDb(async (userId) => {
    try {
      const body = await req.json();
      const validation = validateUpdateCharacter(body);

      if (!validation.success) {
        return ApiErrors.badRequest(
          `Validation error: ${validation.error.message}`
        );
      }

      // Transform Zod output to match service interface
      const updates = {
        ...(validation.data.name !== undefined && {
          name: validation.data.name,
        }),
        ...(validation.data.abilityScores !== undefined && {
          abilityScores: validation.data.abilityScores,
        }),
        ...(validation.data.classes && {
          classes: validation.data.classes.map((cls) => ({
            classId: cls.classId,
            level: cls.level,
            ...(cls.name !== undefined && { name: cls.name }),
            ...(cls.hitDie !== undefined && { hitDie: cls.hitDie }),
            ...(cls.savingThrows !== undefined && {
              savingThrows: cls.savingThrows,
            }),
          })),
        }),
        ...(validation.data.hitPoints !== undefined && {
          hitPoints: validation.data.hitPoints,
        }),
        ...(validation.data.baseArmorClass !== undefined && {
          baseArmorClass: validation.data.baseArmorClass,
        }),
      };

      const character = await CharacterService.updateCharacter({
        userId,
        characterId: id,
        updates,
      });

      return NextResponse.json(character, { status: 200 });
    } catch (error) {
      const handled = handleCharacterNotFound(error);
      if (handled) return handled;
      return handleCharacterErrors('PUT /api/characters/[id]', error) as never;
    }
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { id } = await params;
  return withAuthAndDb(async (userId) => {
    try {
      await CharacterService.deleteCharacter({
        userId,
        characterId: id,
      });

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      const handled = handleCharacterNotFound(error);
      if (handled) return handled;
      return handleCharacterErrors('DELETE /api/characters/[id]', error) as never;
    }
  });
}

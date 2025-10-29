import { NextRequest, NextResponse } from 'next/server';

import { ApiErrors, withAuthAndDb } from '@/lib/api/common';
import {
  validateCreateCharacter,
  validateListCharactersQuery,
} from '@/lib/validations/characters';
import {
  CharacterService,
  type CreateCharacterPayload,
} from '@/lib/services/characterService';

export async function POST(req: NextRequest) {
  return withAuthAndDb(async (userId) => {
    try {
      const body = await req.json();
      const validation = validateCreateCharacter(body);

      if (!validation.success) {
        return ApiErrors.badRequest(
          `Validation error: ${validation.error.message}`
        );
      }

      // Transform Zod output to match service interface
      const payload: CreateCharacterPayload = {
        name: validation.data.name,
        raceId: validation.data.raceId,
        abilityScores: validation.data.abilityScores,
        classes: validation.data.classes.map((cls) => ({
          classId: cls.classId,
          level: cls.level,
          ...(cls.name !== undefined && { name: cls.name }),
          ...(cls.hitDie !== undefined && { hitDie: cls.hitDie }),
          ...(cls.savingThrows !== undefined && {
            savingThrows: cls.savingThrows,
          }),
        })),
        hitPoints: validation.data.hitPoints,
        ...(validation.data.baseArmorClass !== undefined && {
          baseArmorClass: validation.data.baseArmorClass,
        }),
        ...(validation.data.proficientSkills && {
          proficientSkills: validation.data.proficientSkills,
        }),
        ...(validation.data.bonusSavingThrows && {
          bonusSavingThrows: validation.data.bonusSavingThrows,
        }),
      };

      const character = await CharacterService.createCharacter({
        userId,
        payload,
      });

      return NextResponse.json(character, { status: 201 });
    } catch (error) {
      console.error('POST /api/characters error:', error);
      throw error;
    }
  });
}

export async function GET(req: NextRequest) {
  return withAuthAndDb(async (userId) => {
    try {
      const { searchParams } = new URL(req.url);
      const queryData = {
        page: searchParams.get('page'),
        pageSize: searchParams.get('pageSize'),
        includeDeleted: searchParams.get('includeDeleted'),
      };

      const validation = validateListCharactersQuery(queryData);

      if (!validation.success) {
        return ApiErrors.badRequest(
          `Validation error: ${validation.error.message}`
        );
      }

      const result = await CharacterService.listCharacters({
        userId,
        page: validation.data.page,
        pageSize: validation.data.pageSize,
        includeDeleted: validation.data.includeDeleted,
      });

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      console.error('GET /api/characters error:', error);
      throw error;
    }
  });
}

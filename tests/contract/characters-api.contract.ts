import { describe, expect, it } from '@jest/globals';

const API_BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const AUTH_HEADER = 'Bearer valid_clerk_jwt';

const baseCharacterPayload = {
  name: 'Test Character',
  raceId: 'race-human',
  abilityScores: {
    str: 12,
    dex: 14,
    con: 13,
    int: 10,
    wis: 11,
    cha: 8,
  },
  classes: [
    { classId: 'fighter', level: 3 },
    { classId: 'wizard', level: 2 },
  ],
};

describe('Characters API contract', () => {
  let createdCharacterId: string;

  it('creates a character per POST /api/characters contract', async () => {
    const response = await fetch(`${API_BASE_URL}/api/characters`, {
      method: 'POST',
      headers: {
        Authorization: AUTH_HEADER,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(baseCharacterPayload),
    });

    expect(response.status).toBe(201);

    const payload = await response.json();

    expect(payload).toHaveProperty('id');
    expect(payload).toHaveProperty('name', baseCharacterPayload.name);
    expect(payload).toHaveProperty('totalLevel', 5);
    expect(payload).toHaveProperty('proficiencyBonus');
    expect(payload).toHaveProperty('abilityScores');
    expect(payload).toHaveProperty('abilityModifiers');
    expect(payload).toHaveProperty('skills');
    expect(payload).toHaveProperty('savingThrows');
    expect(payload).toHaveProperty('hitPoints');
    expect(payload).toHaveProperty('maxHitPoints');
    expect(payload).toHaveProperty('armorClass');
    expect(payload).toHaveProperty('initiative');

    createdCharacterId = payload.id;
  });

  it('lists characters per GET /api/characters contract', async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/characters?page=1&pageSize=20`,
      {
        method: 'GET',
        headers: {
          Authorization: AUTH_HEADER,
          'Content-Type': 'application/json',
        },
      }
    );

    expect(response.status).toBe(200);

    const payload = await response.json();

    expect(payload).toHaveProperty('characters');
    expect(Array.isArray(payload.characters)).toBe(true);
    expect(payload).toHaveProperty('pagination');
    expect(payload.pagination).toHaveProperty('page');
    expect(payload.pagination).toHaveProperty('pageSize');
    expect(payload.pagination).toHaveProperty('total');
    expect(payload.pagination).toHaveProperty('pages');

    if (payload.characters.length > 0) {
      const character = payload.characters[0];
      expect(character).toHaveProperty('id');
      expect(character).toHaveProperty('name');
      expect(character).toHaveProperty('race');
      expect(character).toHaveProperty('classes');
      expect(character).toHaveProperty('totalLevel');
      expect(character).toHaveProperty('armorClass');
      expect(character).toHaveProperty('hitPoints');
    }
  });

  it('retrieves a single character per GET /api/characters/:id contract', async () => {
    const characterId = createdCharacterId ?? '000000000000000000000000';
    const response = await fetch(
      `${API_BASE_URL}/api/characters/${characterId}`,
      {
        method: 'GET',
        headers: {
          Authorization: AUTH_HEADER,
          'Content-Type': 'application/json',
        },
      }
    );

    expect(response.status).toBe(200);

    const payload = await response.json();

    expect(payload).toHaveProperty('id');
    expect(payload).toHaveProperty('abilityScores');
    expect(payload).toHaveProperty('abilityModifiers');
    expect(payload).toHaveProperty('skills');
    expect(payload).toHaveProperty('savingThrows');
    expect(payload).toHaveProperty('totalLevel');
    expect(payload).toHaveProperty('proficiencyBonus');
    expect(payload).toHaveProperty('hitPoints');
    expect(payload).toHaveProperty('maxHitPoints');
    expect(payload).toHaveProperty('armorClass');
    expect(payload).toHaveProperty('initiative');
  });

  it('updates a character per PUT /api/characters/:id contract', async () => {
    const characterId = createdCharacterId ?? '000000000000000000000000';
    const response = await fetch(
      `${API_BASE_URL}/api/characters/${characterId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: AUTH_HEADER,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Updated Character Name',
          abilityScores: {
            ...baseCharacterPayload.abilityScores,
            dex: 16,
          },
        }),
      }
    );

    expect(response.status).toBe(200);

    const payload = await response.json();

    expect(payload).toHaveProperty('name', 'Updated Character Name');
    expect(payload).toHaveProperty('abilityModifiers');
    expect(payload.abilityModifiers).toHaveProperty('dex');
    expect(payload).toHaveProperty('totalLevel');
    expect(payload).toHaveProperty('proficiencyBonus');
  });

  it('soft deletes a character per DELETE /api/characters/:id contract', async () => {
    const characterId = createdCharacterId ?? '000000000000000000000000';
    const response = await fetch(
      `${API_BASE_URL}/api/characters/${characterId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: AUTH_HEADER,
          'Content-Type': 'application/json',
        },
      }
    );

    expect([200, 204]).toContain(response.status);
  });

  it('duplicates a character per POST /api/characters/:id/duplicate contract', async () => {
    const characterId = createdCharacterId ?? '000000000000000000000000';
    const response = await fetch(
      `${API_BASE_URL}/api/characters/${characterId}/duplicate`,
      {
        method: 'POST',
        headers: {
          Authorization: AUTH_HEADER,
          'Content-Type': 'application/json',
        },
      }
    );

    expect(response.status).toBe(201);

    const payload = await response.json();

    expect(payload).toHaveProperty('id');
    expect(payload).toHaveProperty('name');
    expect(payload.name).toMatch(/Copy/);
    expect(payload).toHaveProperty('totalLevel');
    expect(payload).toHaveProperty('proficiencyBonus');
  });
});

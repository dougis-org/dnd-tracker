import {
  abilityScoresSchema,
  characterBaseSchema,
  characterClassEntrySchema,
  characterClassesSchema,
  characterNameSchema,
  PHB_CLASS_OPTIONS,
} from '@/lib/validations/character';

describe('character validation schemas', () => {
  const validAbilityScores = {
    str: 15,
    dex: 14,
    con: 13,
    int: 12,
    wis: 10,
    cha: 8,
  } as const;

  const validClasses = [
    { className: 'Fighter' as (typeof PHB_CLASS_OPTIONS)[number], level: 5 },
  ];

  it('validates a proper character payload', () => {
    const result = characterBaseSchema.safeParse({
      name: 'Aragorn',
      race: 'Human',
      abilityScores: validAbilityScores,
      classes: validClasses,
    });

    expect(result.success).toBe(true);
  });

  it('rejects names shorter than 1 character after trimming', () => {
    const result = characterNameSchema.safeParse('   ');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/name is required/i);
    }
  });

  it('rejects names longer than 255 characters', () => {
    const longName = 'A'.repeat(256);
    const result = characterNameSchema.safeParse(longName);

    expect(result.success).toBe(false);
  });

  it.each(Object.keys(validAbilityScores))('rejects ability score below 1 for %s', (key) => {
    const scores = { ...validAbilityScores, [key]: 0 };
    const result = abilityScoresSchema.safeParse(scores);

    expect(result.success).toBe(false);
  });

  it.each(Object.keys(validAbilityScores))('rejects ability score above 20 for %s', (key) => {
    const scores = { ...validAbilityScores, [key]: 21 };
    const result = abilityScoresSchema.safeParse(scores);

    expect(result.success).toBe(false);
  });

  it('rejects invalid race values', () => {
    const result = characterBaseSchema.safeParse({
      name: 'Invalid Race',
      race: 'Centaur',
      abilityScores: validAbilityScores,
      classes: validClasses,
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid class values', () => {
    const result = characterClassEntrySchema.safeParse({
      className: 'Samurai',
      level: 3,
    });

    expect(result.success).toBe(false);
  });

  it('rejects class level less than 1', () => {
    const result = characterClassEntrySchema.safeParse({
      className: 'Wizard',
      level: 0,
    });

    expect(result.success).toBe(false);
  });

  it('rejects class level greater than 20', () => {
    const result = characterClassEntrySchema.safeParse({
      className: 'Wizard',
      level: 21,
    });

    expect(result.success).toBe(false);
  });

  it('rejects total level above 20 across classes', () => {
    const result = characterClassesSchema.safeParse([
      { className: 'Wizard', level: 10 },
      { className: 'Fighter', level: 11 },
    ]);

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages.join(' ')).toMatch(/total character level/i);
    }
  });

  it('rejects duplicate class entries', () => {
    const result = characterClassesSchema.safeParse([
      { className: 'Wizard', level: 5 },
      { className: 'Wizard', level: 3 },
    ]);

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages.join(' ')).toMatch(/duplicate/i);
    }
  });

  it('rejects more than three class entries', () => {
    const result = characterClassesSchema.safeParse([
      { className: 'Wizard', level: 5 },
      { className: 'Fighter', level: 5 },
      { className: 'Rogue', level: 5 },
      { className: 'Cleric', level: 5 },
    ]);

    expect(result.success).toBe(false);
  });

  it('requires at least one class entry', () => {
    const result = characterClassesSchema.safeParse([]);

    expect(result.success).toBe(false);
  });
});

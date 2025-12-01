import {
  validateMemberForm,
  hasErrors,
  createDefaultFormData,
  formDataToPartyMember,
  MemberFormErrors,
  FormData,
} from '../../../src/lib/utils/memberFormHelpers';
import { PartyMember } from '../../../src/types/party';

describe('memberFormHelpers', () => {
  const createValidFormData = (
    overrides: Partial<FormData> = {}
  ): FormData => ({
    characterName: 'Test Character',
    class: 'Fighter',
    race: 'Human',
    level: 5,
    ac: 15,
    hp: 50,
    role: undefined,
    ...overrides,
  });

  const createPartyMember = (
    overrides: Partial<PartyMember> = {}
  ): PartyMember => ({
    id: '1',
    partyId: 'party-1',
    characterName: 'Test Character',
    class: 'Fighter',
    race: 'Human',
    level: 5,
    ac: 15,
    hp: 50,
    position: 0,
    ...overrides,
  });

  describe('validateMemberForm', () => {
    it('should return no errors for valid data', () => {
      const formData = createValidFormData();
      const errors = validateMemberForm(formData);
      expect(errors).toEqual({});
    });

    const missingFieldTests = [
      {
        field: 'characterName' as const,
        value: '',
        errorMsg: 'Character name is required',
      },
      {
        field: 'characterName' as const,
        value: '   ',
        errorMsg: 'Character name is required',
      },
      {
        field: 'class' as const,
        value: '' as unknown as FormData['class'],
        errorMsg: 'Class is required',
      },
      {
        field: 'race' as const,
        value: '' as unknown as FormData['race'],
        errorMsg: 'Race is required',
      },
    ];

    missingFieldTests.forEach(({ field, value, errorMsg }) => {
      it(`should return error for missing ${field}`, () => {
        const formData = createValidFormData({
          [field]: value,
        } as Partial<FormData>);
        const errors = validateMemberForm(formData);
        expect(errors[field]).toBe(errorMsg);
      });
    });

    const boundaryTests = [
      {
        field: 'level' as const,
        low: 0,
        high: 21,
        msg: 'Level must be between 1 and 20',
      },
      {
        field: 'ac' as const,
        low: 0,
        high: 31,
        msg: 'AC must be between 1 and 30',
      },
    ];

    boundaryTests.forEach(({ field, low, high, msg }) => {
      it(`should return error for ${field} too low`, () => {
        const formData = createValidFormData({
          [field]: low,
        } as Partial<FormData>);
        const errors = validateMemberForm(formData);
        expect(errors[field]).toBe(msg);
      });

      it(`should return error for ${field} too high`, () => {
        const formData = createValidFormData({
          [field]: high,
        } as Partial<FormData>);
        const errors = validateMemberForm(formData);
        expect(errors[field]).toBe(msg);
      });
    });

    it('should return error for HP zero or negative', () => {
      const formData = createValidFormData({ hp: 0 });
      const errors = validateMemberForm(formData);
      expect(errors.hp).toBe('HP must be greater than 0');
    });

    it('should accumulate multiple errors', () => {
      const formData = createValidFormData({
        characterName: '',
        level: 0,
        ac: 0,
        hp: -1,
      });
      const errors = validateMemberForm(formData);
      expect(errors.characterName).toBeDefined();
      expect(errors.level).toBeDefined();
      expect(errors.ac).toBeDefined();
      expect(errors.hp).toBeDefined();
    });
  });

  describe('hasErrors', () => {
    it('should return false for empty error object', () => {
      const errors: MemberFormErrors = {};
      expect(hasErrors(errors)).toBe(false);
    });

    it('should return true when errors exist', () => {
      const errors: MemberFormErrors = { characterName: 'Error' };
      expect(hasErrors(errors)).toBe(true);
    });

    it('should return true for multiple errors', () => {
      const errors: MemberFormErrors = {
        characterName: 'Name error',
        level: 'Level error',
      };
      expect(hasErrors(errors)).toBe(true);
    });
  });

  describe('createDefaultFormData', () => {
    it('should return empty form data when no member provided', () => {
      const formData = createDefaultFormData();

      expect(formData.characterName).toBe('');
      expect(formData.class).toBe('');
      expect(formData.race).toBe('');
      expect(formData.level).toBe(1);
      expect(formData.ac).toBe(10);
      expect(formData.hp).toBe(10);
      expect(formData.role).toBeUndefined();
    });

    it('should populate form data from existing member', () => {
      const member = createPartyMember({
        characterName: 'Existing',
        class: 'Wizard',
        race: 'Elf',
        level: 8,
        ac: 12,
        hp: 30,
        role: 'DPS',
      });

      const formData = createDefaultFormData(member);

      expect(formData.characterName).toBe('Existing');
      expect(formData.class).toBe('Wizard');
      expect(formData.race).toBe('Elf');
      expect(formData.level).toBe(8);
      expect(formData.ac).toBe(12);
      expect(formData.hp).toBe(30);
      expect(formData.role).toBe('DPS');
    });

    it('should use defaults for undefined member fields', () => {
      const member = createPartyMember({
        characterName: undefined as unknown as string,
        level: undefined as unknown as number,
        ac: undefined as unknown as number,
        hp: undefined as unknown as number,
      });

      const formData = createDefaultFormData(member);

      expect(formData.characterName).toBe('');
      expect(formData.level).toBe(1);
      expect(formData.ac).toBe(10);
      expect(formData.hp).toBe(10);
    });
  });

  describe('formDataToPartyMember', () => {
    it('should convert form data to party member', () => {
      const formData = createValidFormData();
      const partyId = 'party-123';
      const member = formDataToPartyMember(formData, partyId);

      expect(member.partyId).toBe(partyId);
      expect(member.characterName).toBe('Test Character');
      expect(member.class).toBe('Fighter');
      expect(member.race).toBe('Human');
      expect(member.level).toBe(5);
      expect(member.ac).toBe(15);
      expect(member.hp).toBe(50);
      expect(member.role).toBeUndefined();
    });

    it('should trim character name whitespace', () => {
      const formData = createValidFormData({ characterName: '  Test  ' });
      const member = formDataToPartyMember(formData, 'party-1');
      expect(member.characterName).toBe('Test');
    });

    const clampTests = [
      {
        field: 'level' as const,
        low: -5,
        high: 100,
        lowExpected: 1,
        highExpected: 20,
        desc: 'clamp level between 1 and 20',
      },
      {
        field: 'ac' as const,
        low: -5,
        high: 100,
        lowExpected: 1,
        highExpected: 30,
        desc: 'clamp AC between 1 and 30',
      },
    ];

    clampTests.forEach(
      ({ field, low, high, lowExpected, highExpected, desc }) => {
        it(`should ${desc}`, () => {
          const tooLow = formDataToPartyMember(
            createValidFormData({ [field]: low } as Partial<FormData>),
            'party-1'
          );
          expect(tooLow[field]).toBe(lowExpected);

          const tooHigh = formDataToPartyMember(
            createValidFormData({ [field]: high } as Partial<FormData>),
            'party-1'
          );
          expect(tooHigh[field]).toBe(highExpected);
        });
      }
    );

    it('should ensure HP is at least 1', () => {
      const tooLow = formDataToPartyMember(
        createValidFormData({ hp: -10 }),
        'party-1'
      );
      expect(tooLow.hp).toBe(1);

      const zero = formDataToPartyMember(
        createValidFormData({ hp: 0 }),
        'party-1'
      );
      expect(zero.hp).toBe(1);
    });

    it('should include role when provided', () => {
      const formData = createValidFormData({ role: 'Healer' });
      const member = formDataToPartyMember(formData, 'party-1');
      expect(member.role).toBe('Healer');
    });
  });
});

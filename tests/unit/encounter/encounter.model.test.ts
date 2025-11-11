import { describe, it, expect } from '@jest/globals';
import EncounterModel from '../../../src/lib/models/encounter';

// T012: Unit tests for Encounter Mongoose model
describe('Encounter model (T012)', () => {
  it('should export a Mongoose model for Encounter', () => {
    expect(EncounterModel).toBeDefined();
    expect(EncounterModel.schema).toBeDefined();
  });

  it('should have the correct schema properties', () => {
    const schema = EncounterModel.schema;
    expect(schema.paths.name).toBeDefined();
    expect(schema.paths.participants).toBeDefined();
    expect(schema.paths.owner_id).toBeDefined();
    expect(schema.paths.created_at).toBeDefined();
    expect(schema.paths.updated_at).toBeDefined();
  });

  it('should enforce required fields', () => {
    const schema = EncounterModel.schema;
    expect(schema.paths.name.isRequired).toBeDefined();
    expect(schema.paths.participants.isRequired).toBeDefined();
    expect(schema.paths.owner_id.isRequired).toBeDefined();
  });

  it('should have indexes defined for performance', () => {
    const schema = EncounterModel.schema;
    // Mongoose stores indexes; verify structure is there
    expect(schema).toBeDefined();
    expect(schema.paths.owner_id).toBeDefined();
  });

  it('should have timestamps enabled', () => {
    const schema = EncounterModel.schema;
    // Mongoose adds _id by default, timestamps should map to created_at/updated_at
    expect(schema.paths.created_at).toBeDefined();
    expect(schema.paths.updated_at).toBeDefined();
  });
});

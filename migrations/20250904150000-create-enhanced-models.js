/**
 * Migration: Create enhanced D&D models (Character and Party)
 * Version: 20250904150000
 * Created: 2024-09-04T15:00:00.000Z
 *
 * This migration creates enhanced D&D character and party models with improved
 * features while preserving Clerk-based authentication compatibility.
 */

/* eslint-env node */
module.exports = {
  version: '20250904150000',
  description: 'Create enhanced D&D models (Character and Party)',

  /**
   * Apply migration
   * @param {import('mongodb').Db} db
   */
  async up(db) {
    // Create enhanced characters collection
    const enhancedCharactersCollection = db.collection('enhancedcharacters');

    // Create indexes for enhanced characters
    await enhancedCharactersCollection.createIndex({ userId: 1, createdAt: -1 });
    await enhancedCharactersCollection.createIndex({ userId: 1, name: 1 });
    await enhancedCharactersCollection.createIndex({ userId: 1, isDeleted: 1 });
    await enhancedCharactersCollection.createIndex({ isPublic: 1, createdAt: -1 });
    await enhancedCharactersCollection.createIndex({ isPublic: 1, name: 1 });
    await enhancedCharactersCollection.createIndex({ createdAt: -1 });
    await enhancedCharactersCollection.createIndex({ updatedAt: -1 });
    await enhancedCharactersCollection.createIndex({ type: 1 });
    await enhancedCharactersCollection.createIndex({ 'classes.class': 1 });
    await enhancedCharactersCollection.createIndex({ race: 1 });
    await enhancedCharactersCollection.createIndex({ name: 'text' });
    await enhancedCharactersCollection.createIndex({ partyId: 1 });

    // Create enhanced parties collection
    const enhancedPartiesCollection = db.collection('enhancedparties');

    // Create indexes for enhanced parties
    await enhancedPartiesCollection.createIndex({ userId: 1, createdAt: -1 });
    await enhancedPartiesCollection.createIndex({ userId: 1, name: 1 });
    await enhancedPartiesCollection.createIndex({ isPublic: 1, createdAt: -1 });
    await enhancedPartiesCollection.createIndex({ isPublic: 1, name: 1 });
    await enhancedPartiesCollection.createIndex({ createdAt: -1 });
    await enhancedPartiesCollection.createIndex({ updatedAt: -1 });
    await enhancedPartiesCollection.createIndex({ name: 'text', description: 'text' });
    await enhancedPartiesCollection.createIndex({ tags: 1 });
    await enhancedPartiesCollection.createIndex({ 'settings.allowJoining': 1 });
    await enhancedPartiesCollection.createIndex({ lastActivity: -1 });
    await enhancedPartiesCollection.createIndex({ sharedWith: 1 });

    console.log('Enhanced D&D models migration completed successfully');
  },

  /**
   * Rollback migration
   * @param {import('mongodb').Db} db
   */
  async down(db) {
    // Drop enhanced characters collection
    const enhancedCharactersCollection = db.collection('enhancedcharacters');
    await enhancedCharactersCollection.drop();

    // Drop enhanced parties collection
    const enhancedPartiesCollection = db.collection('enhancedparties');
    await enhancedPartiesCollection.drop();

    console.log('Enhanced D&D models migration rolled back successfully');
  }
};
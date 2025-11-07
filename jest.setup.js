import '@testing-library/jest-dom';

// Mock bson ObjectId for tests
jest.mock('bson', () => ({
  ObjectId: class MockObjectId {
    constructor() {
      this.id = Math.random().toString(36).substring(2, 15);
    }
    toHexString() {
      return this.id;
    }
  },
}));

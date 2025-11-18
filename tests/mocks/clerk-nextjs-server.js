module.exports = {
  auth: jest.fn(async () => ({
    userId: 'test-user-id',
    sessionId: 'test-session-id',
    getToken: jest.fn(async () => 'mock-token'),
  })),
  currentUser: jest.fn(async () => ({
    id: 'test-user-id',
    fullName: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    imageUrl: 'https://example.com/avatar.jpg',
    primaryEmailAddress: {
      emailAddress: 'test@example.com',
    },
  })),
};

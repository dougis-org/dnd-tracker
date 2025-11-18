module.exports = {
  ClerkProvider: ({ children }) => children,
  useAuth: jest.fn(() => ({
    isLoaded: true,
    userId: 'test-user-id',
    sessionId: 'test-session-id',
    signOut: jest.fn(),
  })),
  useUser: jest.fn(() => ({
    isLoaded: true,
    user: {
      id: 'test-user-id',
      fullName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      imageUrl: 'https://example.com/avatar.jpg',
      primaryEmailAddress: {
        emailAddress: 'test@example.com',
      },
    },
  })),
  useClerk: jest.fn(() => ({
    signOut: jest.fn(),
  })),
};

// Clerk session mock helpers (restored from main)
export type ClerkSessionMock = {
  userId: string | null;
  sessionId: null;
  sessionStatus: 'active' | null;
  sessionClaims: any;
  actor?: any;
  getToken: jest.Mock;
  isAuthenticated: boolean;
  tokenType: string;
  orgId: string | null;
  orgRole: string | null;
  orgSlug: string | null;
  orgPermissions: any;
  factorVerificationAge: any;
  redirectToSignIn: () => never;
  redirectToSignUp: () => never;
  has: jest.Mock;
  debug: jest.Mock;
};

export function getMockSignedOutSession(): ClerkSessionMock {
  return {
    userId: null,
    sessionId: null,
    sessionStatus: null,
    sessionClaims: null,
    actor: null,
    getToken: jest.fn(),
    isAuthenticated: false,
    tokenType: 'session_token',
    orgId: null,
    orgRole: null,
    orgSlug: null,
    orgPermissions: null,
    factorVerificationAge: null,
    redirectToSignIn: (): never => {
      throw new Error('redirect');
    },
    redirectToSignUp: (): never => {
      throw new Error('redirect');
    },
    has: jest.fn(),
    debug: jest.fn(),
  };
}

export function getMockSignedInSession({
  userId = 'user_12345',
  sessionClaims = {
    sub: 'user_12345',
    iss: '',
    sid: '',
    nbf: 0,
    exp: 0,
    iat: 0,
    aud: '',
    __raw: '',
  },
  actor = undefined,
  orgId = 'org_12345',
  orgRole = 'admin',
  orgSlug = 'test-org',
  orgPermissions = [],
  factorVerificationAge = [0, 0],
}: Partial<Omit<ClerkSessionMock, 'sessionId'>> = {}): ClerkSessionMock {
  return {
    userId,
    sessionId: null,
    sessionStatus: 'active',
    sessionClaims,
    actor,
    getToken: jest.fn(),
    isAuthenticated: true,
    tokenType: 'session_token',
    orgId,
    orgRole,
    orgSlug,
    orgPermissions,
    factorVerificationAge,
    redirectToSignIn: (): never => {
      throw new Error('redirect');
    },
    redirectToSignUp: (): never => {
      throw new Error('redirect');
    },
    has: jest.fn(),
    debug: jest.fn(),
  };
}

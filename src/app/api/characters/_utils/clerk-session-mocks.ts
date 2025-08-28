// Codacy CLI analysis required after file edit (see .github/instructions/codacy.instructions.md)
// Use Clerk-compatible function signatures for mocks, not Jest Mock

// Codacy CLI analysis required after file edit (see .github/instructions/codacy.instructions.md)
// Use Clerk-compatible function signatures for mocks, not Jest Mock

export type JwtPayload = {
  sub: string;
  iss: string;
  sid: string;
  nbf: number;
  exp: number;
  iat: number;
  aud: string;
  __raw: string;
};

export type SignedInAuthObject = {
  userId: string;
  sessionId: string;
  sessionStatus: 'active';
  sessionClaims: JwtPayload;
  actor: undefined;
  getToken: () => Promise<string>;
  isAuthenticated: true;
  tokenType: 'session_token';
  orgId: string;
  orgRole: string;
  orgSlug: string;
  orgPermissions: unknown;
  factorVerificationAge: unknown;
  redirectToSignIn: () => never;
  redirectToSignUp: () => never;
  has: () => boolean;
  debug: () => Record<string, unknown>;
};

export type SignedOutAuthObject = {
  userId: null;
  sessionId: null;
  sessionStatus: null;
  sessionClaims: null;
  actor: null;
  getToken: () => Promise<null>;
  isAuthenticated: false;
  tokenType: 'session_token';
  orgId: null;
  orgRole: null;
  orgSlug: null;
  orgPermissions: null;
  factorVerificationAge: null;
  redirectToSignIn: () => never;
  redirectToSignUp: () => never;
  has: () => boolean;
  debug: () => Record<string, unknown>;
};

export function getMockSignedOutSession(): SignedOutAuthObject {
  return {
    userId: null,
    sessionId: null,
    sessionStatus: null,
    sessionClaims: null,
    actor: null,
    getToken: async () => null,
    isAuthenticated: false,
    tokenType: 'session_token',
    orgId: null,
    orgRole: null,
    orgSlug: null,
    orgPermissions: null,
    factorVerificationAge: null,
    redirectToSignIn: () => {
      throw new Error('redirect');
    },
    redirectToSignUp: () => {
      throw new Error('redirect');
    },
    has: () => false,
    debug: () => ({}),
  };
}

export function getMockSignedInSession(
  params?: Partial<SignedInAuthObject>
): SignedInAuthObject {
  return {
    userId: params?.userId ?? 'user_12345',
    sessionId: params?.sessionId ?? 'sess_12345',
    sessionStatus: 'active',
    sessionClaims: params?.sessionClaims ?? {
      sub: 'user_12345',
      iss: '',
      sid: '',
      nbf: 0,
      exp: 0,
      iat: 0,
      aud: '',
      __raw: '',
    },
    actor: params?.actor ?? undefined,
    getToken: async () => 'mock-token',
    isAuthenticated: true,
    tokenType: 'session_token',
    orgId: params?.orgId ?? '',
    orgRole: params?.orgRole ?? '',
    orgSlug: params?.orgSlug ?? '',
    orgPermissions: params?.orgPermissions ?? [],
    factorVerificationAge: params?.factorVerificationAge ?? [0, 0],
    redirectToSignIn: () => {
      throw new Error('redirect');
    },
    redirectToSignUp: () => {
      throw new Error('redirect');
    },
    has: () => true,
    debug: () => ({}),
  };
}

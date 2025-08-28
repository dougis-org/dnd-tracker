// Codacy CLI analysis required after file edit (see .github/instructions/codacy.instructions.md)
import type { Mock } from 'jest-mock';

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
  actor?: undefined;
  getToken: Mock;
  isAuthenticated: true;
  tokenType: 'session_token';
  orgId?: string;
  orgRole?: string;
  orgSlug?: string;
  orgPermissions: unknown;
  factorVerificationAge: unknown;
  redirectToSignIn: () => never;
  redirectToSignUp: () => never;
  has: Mock;
  debug: Mock;
};

export type SignedOutAuthObject = {
  userId: null;
  sessionId: null;
  sessionStatus: null;
  sessionClaims: null;
  actor: null;
  getToken: Mock;
  isAuthenticated: false;
  tokenType: 'session_token';
  orgId: null;
  orgRole: null;
  orgSlug: null;
  orgPermissions: null;
  factorVerificationAge: null;
  redirectToSignIn: () => never;
  redirectToSignUp: () => never;
  has: Mock;
  debug: Mock;
};

export function getMockSignedOutSession(): SignedOutAuthObject {
  return {
    userId: null,
    sessionId: null,
    sessionStatus: null,
    sessionClaims: null,
    actor: null,
    getToken: jest.fn() as unknown as Mock,
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
    has: jest.fn() as unknown as Mock,
    debug: jest.fn() as unknown as Mock,
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
    actor: undefined,
    getToken: jest.fn() as unknown as Mock,
    isAuthenticated: true,
    tokenType: 'session_token',
    orgId: params?.orgId,
    orgRole: params?.orgRole,
    orgSlug: params?.orgSlug,
    orgPermissions: params?.orgPermissions ?? [],
    factorVerificationAge: params?.factorVerificationAge ?? [0, 0],
    redirectToSignIn: () => {
      throw new Error('redirect');
    },
    redirectToSignUp: () => {
      throw new Error('redirect');
    },
    has: jest.fn() as unknown as Mock,
    debug: jest.fn() as unknown as Mock,
  };
}

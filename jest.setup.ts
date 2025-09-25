import React from 'react'
import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Mock fetch for Node.js test environment
if (typeof jest !== 'undefined') {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({}),
      ok: true,
      status: 200,
    })
  ) as jest.Mock
}

// TextEncoder/TextDecoder are handled above

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock Clerk client-side
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: null, isLoaded: true }),
  useAuth: () => ({ isLoaded: true, isSignedIn: false }),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  SignInButton: ({ children }: { children: React.ReactNode }) => children,
  SignUpButton: ({ children }: { children: React.ReactNode }) => children,
  UserButton: () => React.createElement('div', null, 'UserButton'),
}))

// Mock Clerk server-side
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
  clerkClient: {
    users: {
      getUser: jest.fn(),
    },
  },
  currentUser: jest.fn(),
}))

// Mock database connection and models
jest.mock('@/lib/db/connection', () => ({
  connectToDatabase: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/lib/db/models/User', () => ({
  __esModule: true,
  default: {
    findByClerkId: jest.fn(),
    createFromClerkUser: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}))

jest.mock('@/lib/validations/auth', () => ({
  validateProfileUpdate: jest.fn(),
}))

// Mock Web APIs for Next.js server environment
const { TextEncoder, TextDecoder } = require('util')

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock NextRequest and NextResponse directly
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    public url: string
    public method: string
    public headers: Map<string, string>
    private _body: any

    constructor(url: string, init?: any) {
      this.url = url
      this.method = init?.method || 'GET'
      this.headers = new Map()
      if (init?.headers) {
        Object.entries(init.headers).forEach(([key, value]) => {
          this.headers.set(key.toLowerCase(), value as string)
        })
      }
      this._body = init?.body
    }

    async json() {
      return this._body ? JSON.parse(this._body) : {}
    }
  },
  NextResponse: {
    json: (data: any, options?: any) => ({
      json: async () => data,
      status: options?.status || 200
    })
  }
}))

global.Response = class MockResponse {
  constructor(public body?: any, public init?: any) {}
  static json(data: any, options?: any) {
    return { json: async () => data, status: options?.status || 200 }
  }
} as any

global.Headers = class MockHeaders extends Map {} as any

// Keep global mocks minimal - let individual tests handle their own mocking

// Setup global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
// tests/api.auth.test.js
// Unit tests for the auth validation function

// Mock the Supabase client
const mockGetUser = jest.fn();

jest.mock('../src/lib/supabaseClient.server.js', () => ({
  supabaseAdmin: {
    auth: {
      getUser: mockGetUser
    }
  }
}));

// Import the function to test
const authModule = require('../src/lib/auth.js');
const validateOwner = authModule.validateOwner || authModule.default;

describe('Auth Validation', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set the OWNER_EMAIL environment variable
    process.env.OWNER_EMAIL = 'owner@example.com';
    
    // Set NODE_ENV to test
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    // Clear the OWNER_EMAIL environment variable
    delete process.env.OWNER_EMAIL;
    delete process.env.NODE_ENV;
  });

  test('should validate owner with correct email', async () => {
    // Mock the Supabase getUser response
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          email: 'owner@example.com'
        }
      },
      error: null
    });

    const result = await validateOwner('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
    expect(result).toBe(true);
    expect(mockGetUser).toHaveBeenCalledWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
  });

  test('should reject non-owner user', async () => {
    // Mock the Supabase getUser response
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          email: 'user@example.com'
        }
      },
      error: null
    });

    const result = await validateOwner('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
    expect(result).toBe(false);
  });
});
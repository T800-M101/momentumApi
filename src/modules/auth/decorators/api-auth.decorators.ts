import { applyDecorators, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

export function ApiRegister() {
  return applyDecorators(
    UsePipes(new ValidationPipe({ whitelist: true, transform: true })),
    ApiOperation({ summary: 'Register a new account', description: 'Creates a user profile in the database and generates initial session tokens.' }),
    ApiBody({
      description: 'Credentials and metadata required to open a new user account',
      schema: {
        type: 'object',
        required: ['email', 'username', 'password'],
        properties: {
          email: { type: 'string', example: 'developer@example.com' },
          username: { type: 'string', example: 'dev_journal' },
          password: { type: 'string', example: 'SecurePassword123!' }
        }
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Account successfully provisioned.',
      schema: {
        example: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            username: 'dev_journal',
            email: 'developer@example.com'
          }
        }
      }
    }),
    ApiResponse({ status: 409, description: 'Conflict. Email or username already taken.' }),
    ApiResponse({ status: 400, description: 'Validation failed.' })
  );
}

export function ApiLogin() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    UsePipes(new ValidationPipe({ whitelist: true, transform: true })),
    ApiOperation({ summary: 'Authenticate user credentials', description: 'Verifies user identity matching either username or email, emitting an access token in the response and setting an HttpOnly Refresh Token cookie.' }),
    ApiBody({
      description: 'Accepts username OR email as the unique identifier alongside the raw password string',
      schema: {
        type: 'object',
        required: ['identifier', 'password'],
        properties: {
          identifier: { type: 'string', example: 'developer@example.com', description: 'Can be either your registration email or chosen username' },
          password: { type: 'string', example: 'SecurePassword123!' }
        }
      }
    }),
    ApiResponse({
      status: 200,
      description: 'Authentication successful. Refresh Token cookie injected into browser context.',
      schema: {
        example: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            username: 'dev_journal',
            email: 'developer@example.com'
          }
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Access Denied. Invalid identifier or bad password bounds.' })
  );
}

export function ApiRefreshSession() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Rotate volatile Access Token via secure cookie', description: 'Validates the incoming HttpOnly Refresh Token cookie to emit a fresh Short-Lived Access Token in RAM.' }),
    ApiResponse({
      status: 200,
      description: 'Session rotated smoothly. A new access token is generated.',
      schema: {
        example: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Access Denied. Expired or altered Refresh Token.' })
  );
}

export function ApiLogout() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiBearerAuth(), // Displays the lock icon for this specific endpoint
    ApiOperation({ summary: 'Terminate active session', description: 'Removes the volatile session variables and clears out the hashed Refresh Token reference from PostgreSQL.' }),
    ApiResponse({
      status: 200,
      description: 'Session successfully revoked.',
      schema: {
        example: {
          success: true
        }
      }
    }),
    ApiResponse({ status: 401, description: 'Unauthorized context.' })
  );
}
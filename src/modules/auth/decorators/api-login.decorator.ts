import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiLogin() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Login and get JWT token' }),
    ApiResponse({ 
      status: 200, 
      description: 'Login successful',
      schema: {
        example: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
  }),
  ApiResponse({ status: 401, description: 'Invalid credential.' })
  );
}
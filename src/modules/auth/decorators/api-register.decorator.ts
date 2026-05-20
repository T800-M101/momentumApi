import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiRegister() {
  return applyDecorators(
    ApiOperation({ summary: 'Register a new user' }),
    ApiResponse({ status: 201, description: 'User creates successfuly.' }),
    ApiResponse({ status: 409, description: 'The email is already in use.' })
  );
}
import { applyDecorators, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

export function ApiCreateMood() {
  return applyDecorators(
    UsePipes(new ValidationPipe({ whitelist: true, transform: true })),
    ApiOperation({ summary: 'Create a new mood tracker option', description: 'Adds a new emotional state configuration (label and emoji mapping) available for journal entries.' }),
    ApiBody({
      description: 'The label and visual emoji required to provision a new system mood',
      schema: {
        type: 'object',
        required: ['label', 'emoji'],
        properties: {
          label: { type: 'string', example: 'Productive' },
          emoji: { type: 'string', example: '🚀' }
        }
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Mood configuration successfully established.',
      schema: {
        example: {
          id: 4,
          label: 'Productive',
          emoji: '🚀'
        }
      }
    }),
    ApiResponse({ status: 400, description: 'Bad Request. Validation constraints failed.' })
  );
}

export function ApiFindAllMoods() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'List all available moods', description: 'Retrieves an array of all active emotional state settings, ordered sequentially by ID.' }),
    ApiResponse({
      status: 200,
      description: 'Collection of available system moods successfully retrieved.',
      schema: {
        example: [
          { id: 1, label: 'Happy', emoji: '😊' },
          { id: 2, label: 'Anxious', emoji: '😰' },
          { id: 3, label: 'Productive', emoji: '🚀' }
        ]
      }
    })
  );
}

export function ApiGetMoodById() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Get a specific mood by ID', description: 'Returns a single mood profile matching the target numerical identifier.' }),
    ApiParam({ name: 'id', description: 'The unique auto-incrementing numerical record ID', example: 3 }),
    ApiResponse({
      status: 200,
      description: 'Mood found successfully.',
      schema: {
        example: { id: 3, label: 'Productive', emoji: '🚀' }
      }
    }),
    ApiResponse({ status: 404, description: 'The requested mood tracking option does not exist.' })
  );
}

export function ApiUpdateMood() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    UsePipes(new ValidationPipe({ whitelist: true, transform: true })),
    ApiOperation({ summary: 'Modify an existing mood option', description: 'Performs a partial structural update to a target mood row utilizing schema field deltas.' }),
    ApiParam({ name: 'id', description: 'The unique auto-incrementing numerical record ID to modify', example: 3 }),
    ApiBody({
      description: 'Payload with properties to update',
      schema: {
        type: 'object',
        properties: {
          label: { type: 'string', example: 'Super Productive' }
        }
      }
    }),
    ApiResponse({
      status: 200,
      description: 'Mood modifications saved successfully.',
      schema: {
        example: { id: 3, label: 'Super Productive', emoji: '🚀' }
      }
    }),
    ApiResponse({ status: 404, description: 'Target mood row not found for modification.' })
  );
}

export function ApiRemoveMood() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Remove a mood option', description: 'Permanently deletes a target mood configurations metadata row from PostgreSQL storage.' }),
    ApiParam({ name: 'id', description: 'The unique auto-incrementing numerical record ID to remove', example: 3 }),
    ApiResponse({
      status: 200,
      description: 'Mood option safely dropped from runtime schema.',
      schema: {
        example: {
          success: true,
          message: 'The Mood with ID #3 was successfully removed.'
        }
      }
    }),
    ApiResponse({ status: 404, description: 'No target record matches the provided identification sequence.' })
  );
}
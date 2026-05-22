import { applyDecorators, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';

export function ApiGetStats() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Get user statistics', description: 'Returns the total number of entries and the active streak.' }),
    ApiResponse({ 
      status: 200, 
      description: 'Statistics successfully retrieved.',
      schema: {
        example: {
          totalEntries: 42,
          currentStreak: 7,
          longestStreak: 15
        }
      }
    }),
    ApiResponse({ status: 401, description: 'Unauthorized. Invalid or missing token.' })
  );
}

export function ApiCreateEntry() {
  return applyDecorators(
    UsePipes(new ValidationPipe({ whitelist: true, transform: true })),
    ApiOperation({ summary: 'Create a new entry', description: 'Creates a journal entry linking a specific mood and tags.' }),
    // 🚀 This forces Swagger to show the exact JSON expected in the Request Body
    ApiBody({
      description: 'Payload required to log a new journal entry',
      schema: {
        type: 'object',
        required: ['title', 'content', 'moodId'],
        properties: {
          title: { type: 'string', example: 'Reflecting on today\'s backend design' },
          content: { type: 'string', example: 'Successfully refactored the data layer using the repository pattern. Code feels tight.' },
          moodId: { type: 'number', example: 1 },
          tags: { 
            type: 'array', 
            items: { type: 'string' }, 
            example: ['backend', 'architecture', 'nestJS'] 
          }
        }
      }
    }),
    ApiResponse({ 
      status: 201, 
      description: 'The entry has been successfully created.',
      schema: {
        example: {
          id: 'b3b81d74-1234-4abc-9012-123456789abc',
          title: 'Reflecting on today\'s backend design',
          content: 'Successfully refactored the data layer using the repository pattern. Code feels tight.',
          moodId: 1,
          userId: 'usr_77x92',
          tags: ['backend', 'architecture', 'nestJS'],
          createdAt: '2026-05-22T15:45:00.000Z',
          updatedAt: '2026-05-22T15:45:00.000Z'
        }
      }
    }),
    ApiResponse({ status: 400, description: 'Invalid input data.' }),
    ApiResponse({ status: 404, description: 'The provided moodId does not exist.' })
  );
}

export function ApiFindAllEntries() {
  return applyDecorators(
    ApiOperation({ summary: 'List journal entries', description: 'Retrieves user entries. Optionally filters by a specific date or full-text keywords.' }),
    ApiQuery({ name: 'date', required: false, type: String, description: 'Strict YYYY-MM-DD format' }),
    ApiQuery({ name: 'search', required: false, type: String, description: 'Free text keywords or #tags' }),
    ApiResponse({ 
      status: 200, 
      description: 'List successfully retrieved.',
      schema: {
        example: [
          {
            id: 'b3b81d74-1234-4abc-9012-123456789abc',
            title: 'Morning Routine',
            content: 'Woke up early, ran 5k, high protein breakfast.',
            moodId: 2,
            tags: ['fitness', 'health'],
            createdAt: '2026-05-21T12:00:00.000Z'
          }
        ]
      }
    }),
    ApiResponse({ status: 400, description: 'Invalid date format.' })
  );
}

export function ApiGetEntryById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get an entry by ID', description: 'Returns a specific journal entry if it belongs to the authenticated user.' }),
    ApiParam({ name: 'id', description: 'Unique entry ID (UUID)', example: 'b3b81d74-1234-4abc-9012-123456789abc' }),
    ApiResponse({ 
      status: 200, 
      description: 'Entry successfully found.',
      schema: {
        example: {
          id: 'b3b81d74-1234-4abc-9012-123456789abc',
          title: 'Morning Routine',
          content: 'Woke up early, ran 5k, high protein breakfast.',
          moodId: 2,
          tags: ['fitness', 'health'],
          createdAt: '2026-05-21T12:00:00.000Z'
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden. You do not have permission to view this entry.' }),
    ApiResponse({ status: 404, description: 'The entry does not exist.' })
  );
}

export function ApiUpdateEntry() {
  return applyDecorators(
    UsePipes(new ValidationPipe({ whitelist: true, transform: true })),
    ApiOperation({ summary: 'Update an existing entry', description: 'Modifies entry fields and updates its relationships.' }),
    ApiParam({ name: 'id', description: 'Unique ID of the entry to modify (UUID)', example: 'b3b81d74-1234-4abc-9012-123456789abc' }),
    ApiBody({
      description: 'Properties to update (Partial or whole record)',
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string', example: 'Updated Title' },
          content: { type: 'string', example: 'Updated content string.' }
        }
      }
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Entry successfully updated.',
      schema: {
        example: {
          id: 'b3b81d74-1234-4abc-9012-123456789abc',
          title: 'Updated Title',
          content: 'Updated content string.',
          moodId: 2,
          tags: ['fitness'],
          updatedAt: '2026-05-22T15:48:00.000Z'
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden. You do not have permission to modify this entry.' }),
    ApiResponse({ status: 404, description: 'The Mood or the Entry does not exist.' })
  );
}

export function ApiRemoveEntry() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a journal entry', description: 'Permanently removes a journal entry from the database.' }),
    ApiParam({ name: 'id', description: 'Unique ID of the entry to remove (UUID)', example: 'b3b81d74-1234-4abc-9012-123456789abc' }),
    ApiResponse({ 
      status: 200, 
      description: 'Entry successfully removed.',
      schema: {
        example: {
          success: true,
          message: 'Entry b3b81d74-1234-4abc-9012-123456789abc was deleted successfully.'
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden. You do not have permission to remove this entry.' })
  );
}
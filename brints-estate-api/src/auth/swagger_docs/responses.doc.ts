import { HttpStatus } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

export const CreatedUserResponse = {
  description: 'User registration successful',
  status: HttpStatus.CREATED,
  type: User,
};

export const ConflictResponse = {
  description: 'Conflict',
  status: HttpStatus.CONFLICT,
  schema: {
    type: 'object',
    properties: {
      status_code: {
        type: 'number',
        example: 409,
      },
      message: {
        type: 'string',
        example: 'User with email already exists',
      },
    },
  },
};

export const LoginUserResponse = {
  description: 'Login successful',
  status: HttpStatus.OK,
  schema: {
    type: 'object',
    properties: {
      api_version: {
        type: 'string',
        example: '1.0.0',
      },
      message: {
        type: 'string',
        example: 'Login successful',
      },
      status_code: {
        type: 'number',
        example: 200,
      },
      data: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: '909e3380-df25-4985-aa19-d01b4debb152',
              },
              createdAt: {
                type: 'string',
                example: '2024-11-01T13:51:21.374Z',
              },
              updatedAt: {
                type: 'string',
                example: '2024-11-01T13:51:21.374Z',
              },
              image_url: {
                type: 'string',
                example: 'https://example.com/image.jpg',
              },
              first_name: {
                type: 'string',
                example: 'John',
              },
              last_name: {
                type: 'string',
                example: 'Doe',
              },
              email: {
                type: 'string',
                example: 'test@example.com',
              },
              phone_number: {
                type: 'string',
                example: '+2348027872415',
              },
              gender: {
                type: 'string',
                example: 'male',
              },
              isVerified: {
                type: 'boolean',
                example: true,
              },
              last_login: {
                type: 'string',
                example: '2024-11-01T13:51:21.374Z',
              },
              account_status: {
                type: 'string',
                example: 'active',
              },
              role: {
                type: 'string',
                example: 'user',
              },
              isTwoFAEnabled: {
                type: 'boolean',
                example: false,
              },
              terms_and_conditions: {
                type: 'boolean',
                example: true,
              },
              privacy_policy: {
                type: 'boolean',
                example: true,
              },
              marketing_consent: {
                type: 'boolean',
                example: true,
              },
            },
          },
          tokens: {
            type: 'object',
            properties: {
              access_token: {
                type: 'string',
                example:
                  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MDllMzM4MC1kZjI1LTQ5ODUtYWExOS1kMDFiNGRlYmIxNTIiLCJmaXJzdF9uYW1lIjoiRG9yYXRoeSIsImxhc3RfbmFtZSI6Ikthd2F6YWtpIiwiZW1haWwiOiJhZmlhYW5pZWJpZXQwQGdtYWlsLmNvbSIsInBob25lX251bWJlciI6IisyMzQ4MDI3ODcyNDE1Iiwicm9sZSI6InVzZXIiLCJ2ZXJpZmllZCI6dHJ1ZSwiaWF0IjoxNzMwNDY5MDgxLCJleHAiOjE3MzA0NzI2ODEsImF1ZCI6ImxvY2FsaG9zdDozMDAxIiwiaXNzIjoibG9jYWxob3N0OjMwMDEifQ.G24uf99migJRHRgJ1Bss8F3j39zbiJ4M5Ad_n02lBZE',
              },
              refresh_token: {
                type: 'string',
                example:
                  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MDllMzM4MC1kZjI1LTQ5ODUtYWExOS1kMDFiNGRlYmIxNTIiLCJpYXQiOjE3MzA0NjkwODEsImV4cCI6MTczMDU1NTQ4MSwiYXVkIjoibG9jYWxob3N0OjMwMDEiLCJpc3MiOiJsb2NhbGhvc3Q6MzAwMSJ9.-PaykiMgd8lf50LxFqFyrrsOOHSB3OhOq_A-meWCxPw',
              },
            },
          },
        },
      },
    },
  },
};

export const BadRequestResponse = {
  description: 'Bad request',
  status: HttpStatus.BAD_REQUEST,
  schema: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false,
      },
      status_code: {
        type: 'number',
        example: 400,
      },
      message: {
        type: 'string',
        example: 'Bad request',
      },
    },
  },
};

export const UnauthorizedResponse = {
  description: 'Unauthorized',
  status: HttpStatus.UNAUTHORIZED,
  schema: {
    type: 'object',
    properties: {
      status_code: {
        type: 'number',
        example: 401,
      },
      message: {
        type: 'string',
        example: 'Unauthorized',
      },
    },
  },
};

export const InternalServerErrorResponse = {
  description: 'Internal server error',
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  schema: {
    type: 'object',
    properties: {
      status_code: {
        type: 'number',
        example: 500,
      },
      message: {
        type: 'string',
        example: 'Internal server error',
      },
    },
  },
};

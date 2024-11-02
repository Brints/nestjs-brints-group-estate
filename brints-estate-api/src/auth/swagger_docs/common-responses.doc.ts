import { HttpStatus } from '@nestjs/common';

export const ConflictResponse = {
  description: 'Conflict',
  status: HttpStatus.CONFLICT,
  schema: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false,
      },
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
      success: {
        type: 'boolean',
        example: false,
      },
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
      success: {
        type: 'boolean',
        example: false,
      },
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

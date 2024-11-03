import { HttpStatus } from '@nestjs/common';

export const UnauthorizedUserVerifiedResponse = {
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
        example: HttpStatus.UNAUTHORIZED,
      },
      message: {
        type: 'string',
        example: 'User already verified',
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
        example: HttpStatus.INTERNAL_SERVER_ERROR,
      },
      message: {
        type: 'string',
        example: 'Internal server error. Please try again later',
      },
    },
  },
};

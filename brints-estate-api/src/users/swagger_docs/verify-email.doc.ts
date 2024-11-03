import { HttpStatus } from '@nestjs/common';

export const BadRequestInvalidTokenResponse = {
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
        example: HttpStatus.BAD_REQUEST,
      },
      message: {
        type: 'string',
        example: 'Invalid token',
      },
    },
  },
};

export const ForbiddenTokenExpiredResponse = {
  description: 'Forbidden',
  status: HttpStatus.FORBIDDEN,
  schema: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false,
      },
      status_code: {
        type: 'number',
        example: HttpStatus.FORBIDDEN,
      },
      message: {
        type: 'string',
        example: 'Token expired',
      },
    },
  },
};

export const VerifyEmailResponse = {
  description: 'User email verified successfully',
  status: HttpStatus.OK,
  schema: {
    type: 'object',
    properties: {
      status_code: {
        type: 'number',
        example: HttpStatus.OK,
      },
      message: {
        type: 'string',
        example: 'Your email has been verified successfully.',
      },
    },
  },
};

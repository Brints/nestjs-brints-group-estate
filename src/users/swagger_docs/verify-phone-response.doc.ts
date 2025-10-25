import { HttpStatus } from '@nestjs/common';

export const VerifyPhoneResponse = {
  description: 'User phone number verified successfully',
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
        example: 'Your phone number has been verified successfully.',
      },
    },
  },
};

export const NotFoundPhoneNumberResponse = {
  description: 'Phone number does not exist',
  status: HttpStatus.NOT_FOUND,
  schema: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false,
      },
      status_code: {
        type: 'number',
        example: HttpStatus.NOT_FOUND,
      },
      message: {
        type: 'string',
        example: 'Phone number does not exist.',
      },
    },
  },
};

export const IncorrectPhoneNumberResponse = {
  description: 'Incorrect phone number',
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
        example: 'Incorrect phone number.',
      },
    },
  },
};

export const ForbiddenAccountVerifiedResponse = {
  description: 'This account is already verified',
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
        example: 'This account is already verified.',
      },
    },
  },
};

export const InvalidOTPResponse = {
  description: 'Invalid OTP. Try again.',
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
        example: 'Invalid OTP. Try again.',
      },
    },
  },
};

export const OTPExpiredResponse = {
  description: 'OTP has expired. Please, generate a new one.',
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
        example: 'OTP has expired. Please, generate a new one.',
      },
    },
  },
};

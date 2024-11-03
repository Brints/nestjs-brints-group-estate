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

import { HttpStatus } from '@nestjs/common';

export const CreatedUserResponse = {
  description: 'User registration successful',
  status: HttpStatus.CREATED,
  schema: {
    type: 'object',
    properties: {
      api_version: { type: 'string', example: '1.0.0' },
      message: { type: 'string', example: 'User registration successful' },
      status_code: { type: 'number', example: 201 },
      data: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'de45dbab-f570-48e7-9875-7c51f260c02d',
          },
          createdAt: { type: 'string', example: '2024-11-02T13:56:11.121Z' },
          updatedAt: { type: 'string', example: '2024-11-02T13:56:11.121Z' },
          image_url: {
            type: ['string', null],
            example: 'https://example.com/image.jpg',
          },
          first_name: { type: 'string', example: 'David' },
          last_name: { type: 'string', example: 'Lacroix' },
          email: { type: 'string', example: 'aniebietafia@gmail.com' },
          phone_number: { type: 'string', example: '08098194719' },
          gender: { type: 'string', example: 'male' },
          isVerified: { type: 'boolean', example: false },
          last_login: { type: ['string', null], example: null },
          account_status: { type: 'string', example: 'inactive' },
          role: { type: 'string', example: 'user' },
          isTwoFAEnabled: { type: 'boolean', example: false },
          terms_and_conditions: { type: 'boolean', example: true },
          privacy_policy: { type: 'boolean', example: true },
          marketing_consent: { type: 'boolean', example: false },
        },
      },
    },
  },
};

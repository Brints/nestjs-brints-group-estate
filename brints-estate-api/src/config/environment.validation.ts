// import Joi from '@hapi/joi';
import * as Joi from 'joi';

// export const environmentValidationSchema = Joi.object({
//   APP_PORT: Joi.number().default(8000),
//   DB_HOST: Joi.string().required(),
//   DB_PORT: Joi.number().default(5432),
//   DB_USER: Joi.string().required(),
//   DB_PASSWORD: Joi.string().required(),
//   DB_NAME: Joi.string().required(),
//   NODE_ENV: Joi.string()
//     .required()
//     .valid('development', 'production', 'test')
//     .default('development'),
// });

export const environmentValidationSchema = Joi.object({
  APP_PORT: Joi.number().port().default(8000),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().port().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  NODE_ENV: Joi.string()
    .required()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
});

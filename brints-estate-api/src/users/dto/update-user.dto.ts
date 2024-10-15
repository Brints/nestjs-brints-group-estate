import { CreateUserDto } from '../../auth/dto/create-user.dto';
import { PartialType, PickType } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, [
    'first_name',
    'last_name',
    'country_code',
    'phone_number',
    'gender',
    'marketing_consent',
  ]),
) {}

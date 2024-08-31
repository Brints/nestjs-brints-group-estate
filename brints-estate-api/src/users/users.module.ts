import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './users.controller';
import { UsersService } from './providers/users.service';

import { User } from './entities/user.entity';
import { UserAuth } from './entities/userAuth.entity';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [TypeOrmModule.forFeature([User, UserAuth])],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}

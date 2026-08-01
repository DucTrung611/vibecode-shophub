import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { USER_PORT } from './user.port';

@Module({
  controllers: [UserController],
  providers: [
    UserRepository,
    { provide: USER_PORT, useExisting: UserRepository },
    UserService,
  ],
  exports: [USER_PORT],
})
export class UserModule {}

import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { USER_PORT } from './user.port';

@Module({
  providers: [
    UserRepository,
    { provide: USER_PORT, useExisting: UserRepository },
  ],
  exports: [USER_PORT],
})
export class UserModule {}

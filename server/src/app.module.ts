import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EnterprisesModule } from './enterprises/enterprises.module';
import { CaseLibraryModule } from './case-library/case-library.module';
import { CasesModule } from './cases/cases.module';

@Module({
  imports: [AuthModule, UsersModule, EnterprisesModule, CaseLibraryModule, CasesModule],
})
export class AppModule {}

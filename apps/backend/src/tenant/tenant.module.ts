import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { Tenant, TenantSchema } from './schemas/tenant.schema';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { TenantBankAccount, TenantBankAccountSchema } from './schemas/tenant-bank-account.schema';
import { TenantBankAccountService } from './tenant-bank-account.service';
import { TenantBankAccountController } from './tenant-bank-account.controller';
import { AuthModule } from '../auth/auth.module';
import { TenantMembershipModule } from '../tenant-membership/tenant-membership.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: TenantBankAccount.name, schema: TenantBankAccountSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
    TenantMembershipModule,
  ],
  controllers: [TenantBankAccountController, TenantController],
  providers: [TenantService, TenantBankAccountService],
  exports: [
    TenantService,
    TenantBankAccountService,
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: TenantBankAccount.name, schema: TenantBankAccountSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
})
export class TenantModule {}

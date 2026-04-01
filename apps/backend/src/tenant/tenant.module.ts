import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { Tenant, TenantSchema } from './schemas/tenant.schema';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { TenantBankAccount, TenantBankAccountSchema } from './schemas/tenant-bank-account.schema';
import { TenantBankAccountService } from './tenant-bank-account.service';
import { TenantBankAccountController } from './tenant-bank-account.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: TenantBankAccount.name, schema: TenantBankAccountSchema },
      { name: User.name, schema: UserSchema },
    ]),
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

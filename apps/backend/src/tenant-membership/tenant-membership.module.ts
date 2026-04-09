import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from '../tenant/schemas/tenant.schema';
import {
  TenantMembership,
  TenantMembershipSchema,
} from './schemas/tenant-membership.schema';
import { TenantMembershipService } from './tenant-membership.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TenantMembership.name, schema: TenantMembershipSchema },
      { name: Tenant.name, schema: TenantSchema },
    ]),
  ],
  providers: [TenantMembershipService],
  exports: [
    TenantMembershipService,
    MongooseModule.forFeature([
      { name: TenantMembership.name, schema: TenantMembershipSchema },
    ]),
  ],
})
export class TenantMembershipModule {}


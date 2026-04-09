import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { HttpModule } from '@nestjs/axios';
import { FriendGateway } from './socket/friend.gateway';
import { Role, RoleSchema } from './schemas/role.schema';
import { Tenant, TenantSchema } from '../tenant/schemas/tenant.schema';
import { TenantMembershipModule } from '../tenant-membership/tenant-membership.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Tenant.name, schema: TenantSchema },
    ]),
    TenantMembershipModule,
    HttpModule
  ],
  exports: [
    AuthService,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  controllers: [AuthController],
  providers: [AuthService, FriendGateway]
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { Service, ServiceSchema } from './schemas/service.schema';
import { TenantModule } from '../tenant/tenant.module';
import { TenantGuard } from '../guards/tenant.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]),
    TenantModule,
  ],
  controllers: [ServiceController],
  providers: [ServiceService, TenantGuard],
  exports: [ServiceService],
})
export class ServiceModule {}

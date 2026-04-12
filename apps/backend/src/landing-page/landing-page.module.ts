import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LandingPageController } from './landing-page.controller';
import { LandingPageService } from './landing-page.service';
import { LandingPage, LandingPageSchema } from './schemas/landing-page.schema';
import { TenantModule } from '../tenant/tenant.module';
import { TenantGuard } from '../guards/tenant.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LandingPage.name, schema: LandingPageSchema }]),
    TenantModule,
  ],
  controllers: [LandingPageController],
  providers: [LandingPageService, TenantGuard],
  exports: [LandingPageService],
})
export class LandingPageModule {}

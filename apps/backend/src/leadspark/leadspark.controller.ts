import { Controller, Post, UseGuards } from '@nestjs/common';
import { LeadSparkService } from './leadspark.service';
import { AuthGuard } from '../guards/auth.guard';

@Controller('leadspark')
@UseGuards(AuthGuard)
export class LeadSparkController {
  constructor(private readonly leadSparkService: LeadSparkService) {}

  @Post('sync')
  syncProducts() {
    return this.leadSparkService.syncAllProducts();
  }
}

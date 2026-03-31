import {
  Controller, Get, Post, Delete, Body, Param,
  UseGuards, UsePipes, ValidationPipe, Req,
} from '@nestjs/common';
import { TenantBankAccountService, UpsertBankAccountDto } from './tenant-bank-account.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/guards/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('tenants/bank-accounts')
export class TenantBankAccountController {
  constructor(private readonly service: TenantBankAccountService) {}

  @Get()
  findAll(@Req() req: any) {
    const tenantId = req.user?.tenantId;
    return this.service.findByTenant(tenantId);
  }

  @Post()
  @Roles('admin', 'superadmin')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  upsert(@Req() req: any, @Body() dto: UpsertBankAccountDto) {
    const tenantId = req.user?.tenantId;
    return this.service.upsert(tenantId, dto);
  }

  @Delete(':id')
  @Roles('admin', 'superadmin')
  remove(@Req() req: any, @Param('id') id: string) {
    const tenantId = req.user?.tenantId;
    return this.service.remove(tenantId, id);
  }
}

import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';
import { TenantGuard } from 'src/guards/tenant.guard';
import { CurrentTenant } from 'src/guards/tenant.decorator';
import { AuditLogService } from './audit-log.service';

@UseGuards(AuthGuard, TenantGuard)
@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: {
      page?: string;
      limit?: string;
      userId?: string;
      action?: string;
      entity?: string;
      from?: string;
      to?: string;
    },
  ) {
    return this.auditLogService.findAll(query, tenantId);
  }

  @Get('export')
  async exportCsv(
    @CurrentTenant() tenantId: string,
    @Query() query: { userId?: string; action?: string; entity?: string; from?: string; to?: string },
    @Res() res: Response,
  ) {
    const csv = await this.auditLogService.exportCsv(query, tenantId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-log.csv"');
    res.send(csv);
  }
}

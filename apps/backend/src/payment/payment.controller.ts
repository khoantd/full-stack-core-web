import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query,
  UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { TenantGuard } from 'src/guards/tenant.guard';
import { CurrentTenant } from 'src/guards/tenant.decorator';

@UseGuards(AuthGuard, TenantGuard)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@CurrentTenant() tenantId: string, @Body() dto: CreatePaymentDto) {
    return this.paymentService.create(dto, tenantId);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@CurrentTenant() tenantId: string, @Query() queryDto: QueryPaymentDto) {
    return this.paymentService.findAll(queryDto, tenantId);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.paymentService.findOne(id, tenantId);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.paymentService.update(id, dto, tenantId);
  }

  @Patch(':id/status')
  @UsePipes(new ValidationPipe({ transform: true }))
  updateStatus(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.paymentService.updateStatus(id, dto, tenantId);
  }

  @Delete(':id')
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.paymentService.remove(id, tenantId);
  }
}

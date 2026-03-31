import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, Req,
  UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Req() req: any, @Body() dto: CreatePaymentDto) {
    return this.paymentService.create(dto, req.user?.tenantId);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Req() req: any, @Query() queryDto: QueryPaymentDto) {
    return this.paymentService.findAll(queryDto, req.user?.tenantId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.paymentService.findOne(id, req.user?.tenantId);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.paymentService.update(id, dto, req.user?.tenantId);
  }

  @Patch(':id/status')
  @UsePipes(new ValidationPipe({ transform: true }))
  updateStatus(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.paymentService.updateStatus(id, dto, req.user?.tenantId);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.paymentService.remove(id, req.user?.tenantId);
  }
}

import { Controller, Get, Post, Body, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { IsEnum, IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { VietQRService } from './vietqr.service';
import { BankCode } from './vietqr.types';
import { AuthGuard } from 'src/guards/auth.guard';

class GenerateQRDto {
  @IsEnum(BankCode)
  bankCode: BankCode;

  @IsString()
  accountNumber: string;

  @IsString()
  @IsOptional()
  accountName?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;

  @IsString()
  @IsOptional()
  description?: string;
}

@UseGuards(AuthGuard)
@Controller('vietqr')
export class VietQRController {
  constructor(private readonly vietQRService: VietQRService) {}

  /** List all supported banks */
  @Get('banks')
  getBanks() {
    return this.vietQRService.getAllBanks();
  }

  /** Generate a VietQR code object */
  @Post('generate')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  generate(@Body() dto: GenerateQRDto) {
    return this.vietQRService.createVietQR(
      dto.bankCode,
      dto.accountNumber,
      dto.accountName,
      dto.amount,
      dto.description,
    );
  }

  /** Parse a VietQR string */
  @Get('parse')
  parse(@Query('qr') qr: string) {
    return this.vietQRService.parseVietQR(qr);
  }
}

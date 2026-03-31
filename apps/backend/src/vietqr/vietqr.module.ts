import { Module } from '@nestjs/common';
import { VietQRService } from './vietqr.service';
import { VietQRController } from './vietqr.controller';

@Module({
  controllers: [VietQRController],
  providers: [VietQRService],
  exports: [VietQRService],
})
export class VietQRModule {}

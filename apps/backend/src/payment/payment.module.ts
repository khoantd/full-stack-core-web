import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { Event, EventSchema } from '../event/schemas/event.schema';
import { TelegramModule } from '../telegram/telegram.module';
import { VietQRModule } from '../vietqr/vietqr.module';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Event.name, schema: EventSchema },
    ]),
    forwardRef(() => TelegramModule),
    VietQRModule,
    TenantModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}

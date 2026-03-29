import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { AutomakerService } from './automaker.service';
import { AutomakerEntityService } from './automaker-entity.service';
import { AutomakerEntityController } from './automaker-entity.controller';
import { AutomakerEntity, AutomakerEntitySchema } from './schemas/automaker.schema';

@Module({
  imports: [
    HttpModule.register({ timeout: 30000, maxRedirects: 5 }),
    MongooseModule.forFeature([{ name: AutomakerEntity.name, schema: AutomakerEntitySchema }]),
  ],
  controllers: [AutomakerEntityController],
  providers: [AutomakerService, AutomakerEntityService],
  exports: [AutomakerService, AutomakerEntityService],
})
export class AutomakerModule {}

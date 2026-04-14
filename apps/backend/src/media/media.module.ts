import { Module } from '@nestjs/common';
import { MinioMediaStorage } from './minio-media.storage';
import { LocalMediaStorage } from './local-media.storage';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MediaPublicController } from './media-public.controller';
import { MinioCompatController } from './minio-compat.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [AuditLogModule],
  providers: [MinioMediaStorage, LocalMediaStorage, MediaService],
  controllers: [MediaController, MediaPublicController, MinioCompatController],
  exports: [MediaService],
})
export class MediaModule {}

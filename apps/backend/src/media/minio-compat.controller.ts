import { Controller, Post, Delete, UploadedFile, UseInterceptors, Get, Query, Param, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/guards/auth.guard';
import { MediaService } from './media.service';
import { getMediaMulterOptions } from './media-upload.config';

/** Backward-compatible routes that always use the MinIO provider. */
@UseGuards(AuthGuard)
@Controller('minio')
export class MinioCompatController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file', getMediaMulterOptions()))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.mediaService.upload('minio', file);
  }

  @Get('files')
  async listFiles(
    @Query('type') type?: string,
    @Query('limit') limit?: string,
    @Query('continuationToken') continuationToken?: string,
  ) {
    const maxKeys = Math.min(parseInt(limit ?? '20', 10) || 20, 100);
    return this.mediaService.listFiles('minio', { type, maxKeys, continuationToken });
  }

  @Delete('files/:key')
  async deleteFile(@Param('key') key: string) {
    await this.mediaService.deleteFile('minio', decodeURIComponent(key));
    return { message: 'File deleted successfully' };
  }
}

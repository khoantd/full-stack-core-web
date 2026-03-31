import { Controller, Post, Delete, UploadedFile, UseInterceptors, Get, Query, Param, UseGuards } from '@nestjs/common';
import { MinioService } from './minio.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/guards/auth.guard';

const BUCKET = 'imagefolder';

@UseGuards(AuthGuard)
@Controller('minio')
export class MinioController {
  constructor(private readonly minioService: MinioService) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const fileUrl = await this.minioService.uploadFile(BUCKET, file);
    return { url: fileUrl };
  }

  @Get('files')
  async listFiles(
    @Query('type') type?: string,
    @Query('limit') limit?: string,
    @Query('continuationToken') continuationToken?: string,
  ) {
    const maxKeys = Math.min(parseInt(limit ?? '20', 10) || 20, 100);
    const result = await this.minioService.listFiles(BUCKET, {
      maxKeys,
      continuationToken: continuationToken || undefined,
    });

    const filtered = type && type !== 'all'
      ? result.items.filter(f => {
          if (type === 'image') return f.contentType.startsWith('image/');
          if (type === 'video') return f.contentType.startsWith('video/');
          if (type === 'document') return f.contentType.startsWith('application/') || f.contentType === 'text/plain';
          return true;
        })
      : result.items;

    return {
      data: filtered,
      nextContinuationToken: result.nextContinuationToken ?? null,
      isTruncated: result.isTruncated,
    };
  }

  @Delete('files/:key')
  async deleteFile(@Param('key') key: string) {
    await this.minioService.deleteFile(BUCKET, decodeURIComponent(key));
    return { message: 'File deleted successfully' };
  }
}

import {
  Controller,
  Post,
  Delete,
  UploadedFile,
  UseInterceptors,
  Get,
  Query,
  Param,
  UseGuards,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/guards/auth.guard';
import { MediaService } from './media.service';
import { getMediaMulterOptions } from './media-upload.config';

@UseGuards(AuthGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('providers')
  getProviders() {
    return { providers: this.mediaService.getProviders() };
  }

  @Post('file')
  @UseInterceptors(FileInterceptor('file', getMediaMulterOptions()))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('provider') queryProvider?: string,
    @Body('provider') bodyProvider?: string,
  ) {
    const provider = this.mediaService.parseProvider(queryProvider || bodyProvider, 'minio');
    return this.mediaService.upload(provider, file);
  }

  @Get('files')
  async listFiles(
    @Query('provider') providerRaw?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
    @Query('continuationToken') continuationToken?: string,
  ) {
    const provider = this.mediaService.parseProvider(providerRaw, 'minio');
    const maxKeys = Math.min(parseInt(limit ?? '20', 10) || 20, 100);
    return this.mediaService.listFiles(provider, { type, maxKeys, continuationToken });
  }

  @Delete('files/:key')
  async deleteFile(@Param('key') key: string, @Query('provider') providerRaw?: string) {
    const provider = this.mediaService.parseProvider(providerRaw, 'minio');
    await this.mediaService.deleteFile(provider, decodeURIComponent(key));
    return { message: 'File deleted successfully' };
  }
}

import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { statSync } from 'fs';
import { MediaService } from './media.service';

/** Public read-only access to locally stored media (no auth). */
@Controller('media')
export class MediaPublicController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('public/:key')
  serve(@Param('key') key: string, @Res({ passthrough: false }) res: Response) {
    const decoded = decodeURIComponent(key);
    const fullPath = this.mediaService.resolveLocalFilePath(decoded);
    if (!fullPath) {
      throw new NotFoundException();
    }
    try {
      statSync(fullPath);
    } catch {
      throw new NotFoundException();
    }
    const type = this.mediaService.guessContentType(decoded);
    res.setHeader('Content-Type', type);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return createReadStream(fullPath).pipe(res);
  }
}

import {
  Controller, Get, Post, Delete, Patch,
  Body, Param, Req, UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { TenantGuard } from 'src/guards/tenant.guard';

@UseGuards(AuthGuard, TenantGuard)
@Controller('api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.apiKeyService.findAllByTenant(req.user.tenantId);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Req() req: any, @Body() dto: CreateApiKeyDto) {
    const { apiKey, plainKey } = await this.apiKeyService.create(dto, req.user.tenantId);
    // Return the plain key ONCE — it won't be retrievable again
    return {
      _id: (apiKey as any)._id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      isActive: apiKey.isActive,
      createdAt: apiKey.createdAt,
      expiresAt: apiKey.expiresAt,
      plainKey, // only returned on creation
    };
  }

  @Patch(':id/revoke')
  revoke(@Req() req: any, @Param('id') id: string) {
    return this.apiKeyService.revoke(id, req.user.tenantId);
  }

  @Delete(':id')
  delete(@Req() req: any, @Param('id') id: string) {
    return this.apiKeyService.delete(id, req.user.tenantId);
  }
}

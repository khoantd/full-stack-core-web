import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { ApiKey, ApiKeyDocument } from './schemas/api-key.schema';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectModel(ApiKey.name) private apiKeyModel: Model<ApiKeyDocument>,
  ) {}

  private generateKey(): string {
    return 'sk_live_' + crypto.randomBytes(32).toString('hex');
  }

  private hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  async create(dto: CreateApiKeyDto, tenantId: string): Promise<{ apiKey: ApiKey; plainKey: string }> {
    const plainKey = this.generateKey();
    const keyHash = this.hashKey(plainKey);
    const keyPrefix = plainKey.substring(0, 15); // "sk_live_" + 7 chars

    const apiKey = await this.apiKeyModel.create({
      name: dto.name,
      keyHash,
      keyPrefix,
      tenantId: new Types.ObjectId(tenantId),
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });

    return { apiKey, plainKey };
  }

  async findAllByTenant(tenantId: string): Promise<ApiKey[]> {
    return this.apiKeyModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async revoke(id: string, tenantId: string): Promise<ApiKey> {
    const key = await this.apiKeyModel.findOne({
      _id: id,
      tenantId: new Types.ObjectId(tenantId),
    });
    if (!key) throw new NotFoundException('API key not found');
    key.isActive = false;
    return key.save();
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const result = await this.apiKeyModel.deleteOne({
      _id: id,
      tenantId: new Types.ObjectId(tenantId),
    });
    if (result.deletedCount === 0) throw new NotFoundException('API key not found');
  }

  /** Validate an incoming API key — used by ApiKeyGuard */
  async validateKey(plainKey: string): Promise<ApiKey | null> {
    const keyHash = this.hashKey(plainKey);
    const apiKey = await this.apiKeyModel
      .findOne({ keyHash, isActive: true })
      .exec();

    if (!apiKey) return null;
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;

    // Update lastUsedAt without blocking the request
    this.apiKeyModel
      .updateOne({ _id: apiKey._id }, { lastUsedAt: new Date() })
      .exec();

    return apiKey;
  }
}

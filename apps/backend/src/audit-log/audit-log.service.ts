import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

export interface CreateAuditLogDto {
  tenantId: string;
  userId: string;
  userEmail: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  entityId?: string;
  diff?: Record<string, any>;
  description?: string;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
  ) {}

  async create(dto: CreateAuditLogDto): Promise<AuditLog> {
    return this.auditLogModel.create(dto);
  }

  async findAll(query: {
    page?: string;
    limit?: string;
    userId?: string;
    action?: string;
    entity?: string;
    from?: string;
    to?: string;
  }, tenantId: string) {
    const page = parseInt(query.page ?? '1') || 1;
    const limit = parseInt(query.limit ?? '20') || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { tenantId };
    if (query.userId) filter.userId = query.userId;
    if (query.action) filter.action = query.action;
    if (query.entity) filter.entity = query.entity;
    if (query.from || query.to) {
      filter.createdAt = {};
      if (query.from) filter.createdAt.$gte = new Date(query.from);
      if (query.to) filter.createdAt.$lte = new Date(query.to);
    }

    const [data, total] = await Promise.all([
      this.auditLogModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.auditLogModel.countDocuments(filter),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async exportCsv(query: { userId?: string; action?: string; entity?: string; from?: string; to?: string }, tenantId: string): Promise<string> {
    const filter: Record<string, any> = { tenantId };
    if (query.userId) filter.userId = query.userId;
    if (query.action) filter.action = query.action;
    if (query.entity) filter.entity = query.entity;
    if (query.from || query.to) {
      filter.createdAt = {};
      if (query.from) filter.createdAt.$gte = new Date(query.from);
      if (query.to) filter.createdAt.$lte = new Date(query.to);
    }

    const logs = await this.auditLogModel.find(filter).sort({ createdAt: -1 }).lean();
    const header = 'userId,userEmail,action,entity,entityId,description,createdAt';
    const rows = logs.map(l =>
      [l.userId, l.userEmail, l.action, l.entity, l.entityId ?? '', l.description ?? '', (l as any).createdAt?.toISOString() ?? '']
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    );
    return [header, ...rows].join('\n');
  }
}

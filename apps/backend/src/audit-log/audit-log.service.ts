import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogAction, AuditLogDiff, AuditLogDocument } from './schemas/audit-log.schema';

export interface CreateAuditLogDto {
  tenantId: string;
  userId: string;
  userEmail: string;
  action: AuditLogAction;
  entity: string;
  entityId?: string;
  diff?: AuditLogDiff;
  description?: string;
}

type AuditLogQuery = {
  page?: string;
  limit?: string;
  userId?: string;
  action?: AuditLogAction;
  entity?: string;
  from?: string;
  to?: string;
};

@Injectable()
export class AuditLogService {
  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
  ) {}

  async create(dto: CreateAuditLogDto): Promise<AuditLog> {
    return this.auditLogModel.create(dto);
  }

  async findAll(query: AuditLogQuery, tenantId: string) {
    const page = parseInt(query.page ?? '1') || 1;
    const limit = parseInt(query.limit ?? '20') || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { tenantId };
    if (query.userId) filter.userId = query.userId;
    if (query.action) filter.action = query.action;
    if (query.entity) filter.entity = query.entity;
    if (query.from || query.to) {
      const createdAt: { $gte?: Date; $lte?: Date } = {};
      if (query.from) createdAt.$gte = new Date(query.from);
      if (query.to) createdAt.$lte = new Date(query.to);
      filter.createdAt = createdAt;
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

  async exportCsv(query: AuditLogQuery, tenantId: string): Promise<string> {
    const filter: Record<string, unknown> = { tenantId };
    if (query.userId) filter.userId = query.userId;
    if (query.action) filter.action = query.action;
    if (query.entity) filter.entity = query.entity;
    if (query.from || query.to) {
      const createdAt: { $gte?: Date; $lte?: Date } = {};
      if (query.from) createdAt.$gte = new Date(query.from);
      if (query.to) createdAt.$lte = new Date(query.to);
      filter.createdAt = createdAt;
    }

    const logs = await this.auditLogModel.find(filter).sort({ createdAt: -1 }).lean();
    const header = 'userId,userEmail,action,entity,entityId,description,createdAt';
    const rows = logs.map((l: { userId: string; userEmail: string; action: AuditLogAction; entity: string; entityId?: string; description?: string; createdAt?: Date }) =>
      [l.userId, l.userEmail, l.action, l.entity, l.entityId ?? '', l.description ?? '', l.createdAt ? l.createdAt.toISOString() : '']
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    );
    return [header, ...rows].join('\n');
  }
}

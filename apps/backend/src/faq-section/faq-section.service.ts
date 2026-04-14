import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFaqSectionDto } from './dto/create-faq-section.dto';
import { QueryFaqSectionDto } from './dto/query-faq-section.dto';
import { UpdateFaqSectionDto } from './dto/update-faq-section.dto';
import {
  FaqSection,
  FaqSectionDocument,
  type FaqSectionTranslatableFields,
} from './schemas/faq-section.schema';
import { overlayTranslatedFields, upsertTranslation } from '../common/i18n/translations';
import { AuditLogService } from '../audit-log/audit-log.service';
import { buildCreateDiff, buildDeleteDiff, buildUpdateDiff } from '../audit-log/audit-log.diff';
import { ActorContext } from '../audit-log/audit-log.types';

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number | 'all';
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

@Injectable()
export class FaqSectionService {
  constructor(
    @InjectModel(FaqSection.name)
    private readonly faqSectionModel: Model<FaqSectionDocument>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async findAll(
    query: QueryFaqSectionDto,
    tenantId: string,
    locale?: string,
  ): Promise<PaginationResult<FaqSection>> {
    const isGetAll = query.page === 'all';
    const page = isGetAll ? 1 : parseInt(query.page ?? '1', 10) || 1;
    const limit = isGetAll ? Number.MAX_SAFE_INTEGER : parseInt(query.limit ?? '10', 10) || 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { tenantId };
    if (query.search?.trim()) {
      const rx = query.search.trim();
      filter.$or = [
        { title: { $regex: rx, $options: 'i' } },
        { eyebrow: { $regex: rx, $options: 'i' } },
      ];
    }
    if (query.status?.trim()) {
      filter.status = query.status.trim();
    }

    const total = await this.faqSectionModel.countDocuments(filter).exec();

    if (isGetAll) {
      const data = await this.faqSectionModel.find(filter).sort({ createdAt: -1 }).lean().exec();
      return {
        data: data.map((row: any) =>
          overlayTranslatedFields(row, row.translations, locale) as FaqSection,
        ),
        pagination: {
          total: data.length,
          page: 'all',
          limit: data.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }

    const data = await this.faqSectionModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const totalPages = Math.ceil(total / limit);
    return {
      data: data.map((row: any) =>
        overlayTranslatedFields(row, row.translations, locale) as FaqSection,
      ),
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findById(id: string, tenantId: string, locale?: string): Promise<FaqSection> {
    try {
      const doc = await this.faqSectionModel.findOne({ _id: id, tenantId }).lean().exec();
      if (!doc) throw new NotFoundException(`FAQ section with ID "${id}" not found`);
      return overlayTranslatedFields(doc as any, (doc as any).translations, locale) as FaqSection;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      const err = error as { name?: string };
      if (err?.name === 'CastError') {
        throw new BadRequestException(`Invalid FAQ section ID format: "${id}"`);
      }
      throw new BadRequestException('Failed to get FAQ section');
    }
  }

  async create(dto: CreateFaqSectionDto, tenantId: string, actor: ActorContext, locale?: string): Promise<FaqSection> {
    try {
      const payload: Record<string, unknown> = { ...dto, tenantId };
      if (Array.isArray(payload.items)) {
        payload.items = (payload.items as { order?: number }[])
          .map((item, idx) => ({ ...item, order: typeof item.order === 'number' ? item.order : idx }))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
      if (locale) {
        const patch: Partial<FaqSectionTranslatableFields> = {
          eyebrow: payload.eyebrow as string,
          title: payload.title as string,
          items: payload.items as FaqSectionTranslatableFields['items'],
        };
        payload.translations = upsertTranslation<FaqSectionTranslatableFields>(
          payload.translations as any,
          locale,
          patch,
        );
      }
      const created = new this.faqSectionModel(payload);
      const saved = await created.save();

      await this.auditLogService.create({
        tenantId,
        userId: actor.userId,
        userEmail: actor.userEmail,
        action: 'CREATE',
        entity: 'FaqSection',
        entityId: String((saved as any)._id),
        diff: buildCreateDiff(dto as unknown as Record<string, unknown>),
        description: `Created FAQ section ${(saved as any)._id}`,
      });

      return saved;
    } catch {
      throw new BadRequestException('Failed to create FAQ section');
    }
  }

  async update(
    id: string,
    dto: UpdateFaqSectionDto,
    tenantId: string,
    actor: ActorContext,
    locale?: string,
  ): Promise<FaqSection> {
    try {
      const section = await this.faqSectionModel.findOne({ _id: id, tenantId }).exec();
      if (!section) throw new NotFoundException(`FAQ section with ID "${id}" not found`);

      const before = (section as any).toObject() as unknown as Record<string, unknown>;
      const payload: Record<string, unknown> = { ...dto };
      if (payload.items) {
        payload.items = (payload.items as { order?: number }[])
          .map((item, idx) => ({ ...item, order: typeof item.order === 'number' ? item.order : idx }))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }

      Object.assign(section, payload);

      if (locale) {
        const patch: Partial<FaqSectionTranslatableFields> = {};
        if (dto.eyebrow !== undefined) patch.eyebrow = section.eyebrow;
        if (dto.title !== undefined) patch.title = section.title;
        if (dto.items !== undefined) patch.items = section.items as FaqSectionTranslatableFields['items'];

        if (Object.keys(patch).length > 0) {
          section.translations = upsertTranslation<FaqSectionTranslatableFields>(
            section.translations as any,
            locale,
            patch,
          ) as typeof section.translations;
        }
      }

      const saved = await section.save();
      const after = (saved as any).toObject() as unknown as Record<string, unknown>;

      await this.auditLogService.create({
        tenantId,
        userId: actor.userId,
        userEmail: actor.userEmail,
        action: 'UPDATE',
        entity: 'FaqSection',
        entityId: String(id),
        diff: buildUpdateDiff({ before, after, patch: dto as unknown as Record<string, unknown> }),
        description: `Updated FAQ section ${id}`,
      });

      return saved;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      const err = error as { name?: string };
      if (err?.name === 'CastError') {
        throw new BadRequestException(`Invalid FAQ section ID format: "${id}"`);
      }
      throw new BadRequestException('Failed to update FAQ section');
    }
  }

  async delete(id: string, tenantId: string, actor: ActorContext): Promise<{ message: string; id: string }> {
    try {
      const deleted = await this.faqSectionModel.findOneAndDelete({ _id: id, tenantId }).lean().exec();
      if (!deleted) throw new NotFoundException(`FAQ section with ID "${id}" not found`);

      await this.auditLogService.create({
        tenantId,
        userId: actor.userId,
        userEmail: actor.userEmail,
        action: 'DELETE',
        entity: 'FaqSection',
        entityId: String(id),
        diff: buildDeleteDiff(deleted as unknown as Record<string, unknown>, {
          allowlist: ['_id', 'title', 'eyebrow', 'status'],
        }),
        description: `Deleted FAQ section ${id}`,
      });

      return { message: 'FAQ section deleted successfully', id };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      const err = error as { name?: string };
      if (err?.name === 'CastError') {
        throw new BadRequestException(`Invalid FAQ section ID format: "${id}"`);
      }
      throw new BadRequestException('Failed to delete FAQ section');
    }
  }
}

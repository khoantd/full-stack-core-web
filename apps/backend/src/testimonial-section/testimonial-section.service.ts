import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTestimonialSectionDto } from './dto/create-testimonial-section.dto';
import { QueryTestimonialSectionDto } from './dto/query-testimonial-section.dto';
import { UpdateTestimonialSectionDto } from './dto/update-testimonial-section.dto';
import {
  TestimonialSection,
  TestimonialSectionDocument,
  type TestimonialSectionTranslatableFields,
} from './schemas/testimonial-section.schema';
import { overlayTranslatedFields, upsertTranslation } from '../common/i18n/translations';
import { AuditLogService } from '../audit-log/audit-log.service';
import { buildCreateDiff, buildDeleteDiff, buildUpdateDiff } from '../audit-log/audit-log.diff';
import { ActorContext } from '../audit-log/audit-log.types';

function normalizeTestimonialItem(
  item: { order?: number; rating?: number },
  idx: number,
): { order: number; rating: number } & typeof item {
  let rating = 5;
  if (typeof item.rating === 'number' && !Number.isNaN(item.rating)) {
    rating = Math.min(5, Math.max(1, Math.round(item.rating)));
  }
  return {
    ...item,
    order: typeof item.order === 'number' ? item.order : idx,
    rating,
  };
}

function normalizeTestimonialItems(
  items: { order?: number; rating?: number }[],
): ReturnType<typeof normalizeTestimonialItem>[] {
  return items
    .map((item, idx) => normalizeTestimonialItem(item, idx))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

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
export class TestimonialSectionService {
  constructor(
    @InjectModel(TestimonialSection.name)
    private readonly testimonialSectionModel: Model<TestimonialSectionDocument>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async findAll(
    query: QueryTestimonialSectionDto,
    tenantId: string,
    locale?: string,
  ): Promise<PaginationResult<TestimonialSection>> {
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

    const total = await this.testimonialSectionModel.countDocuments(filter).exec();

    if (isGetAll) {
      const data = await this.testimonialSectionModel.find(filter).sort({ createdAt: -1 }).lean().exec();
      return {
        data: data.map((row: Record<string, unknown>) =>
          overlayTranslatedFields(row, row.translations as never, locale) as unknown as TestimonialSection,
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

    const data = await this.testimonialSectionModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const totalPages = Math.ceil(total / limit);
    return {
      data: data.map((row: Record<string, unknown>) =>
        overlayTranslatedFields(row, row.translations as never, locale) as unknown as TestimonialSection,
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

  async findById(id: string, tenantId: string, locale?: string): Promise<TestimonialSection> {
    try {
      const doc = await this.testimonialSectionModel.findOne({ _id: id, tenantId }).lean().exec();
      if (!doc) throw new NotFoundException(`Testimonial section with ID "${id}" not found`);
      return overlayTranslatedFields(
        doc as Record<string, unknown>,
        (doc as { translations?: unknown }).translations as never,
        locale,
      ) as unknown as TestimonialSection;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      const err = error as { name?: string };
      if (err?.name === 'CastError') {
        throw new BadRequestException(`Invalid testimonial section ID format: "${id}"`);
      }
      throw new BadRequestException('Failed to get testimonial section');
    }
  }

  async create(
    dto: CreateTestimonialSectionDto,
    tenantId: string,
    actor: ActorContext,
    locale?: string,
  ): Promise<TestimonialSection> {
    try {
      const payload: Record<string, unknown> = { ...dto, tenantId };
      if (Array.isArray(payload.items)) {
        payload.items = normalizeTestimonialItems(
          payload.items as { order?: number; rating?: number }[],
        );
      }
      if (locale) {
        const patch: Partial<TestimonialSectionTranslatableFields> = {
          eyebrow: payload.eyebrow as string,
          title: payload.title as string,
          items: payload.items as TestimonialSectionTranslatableFields['items'],
        };
        payload.translations = upsertTranslation<TestimonialSectionTranslatableFields>(
          payload.translations as never,
          locale,
          patch,
        );
      }
      const created = new this.testimonialSectionModel(payload);
      const saved = await created.save();

      await this.auditLogService.create({
        tenantId,
        userId: actor.userId,
        userEmail: actor.userEmail,
        action: 'CREATE',
        entity: 'TestimonialSection',
        entityId: String((saved as any)._id),
        diff: buildCreateDiff(dto as unknown as Record<string, unknown>),
        description: `Created testimonial section ${(saved as any)._id}`,
      });

      return saved;
    } catch {
      throw new BadRequestException('Failed to create testimonial section');
    }
  }

  async update(
    id: string,
    dto: UpdateTestimonialSectionDto,
    tenantId: string,
    actor: ActorContext,
    locale?: string,
  ): Promise<TestimonialSection> {
    try {
      const section = await this.testimonialSectionModel.findOne({ _id: id, tenantId }).exec();
      if (!section) throw new NotFoundException(`Testimonial section with ID "${id}" not found`);

      const before = (section as any).toObject() as unknown as Record<string, unknown>;
      const payload: Record<string, unknown> = { ...dto };
      if (payload.items) {
        payload.items = normalizeTestimonialItems(
          payload.items as { order?: number; rating?: number }[],
        );
      }

      Object.assign(section, payload);

      if (locale) {
        const patch: Partial<TestimonialSectionTranslatableFields> = {};
        if (dto.eyebrow !== undefined) patch.eyebrow = section.eyebrow;
        if (dto.title !== undefined) patch.title = section.title;
        if (dto.items !== undefined) patch.items = section.items as TestimonialSectionTranslatableFields['items'];

        if (Object.keys(patch).length > 0) {
          section.translations = upsertTranslation<TestimonialSectionTranslatableFields>(
            section.translations as never,
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
        entity: 'TestimonialSection',
        entityId: String(id),
        diff: buildUpdateDiff({ before, after, patch: dto as unknown as Record<string, unknown> }),
        description: `Updated testimonial section ${id}`,
      });

      return saved;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      const err = error as { name?: string };
      if (err?.name === 'CastError') {
        throw new BadRequestException(`Invalid testimonial section ID format: "${id}"`);
      }
      throw new BadRequestException('Failed to update testimonial section');
    }
  }

  async delete(id: string, tenantId: string, actor: ActorContext): Promise<{ message: string; id: string }> {
    try {
      const deleted = await this.testimonialSectionModel.findOneAndDelete({ _id: id, tenantId }).lean().exec();
      if (!deleted) throw new NotFoundException(`Testimonial section with ID "${id}" not found`);

      await this.auditLogService.create({
        tenantId,
        userId: actor.userId,
        userEmail: actor.userEmail,
        action: 'DELETE',
        entity: 'TestimonialSection',
        entityId: String(id),
        diff: buildDeleteDiff(deleted as unknown as Record<string, unknown>, {
          allowlist: ['_id', 'title', 'eyebrow', 'status'],
        }),
        description: `Deleted testimonial section ${id}`,
      });

      return { message: 'Testimonial section deleted successfully', id };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      const err = error as { name?: string };
      if (err?.name === 'CastError') {
        throw new BadRequestException(`Invalid testimonial section ID format: "${id}"`);
      }
      throw new BadRequestException('Failed to delete testimonial section');
    }
  }
}

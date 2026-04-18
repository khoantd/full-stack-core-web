import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model, Types } from 'mongoose';
import { upsertTranslation } from '../common/i18n/translations';
import { CreateLandingPageDto } from './dto/create-landing-page.dto';
import { UpdateLandingPageDto } from './dto/update-landing-page.dto';
import { QueryLandingPageDto } from './dto/query-landing-page.dto';
import {
  LandingPage,
  LandingPageStatus,
  type LandingPageTranslatableFields,
  type LandingSection,
} from './schemas/landing-page.schema';

export interface LandingPaginationResult {
  data: Record<string, unknown>[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '');
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === 'object' && !Array.isArray(v);
}

/** Footer section-level legacy `heading` → `tagline` for API consumers (GET). */
function mapSectionsForResponse(sections: unknown): unknown {
  if (!Array.isArray(sections)) return sections;
  return sections.map((raw) => {
    if (!isRecord(raw) || raw.type !== 'footer') return raw;
    const s = raw as Record<string, unknown>;
    let tagline: string | undefined;
    if (isNonEmptyString(s.tagline)) {
      tagline = String(s.tagline).trim();
    } else if (isNonEmptyString(s.heading)) {
      tagline = String(s.heading).trim();
    }
    const { heading: _legacyHeading, ...rest } = s;
    const out: Record<string, unknown> = { ...rest };
    if (tagline) {
      out.tagline = tagline;
    } else {
      delete out.tagline;
    }
    return out;
  });
}

function overlayLandingPage(
  doc: Record<string, unknown>,
  locale: string | undefined,
): Record<string, unknown> {
  const applyFooterTagline = (d: Record<string, unknown>): Record<string, unknown> => {
    const out = { ...d };
    if (out.sections != null) {
      out.sections = mapSectionsForResponse(out.sections);
    }
    return out;
  };

  if (!locale) {
    return applyFooterTagline(doc);
  }
  const translations = doc.translations as
    | Record<string, Partial<LandingPageTranslatableFields>>
    | undefined;
  const patch = translations?.[locale];
  if (!patch) {
    return applyFooterTagline(doc);
  }
  const out: Record<string, unknown> = { ...doc };
  if (patch.title != null) out.title = patch.title;
  if (patch.seoTitle !== undefined) out.seoTitle = patch.seoTitle;
  if (patch.seoDescription !== undefined) out.seoDescription = patch.seoDescription;
  if (patch.sections != null) {
    out.sections = mapSectionsForResponse(patch.sections);
  } else if (out.sections != null) {
    out.sections = mapSectionsForResponse(out.sections);
  }
  return out;
}

@Injectable()
export class LandingPageService {
  constructor(
    @InjectModel(LandingPage.name)
    private readonly landingPageModel: Model<LandingPage>,
  ) {}

  validateSections(sections: unknown): LandingSection[] {
    if (sections == null) return [];
    if (!Array.isArray(sections)) {
      throw new BadRequestException('sections must be an array');
    }
    const out: LandingSection[] = [];
    for (let i = 0; i < sections.length; i++) {
      const raw = sections[i];
      if (raw == null || typeof raw !== 'object') {
        throw new BadRequestException(`sections[${i}] must be an object`);
      }
      const s = raw as Record<string, unknown>;
      const type = s.type;
      const id = typeof s.id === 'string' && s.id.trim() ? s.id : randomUUID();

      if (type === 'hero') {
        if (!isNonEmptyString(s.headline)) {
          throw new BadRequestException(`sections[${i}].headline is required for hero`);
        }
        out.push({
          id,
          type: 'hero',
          headline: String(s.headline).trim(),
          subheadline: s.subheadline != null ? String(s.subheadline) : undefined,
          image: s.image != null ? String(s.image) : undefined,
          primaryCtaLabel: s.primaryCtaLabel != null ? String(s.primaryCtaLabel) : undefined,
          primaryCtaHref: s.primaryCtaHref != null ? String(s.primaryCtaHref) : undefined,
          secondaryCtaLabel: s.secondaryCtaLabel != null ? String(s.secondaryCtaLabel) : undefined,
          secondaryCtaHref: s.secondaryCtaHref != null ? String(s.secondaryCtaHref) : undefined,
        });
        continue;
      }
      if (type === 'features') {
        if (!isNonEmptyString(s.heading)) {
          throw new BadRequestException(`sections[${i}].heading is required for features`);
        }
        const itemsRaw = s.items;
        if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
          throw new BadRequestException(`sections[${i}].items must be a non-empty array`);
        }
        const items: { title: string; description?: string; icon?: string }[] = [];
        for (let j = 0; j < itemsRaw.length; j++) {
          const it = itemsRaw[j];
          if (it == null || typeof it !== 'object') {
            throw new BadRequestException(`sections[${i}].items[${j}] must be an object`);
          }
          const o = it as Record<string, unknown>;
          if (!isNonEmptyString(o.title)) {
            throw new BadRequestException(`sections[${i}].items[${j}].title is required`);
          }
          items.push({
            title: String(o.title).trim(),
            description: o.description != null ? String(o.description) : undefined,
            icon: o.icon != null ? String(o.icon) : undefined,
          });
        }
        out.push({ id, type: 'features', heading: String(s.heading).trim(), items });
        continue;
      }
      if (type === 'cta') {
        if (!isNonEmptyString(s.title)) {
          throw new BadRequestException(`sections[${i}].title is required for cta`);
        }
        if (!isNonEmptyString(s.buttonLabel)) {
          throw new BadRequestException(`sections[${i}].buttonLabel is required for cta`);
        }
        if (!isNonEmptyString(s.buttonHref)) {
          throw new BadRequestException(`sections[${i}].buttonHref is required for cta`);
        }
        out.push({
          id,
          type: 'cta',
          title: String(s.title).trim(),
          body: s.body != null ? String(s.body) : undefined,
          buttonLabel: String(s.buttonLabel).trim(),
          buttonHref: String(s.buttonHref).trim(),
        });
        continue;
      }
      if (type === 'stats') {
        const itemsRaw = s.items;
        if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
          throw new BadRequestException(`sections[${i}].items must be a non-empty array`);
        }
        const items: { label: string; value: string }[] = [];
        for (let j = 0; j < itemsRaw.length; j++) {
          const it = itemsRaw[j];
          if (it == null || typeof it !== 'object') {
            throw new BadRequestException(`sections[${i}].items[${j}] must be an object`);
          }
          const o = it as Record<string, unknown>;
          if (!isNonEmptyString(o.label) || !isNonEmptyString(o.value)) {
            throw new BadRequestException(
              `sections[${i}].items[${j}].label and value are required`,
            );
          }
          items.push({ label: String(o.label).trim(), value: String(o.value).trim() });
        }
        out.push({ id, type: 'stats', items });
        continue;
      }
      if (type === 'faq') {
        const itemsRaw = s.items;
        if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
          throw new BadRequestException(`sections[${i}].items must be a non-empty array`);
        }
        const items: { question: string; answer: string }[] = [];
        for (let j = 0; j < itemsRaw.length; j++) {
          const it = itemsRaw[j];
          if (it == null || typeof it !== 'object') {
            throw new BadRequestException(`sections[${i}].items[${j}] must be an object`);
          }
          const o = it as Record<string, unknown>;
          if (!isNonEmptyString(o.question) || !isNonEmptyString(o.answer)) {
            throw new BadRequestException(
              `sections[${i}].items[${j}].question and answer are required`,
            );
          }
          items.push({
            question: String(o.question).trim(),
            answer: String(o.answer).trim(),
          });
        }
        out.push({ id, type: 'faq', items });
        continue;
      }
      if (type === 'paragraph') {
        if (!isNonEmptyString(s.body)) {
          throw new BadRequestException(`sections[${i}].body is required for paragraph`);
        }
        out.push({ id, type: 'paragraph', body: String(s.body).trim() });
        continue;
      }
      if (type === 'footer') {
        const columnsRaw = s.columns;
        if (!Array.isArray(columnsRaw) || columnsRaw.length === 0) {
          throw new BadRequestException(`sections[${i}].columns must be a non-empty array`);
        }

        const columns: { heading?: string; links: { label: string; href: string }[] }[] = [];
        for (let j = 0; j < columnsRaw.length; j++) {
          const colRaw = columnsRaw[j];
          if (!isRecord(colRaw)) {
            throw new BadRequestException(`sections[${i}].columns[${j}] must be an object`);
          }
          const linksRaw = colRaw.links;
          if (!Array.isArray(linksRaw) || linksRaw.length === 0) {
            throw new BadRequestException(
              `sections[${i}].columns[${j}].links must be a non-empty array`,
            );
          }

          const links: { label: string; href: string }[] = [];
          for (let k = 0; k < linksRaw.length; k++) {
            const linkRaw = linksRaw[k];
            if (!isRecord(linkRaw)) {
              throw new BadRequestException(
                `sections[${i}].columns[${j}].links[${k}] must be an object`,
              );
            }
            if (!isNonEmptyString(linkRaw.label) || !isNonEmptyString(linkRaw.href)) {
              throw new BadRequestException(
                `sections[${i}].columns[${j}].links[${k}].label and href are required`,
              );
            }
            links.push({
              label: String(linkRaw.label).trim(),
              href: String(linkRaw.href).trim(),
            });
          }

          columns.push({
            heading: colRaw.heading != null ? String(colRaw.heading) : undefined,
            links,
          });
        }

        let tagline: string | undefined;
        if (isNonEmptyString(s.tagline)) {
          tagline = String(s.tagline).trim();
        } else if (isNonEmptyString(s.heading)) {
          tagline = String(s.heading).trim();
        }

        out.push({
          id,
          type: 'footer',
          ...(tagline ? { tagline } : {}),
          columns,
          bottomText: s.bottomText != null ? String(s.bottomText) : undefined,
        });
        continue;
      }
      throw new BadRequestException(
        `sections[${i}].type must be one of: hero, features, cta, stats, faq, paragraph, footer`,
      );
    }
    return out;
  }

  private async clearOtherDefaults(tenantId: string, exceptId?: string): Promise<void> {
    const filter: Record<string, unknown> = {
      tenantId: new Types.ObjectId(tenantId),
      isDefault: true,
    };
    if (exceptId) {
      filter._id = { $ne: new Types.ObjectId(exceptId) };
    }
    await this.landingPageModel.updateMany(filter, { $set: { isDefault: false } }).exec();
  }

  async findAll(
    query: QueryLandingPageDto,
    tenantId: string,
    locale?: string,
  ): Promise<LandingPaginationResult> {
    const isGetAll = query.page === 'all';
    const page = isGetAll ? 1 : parseInt(query.page ?? '1', 10) || 1;
    const limit = isGetAll ? Number.MAX_SAFE_INTEGER : parseInt(query.limit ?? '10', 10) || 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { tenantId: new Types.ObjectId(tenantId) };

    if (query.search?.trim()) {
      const q = query.search.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { slug: { $regex: q, $options: 'i' } },
      ];
    }

    if (query.status?.trim()) {
      filter.status = query.status.trim();
    }

    const total = await this.landingPageModel.countDocuments(filter);

    if (isGetAll) {
      const rows = await this.landingPageModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .lean()
        .exec();
      const data = rows.map((row) => overlayLandingPage(row as Record<string, unknown>, locale));
      return {
        data,
        pagination: {
          total: data.length,
          page: 1,
          limit: data.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }

    const rows = await this.landingPageModel
      .find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
    const totalPages = Math.ceil(total / limit);
    const data = rows.map((row) => overlayLandingPage(row as Record<string, unknown>, locale));

    return {
      data,
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

  async findById(id: string, tenantId: string, locale?: string): Promise<Record<string, unknown>> {
    try {
      const doc = await this.landingPageModel
        .findOne({ _id: id, tenantId: new Types.ObjectId(tenantId) })
        .lean()
        .exec();
      if (!doc) {
        throw new NotFoundException(`Landing page with ID "${id}" not found`);
      }
      return overlayLandingPage(doc as Record<string, unknown>, locale);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      const err = error as { name?: string };
      if (err.name === 'CastError') {
        throw new BadRequestException(`Invalid landing page ID format: "${id}"`);
      }
      throw new BadRequestException('Failed to get landing page');
    }
  }

  async create(
    dto: CreateLandingPageDto,
    tenantId: string,
    locale?: string,
  ): Promise<LandingPage> {
    const slug = normalizeSlug(dto.slug);
    if (!slug) {
      throw new BadRequestException('Slug must contain at least one valid character');
    }

    const sections = this.validateSections(dto.sections ?? []);

    const data: Record<string, unknown> = {
      tenantId: new Types.ObjectId(tenantId),
      slug,
      title: dto.title,
      status: dto.status ?? LandingPageStatus.DRAFT,
      isDefault: dto.isDefault ?? false,
      seoTitle: dto.seoTitle,
      seoDescription: dto.seoDescription,
      sections,
    };

    if (locale) {
      const patch: Partial<LandingPageTranslatableFields> = {
        title: dto.title,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        sections,
      };
      data.translations = upsertTranslation<LandingPageTranslatableFields>(
        undefined,
        locale,
        patch,
      );
    }

    try {
      if (data.isDefault) {
        await this.clearOtherDefaults(tenantId);
      }
      const created = new this.landingPageModel(data);
      return await created.save();
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (err.code === 11000) {
        throw new BadRequestException(`Slug "${slug}" is already used for this organization`);
      }
      throw new BadRequestException('Failed to create landing page');
    }
  }

  async update(
    id: string,
    dto: UpdateLandingPageDto,
    tenantId: string,
    locale?: string,
  ): Promise<LandingPage> {
    const page = await this.landingPageModel.findOne({
      _id: id,
      tenantId: new Types.ObjectId(tenantId),
    });
    if (!page) {
      throw new NotFoundException(`Landing page with ID "${id}" not found`);
    }

    if (dto.slug != null) {
      const slug = normalizeSlug(dto.slug);
      if (!slug) {
        throw new BadRequestException('Slug must contain at least one valid character');
      }
      page.slug = slug;
    }
    if (dto.title != null) page.title = dto.title;
    if (dto.status != null) page.status = dto.status;
    if (dto.isDefault != null) page.isDefault = dto.isDefault;
    if (dto.seoTitle !== undefined) page.seoTitle = dto.seoTitle;
    if (dto.seoDescription !== undefined) page.seoDescription = dto.seoDescription;
    if (dto.sections != null) {
      page.sections = this.validateSections(dto.sections);
    }

    if (locale) {
      const patch: Partial<LandingPageTranslatableFields> = {};
      if (dto.title != null) patch.title = dto.title;
      if (dto.seoTitle !== undefined) patch.seoTitle = dto.seoTitle;
      if (dto.seoDescription !== undefined) patch.seoDescription = dto.seoDescription;
      if (dto.sections != null) patch.sections = page.sections;
      page.translations = upsertTranslation<LandingPageTranslatableFields>(
        page.translations,
        locale,
        patch,
      );
    }

    try {
      if (page.isDefault) {
        await this.clearOtherDefaults(tenantId, id);
      }
      return await page.save();
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (err.code === 11000) {
        throw new BadRequestException('That slug is already used for this organization');
      }
      throw new BadRequestException('Failed to update landing page');
    }
  }

  async remove(id: string, tenantId: string): Promise<{ deleted: boolean }> {
    const res = await this.landingPageModel.deleteOne({
      _id: id,
      tenantId: new Types.ObjectId(tenantId),
    });
    if (res.deletedCount === 0) {
      throw new NotFoundException(`Landing page with ID "${id}" not found`);
    }
    return { deleted: true };
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import {
  Appointment,
  AppointmentDocument,
  AppointmentSource,
  AppointmentStatus,
} from './schemas/appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { QueryAppointmentDto } from './dto/query-appointment.dto';
import { RequestPublicAppointmentDto } from './dto/request-public-appointment.dto';
import { TenantService } from '../tenant/tenant.service';
import { ALL_FEATURES, FeatureKey } from '../tenant/schemas/tenant.schema';
import { AuditLogService } from '../audit-log/audit-log.service';
import { buildCreateDiff, buildDeleteDiff, buildUpdateDiff } from '../audit-log/audit-log.diff';
import { ActorContext } from '../audit-log/audit-log.types';

const OVERLAP_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.PENDING,
  AppointmentStatus.CONFIRMED,
];

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    private readonly tenantService: TenantService,
    private readonly auditLogService: AuditLogService,
  ) {}

  private assertDateOrder(startAt: Date, endAt: Date): void {
    if (endAt <= startAt) {
      throw new BadRequestException('End time must be after start time');
    }
  }

  private async assertNoTimeOverlap(
    tenantId: string,
    startAt: Date,
    endAt: Date,
    excludeId?: string,
  ): Promise<void> {
    const query: FilterQuery<AppointmentDocument> = {
      tenantId: new Types.ObjectId(tenantId),
      status: { $in: OVERLAP_STATUSES },
      startAt: { $lt: endAt },
      endAt: { $gt: startAt },
    };
    if (excludeId && Types.ObjectId.isValid(excludeId)) {
      query._id = { $ne: new Types.ObjectId(excludeId) };
    }
    const conflict = await this.appointmentModel.findOne(query).select('_id').lean().exec();
    if (conflict) {
      throw new BadRequestException('This time slot overlaps an existing appointment');
    }
  }

  private tenantHasAppointmentsFeature(enabled: FeatureKey[] | undefined): boolean {
    const list = enabled?.length ? enabled : [...ALL_FEATURES];
    return list.includes('appointments');
  }

  async create(
    dto: CreateAppointmentDto,
    tenantId: string,
    actor: ActorContext,
    source: AppointmentSource = AppointmentSource.DASHBOARD,
  ): Promise<Appointment> {
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);
    this.assertDateOrder(startAt, endAt);
    await this.assertNoTimeOverlap(tenantId, startAt, endAt);

    const status =
      dto.status ??
      (source === AppointmentSource.DASHBOARD
        ? AppointmentStatus.CONFIRMED
        : AppointmentStatus.PENDING);

    const doc = new this.appointmentModel({
      tenantId: new Types.ObjectId(tenantId),
      title: dto.title,
      startAt,
      endAt,
      status,
      customer: dto.customer,
      notes: dto.notes,
      source,
      serviceId: dto.serviceId ? new Types.ObjectId(dto.serviceId) : undefined,
    });
    const saved = await doc.save();

    await this.auditLogService.create({
      tenantId,
      userId: actor.userId,
      userEmail: actor.userEmail,
      action: 'CREATE',
      entity: 'Appointment',
      entityId: String((saved as any)._id),
      diff: buildCreateDiff(dto as unknown as Record<string, unknown>),
      description: `Created appointment ${(saved as any)._id}`,
    });

    return saved;
  }

  async createPublicRequest(dto: RequestPublicAppointmentDto): Promise<Appointment> {
    const slug = dto.tenantSlug.trim().toLowerCase();
    const tenant = await this.tenantService.findBySlug(slug);
    if (!tenant) {
      throw new NotFoundException('Organization not found');
    }
    if (tenant.status && tenant.status !== 'active') {
      throw new ForbiddenException('Organization is not accepting bookings');
    }
    if (!this.tenantHasAppointmentsFeature(tenant.enabledFeatures)) {
      throw new ForbiddenException('Appointments are not enabled for this organization');
    }

    const tenantId = (tenant._id as Types.ObjectId).toString();
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);
    this.assertDateOrder(startAt, endAt);
    await this.assertNoTimeOverlap(tenantId, startAt, endAt);

    const title = dto.title?.trim() || 'Booking request';

    const doc = new this.appointmentModel({
      tenantId: new Types.ObjectId(tenantId),
      title,
      startAt,
      endAt,
      status: AppointmentStatus.PENDING,
      customer: dto.customer,
      notes: dto.notes,
      source: AppointmentSource.PUBLIC,
    });
    const saved = await doc.save();

    await this.auditLogService.create({
      tenantId,
      userId: 'public',
      userEmail: 'public',
      action: 'CREATE',
      entity: 'Appointment',
      entityId: String((saved as any)._id),
      diff: buildCreateDiff(dto as unknown as Record<string, unknown>),
      description: `Created public appointment request ${(saved as any)._id}`,
    });

    return saved;
  }

  async findAll(queryDto: QueryAppointmentDto, tenantId: string) {
    const { page = '1', limit = '10', search, status, from, to } = queryDto;
    const query: FilterQuery<AppointmentDocument> = {
      tenantId: new Types.ObjectId(tenantId),
    };

    if (status) {
      query.status = status;
    }

    if (from || to) {
      query.startAt = {};
      if (from) (query.startAt as Record<string, Date>).$gte = new Date(from);
      if (to) (query.startAt as Record<string, Date>).$lte = new Date(to);
    }

    if (search?.trim()) {
      const rx = { $regex: search.trim(), $options: 'i' };
      query.$or = [{ title: rx }, { 'customer.name': rx }, { 'customer.email': rx }];
    }

    if (page === 'all') {
      const data = await this.appointmentModel.find(query).sort({ startAt: -1 }).exec();
      return {
        data,
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

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      this.appointmentModel.find(query).sort({ startAt: -1 }).skip(skip).limit(limitNum).exec(),
      this.appointmentModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    };
  }

  async findOne(id: string, tenantId: string): Promise<Appointment> {
    const doc = await this.appointmentModel
      .findOne({ _id: id, tenantId: new Types.ObjectId(tenantId) })
      .exec();
    if (!doc) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return doc;
  }

  async update(id: string, dto: UpdateAppointmentDto, tenantId: string, actor: ActorContext): Promise<Appointment> {
    const existing = await this.appointmentModel
      .findOne({ _id: id, tenantId: new Types.ObjectId(tenantId) })
      .exec();
    if (!existing) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    const startAt = dto.startAt ? new Date(dto.startAt) : existing.startAt;
    const endAt = dto.endAt ? new Date(dto.endAt) : existing.endAt;
    this.assertDateOrder(startAt, endAt);

    const nextStatus = dto.status ?? existing.status;
    if (OVERLAP_STATUSES.includes(nextStatus)) {
      await this.assertNoTimeOverlap(tenantId, startAt, endAt, id);
    }

    const updatePayload: Record<string, unknown> = {};
    if (dto.title !== undefined) updatePayload.title = dto.title;
    if (dto.startAt !== undefined) updatePayload.startAt = startAt;
    if (dto.endAt !== undefined) updatePayload.endAt = endAt;
    if (dto.customer !== undefined) updatePayload.customer = dto.customer;
    if (dto.notes !== undefined) updatePayload.notes = dto.notes;
    if (dto.status !== undefined) updatePayload.status = dto.status;
    if (dto.serviceId !== undefined) {
      updatePayload.serviceId = dto.serviceId ? new Types.ObjectId(dto.serviceId) : undefined;
    }

    const before = (existing as any).toObject() as unknown as Record<string, unknown>;
    const updated = await this.appointmentModel
      .findOneAndUpdate({ _id: id, tenantId: new Types.ObjectId(tenantId) }, updatePayload, {
        new: true,
      })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    const after = (updated as any).toObject() as unknown as Record<string, unknown>;
    await this.auditLogService.create({
      tenantId,
      userId: actor.userId,
      userEmail: actor.userEmail,
      action: 'UPDATE',
      entity: 'Appointment',
      entityId: String(id),
      diff: buildUpdateDiff({ before, after, patch: dto as unknown as Record<string, unknown> }),
      description: `Updated appointment ${id}`,
    });

    return updated;
  }

  async remove(id: string, tenantId: string, actor: ActorContext): Promise<void> {
    const res = await this.appointmentModel
      .findOneAndDelete({ _id: id, tenantId: new Types.ObjectId(tenantId) })
      .lean()
      .exec();
    if (!res) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    await this.auditLogService.create({
      tenantId,
      userId: actor.userId,
      userEmail: actor.userEmail,
      action: 'DELETE',
      entity: 'Appointment',
      entityId: String(id),
      diff: buildDeleteDiff(res as unknown as Record<string, unknown>, {
        allowlist: ['_id', 'title', 'startAt', 'endAt', 'status', 'source', 'serviceId'],
      }),
      description: `Deleted appointment ${id}`,
    });
  }
}

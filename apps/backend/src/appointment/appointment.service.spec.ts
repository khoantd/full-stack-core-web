import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { Appointment } from './schemas/appointment.schema';
import { TenantService } from '../tenant/tenant.service';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('AppointmentService', () => {
  let service: AppointmentService;
  const tenantService = { findBySlug: jest.fn() };
  const auditLogService = { create: jest.fn() };
  const saveMock = jest.fn().mockResolvedValue({ _id: 'new' });

  const AppointmentModelMock = jest.fn().mockImplementation(() => ({
    save: saveMock,
  })) as unknown;
  Object.assign(AppointmentModelMock as object, {
    findOne: jest.fn().mockReturnValue({
      select: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) }),
    }),
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    saveMock.mockResolvedValue({ _id: 'new' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        { provide: getModelToken(Appointment.name), useValue: AppointmentModelMock },
        { provide: TenantService, useValue: tenantService },
        { provide: AuditLogService, useValue: auditLogService },
      ],
    }).compile();

    service = module.get(AppointmentService);
  });

  it('createPublicRequest throws when tenant slug not found', async () => {
    tenantService.findBySlug.mockResolvedValue(null);
    await expect(
      service.createPublicRequest({
        tenantSlug: 'missing',
        startAt: new Date('2030-01-01T10:00:00.000Z').toISOString(),
        endAt: new Date('2030-01-01T11:00:00.000Z').toISOString(),
        customer: { name: 'A', email: 'a@a.com' },
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('createPublicRequest throws when appointments feature disabled', async () => {
    tenantService.findBySlug.mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      status: 'active',
      enabledFeatures: ['events'],
    });
    await expect(
      service.createPublicRequest({
        tenantSlug: 'acme',
        startAt: new Date('2030-01-01T10:00:00.000Z').toISOString(),
        endAt: new Date('2030-01-01T11:00:00.000Z').toISOString(),
        customer: { name: 'A', email: 'a@a.com' },
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
